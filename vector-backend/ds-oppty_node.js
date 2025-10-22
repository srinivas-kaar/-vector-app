// // server.js — BAS-friendly, GET-only API, dynamic CORS for port300x previews

// import express from "express";
// import cors from "cors";
// // If you're on Node < 18, uncomment the next line:
// // import fetch from "node-fetch";

// const app = express();
// app.use(express.json());

// /* ----------------------- CONFIG (env or inline) ----------------------- */
// // Your BAS workspace host (everything AFTER the port prefix). Examples:
// //   port3002-workspaces-ws-ktckh.us10.applicationstudio.cloud.sap
// //                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  <-- this part
// const WORKSPACE_HOST =
//   process.env.WORKSPACE_HOST || "workspaces-ws-ktckh.us10.applicationstudio.cloud.sap";

// // SAP Datasphere OAuth & OData
// const TOKEN_URL = process.env.DSP_TOKEN_URL || "https://doledwt.authentication.us10.hana.ondemand.com/oauth/token";
// const ODATA_URL = process.env.DSP_ODATA_URL || "https://doledwt.us10.hcs.cloud.sap/api/v1/dwc/consumption/analytical/BTP_INTERFACE/Opportunity_Data/Opportunity_Data";
// const CLIENT_ID = process.env.DSP_CLIENT_ID || "sb-9c0b0a9a-d33e-4e54-a13d-d9fa60aee520!b100302|client!b655";
// const CLIENT_SECRET = process.env.DSP_CLIENT_SECRET || "54ca2f82-b259-4914-becb-3bdd97db45dd$nlSN8FPin5WupUSC7c3fxtmCGxrZ5c20Pr3BapGwMEs=";

// // OPTIONAL: default row cap for OData reads
// const DEFAULT_TOP = Number(process.env.DSP_DEFAULT_TOP || 500);

// /* ----------------------- Dynamic CORS for BAS ------------------------ */
// /** Allow any BAS frontend preview on ports 3000–3010 for THIS workspace. */
// app.use(
//   cors({
//     origin: (origin, cb) => {
//       // Allow tools without an Origin (curl, Postman, BAS port preview open)
//       if (!origin) return cb(null, true);

//       // Match: https://port3000-<workspace-host> ... https://port3010-<workspace-host>
//       const wsHostEsc = WORKSPACE_HOST.replace(/\./g, "\\.");
//       const re = new RegExp(`^https:\\/\\/port30[0-9]-${wsHostEsc}$`, "i");

//       if (re.test(origin)) return cb(null, true);
//       // Helpful error for debugging mismatched origin vs workspace host
//       return cb(new Error(`CORS blocked for origin: ${origin}`));
//     },
//     methods: ["GET"], // API is GET-only
//     allowedHeaders: ["Accept", "Content-Type"],
//     maxAge: 86400,
//   })
// );

// /* -------------------------- Health check ---------------------------- */
// app.get("/api/ping", (req, res) => {
//   res.json({ ok: true, at: new Date().toISOString(), host: WORKSPACE_HOST });
// });

// /* -------------------- OAuth token (client creds) -------------------- */
// let cachedToken = null;
// let tokenExpiresAt = 0;

// async function getAccessToken() {
//   const now = Date.now();
//   if (cachedToken && now < tokenExpiresAt - 5000) return cachedToken;

//   const body = new URLSearchParams({
//     grant_type: "client_credentials",
//     client_id: CLIENT_ID,
//     client_secret: CLIENT_SECRET,
//   });

//   const r = await fetch(TOKEN_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body,
//   });

//   if (!r.ok) {
//     const t = await r.text().catch(() => "");
//     throw new Error(`Token request failed: ${r.status} ${t}`);
//   }

//   const j = await r.json();
//   if (!j.access_token) throw new Error("No access_token in token response");

//   cachedToken = j.access_token;
//   const ttlSec = Number(j.expires_in || 1800);
//   tokenExpiresAt = now + ttlSec * 1000;
//   return cachedToken;
// }

