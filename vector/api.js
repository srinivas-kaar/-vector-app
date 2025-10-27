import { API_BASE_URL } from "./src/config";

export async function apiFetchOpps() {
  const url = `${API_BASE_URL}/opportunities`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      mode: "cors",
    });
    if (!res.ok)
      throw new Error(`GET ${url} failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.map((record) => ({
      id: record.OPPORTUNITY_ID || record.id,
      title: record.CUSTOMER_NAME
        ? `${record.CUSTOMER_NAME} - ${record.PRODUCT}`
        : record.title,
      amount: Number(record.PIPELINE_PROJECTED_REVENUE || record.amount || 0),
      status:
        record.SALES_STAGE ||
        record.status ||
        "Lead: No Current Product Solution",
      owner: record.SALES_LEAD || record.owner || "system@doleintl.com",
      createdAt: record.LIKELY_START_DATE
        ? new Date(record.LIKELY_START_DATE)
        : new Date(),
      closeDate: record.END_DATE ? new Date(record.END_DATE) : new Date(),
      customerName: record.CUSTOMER_NAME,
      product: record.PRODUCT,
      doleSalesLead: record.SALES_LEAD,
      salesTeam: record.SALES_TEAM,
      industrySegment: record.INDUSTRY_SEGMENT,
      salesStage: record.SALES_STAGE,
      opportunityType: record.OPPORTUNITY_TYPE,
      materialId: record.MATERIAL_ID,
      estimatedVolume: record.ESTIMATED_VOLUME,
      pipelineProjectedRevenue: record.PIPELINE_PROJECTED_REVENUE,
      ...record,
    }));
  } catch (e) {
    console.error("Failed to fetch opportunities:", e);
    throw e;
  }
}

export async function apiFetchMaterials() {
  try {
    const response = await fetch(`${API_BASE_URL}/materials`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching materials:", error);
    throw error;
  }
}

export async function apiCreateOpp(body) {
  try {
    const payload = {
      TITLE:
        body.title ||
        `${body.customer_Name || body.customerName} - ${body.product}`,
      AMOUNT: Number(
        body.pipeline_Projected_Revenue ||
          body.pipelineProjectedRevenue ||
          body.amount ||
          0
      ),
      STATUS:
        body.sales_Stage ||
        body.salesStage ||
        body.status ||
        "Lead: No Current Product Solution",
      OWNER: body.owner || "system@doleintl.com",
      CREATED_AT: body.createdAt || new Date().toISOString(),
      CLOSE_DATE:
        body.closeDate ||
        body.end_Date ||
        body.endDate ||
        new Date().toISOString(),
      CUSTOMER_NAME: body.customer_Name || body.customerName || "",
      SALES_LEAD: body.sales_Lead || body.doleSalesLead || body.salesLead || "",
      SALES_TEAM: body.sales_Team || body.salesTeam || "",
      INDUSTRY_SEGMENT: body.industry_Segment || body.industrySegment || "",
      OTHER_SEGMENT: body.other_Segment || body.otherSegment || "",
      SALES_STAGE:
        body.sales_Stage ||
        body.salesStage ||
        body.status ||
        "Lead: No Current Product Solution",
      OPPORTUNITY_TYPE:
        body.opportunity_Type || body.opportunityType || "New Business",
      OPPORTUNITY_SUMMARY:
        body.opportunity_Summary || body.opportunitySummary || "",
      PRODUCT: body.product || "",
      LIKE_PRODUCT: body.like_Product || body.likeProduct || "",
      MATERIAL_ID: body.material_ID || body.materialId || "",
      PRODUCT_CATEGORY: body.product_Category || body.productCategory || "",
      BASE_UOM:
        body.base_UoM || body.baseUoM || body.materialBaseUnit || "Case",
      MATERIAL_WEIGHT:
        body.material_Weight ||
        body.materialWeight ||
        body.materialNetWeightLbs ||
        "",
      PRODUCT_SOURCE_LOCATION:
        body.product_Source_Location || body.productSourceLocation || "",
      LIKELY_DISTRIBUTORS:
        body.likely_Distributors || body.likelyDistributors || "",
      ESTIMATED_VOLUME: body.estimated_Volume || body.estimatedVolume || "",
      UOM: body.uoM || body.uom || "Case",
      CASE_VOLUME_CONVERTED:
        body.case_Volume_Converted ||
        body.caseVolumeConverted ||
        body.caseVolume ||
        "",
      OPPORTUNITY_VOLUME_INPUT:
        body.opportunity_Volume_Input || body.opportunityVolumeInput || "",
      DAYS_30_SHIP: body.days_30_Ship || body.days30Ship || "N",
      MATERIAL_PROJECTED_PRICE:
        body.material_Projected_Price || body.materialProjectedPrice || "",
      OVERRIDE_PRICE: body.override_Price || body.overridePrice || "",
      EQUIVALIZED_PIPELINE_LBS:
        body.equivalized_Pipeline_LBS || body.equalizedPipelineLbs || "",
      PIPELINE_PROJECTED_REVENUE:
        body.pipeline_Projected_Revenue ||
        body.pipelineProjectedRevenue ||
        body.amount ||
        "",
      LIKELY_START_DATE:
        body.likely_Start_Date ||
        body.likelyStartDate ||
        body.createdAt ||
        new Date().toISOString(),
      ANNUAL_OR_LTO: body.annual_Or_LTO || body.annualOrLTO || "Annual",
      END_DATE:
        body.end_Date ||
        body.endDate ||
        body.closeDate ||
        new Date().toISOString(),
      LAST_MEETING_DATE: body.last_Meeting_Date || body.lastMeetingDate || "",
      NEXT_STEP_DESCRIPTION:
        body.next_Step_Description || body.nextStepDescription || "",
      WIN_LOSS_REASON_CODE:
        body.win_Loss_Reason_Code || body.winLossReasonCode || "",
      WIN_LOSS_COMMENTS: body.win_Loss_Comments || body.winLossComments || "",
      SAMPLES_NEEDED: body.samples_Needed || body.samplesNeeded || "N",
      SAMPLES_SUPPORT_STATUS:
        body.samples_Support_Status || body.samplesSupportStatus || "",
      CULINARY_SUPPORT_NEEDED:
        body.culinary_Support_Needed || body.culinarySupportNeeded || "N",
      CULINARY_SUPPORT_DESCRIPTION:
        body.culinary_Support_Description ||
        body.culinarySupportDescription ||
        "",
      CULINARY_SUPPORT_STATUS:
        body.culinary_Support_Status || body.culinarySupportStatus || "",
      INNOVATION_SUPPORT_NEEDED:
        body.innovation_Support_Needed || body.innovationSupportNeeded || "N",
      INNOVATION_NEED_DESCRIPTION:
        body.innovation_Need_Description ||
        body.innovationNeedDescription ||
        "",
      INNOVATION_SUPPORT_STATUS:
        body.innovation_Support_Status || body.innovationSupportStatus || "",
      TOTAL_UNITS: body.total_Units || body.units2023 || "",
    };

    const res = await fetch(`${API_BASE_URL}/opportunities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      mode: "cors",
      body: JSON.stringify(payload),
    });
    if (!res.ok)
      throw new Error(
        `Failed to create opportunity: ${res.status} ${await res.text()}`
      );
    const created = await res.json();

    if (payload.MATERIAL_PROJECTED_PRICE > payload.OVERRIDE_PRICE) {
      const overridePricepayload = {
        opportunity_id:
          body.opportunity_ID ||
          payload.opportunity_ID ||
          payload.opportunity_ID,
        currentprice: payload.MATERIAL_PROJECTED_PRICE,
        overrideprice: payload.OVERRIDE_PRICE,
        businessjustification: body.businessJustification,
        dateofrequest: new Date().toISOString().split("T")[0],
        dateofapproval: "",
        approvalnote: "",
        requestor: payload.SALES_LEAD,
        product_category: payload.PRODUCT_CATEGORY,
        customer_name: payload.CUSTOMER_NAME,
        status: "Pending",
      };

      const res = await fetch(`${API_BASE_URL}/overrideprice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify(overridePricepayload),
      });
      if (!res.ok)
        throw new Error(
          `Failed to create opportunity: ${res.status} ${await res.text()}`
        );
    }

    return {
      id: created.OPPORTUNITY_ID || created.id || created.opportunity_ID,
      title: created.TITLE || created.title || payload.TITLE,
      amount: Number(
        created.AMOUNT ||
          created.PIPELINE_PROJECTED_REVENUE ||
          payload.PIPELINE_PROJECTED_REVENUE
      ),
      status: created.STATUS || created.SALES_STAGE || payload.SALES_STAGE,
      owner: created.OWNER || created.SALES_LEAD || payload.SALES_LEAD,
      createdAt: new Date(
        created.CREATED_AT || created.createdAt || payload.CREATED_AT
      ),
      closeDate: new Date(
        created.CLOSE_DATE || created.END_DATE || payload.END_DATE
      ),
      customerName: created.CUSTOMER_NAME || payload.CUSTOMER_NAME,
      product: created.PRODUCT || payload.PRODUCT,
      doleSalesLead: created.SALES_LEAD || payload.SALES_LEAD,
      salesTeam: created.SALES_TEAM || payload.SALES_TEAM,
      industrySegment: created.INDUSTRY_SEGMENT || payload.INDUSTRY_SEGMENT,
      salesStage: created.SALES_STAGE || payload.SALES_STAGE,
      opportunityType: created.OPPORTUNITY_TYPE || payload.OPPORTUNITY_TYPE,
      materialId: created.MATERIAL_ID || payload.MATERIAL_ID,
      estimatedVolume: created.ESTIMATED_VOLUME || payload.ESTIMATED_VOLUME,
      pipelineProjectedRevenue:
        created.PIPELINE_PROJECTED_REVENUE ||
        payload.PIPELINE_PROJECTED_REVENUE,
      overridePrice: created.OVERRIDE_PRICE || payload.OVERRIDE_PRICE,
      ...created,
    };
  } catch (error) {
    console.error("Failed to create opportunity in SAP Datasphere:", error);
    const fallbackId = Math.floor(Math.random() * 10000) + 1;
    return {
      id: fallbackId,
      title: body.title || `${body.customer_Name} - ${body.product}`,
      amount: Number(body.pipeline_Projected_Revenue || body.amount || 0),
      status:
        body.sales_Stage || body.status || "Lead: No Current Product Solution",
      owner: body.owner || "system@doleintl.com",
      createdAt: new Date(),
      closeDate: body.end_Date ? new Date(body.end_Date) : new Date(),
      ...body,
    };
  }
}

export async function apiDeleteOpps(ids = []) {
  try {
    const res = await fetch(`${API_BASE_URL}/opportunities/bulk-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      mode: "cors",
      body: JSON.stringify({ ids }),
    });
    if (res.ok) return true;
  } catch (error) {
    console.error("Bulk delete error:", error);
  }
  try {
    await Promise.all(
      ids.map((id) =>
        fetch(`${API_BASE_URL}/opportunities/${id}`, {
          method: "DELETE",
          credentials: "include",
          mode: "cors",
        })
      )
    );
    return true;
  } catch (e) {
    console.warn("Delete fallback failed", e);
    return false;
  }
}