// /* --------------------- OData helpers (flatten) ---------------------- */
// function flattenOData(p) {
//   if (Array.isArray(p)) return p;
//   if (Array.isArray(p?.d?.results)) return p.d.results; // OData v2
//   if (Array.isArray(p?.value)) return p.value;          // OData v4-ish
//   return [];
// }

// /* ------------------------ Main data endpoint ------------------------ */
// app.get("/api/datasphere-data", async (req, res) => {
//   try {
//     const token = await getAccessToken();

//     // Build URL: must point to an ENTITY SET, not just the service root
//     // Example: https://<tenant>.<region>.cloud.sap/odata/v2/Z_OPPTY_ENTITY
//     const top = encodeURIComponent(req.query.$top || DEFAULT_TOP || 500);

//     // Ensure $format=json is present, and avoid duplicating query delimiters
//     const sep = ODATA_URL.includes("?") ? "&" : "?";
//     const url = `${ODATA_URL}${sep}$format=json&$top=${top}`;

//     const ds = await fetch(url, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Accept: "application/json"
//       },
//       redirect: "follow" // still fine; we’ll detect if we end up on HTML
//     });

//     const ct = ds.headers.get("content-type") || "";
//     const status = ds.status;

//     // Grab raw text first to robustly detect non-JSON
//     const raw = await ds.text();

//     if (!ds.ok) {
//       // Return server’s text (often HTML or JSON error)
//       return res.status(status).json({
//         error: "OData fetch failed",
//         status,
//         contentType: ct,
//         snippet: raw.slice(0, 400)
//       });
//     }

//     // If content-type doesn’t look like JSON, surface it
//     if (!/json/i.test(ct)) {
//       return res.status(502).json({
//         error: "Non-JSON response from OData",
//         status,
//         contentType: ct,
//         hint: "Check TOKEN_URL, ODATA_URL (entity set, not service root), scopes/roles, and $format=json.",
//         snippet: raw.slice(0, 400)
//       });
//     }

//     // Parse JSON safely now
//     let payload;
//     try {
//       payload = JSON.parse(raw);
//     } catch (e) {
//       return res.status(502).json({
//         error: "JSON parse error from OData",
//         detail: String(e?.message || e),
//         contentType: ct,
//         snippet: raw.slice(0, 400)
//       });
//     }

//     // Flatten OData
//     const rows =
//       Array.isArray(payload) ? payload :
//         Array.isArray(payload?.d?.results) ? payload.d.results :
//           Array.isArray(payload?.value) ? payload.value :
//             [];

//     // Return as-is if you want raw, or normalize:
//     const normalized = rows.map((d, i) => ({
//       id: d.id ?? d.Opportunity_ID ?? d.OpportunityId ?? i + 1,
//       title: d.title ?? d.Opportunity_Summary ?? d.OpportunityTitle ?? `Opp ${i + 1}`,
//       amount: Number(d.amount ?? d.Pipeline_Projected_Revenue ?? d.Estimated_Revenue ?? 0),
//       status: d.status ?? d.Sales_Stage ?? "Lead: Deprioritized Account",
//       owner: d.owner ?? d.Sales_Lead ?? d.Owner ?? "unknown@doleintl.com",
//       createdAt: d.createdAt ?? d.Created_At ?? d.Likely_Start_Date ?? new Date().toISOString(),
//       closeDate: d.closeDate ?? d.End_Date ?? d.Close_Date ?? new Date().toISOString(),
//       ...d,
//     }));

//     return res.json(normalized);
//   } catch (err) {
//     console.error("datasphere-data error:", err);
//     res.status(500).json({
//       error: "Failed to fetch from Datasphere",
//       detail: String(err?.message || err)
//     });
//   }
// });

// /* ----------------------------- Start ------------------------------- */
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Backend listening at ${PORT} (workspace host: ${WORKSPACE_HOST})`);
// });