export async function apiFetchUsers() {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    mode: "cors",
  });
  if (!res.ok)
    throw new Error(`GET /users failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function apiFetchPendingUsers() {
  const res = await fetch(`${API_BASE_URL}/users/pending`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    mode: "cors",
  });
  if (!res.ok)
    throw new Error(
      `GET /users/pending failed: ${res.status} ${await res.text()}`
    );
  return res.json(); // expect array from USER_ACCOUNTS_PENDING
}

export async function apiCreatePendingUser(user) {
  const res = await fetch(`${API_BASE_URL}/users/pending`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    mode: "cors",
    body: JSON.stringify({
      firstName: user.firstName,
      lastName: user.lastName,
      preferredName: user.preferredName || "",
      email: user.email,
      isRsm: !!user.isRsm,
      isAll: !!user.isAll,
      isAdmin: !!user.isAdmin,
    }),
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) throw new Error(`POST /users/pending ${res.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

export async function apiCreateUser(user) {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    mode: "cors",
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiApprovePendingUser(email, roles) {
  const res = await fetch(`${API_BASE_URL}/users/pending/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    mode: "cors",
    body: JSON.stringify({ email, ...roles }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiRejectPendingUser(email) {
  const res = await fetch(
    `${API_BASE_URL}/users/pending/${encodeURIComponent(email)}`,
    {
      method: "DELETE",
      credentials: "include",
      mode: "cors",
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return true;
}

export async function apiGetUserByEmail(email) {
  const url = `${API_BASE_URL}/users/by-email?email=${encodeURIComponent(
    email.trim()
  )}`;
  const res = await fetch(url, { credentials: "include", mode: "cors" });
  if (!res.ok) {
    // Treat not-found as null if backend ever returns 404
    if (res.status === 404) return null;
    const text = await res.text().catch(() => "");
    throw new Error(`GET /users/by-email failed: ${res.status} ${text}`);
  }
  const data = await res.json().catch(() => null);
  return data?.user ?? data ?? null;
}

export async function apiUpdateUser(email, user) {
  const res = await fetch(
    `${API_BASE_URL}/users/${encodeURIComponent(email)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      mode: "cors",
      body: JSON.stringify(user),
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function apiFetchOverridePrice() {
  const res = await fetch(`${API_BASE_URL}/overrideprice`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    mode: "cors",
  });

  if (!res.ok) {
    throw new Error(
      `GET /overrideprice failed: ${res.status} ${await res.text()}`
    );
  }

  return res.json();
}

export async function apiUpdateOverridePrice(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/overrideprice`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      mode: "cors",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error:", res.status, errorText);
      throw new Error(`Failed to update request: ${res.status} ${errorText}`);
    }

    // Return parsed JSON if available, else empty object
    return await res.json().catch(() => ({}));
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}