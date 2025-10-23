import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
  useCallback,
} from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";

import {
  Plus,
  Calendar as CalendarIcon,
  TrendingUp,
  LayoutDashboard,
  Table as TableIcon,
  User as UserIcon,
  GripVertical,
  Sun,
  Moon,
  Clock,
  X as XIcon,
  Trash2,
  LogOut,
  Search,
  Database,
  ChevronDown,
  ScatterChart,
  Scatter,
  Settings,
  ChevronsUpDown,
  ChevronUp,
} from "lucide-react";

import ReactDOM from "react-dom";
import { API_BASE_URL } from "./config";
import { clsx } from "clsx";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
// ---------------- Dole Brand ----------------
const BRAND = {
  yellow: "#F6E500",
  blue: "#39B4E8",
  navy: "#00205C",
  deepBlue: "#001489",
  green: "#78BE20",
  red: "#C8102E",
};
const ThemeContext = React.createContext("sunrise");

// ---------------- Frosted UI ----------------
const Card = ({ children, className = "", noClip = false }) => {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  const frostBg = isNight ? "bg-white/10" : "bg-white/20";
  const borderClr = isNight ? "border-white/20" : "border-white/40";
  const shadow = "shadow-[0_6px_24px_rgba(0,0,0,0.08)]";
  const overflowCls = noClip ? "overflow-visible" : "overflow-hidden";
  return (
    <div
      className={`relative rounded-3xl border ${borderClr} ${frostBg} bg-clip-padding backdrop-blur-xl backdrop-saturate-150 ${shadow} ${overflowCls} ${className}`}
    >
      {children}
    </div>
  );
};

const Badge = ({ children, variant = "default", className = "" }) => {
  const baseClasses =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";

  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-200 text-gray-800",
    success: "bg-green-100 text-green-800",
  };

  return (
    <span className={clsx(baseClasses, variants[variant], className)}>
      {children}
    </span>
  );
};

const CardHeader = ({ title, subtitle, right, dragHandle }) => {
  const theme = useContext(ThemeContext);
  const border = theme === "sunset" ? "border-white/15" : "border-white/45";
  const textMuted = theme === "sunset" ? "text-white/70" : "text-gray-600";
  return (
    <div className={`flex items-center justify-between p-4 border-b ${border}`}>
      <div className="flex items-center gap-3">
        {dragHandle}
        <div>
          {title && (
            <h3
              className={`text-lg font-semibold leading-tight ${
                theme === "sunset" ? "text-white" : ""
              }`}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`text-xs ${textMuted} mt-1`}>{subtitle}</p>
          )}
        </div>
      </div>
      {right}
    </div>
  );
};

const CardBody = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

const Button = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  type = "button",
  disabled = false,
}) => {
  const theme = useContext(ThemeContext);
  const primaryGradient =
    theme === "sunset"
      ? `bg-gradient-to-r from-[${BRAND.red}] to-[${BRAND.deepBlue}] text-white`
      : `bg-gradient-to-r from-[rgba(246,229,0,0.6)] to-[rgba(57,180,232,0.6)] text-gray-900`;
  const ghostBg =
    theme === "sunset"
      ? "bg-transparent hover:bg-white/15 text-white"
      : "bg-transparent hover:bg-white/50";
  const neutralBg =
    theme === "sunset"
      ? "bg-white/10 border border-white/20 hover:bg-white/15 text-white"
      : "bg-white/60 hover:bg-white";
  const dangerBg =
    theme === "sunset"
      ? "bg-red-600/80 text-white hover:bg-red-600 border border-red-500/20"
      : "bg-red-600 text-white hover:bg-red-700";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all active:scale-[.99] ${
        variant === "primary"
          ? primaryGradient
          : variant === "ghost"
          ? ghostBg
          : variant === "danger"
          ? dangerBg
          : neutralBg
      } ${disabled ? "opacity-50 pointer-events-none" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

// ---------------- Config ----------------
const STATUSES = [
  "Lead: Deprioritized Account",
  "Lead: No Current Product Solution",
  "Target Account",
  "Customer Engaged",
  "Proposal Submitted",
  "Win - Customer Verbal",
  "Post-pipeline: Win (order shipped)",
  "Post-pipeline: Loss",
  "Post-pipeline: On-hold",
];

const STATUS_COLORS = {
  "Lead: Deprioritized Account": "#6B7280",
  "Lead: No Current Product Solution": "#93C5FD",
  "Target Account": "#FCD34D",
  "Customer Engaged": "#39B4E8",
  "Proposal Submitted": "#FB923C",
  "Win - Customer Verbal": "#78BE20",
  "Post-pipeline: Win (order shipped)": "#16A34A",
  "Post-pipeline: Loss": "#C8102E",
  "Post-pipeline: On-hold": "#8B5CF6",
};

const CHART_COLORS = {
  teal: "#14B8A6",
  purple: "#A78BFA",
  cyan: "#22D3EE",
  grayAxis: "#64748B",
  blue: "#3B82F6",
};

// ---------------- API ----------------
async function apiFetchOpps() {
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

async function apiFetchMaterials() {
  try {
    const response = await fetch(`${API_BASE_URL}/materials`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching materials:", error);
    throw error;
  }
}

async function apiCreateOpp(body) {
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

async function apiDeleteOpps(ids = []) {
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

async function apiFetchUsers() {
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

async function apiFetchPendingUsers() {
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

async function apiCreatePendingUser(user) {
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

async function apiCreateUser(user) {
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

async function apiApprovePendingUser(email, roles) {
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

async function apiRejectPendingUser(email) {
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

async function apiGetUserByEmail(email) {
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

async function apiUpdateUser(email, user) {
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
async function apiFetchOverridePrice() {
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

async function apiFetchApprovals() {
  return [
    {
      id: "OPP-12342",
      productCategory: "Electronics",
      customerName: "Acme Corp",
      approverName: "John Doe",
      dateRaised: "2025-10-10",
      dateApproved: null,
      status: "Pending",
      overridePrice: 10,
      BussinessJustification: "Approve raised from sales",
      currentPrice: 12,
    },
    {
      id: "OPP-12341",
      productCategory: "Ships",
      customerName: "Bcme Corp",
      approverName: "Nithin Doe",
      dateRaised: "2025-10-12",
      dateApproved: null,
      status: "Pending",
      overridePrice: 10,
      BussinessJustification: "Approve raised from sales",
      currentPrice: 10,
    },
    {
      id: "OPP-12345",
      productCategory: "Electronics",
      customerName: "Acme Corp",
      approverName: "John Doe",
      dateRaised: "2025-10-16",
      dateApproved: null,
      status: "Pending",
      overridePrice: 12,
      BussinessJustification: "Approve raised from sales",
      currentPrice: 14,
    },
    {
      id: "OPP-12346",
      productCategory: "Electronics",
      customerName: "Acme Corp",
      approverName: "John Doe",
      dateRaised: "2025-10-07",
      dateApproved: null,
      status: "Approved",
    },
  ];
}

// ---------------- Utils ----------------
function pickLatestByCreated(arr, n = 5) {
  return (arr || [])
    .slice()
    .sort(
      (a, b) =>
        (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0)
    )
    .slice(0, n);
}
function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function formatMonthDisplay(monthStr) {
  const [year, month] = monthStr.split("-");
  const m = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][parseInt(month) - 1];
  return `${m} '${year.slice(2)}`;
}
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function toISODate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(dt.getDate()).padStart(2, "0")}`;
}

// ---------------- Global Styles ----------------
function GlobalStyles() {
  const css = `
  .glass-select { appearance: none; -webkit-appearance: none; -moz-appearance: none; backdrop-filter: saturate(140%) blur(12px); -webkit-backdrop-filter: saturate(140%) blur(12px); }
  .glass-select:focus { outline: none; }
  .theme-sunrise .glass-select { background: rgba(255,255,255,0.60); border: 1px solid rgba(209,213,219,1); color: #111; }
  .theme-sunset .glass-select { background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.25); color: #fff; }
  .theme-sunset .glass-select:disabled { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); }
  .scroll-glass::-webkit-scrollbar { width: 10px; height: 10px; }
  .scroll-glass::-webkit-scrollbar-track { background: transparent; }
  .theme-sunrise .scroll-glass::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.25); border: 1px solid rgba(255,255,255,0.45); border-radius: 9999px; }
  .theme-sunset  .scroll-glass::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.25); border-radius: 9999px; }
  .theme-sunrise .scroll-glass { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.25) transparent; }
  .theme-sunset  .scroll-glass { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.18) transparent; }
  .theme-sunrise .cal-selected { background-image: linear-gradient(135deg, #F6E500, #39B4E8); color: #111; }
  .theme-sunset  .cal-selected { background-image: linear-gradient(135deg, #C8102E, #001489); color: #fff; }
  .theme-sunrise .avatar-grad { background-image: linear-gradient(135deg, #F6E500, #39B4E8); color: #111; }
  .theme-sunset  .avatar-grad { background-image: linear-gradient(135deg, #C8102E, #001489); color: #fff; }
  .no-spinner::-webkit-outer-spin-button, .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .no-spinner[type=number] { -moz-appearance: textfield; }
`;
  return <style>{css}</style>;
}

// ---------------- Custom Frosted Select ----------------
function FrostedSelect({
  value,
  onChange,
  options = [],
  disabled = false,
  placeholder = "Select...",
  className = "",
  style,
}) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  const [open, setOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 260,
  });
  const [shouldOpenUpward, setShouldOpenUpward] = useState(false);
  const ref = useRef(null);
  const current = value || "";

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const computePosition = useCallback(() => {
    if (!open || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < 300 && spaceAbove > spaceBelow;
    setShouldOpenUpward(openUp);
    setDropdownPosition({
      top: openUp ? rect.top - 8 : rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      maxHeight: openUp
        ? Math.min(spaceAbove - 20, 300)
        : Math.min(spaceBelow - 20, 300),
    });
  }, [open]);
  useEffect(() => {
    computePosition();
  }, [open, computePosition]);
  useEffect(() => {
    if (!open) return;
    const onWin = () => computePosition();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open, computePosition]);

  const handleSelect = (opt) => {
    onChange(opt);
    setOpen(false);
  };
  const wrapperCls = `inline-flex w-full min-w-0 max-w-full items-center justify-between rounded-2xl border px-3 py-2 cursor-pointer overflow-hidden glass-select ${
    isNight
      ? "border-white/25 text-white focus:ring-[#F6E500]"
      : "border-white/65 text-black focus:ring-[#39B4E8]"
  } ${disabled ? "opacity-60 pointer-events-none" : ""}`;
  const listCls = `rounded-2xl border bg-clip-padding backdrop-blur-xl ${
    isNight
      ? "bg-white/12 border-white/20 text-white"
      : "bg-white/80 border-white/60 text-black"
  } shadow-[0_12px_30px_rgba(0,0,0,0.18)] overflow-y-auto scroll-glass`;

  return (
    <>
      <div ref={ref} className={`relative w-full ${className}`} style={style}>
        <div
          className={wrapperCls}
          onClick={() => !disabled && setOpen(!open)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="flex-1 min-w-0 truncate">
            {current || placeholder}
          </span>
          <ChevronDown
            className={`ml-2 h-4 w-4 opacity-60 flex-shrink-0 transition-transform ${
              open && shouldOpenUpward ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>
      {open && (
        <>
          <div
            className="fixed inset-0"
            style={{
              zIndex: 9998,
              backdropFilter: "blur(0.5px)",
              WebkitBackdropFilter: "blur(0.5px)",
              backgroundColor: isNight
                ? "rgba(0,0,0,0.05)"
                : "rgba(0,0,0,0.02)",
            }}
            onClick={() => setOpen(false)}
          />
          {ReactDOM.createPortal(
            <ul
              role="listbox"
              className={listCls}
              style={{
                position: "fixed",
                top: shouldOpenUpward ? "auto" : `${dropdownPosition.top}px`,
                bottom: shouldOpenUpward
                  ? `${window.innerHeight - dropdownPosition.top + 8}px`
                  : "auto",
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                maxHeight: `${dropdownPosition.maxHeight}px`,
                zIndex: 9999,
              }}
            >
              {options.map((opt, idx) => (
                <li
                  key={`${String(opt)}-${idx}`}
                  role="option"
                  aria-selected={opt === value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(opt);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                    isNight
                      ? opt === value
                        ? "bg-white/15"
                        : "hover:bg-white/10"
                      : opt === value
                      ? "bg-white/70"
                      : "hover:bg-white/60"
                  }`}
                >
                  {String(opt) || "(None)"}
                </li>
              ))}
            </ul>,
            document.body
          )}
        </>
      )}
    </>
  );
}

// ---------------- Frosted Date Picker ----------------

function FrostedDate({
  value,
  onChange,
  onOpenChange,
  disabled = false,
  required = false,
  error = "",
  placeholder = "Select date",
}) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() =>
    value ? new Date(value) : new Date()
  );
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        onOpenChange?.(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onOpenChange]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        onOpenChange?.(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onOpenChange]);

  useEffect(() => {
    if (value) setView(new Date(value));
  }, [value]);

  const format = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const display = (val) => {
    if (!val) return "";
    try {
      return new Date(val).toLocaleDateString("en-IN");
    } catch {
      return val;
    }
  };

  const invalid = required && !value && !disabled;
  const showError = !!error || invalid;

  const wrapperCls = `
    relative w-full glass-select rounded-2xl border px-3 py-2 flex items-center justify-between cursor-pointer
    transition-all duration-200
    ${
      isNight
        ? "bg-white/10 text-white focus:ring-[#F6E500] disabled:bg-white/5 disabled:text-white/50"
        : "bg-white/60 text-gray-900 focus:ring-[#39B4E8] disabled:bg-gray-100 disabled:text-gray-500"
    }
    ${
      showError
        ? "border-red-500 ring-1 ring-red-300"
        : isNight
        ? "border-white/25"
        : "border-gray-300"
    }
  `;

  const popCls = `
    absolute left-0 top-full mt-2 z-50 rounded-2xl border bg-clip-padding backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.18)] p-3
    ${
      isNight
        ? "bg-white/12 border-white/20 text-white"
        : "bg-white/80 border-white/60 text-black"
    }
  `;

  return (
    <div ref={ref} className="relative">
      <div
        className={`${wrapperCls} ${
          disabled ? "opacity-60 pointer-events-none" : ""
        }`}
        onClick={() => {
          if (disabled) return;
          const next = !open;
          setOpen(next);
          onOpenChange?.(next);
        }}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>{display(value) || placeholder}</span>
        <CalendarIcon className="h-4 w-4 opacity-60" />
      </div>

      {open && (
        <div className={popCls} style={{ width: 280 }}>
          <MiniCalendar
            value={view}
            onChange={(d) => {
              onChange(format(d));
              setOpen(false);
              onOpenChange?.(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

// ---------------- Mini Calendars ----------------
function MiniCalendar({ value, onChange }) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  const today = new Date();
  const [view, setView] = useState(
    new Date(value.getFullYear(), value.getMonth(), 1)
  );
  const start = new Date(view.getFullYear(), view.getMonth(), 1);
  const end = new Date(view.getFullYear(), view.getMonth() + 1, 0);
  const startWeekDay = start.getDay();
  const days = [
    ...Array(startWeekDay).fill(null),
    ...Array(end.getDate())
      .fill(0)
      .map((_, i) => i + 1),
  ];

  return (
    <div className="select-none -mt-2">
      <div className="flex items-center justify-between mb-1">
        <Button
          variant="ghost"
          onClick={() =>
            setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))
          }
        >
          ‹
        </Button>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {view.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </div>
          <Button
            variant="ghost"
            className="px-2 py-1 text-xs"
            onClick={() => {
              const t = new Date();
              setView(new Date(t.getFullYear(), t.getMonth(), 1));
              onChange(t);
            }}
          >
            Today
          </Button>
        </div>
        <Button
          variant="ghost"
          onClick={() =>
            setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))
          }
        >
          ›
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-0">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
          <div key={idx} className="text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 -mt-0.5">
        {days.map((d, i) => {
          const isSelected =
            d !== null &&
            isSameDay(value, new Date(view.getFullYear(), view.getMonth(), d));
          const isTodayActive =
            d !== null &&
            isSameDay(today, new Date(view.getFullYear(), view.getMonth(), d));
          return (
            <button
              key={i}
              onClick={() =>
                d && onChange(new Date(view.getFullYear(), view.getMonth(), d))
              }
              className={`aspect-square rounded-lg text-sm grid place-items-center leading-none tabular-nums ${
                d === null
                  ? "bg-transparent"
                  : isSelected
                  ? "cal-selected shadow-sm"
                  : isNight
                  ? "hover:bg-white/10"
                  : "hover:bg-gray-100"
              } ${
                isTodayActive && !isSelected
                  ? isNight
                    ? "border border-white/40"
                    : "border border-gray-300"
                  : ""
              }`}
            >
              {d ?? ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MiniCalendarWithAgenda({
  value,
  onChange,
  onDateClick,
  getOppsForDate,
}) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  const today = new Date();
  const [view, setView] = useState(
    new Date(value.getFullYear(), value.getMonth(), 1)
  );
  const start = new Date(view.getFullYear(), view.getMonth(), 1);
  const end = new Date(view.getFullYear(), view.getMonth() + 1, 0);
  const startWeekDay = start.getDay();
  const days = [
    ...Array(startWeekDay).fill(null),
    ...Array(end.getDate())
      .fill(0)
      .map((_, i) => i + 1),
  ];

  return (
    <div className="select-none -mt-2">
      <div className="flex items-center justify-between mb-1">
        <Button
          variant="ghost"
          onClick={() =>
            setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))
          }
        >
          ‹
        </Button>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {view.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </div>
          <Button
            variant="ghost"
            className="px-2 py-1 text-xs"
            onClick={() => {
              const t = new Date();
              setView(new Date(t.getFullYear(), t.getMonth(), 1));
              onChange(t);
            }}
          >
            Today
          </Button>
        </div>
        <Button
          variant="ghost"
          onClick={() =>
            setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))
          }
        >
          ›
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-0">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
          <div key={idx} className="text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 -mt-0.5">
        {days.map((d, i) => {
          const currentDate =
            d !== null
              ? new Date(view.getFullYear(), view.getMonth(), d)
              : null;
          const isSelected = d !== null && isSameDay(value, currentDate);
          const isTodayActive = d !== null && isSameDay(today, currentDate);
          const hasItems =
            currentDate &&
            getOppsForDate &&
            getOppsForDate(currentDate).length > 0;
          return (
            <button
              key={i}
              onClick={(e) => {
                if (d) {
                  onChange(currentDate);
                  onDateClick?.(e, currentDate);
                }
              }}
              className={`aspect-square rounded-lg text-sm grid place-items-center leading-none tabular-nums relative ${
                d === null
                  ? "bg-transparent"
                  : isSelected
                  ? "cal-selected shadow-sm"
                  : isNight
                  ? "hover:bg-white/10"
                  : "hover:bg-gray-100"
              } ${
                isTodayActive && !isSelected
                  ? isNight
                    ? "border border-white/40"
                    : "border border-gray-300"
                  : ""
              }`}
            >
              {d ?? ""}
              {hasItems && (
                <div
                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    isSelected
                      ? "bg-white"
                      : isNight
                      ? "bg-yellow-400"
                      : "bg-blue-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------- Gantt----------------
function GanttMonth({ items, monthDate, rows = 1 }) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const monthStart = new Date(y, m, 1);
  const monthEnd = new Date(y, m + 1, 0);
  const daysInMonth = monthEnd.getDate();

  const rowsData = items.map((o) => {
    const start = new Date(
      Math.max(new Date(o.createdAt).getTime(), monthStart.getTime())
    );
    const end = new Date(
      Math.min(new Date(o.closeDate).getTime(), monthEnd.getTime())
    );
    const startDay = start.getDate();
    const span = Math.max(1, end.getDate() - start.getDate() + 1);
    return { id: o.id, title: o.title, status: o.status, startDay, span };
  });

  return (
    <div
      className={
        "border rounded-xl p-2 " +
        (isNight
          ? "bg-white/10 border-white/25 text-white"
          : "bg-white/40 text-gray-800")
      }
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(0,1fr))`,
        }}
      >
        <div></div>
        {Array.from({ length: daysInMonth }).map((_, i) => (
          <div
            key={i}
            className={`text-[10px] text-center ${
              isNight ? "text-white/70" : "text-gray-500"
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
      {rowsData.slice(0, rows === 1 ? 6 : rows === 2 ? 10 : 12).map((r) => (
        <div
          key={r.id}
          className="grid items-center"
          style={{
            gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(0,1fr))`,
          }}
        >
          <div
            className={`truncate text-xs pr-2 ${
              isNight ? "text-white" : "text-gray-700"
            }`}
          >
            {r.title}
          </div>
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const show = day === r.startDay;
            return (
              <div key={i} className="h-5 relative">
                {show && (
                  <div
                    className="absolute inset-y-1 left-0 rounded-full"
                    style={{
                      width: `calc(${r.span} * 100%)`,
                      background: `linear-gradient(90deg, ${
                        STATUS_COLORS[r.status]
                      } 0%, ${STATUS_COLORS[r.status]} 100%)`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
      {rowsData.length === 0 && (
        <div className="text-xs text-gray-400 px-2 py-3">
          No items this month
        </div>
      )}
      <div
        className={`flex flex-wrap gap-3 mt-3 text-xs ${
          isNight ? "text-white/80" : "text-gray-700"
        }`}
      >
        {Object.entries(STATUS_COLORS).map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: v }} />
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------- Search ----------------
function SearchModal({ isOpen, onClose, opps, onViewDetails }) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  const [searchId, setSearchId] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchId("");
      setSearchCustomer("");
      setSearchProduct("");
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  const handleSearch = () => {
    let results = [...opps];
    if (searchId.trim())
      results = results.filter((o) => o.id.toString() === searchId.trim());
    if (searchCustomer.trim())
      results = results.filter((o) =>
        o.customerName
          ?.toLowerCase()
          .includes(searchCustomer.toLowerCase().trim())
      );
    if (searchProduct.trim())
      results = results.filter((o) =>
        o.product?.toLowerCase().includes(searchProduct.toLowerCase().trim())
      );
    setSearchResults(results);
    setHasSearched(true);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-3xl max-h-[80vh] rounded-3xl ${
          isNight
            ? "bg-white/10 border-white/20"
            : "bg-white/20 border-white/40"
        } bg-clip-padding backdrop-blur-xl backdrop-saturate-150 border shadow-[0_16px_40px_rgba(0,0,0,0.20)] overflow-hidden flex flex-col`}
      >
        <CardHeader
          title="Search Opportunities"
          subtitle="Search by ID, Customer, or Product"
          right={
            <Button variant="ghost" onClick={onClose}>
              <XIcon className="h-4 w-4" />
            </Button>
          }
        />
        <CardBody className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label>Opportunity ID</Label>
              <Input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g., 123"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div>
              <Label>Customer Name</Label>
              <Input
                type="text"
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                placeholder="e.g., Customer 1"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div>
              <Label>Product</Label>
              <Input
                type="text"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                placeholder="e.g., Product name"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <div className="flex gap-2 mb-6">
            <Button
              onClick={handleSearch}
              disabled={!searchId && !searchCustomer && !searchProduct}
            >
              <Search className="h-4 w-4" /> Search
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSearchId("");
                setSearchCustomer("");
                setSearchProduct("");
                setSearchResults([]);
                setHasSearched(false);
              }}
            >
              Clear
            </Button>
          </div>
          {hasSearched && (
            <div>
              <div
                className={`text-sm mb-3 ${
                  isNight ? "text-white/70" : "text-gray-600"
                }`}
              >
                Found {searchResults.length} result
                {searchResults.length !== 1 ? "s" : ""}
              </div>
              {searchResults.length > 0 ? (
                <div
                  className={`overflow-x-auto border rounded-2xl scroll-glass ${
                    isNight
                      ? "bg-white/8 border-white/15"
                      : "bg-white/40 border-white/50"
                  } bg-clip-padding backdrop-blur-sm`}
                >
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr
                        className={`${
                          isNight ? "text-white/70" : "text-gray-600"
                        } text-left`}
                      >
                        <th className="py-2 px-3">ID</th>
                        <th className="py-2 px-3">Title</th>
                        <th className="py-2 px-3">Customer</th>
                        <th className="py-2 px-3">Product</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((o) => (
                        <tr
                          key={o.id}
                          className={`border-t ${
                            isNight
                              ? "border-white/10 hover:bg-white/5"
                              : "hover:bg-black/5"
                          }`}
                        >
                          <td className="py-2 px-3">
                            <button
                              onClick={() => {
                                onViewDetails(o.id);
                                onClose();
                              }}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                            >
                              #{o.id}
                            </button>
                          </td>
                          <td className="py-2 px-3 font-medium">{o.title}</td>
                          <td className="py-2 px-3">{o.customerName || "-"}</td>
                          <td className="py-2 px-3">{o.product || "-"}</td>
                          <td className="py-2 px-3">
                            <span
                              className="px-2 py-1 rounded-lg text-xs"
                              style={{
                                background: `${
                                  STATUS_COLORS[o.status] || "#999"
                                }22`,
                                color: isNight ? "#fff" : "#111",
                              }}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            ${Number(o.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  className={`text-center py-8 ${
                    isNight ? "text-white/50" : "text-gray-500"
                  }`}
                >
                  No opportunities found
                </div>
              )}
            </div>
          )}
        </CardBody>
      </div>
    </div>
  );
}

// ---------------- FAB Navigation----------------
function FloatingNav({
  goOpps,
  onSignOut,
  onGoDashboard,
  onSearch,
  onGoMasterData,
  onGoAnalytics,
  isAdminUser,
  onGoApprovals,
}) {
  const theme = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const isNight = theme === "sunset";
  const glass = isNight
    ? "bg-white/12 border-white/20"
    : "bg-white/20 border-white/40";
  const btnBase = `h-14 w-14 rounded-full border ${glass} bg-clip-padding backdrop-blur-xl backdrop-saturate-150 shadow-[0_10px_30px_rgba(0,0,0,0.15)] grid place-items-center`;

  const actions = [
    {
      key: "dashboard",
      icon: <LayoutDashboard className="h-6 w-6" />,
      onClick: () => onGoDashboard?.(),
      label: "Dashboard",
    },
    {
      key: "accounts",
      icon: <UserIcon className="h-6 w-6" />,
      onClick: () => alert("Accounts - Coming Soon"),
      label: "Accounts",
    },
    {
      key: "opps",
      icon: <TableIcon className="h-6 w-6" />,
      onClick: () => goOpps?.(),
      label: "My Opportunities",
    },
    {
      key: "analytics",
      icon: <TrendingUp className="h-6 w-6" />,
      onClick: () => onGoAnalytics?.(),
      label: "Analytics",
    },
    // { key: "search", icon: <Search className="h-6 w-6" />, onClick: () => onSearch?.(), label: "Search" },
    {
      key: "logout",
      icon: <LogOut className="h-6 w-6" />,
      onClick: () => onSignOut?.(),
      label: "Sign Out",
    },
    ``,
  ];

  if (onGoMasterData) {
    actions.splice(4, 0, {
      key: "masterdata",
      icon: <Database className="h-6 w-6" />,
      onClick: () => onGoMasterData?.(),
      label: "Master Data",
    });
  }
  if (onGoApprovals) {
    actions.splice(4, 0, {
      key: "approvals",
      icon: <Database className="h-6 w-6" />,
      onClick: () => onGoApprovals?.(),
      label: "Approvals",
    });
  }

  const maxHeight = actions.length * 70 + 70;

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{
        height: open ? `${maxHeight}px` : "56px",
        width: "56px",
        transition: "height 0.3s ease",
      }}
    >
      {actions.map((a, index) => {
        const bottomOffset = (index + 1) * 70;
        return (
          <div
            key={a.key}
            className="absolute bottom-0 right-0"
            style={{
              transform: open
                ? `translateY(-${bottomOffset}px)`
                : "translate(0, 0)",
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
              transition: `all ${200 + index * 30}ms cubic-bezier(.2,.8,.2,1)`,
              transitionDelay: open ? `${index * 20}ms` : "0ms",
            }}
          >
            <div className="relative group">
              <button
                className={`${btnBase} hover:scale-110 transition-transform`}
                onClick={a.onClick}
                aria-label={a.label}
                title={a.label}
              >
                {a.icon}
              </button>
              <span
                className={`pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl text-xs whitespace-nowrap shadow-lg opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ${
                  isNight
                    ? "bg-white/20 border border-white/25 text-white"
                    : "bg-white/70 border border-white/50 text-gray-900"
                } backdrop-blur-2xl`}
              >
                {a.label}
              </span>
            </div>
          </div>
        );
      })}
      <button
        className={`${btnBase} ${
          open
            ? isNight
              ? "ring-2 ring-[#F6E500]"
              : "ring-2 ring-[#00205C]"
            : ""
        } hover:scale-110 transition-transform absolute bottom-0 right-0`}
        aria-label="Quick navigation"
        title="Quick Navigation"
      >
        <LayoutDashboard className="h-6 w-6" />
      </button>
    </div>
  );
}

// ---------------- Inputs ----------------
function Label({ children }) {
  const theme = useContext(ThemeContext);
  return (
    <span
      className={`text-xs ${
        theme === "sunset" ? "text-white/70" : "text-gray-600"
      }`}
    >
      {children}
    </span>
  );
}
function Input({ ...props }) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  return (
    <input
      {...props}
      className={`rounded-2xl border px-3 py-2 focus:ring-2 outline-none w-full ${
        isNight
          ? "bg-white/10 border-white/25 text-white placeholder-white/50 focus:ring-[#F6E500] disabled:bg-white/5 disabled:text-white/50"
          : "bg-white/60 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#39B4E8] disabled:bg-gray-100 disabled:text-gray-500"
      } ${props.className || ""}`}
    />
  );
}
function Textarea({ ...props }) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  return (
    <textarea
      {...props}
      className={`rounded-2xl border px-3 py-2 focus:ring-2 outline-none w-full min-h-[90px] ${
        isNight
          ? "bg-white/10 border-white/25 text-white placeholder-white/50 focus:ring-[#F6E500] disabled:bg-white/5 disabled:text-white/50"
          : "bg-white/60 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#39B4E8] disabled:bg-gray-100 disabled:text-gray-500"
      } ${props.className || ""}`}
    />
  );
}

// ---------------- Login----------------
function LoginPage({ onSubmit, onSignup }) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [su, setSu] = useState({
    firstName: "",
    lastName: "",
    preferredName: "",
    email: "",
  });
  const [suErr, setSuErr] = useState("");
  const [suSuccess, setSuSuccess] = useState(false);
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const doleEmail = /^[A-Za-z0-9._%+-]+@doleintl\.com$/i;

  async function handleSignIn(e) {
    e.preventDefault();
    const emailTrim = email.trim();
    const doleEmail = /^[A-Za-z0-9._%+-]+@doleintl\.com$/i;

    if (!doleEmail.test(emailTrim)) {
      setError("Use your @doleintl.com email");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const ok = await onSubmit(emailTrim);
      setSubmitting(false);

      if (!ok) {
        setError("User not found. Please sign up to create an account.");
      }
    } catch (err) {
      setSubmitting(false);
      setError("An error occurred. Please try again.");
    }
  }

  function openSu() {
    setSu({
      firstName: "",
      lastName: "",
      preferredName: "",
      email: email.trim(),
    });
    setSuErr("");
    setSuSuccess(false);
    setOpenSignup(true);
  }

  async function submitSignup(e) {
    e.preventDefault();

    if (!su.firstName || !su.lastName || !doleEmail.test(su.email.trim())) {
      setSuErr("First, Last and a valid @doleintl.com Email are required");
      return;
    }

    setSignupSubmitting(true);
    setSuErr("");

    try {
      const ok = await onSignup(su);

      if (ok === true) {
        setSuSuccess(true);
        setTimeout(() => {
          setOpenSignup(false);
          setSuSuccess(false);
        }, 3000);
      } else {
        setSuErr(
          typeof ok === "string" ? ok : "Failed to submit signup request"
        );
      }
    } catch (err) {
      setSuErr(
        "An error occurred while submitting your request. Please try again."
      );
    } finally {
      setSignupSubmitting(false);
    }
  }

  function closeSignupModal() {
    setOpenSignup(false);
    setSuSuccess(false);
    setSuErr("");
  }

  return (
    <div
      className={`min-h-screen grid md:grid-cols-2 ${
        isNight ? "theme-sunset text-white" : "theme-sunrise text-gray-900"
      }`}
      style={{
        background: isNight
          ? `radial-gradient(1000px 700px at 15% -10%, rgba(0,20,137,0.35), transparent 60%), radial-gradient(900px 600px at 90% 110%, rgba(200,16,46,0.25), transparent 55%), linear-gradient(180deg, #0b1740 0%, #030817 100%)`
          : `radial-gradient(1000px 700px at 12% -5%, rgba(57,180,232,0.10), transparent 60%), radial-gradient(900px 600px at 88% 105%, rgba(0,32,92,0.08), transparent 55%)`,
      }}
    >
      <div className="hidden md:flex items-center justify-center p-10">
        <div className="max-w-xl">
          <div className="flex items-center gap-5">
            <img
              src="/vector.png"
              alt="Vector"
              className="h-28 w-auto flex-shrink-0 drop-shadow"
            />
            <div className="text-left">
              <h1
                className={`text-4xl font-semibold tracking-tight ${
                  isNight ? "text-white" : "text-gray-900"
                }`}
              >
                Vector
              </h1>
              <p
                className={`mt-1 text-base ${
                  isNight ? "text-white/70" : "text-gray-600"
                }`}
              >
                Your Opportunity Pipeline Hub
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex items-center justify-center px-6 py-10">
        <Card className="w-full max-w-md">
          <CardHeader title="Welcome" subtitle="Use your work email" />
          <CardBody>
            <form onSubmit={handleSignIn} className="grid gap-3">
              <label className="grid gap-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="your.name@doleintl.com"
                  pattern="^[A-Za-z0-9._%+-]+@doleintl\.com$"
                  title="Use your @doleintl.com work email"
                  disabled={submitting}
                />
              </label>
              {error && (
                <div
                  className={`mt-2 text-sm ${
                    error.includes("not found")
                      ? "text-amber-600"
                      : "text-red-500"
                  }`}
                >
                  {error}
                  {error.includes("not found") && (
                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={openSu}
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        Click here to sign up
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleSignIn} disabled={submitting}>
                  {submitting ? "Signing In..." : "Sign In"}
                </Button>
                <Button type="button" variant="ghost" onClick={openSu}>
                  Sign Up
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>

      {openSignup && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={closeSignupModal}
          />
          <Card
            className={`relative w-full max-w-lg ${
              isNight
                ? "bg-white/10 border-white/20"
                : "bg-white/20 border-white/40"
            }`}
          >
            <CardHeader
              title={suSuccess ? "Request Submitted!" : "Create Account"}
              subtitle={
                suSuccess
                  ? "Your request has been submitted for admin approval"
                  : "Submit for admin approval"
              }
              right={
                <Button variant="ghost" onClick={closeSignupModal}>
                  Close
                </Button>
              }
            />
            <CardBody>
              {suSuccess ? (
                <div className="text-center py-8">
                  <div
                    className={`text-6xl mb-4 ${
                      isNight ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    ✓
                  </div>
                  <p
                    className={`text-lg ${
                      isNight ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Your registration request has been submitted successfully!
                  </p>
                  <p
                    className={`text-sm mt-2 ${
                      isNight ? "text-white/70" : "text-gray-600"
                    }`}
                  >
                    An admin will review your request and you'll be notified
                    once approved.
                  </p>
                  <p
                    className={`text-xs mt-4 ${
                      isNight ? "text-white/50" : "text-gray-500"
                    }`}
                  >
                    This window will close automatically in a few seconds.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={submitSignup}
                  className="grid md:grid-cols-2 gap-4"
                >
                  <label className="grid gap-1">
                    <Label>First Name</Label>
                    <Input
                      value={su.firstName}
                      onChange={(e) =>
                        setSu({ ...su, firstName: e.target.value })
                      }
                      disabled={signupSubmitting}
                    />
                  </label>
                  <label className="grid gap-1">
                    <Label>Last Name</Label>
                    <Input
                      value={su.lastName}
                      onChange={(e) =>
                        setSu({ ...su, lastName: e.target.value })
                      }
                      disabled={signupSubmitting}
                    />
                  </label>
                  <label className="grid gap-1 md:col-span-2">
                    <Label>Preferred Name</Label>
                    <Input
                      value={su.preferredName}
                      onChange={(e) =>
                        setSu({ ...su, preferredName: e.target.value })
                      }
                      disabled={signupSubmitting}
                    />
                  </label>
                  <label className="grid gap-1 md:col-span-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={su.email}
                      onChange={(e) => setSu({ ...su, email: e.target.value })}
                      placeholder="your.name@doleintl.com"
                      pattern="^[A-Za-z0-9._%+-]+@doleintl\.com$"
                      title="Use your @doleintl.com work email"
                      disabled={signupSubmitting}
                    />
                  </label>
                  {suErr && (
                    <div
                      className={`md:col-span-2 ${
                        isNight ? "text-amber-200" : "text-amber-700"
                      } text-xs`}
                    >
                      {suErr}
                    </div>
                  )}
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={closeSignupModal}
                      disabled={signupSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={signupSubmitting}>
                      {signupSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </form>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

// ---- Master Data: User Registration ----
function UserRegistrationTable({ currentUser }) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";

  const [liveUsers, setLiveUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editEmail, setEditEmail] = useState(null);
  const [draft, setDraft] = useState(null);

  async function refresh() {
    try {
      setLoading(true);
      const [live, pend] = await Promise.all([
        apiFetchUsers(),
        apiFetchPendingUsers(),
      ]);
      setLiveUsers(Array.isArray(live) ? live : []);
      setPending(
        (Array.isArray(pend) ? pend : []).map((u) => ({
          ...u,
          pending: true,
          isRsm: !!u.isRsm,
          isAll: !!u.isAll,
          isAdmin: !!u.isAdmin,
        }))
      );
      setError("");
    } catch {
      setLiveUsers([]);
      setPending([]);
      setError("Failed to load user registrations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const isAdmin = liveUsers.some(
    (r) =>
      (r.email || "").toLowerCase() === (currentUser || "").toLowerCase() &&
      !!r.isAdmin
  );

  const rows = useMemo(() => [...liveUsers, ...pending], [liveUsers, pending]);

  async function approve(row) {
    if (!(row.isRsm || row.isAll || row.isAdmin)) {
      alert("Select at least one role (RSM, All, or Admin) before approving.");
      return;
    }
    try {
      await apiApprovePendingUser(row.email, {
        isRsm: !!row.isRsm,
        isAll: !!row.isAll,
        isAdmin: !!row.isAdmin,
      });
      await refresh();
    } catch {
      alert("Failed to approve user.");
    }
  }

  async function reject(row) {
    try {
      await apiRejectPendingUser(row.email);
      await refresh();
    } catch {
      alert("Failed to reject user.");
    }
  }

  async function saveLiveEdits(email, updated) {
    try {
      await apiUpdateUser(email, {
        firstName: updated.firstName,
        lastName: updated.lastName,
        preferredName: updated.preferredName,
        isRsm: !!updated.isRsm,
        isAll: !!updated.isAll,
        isAdmin: !!updated.isAdmin,
      });
      setEditEmail(null);
      setDraft(null);
      await refresh();
    } catch {
      alert("Failed to save changes.");
    }
  }

  const tableShell =
    (isNight ? "bg-white/8 border-white/15" : "bg-white/40 border-white/50") +
    " bg-clip-padding backdrop-blur-sm";

  return (
    <Card>
      <CardHeader
        title="User Registration"
        subtitle="Users from SAP Datasphere"
        right={<Button onClick={refresh}>Refresh</Button>}
      />
      <CardBody>
        {error && (
          <div
            className={`${
              isNight ? "text-amber-200" : "text-amber-700"
            } text-xs mb-2`}
          >
            {error}
          </div>
        )}
        <div
          className={`overflow-x-auto border rounded-2xl scroll-glass ${tableShell}`}
        >
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr
                className={`${
                  isNight
                    ? "text-white/80 bg-white/10"
                    : "text-gray-700 bg-white/80"
                } backdrop-blur-md`}
              >
                <th className="py-2 px-3 w-32">First</th>
                <th className="py-2 px-3 w-32">Last</th>
                <th className="py-2 px-3 w-40">Preferred</th>
                <th className="py-2 px-3 w-80">Email</th>
                <th className="py-2 px-3 w-20">RSM</th>
                <th className="py-2 px-3 w-20">All</th>
                <th className="py-2 px-3 w-24">Admin</th>
                <th className="py-2 px-3 w-28">Status</th>
                {isAdmin && <th className="py-2 px-3 w-40">Action</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 9 : 8}
                    className={`${
                      isNight ? "text-white/70" : "text-gray-600"
                    } py-6 px-3`}
                  >
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 9 : 8}
                    className={`${
                      isNight ? "text-white/60" : "text-gray-500"
                    } py-6 px-3`}
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const isPending = !!row.pending;
                  const isEditing = !isPending && editEmail === row.email;
                  const view = isEditing ? draft : row;

                  return (
                    <tr
                      key={`${row.email}${isPending ? ":pending" : ""}`}
                      className={`border-t ${
                        isNight ? "border-white/10" : "border-white/60"
                      }`}
                    >
                      <td className="py-2 px-3">
                        {isEditing ? (
                          <Input
                            value={view.firstName || ""}
                            onChange={(e) =>
                              setDraft({ ...view, firstName: e.target.value })
                            }
                          />
                        ) : (
                          row.firstName
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {isEditing ? (
                          <Input
                            value={view.lastName || ""}
                            onChange={(e) =>
                              setDraft({ ...view, lastName: e.target.value })
                            }
                          />
                        ) : (
                          row.lastName
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {isEditing ? (
                          <Input
                            value={view.preferredName || ""}
                            onChange={(e) =>
                              setDraft({
                                ...view,
                                preferredName: e.target.value,
                              })
                            }
                          />
                        ) : (
                          row.preferredName || "-"
                        )}
                      </td>
                      <td className="py-2 px-3">{row.email}</td>
                      <td className="py-2 px-3">
                        {isPending && isAdmin ? (
                          <input
                            type="checkbox"
                            checked={!!row.isRsm}
                            onChange={(e) =>
                              setPending((prev) =>
                                prev.map((u) =>
                                  u.email === row.email
                                    ? { ...u, isRsm: e.target.checked }
                                    : u
                                )
                              )
                            }
                          />
                        ) : isEditing ? (
                          <input
                            type="checkbox"
                            checked={!!view.isRsm}
                            onChange={(e) =>
                              setDraft({ ...view, isRsm: e.target.checked })
                            }
                          />
                        ) : row.isRsm ? (
                          "✓"
                        ) : (
                          <span
                            className={
                              isNight ? "text-white/30" : "text-gray-300"
                            }
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {isPending && isAdmin ? (
                          <input
                            type="checkbox"
                            checked={!!row.isAll}
                            onChange={(e) =>
                              setPending((prev) =>
                                prev.map((u) =>
                                  u.email === row.email
                                    ? { ...u, isAll: e.target.checked }
                                    : u
                                )
                              )
                            }
                          />
                        ) : isEditing ? (
                          <input
                            type="checkbox"
                            checked={!!view.isAll}
                            onChange={(e) =>
                              setDraft({ ...view, isAll: e.target.checked })
                            }
                          />
                        ) : row.isAll ? (
                          "✓"
                        ) : (
                          <span
                            className={
                              isNight ? "text-white/30" : "text-gray-300"
                            }
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {isPending && isAdmin ? (
                          <input
                            type="checkbox"
                            checked={!!row.isAdmin}
                            onChange={(e) =>
                              setPending((prev) =>
                                prev.map((u) =>
                                  u.email === row.email
                                    ? { ...u, isAdmin: e.target.checked }
                                    : u
                                )
                              )
                            }
                          />
                        ) : isEditing ? (
                          <input
                            type="checkbox"
                            checked={!!view.isAdmin}
                            onChange={(e) =>
                              setDraft({ ...view, isAdmin: e.target.checked })
                            }
                          />
                        ) : row.isAdmin ? (
                          "✓"
                        ) : (
                          <span
                            className={
                              isNight ? "text-white/30" : "text-gray-300"
                            }
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {isPending ? (
                          <span
                            className="px-2 py-1 rounded-lg text-xs"
                            style={{
                              background: isNight
                                ? "rgba(255,255,255,0.12)"
                                : "rgba(0,0,0,0.06)",
                            }}
                          >
                            Pending
                          </span>
                        ) : (
                          <span
                            className="px-2 py-1 rounded-lg text-xs"
                            style={{
                              background: isNight
                                ? "rgba(40,167,69,0.25)"
                                : "rgba(34,197,94,0.18)",
                            }}
                          >
                            Active
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-2 px-3">
                          {isPending ? (
                            <div className="flex gap-2">
                              <Button onClick={() => approve(row)}>
                                Approve
                              </Button>
                              <Button onClick={() => reject(row)}>
                                Reject
                              </Button>
                            </div>
                          ) : isEditing ? (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => saveLiveEdits(row.email, draft)}
                              >
                                Save
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setEditEmail(null);
                                  setDraft(null);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setEditEmail(row.email);
                                setDraft({ ...row });
                              }}
                            >
                              Edit
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}

async function apiApproveRequest({ payload }) {
  console.log("Appproved", payload);

  {
    /* Once API is ready we can test via posting the data */
  }
  // const res = await fetch(`${API_BASE_URL}/overrideTracker`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Accept: "application/json",
  //     },
  //     credentials: "include",
  //     mode: "cors",
  //     body: JSON.stringify(payload),
  //   });
  //   if (!res.ok)
  //     console.log("error",res.status,res.text());
  //     throw new Error(
  //       `Failed to Post the approve: ${res.status} ${await res.text()}`
  //     );
}

async function apiRejectRequest({ payload }) {
  console.log("Rejected:", payload);
  return { success: true };
}

function OverridePriceApprovalRequestsTable({ currentUser }) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRow, setActiveRow] = useState(null);
  const [comment, setComment] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Fetch only Pending approvals
  async function refresh() {
    try {
      setLoading(true);
      const data = await apiFetchApprovals();
      const pendingOnly = Array.isArray(data)
        ? data.filter((r) => r.status === "Pending")
        : [];
      setApprovals(pendingOnly);
      setError("");
    } catch {
      setApprovals([]);
      setError("Failed to load approval requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSubmit(row, action) {
    try {
      if (action === "approve") {
        await apiApproveRequest({
          payload: {
            Opportunity_ID: row.id,
            CurrentPrice: row.currentPrice,
            OverridePrice: row.overridePrice,
            BussinessJustification: row.BussinessJustification,
            DateOfRequest: row.dateRaised,
            DateOfApproval: new Date().toISOString().split("T")[0],
            BussinessJusti: "",
            ApprovalStatus: "Approved",
          },
        });
      } else {
        await apiRejectRequest({
          payload: {
            Opportunity_ID: row.id,
            CurrentPrice: row.currentPrice,
            OverridePrice: row.overridePrice,
            BussinessJustification: "Approve raised from sales",
            DateOfRequest: row.dateRaised,
            DateOfApproval: "",
            BussinessJusti: "",
            ApprovalNote: comment,
            ApprovalStatus: "Rejected",
          },
        });
      }

      // Remove this row from state since it's no longer pending
      setApprovals((prev) => prev.filter((r) => r.id !== row.id));

      // Reset state
      setActiveRow(null);
      setComment("");
    } catch {
      alert("Failed to update request.");
    }
  }

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedApprovals = useMemo(() => {
    if (!sortConfig.key) return approvals;

    return [...approvals].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle numbers
      if (!isNaN(aValue) && !isNaN(bValue)) {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      // Handle dates
      if (
        /^\d{4}-\d{2}-\d{2}$/.test(aValue) ||
        /^\d{4}-\d{2}-\d{2}$/.test(bValue)
      ) {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
      }

      // Handle text
      return sortConfig.direction === "asc"
        ? String(aValue || "").localeCompare(String(bValue || ""))
        : String(bValue || "").localeCompare(String(aValue || ""));
    });
  }, [approvals, sortConfig]);

  const tableShell =
    (isNight ? "bg-white/8 border-white/15" : "bg-white/40 border-white/50") +
    " bg-clip-padding backdrop-blur-sm";

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronsUpDown size={14} />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  return (
    <Card>
      <CardHeader
        title="Override Price Approvals"
        subtitle="Approval requests raised for price overrides"
        right={<Button onClick={refresh}>Refresh</Button>}
      />
      <CardBody>
        {error && (
          <div
            className={`${
              isNight ? "text-amber-200" : "text-amber-700"
            } text-xs mb-2`}
          >
            {error}
          </div>
        )}
        <div
          className={`overflow-x-auto border rounded-2xl scroll-glass ${tableShell}`}
        >
          <table className="min-w-full">
            <thead
              className={`sticky top-0 z-10 ${
                isNight
                  ? "text-white/80 bg-white/10"
                  : "text-gray-700 bg-white/80"
              } backdrop-blur-md`}
            >
              <tr>
                {[
                  { key: "productCategory", label: "Product Category" },
                  { key: "customerName", label: "Customer Name" },
                  { key: "approverName", label: "Approver Name" },
                  { key: "dateRaised", label: "Date Raised" },
                  { key: "currentPrice", label: "Current Price" },
                  { key: "overridePrice", label: "Override Price" },
                  { key: "status", label: "Status" },
                  {
                    key: "BussinessJustification",
                    label: "Business Justification",
                  },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="py-2 px-3 cursor-pointer select-none"
                    onClick={() => requestSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}{" "}
                      <span className="text-xs">{getSortIcon(col.key)}</span>
                    </div>
                  </th>
                ))}
                <th className="py-2 px-3 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className={`${
                      isNight ? "text-white/70" : "text-gray-600"
                    } py-6 px-3`}
                  >
                    Loading…
                  </td>
                </tr>
              ) : sortedApprovals.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className={`${
                      isNight ? "text-white/60" : "text-gray-500"
                    } py-6 px-3`}
                  >
                    No pending approval requests found.
                  </td>
                </tr>
              ) : (
                sortedApprovals.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr
                      className={`border-t ${
                        isNight ? "border-white/10" : "border-white/60"
                      }`}
                    >
                      {/* <td className="py-2 px-3">{row.id}</td> */}
                      <td className="py-2 px-3">{row.productCategory}</td>
                      <td className="py-2 px-3">{row.customerName}</td>
                      <td className="py-2 px-3">{row.approverName}</td>
                      <td className="py-2 px-3">{row.dateRaised}</td>
                      <td className="py-2 px-3">{row.currentPrice}</td>
                      <td className="py-2 px-3">{row.overridePrice}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs ${
                            isNight
                              ? "bg-yellow-700/30 text-yellow-200"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <textarea
                          rows={3}
                          value={row.BussinessJustification}
                          className={`w-full p-2 rounded-lg border ${
                            isNight
                              ? "bg-black/20 border-white/20 text-white"
                              : "bg-white border-gray-300 text-gray-700"
                          }`}
                          readOnly
                        />
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setActiveRow({ id: row.id, action: "approve" });
                              setComment("");
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Yes
                          </Button>
                          <Button
                            onClick={() => {
                              setActiveRow({ id: row.id, action: "reject" });
                              setComment("");
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            No
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {activeRow?.id === row.id && (
                      <tr>
                        <td colSpan={9} className="p-3">
                          <div className="flex flex-col gap-2">
                            <textarea
                              rows={2}
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder="Enter your comments..."
                              className={`w-full p-2 rounded-lg border ${
                                isNight
                                  ? "bg-black/20 border-white/20 text-white"
                                  : "bg-white border-gray-300 text-gray-700"
                              }`}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() =>
                                  handleSubmit(row, activeRow.action)
                                }
                                disabled={!comment.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Submit
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setActiveRow(null);
                                  setComment("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}

function AnalyticsPage({ opps = [], currentUser }) {
  // Access the existing ThemeContext from your app
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";

  // Filter states
  const [selectedSalesLead, setSelectedSalesLead] = useState("All");
  const [selectedSalesTeam, setSelectedSalesTeam] = useState("All");
  const [selectedIndustrySegment, setSelectedIndustrySegment] = useState("All");

  // Extract unique filter values
  const salesLeads = useMemo(() => {
    const leads = new Set();
    opps.forEach((o) => {
      if (o.doleSalesLead || o.sales_Lead)
        leads.add(o.doleSalesLead || o.sales_Lead);
    });
    return ["All", ...Array.from(leads).sort()];
  }, [opps]);

  const salesTeams = useMemo(() => {
    const teams = new Set();
    opps.forEach((o) => {
      if (o.salesTeam || o.sales_Team) teams.add(o.salesTeam || o.sales_Team);
    });
    return ["All", ...Array.from(teams).sort()];
  }, [opps]);

  const industrySegments = useMemo(() => {
    const segments = new Set();
    opps.forEach((o) => {
      if (o.industrySegment || o.industry_Segment)
        segments.add(o.industrySegment || o.industry_Segment);
    });
    return ["All", ...Array.from(segments).sort()];
  }, [opps]);

  // Filter opportunities
  const filteredOpps = useMemo(() => {
    return opps.filter((o) => {
      if (
        selectedSalesLead !== "All" &&
        (o.doleSalesLead || o.sales_Lead) !== selectedSalesLead
      )
        return false;
      if (
        selectedSalesTeam !== "All" &&
        (o.salesTeam || o.sales_Team) !== selectedSalesTeam
      )
        return false;
      if (
        selectedIndustrySegment !== "All" &&
        (o.industrySegment || o.industry_Segment) !== selectedIndustrySegment
      )
        return false;
      return true;
    });
  }, [opps, selectedSalesLead, selectedSalesTeam, selectedIndustrySegment]);

  // Chart data for Sales Stage
  const salesStageData = useMemo(() => {
    const stageMap = new Map();

    filteredOpps.forEach((opp) => {
      const stage =
        opp.salesStage ||
        opp.sales_Stage ||
        opp.status ||
        "Lead: No Current Product Solution";
      const revenue = parseFloat(
        opp.pipelineProjectedRevenue ||
          opp.pipeline_Projected_Revenue ||
          opp.amount ||
          0
      );

      if (revenue > 0) {
        stageMap.set(stage, (stageMap.get(stage) || 0) + revenue);
      }
    });

    return Array.from(stageMap.entries())
      .map(([stage, revenue]) => ({
        stage: stage.replace("Lead: ", "").replace("Post-pipeline: ", ""),
        revenue: revenue,
        fullStage: stage,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredOpps]);

  // Chart data for Sales Lead (for pie chart)
  const salesLeadData = useMemo(() => {
    const leadMap = new Map();

    filteredOpps.forEach((opp) => {
      const lead = opp.doleSalesLead || opp.sales_Lead || "Unknown";
      const revenue = parseFloat(
        opp.pipelineProjectedRevenue ||
          opp.pipeline_Projected_Revenue ||
          opp.amount ||
          0
      );

      if (revenue > 0) {
        leadMap.set(lead, (leadMap.get(lead) || 0) + revenue);
      }
    });

    return Array.from(leadMap.entries())
      .map(([lead, revenue]) => ({
        lead: lead,
        revenue: revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredOpps]);

  // Chart data for Top Customers (bar chart)
  const topCustomersData = useMemo(() => {
    const customerMap = new Map();

    filteredOpps.forEach((opp) => {
      const customer = opp.customerName || opp.customer_Name || "Unknown";
      const revenue = parseFloat(
        opp.pipelineProjectedRevenue ||
          opp.pipeline_Projected_Revenue ||
          opp.amount ||
          0
      );

      if (revenue > 0) {
        customerMap.set(customer, (customerMap.get(customer) || 0) + revenue);
      }
    });

    return Array.from(customerMap.entries())
      .map(([customer, revenue]) => ({
        customer:
          customer.length > 15 ? customer.substring(0, 15) + "..." : customer, // Truncate long names
        revenue: revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8); // Top 8 customers
  }, [filteredOpps]);

  // Component styles
  const cardClass = isNight
    ? "bg-white/5 border-white/20"
    : "bg-white/10 border-white/40";

  const tileClass = `rounded-3xl border ${cardClass} bg-clip-padding backdrop-blur-xl backdrop-saturate-150 shadow-lg`;

  const textMuted = isNight ? "text-white/70" : "text-gray-600";

  // Chart theme
  const chartTheme = isNight
    ? {
        axisStroke: "rgba(255,255,255,0.7)",
        gridStroke: "rgba(255,255,255,0.12)",
        tooltipBg: "rgba(11,23,64,0.90)",
        tooltipBorder: "1px solid rgba(255,255,255,0.2)",
        tooltipColor: "#fff",
      }
    : {
        axisStroke: "#64748B",
        gridStroke: "#e5e7eb",
        tooltipBg: "rgba(255,255,255,0.90)",
        tooltipBorder: "1px solid rgba(0,0,0,0.06)",
        tooltipColor: "#111",
      };

  const { axisStroke, gridStroke, tooltipBg, tooltipBorder, tooltipColor } =
    chartTheme;

  // Pie chart colors
  const pieColors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#EC4899",
    "#6366F1",
  ];

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div
        className={`rounded-3xl border ${cardClass} bg-clip-padding backdrop-blur-xl backdrop-saturate-150 shadow-lg p-6 mb-6`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Analytics Dashboard
            </h1>
            <p className={textMuted}>Pipeline Revenue Analysis</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm ${textMuted} mb-1`}>
              Sales Lead
            </label>
            <FrostedSelect
              value={selectedSalesLead}
              onChange={setSelectedSalesLead}
              options={salesLeads}
              placeholder="Select sales lead"
            />
          </div>

          <div>
            <label className={`block text-sm ${textMuted} mb-1`}>
              Sales Team
            </label>
            <FrostedSelect
              value={selectedSalesTeam}
              onChange={setSelectedSalesTeam}
              options={salesTeams}
              placeholder="Select sales team"
            />
          </div>

          <div>
            <label className={`block text-sm ${textMuted} mb-1`}>
              Industry Segment
            </label>
            <FrostedSelect
              value={selectedIndustrySegment}
              onChange={setSelectedIndustrySegment}
              options={industrySegments}
              placeholder="Select industry segment"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div
          className={`rounded-2xl border ${cardClass} bg-clip-padding backdrop-blur-xl p-4`}
        >
          <div className={`text-sm ${textMuted}`}>Total Revenue</div>
          <div className="text-2xl font-bold mt-1">
            $
            {salesStageData
              .reduce((sum, item) => sum + item.revenue, 0)
              .toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
          </div>
        </div>
        <div
          className={`rounded-2xl border ${cardClass} bg-clip-padding backdrop-blur-xl p-4`}
        >
          <div className={`text-sm ${textMuted}`}>Active Stages</div>
          <div className="text-2xl font-bold mt-1">{salesStageData.length}</div>
        </div>
        <div
          className={`rounded-2xl border ${cardClass} bg-clip-padding backdrop-blur-xl p-4`}
        >
          <div className={`text-sm ${textMuted}`}>Active Sales Leads</div>
          <div className="text-2xl font-bold mt-1">{salesLeadData.length}</div>
        </div>
        <div
          className={`rounded-2xl border ${cardClass} bg-clip-padding backdrop-blur-xl p-4`}
        >
          <div className={`text-sm ${textMuted}`}>Filtered Opportunities</div>
          <div className="text-2xl font-bold mt-1">{filteredOpps.length}</div>
        </div>
      </div>

      {/* Three Charts in a Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Sales Stage Bar Chart */}
        <Card className={tileClass}>
          <CardHeader
            title="Revenue by Sales Stage"
            subtitle={`${salesStageData.length} stages with revenue`}
          />
          <CardBody>
            <div style={{ height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesStageData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    dataKey="stage"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 10, fill: axisStroke }}
                    axisLine={{ stroke: axisStroke }}
                    tickLine={{ stroke: axisStroke }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: axisStroke }}
                    axisLine={{ stroke: axisStroke }}
                    tickLine={{ stroke: axisStroke }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Bar
                    dataKey="revenue"
                    fill={isNight ? "#39B4E8" : "#3B82F6"}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Sales Lead Pie Chart */}
        <Card className={tileClass}>
          <CardHeader
            title="Revenue by Sales Lead"
            subtitle={`${salesLeadData.length} sales leads with revenue`}
          />
          <CardBody>
            <div style={{ height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesLeadData}
                    dataKey="revenue"
                    nameKey="lead"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={40}
                    paddingAngle={2}
                    cornerRadius={8}
                  >
                    {salesLeadData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Top Customers Bar Chart */}
        <Card className={tileClass}>
          <CardHeader
            title="Top Customers by Revenue"
            subtitle="Top customers with highest revenue"
          />
          <CardBody>
            <div style={{ height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topCustomersData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    dataKey="customer"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 10, fill: axisStroke }}
                    axisLine={{ stroke: axisStroke }}
                    tickLine={{ stroke: axisStroke }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: axisStroke }}
                    axisLine={{ stroke: axisStroke }}
                    tickLine={{ stroke: axisStroke }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Bar
                    dataKey="revenue"
                    fill={isNight ? "#F6E500" : "#78BE20"}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// ---------------- Main App ----------------
const ALLOWED_COLS = [3, 4, 6, 8, 12];
const ALLOWED_ROWS = [1, 2, 3];
const GAP_PX = 16;
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function TileGrid({
  order,
  setOrder,
  tiles,
  sizeMap,
  setSizeMap,
  staticMode = false,
}) {
  const theme = useContext(ThemeContext);
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [resizing, setResizing] = useState(null);
  const gridRef = useRef(null);

  function onDrop(targetId) {
    if (!dragId || dragId === targetId) return;
    const arr = [...order];
    const from = arr.indexOf(dragId);
    const to = arr.indexOf(targetId);
    if (from === -1 || to === -1) return;
    arr.splice(to, 0, arr.splice(from, 1)[0]);
    setOrder(arr);
    try {
      localStorage.setItem("oppty_layout_v2", JSON.stringify(arr));
    } catch {}
    setDragId(null);
    setOverId(null);
  }
  function startResize(e, id) {
    e.preventDefault();
    const s = sizeMap[id] || { col: tiles[id]?.colLg || 6, rows: 1 };
    setResizing({
      id,
      startX: e.clientX,
      startY: e.clientY,
      startCol: s.col,
      startRows: s.rows,
    });
  }
  function onPointerMove(e) {
    if (!resizing) return;
    const rect = gridRef.current?.getBoundingClientRect();
    const gridWidth = rect ? rect.width : window.innerWidth;
    const colWidth = (gridWidth - GAP_PX * 11) / 12;
    const dx = e.clientX - resizing.startX;
    const dy = e.clientY - resizing.startY;
    const approxColsDelta = Math.round(dx / colWidth);
    const currentIndex = ALLOWED_COLS.indexOf(resizing.startCol);
    let newIndex = clamp(
      currentIndex + approxColsDelta,
      0,
      ALLOWED_COLS.length - 1
    );
    const rowHeight = 180;
    const approxRowsDelta = Math.round(dy / rowHeight);
    const rIndex = ALLOWED_ROWS.indexOf(resizing.startRows);
    let newRIndex = clamp(rIndex + approxRowsDelta, 0, ALLOWED_ROWS.length - 1);
    const next = {
      ...sizeMap,
      [resizing.id]: {
        col: ALLOWED_COLS[newIndex],
        rows: ALLOWED_ROWS[newRIndex],
      },
    };
    setSizeMap(next);
  }
  function endResize() {
    if (!resizing) return;
    try {
      localStorage.setItem("oppty_sizes_v1", JSON.stringify(sizeMap));
    } catch {}
    setResizing(null);
  }

  useEffect(() => {
    const onMove = (e) => onPointerMove(e);
    const onUp = () => endResize();
    if (resizing) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
    }
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [resizing, sizeMap]); // eslint-disable-line react-hooks/exhaustive-deps

  const ringColor = theme === "sunset" ? BRAND.yellow : BRAND.blue;

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 md:grid-cols-12 gap-6"
      style={{ gridAutoRows: "180px" }}
    >
      {order.map((id) => {
        const t = tiles[id];
        if (!t) return null;
        const size = sizeMap[id] || { col: t.colLg, rows: t.rows || 1 };
        const col = size.col;
        let rows = size.rows;
        if (id === "gantt" && rows !== 2) rows = 2;
        const colClass =
          col === 12
            ? "md:col-span-12"
            : col === 8
            ? "md:col-span-8"
            : col === 6
            ? "md:col-span-6"
            : col === 4
            ? "md:col-span-4"
            : col === 3
            ? "md:col-span-3"
            : "md:col-span-12";
        return (
          <div
            key={id}
            className={`col-span-1 ${colClass} relative group`}
            style={{ gridRow: `span ${rows}` }}
            draggable={!staticMode}
            onDragStart={(e) => {
              setDragId(id);
              e.dataTransfer.setData("text/plain", id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (overId !== id) setOverId(id);
            }}
            onDrop={(e) => {
              e.preventDefault();
              onDrop(id);
            }}
            onDragEnd={() => {
              setDragId(null);
              setOverId(null);
            }}
          >
            <div
              className={`h-full transition ${
                overId === id && dragId !== id ? "ring-2 rounded-3xl" : ""
              }`}
              style={{
                boxShadow:
                  overId === id && dragId !== id
                    ? `0 0 0 2px ${ringColor}`
                    : undefined,
              }}
            >
              {t.render(
                staticMode ? null : (
                  <GripVertical className="h-4 w-4 text-gray-400" />
                )
              )}
            </div>
            {!staticMode && (
              <div
                onPointerDown={(e) => startResize(e, id)}
                className="absolute right-2 bottom-2 h-4 w-4 rounded-md bg-white/70 border border-white/50 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition grid place-items-center text-[10px]"
                title="Resize"
              >
                ↘︎
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const defaultColumns = {
    salesLead: true,
    customerName: true,
    product: true,
    status: true,
    estimatedVolume: true,
    likelyStartDate: true,
  };
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return localStorage.getItem("oppty_user") || "";
    } catch {
      return "";
    }
  });
  const [isAdminUser, setIsAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("oppty_is_admin") || "false");
    } catch {
      return false;
    }
  });
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(defaultColumns);
  const [showModal, setShowModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "customerName",
    direction: "asc",
  });

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronsUpDown size={14} />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  async function handleSignup(user) {
    try {
      await apiCreatePendingUser({
        ...user,
        preferredName: user.preferredName || "",
        isRsm: false,
        isAll: false,
        isAdmin: false,
      });
      return true;
    } catch (e) {
      console.error("Signup error:", e);
      return e?.message || "Signup failed";
    }
  }

  async function handleLogin(email) {
    try {
      const user = await apiGetUserByEmail(email); // returns user or null
      if (!user) return false;
      const admin = !!(
        user.isAdmin === true ||
        user.isAdmin === 1 ||
        user.isAdmin === "1"
      );
      setCurrentUser(user.email);
      setIsAdminUser(admin);
      try {
        localStorage.setItem("oppty_user", user.email);
        localStorage.setItem("oppty_is_admin", JSON.stringify(admin));
      } catch {}
      setRoute("dashboard");
      return true;
    } catch {
      return false;
    }
  }

  const [selectedDate, setSelectedDate] = useState(new Date());
  useEffect(() => {
    const now = new Date();
    setSelectedDate(now);
    try {
      localStorage.setItem("oppty_selectedDate", now.toISOString());
    } catch {}
  }, []);

  const [route, setRoute] = useState("dashboard");
  const [detailId, setDetailId] = useState(null);

  const [themeMode, setThemeMode] = useState(() => {
    try {
      return localStorage.getItem("oppty_themeMode") || "auto";
    } catch {
      return "auto";
    }
  });
  const getAutoTheme = () => {
    const hour = new Date().getHours();
    return hour >= 7 && hour < 19 ? "sunrise" : "sunset";
  };
  const theme = themeMode === "auto" ? getAutoTheme() : themeMode;
  useEffect(() => {
    try {
      localStorage.setItem("oppty_themeMode", themeMode);
    } catch {}
  }, [themeMode]);
  useEffect(() => {
    if (themeMode === "auto") {
      const i = setInterval(
        () => setThemeMode((p) => (p === "auto" ? "auto" : p)),
        60000
      );
      return () => clearInterval(i);
    }
  }, [themeMode]);

  const [ownerScope, setOwnerScope] = useState(() => {
    try {
      return localStorage.getItem("oppty_ownerScope") || "me";
    } catch {
      return "me";
    }
  });

  useEffect(() => {
    const saved = localStorage.getItem("visibleColumns");
    if (saved) setVisibleColumns(JSON.parse(saved));
  }, []);

  // Save preferences whenever changed
  useEffect(() => {
    localStorage.setItem("visibleColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const toggleColumn = (key) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  useEffect(() => {
    try {
      localStorage.setItem("oppty_ownerScope", ownerScope);
    } catch {}
  }, [ownerScope]);

  const [windowMonths, setWindowMonths] = useState(() => {
    try {
      return Number(localStorage.getItem("oppty_windowMonths") || 6);
    } catch {
      return 6;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("oppty_windowMonths", String(windowMonths));
    } catch {}
  }, [windowMonths]);

  const [avatarUrl, setAvatarUrl] = useState(() => {
    try {
      return localStorage.getItem("oppty_avatar") || "";
    } catch {
      return "";
    }
  });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const defaultOrder = [
    "welcome",
    "kpi_total",
    "kpi_inreview",
    "kpi_current",
    "kpi_avg",
    "trend",
    "status",
    "calendar",
    "gantt",
  ];
  const [layoutOrder, setLayoutOrder] = useState(defaultOrder);
  const defaultSizes = {
    welcome: { col: 12, rows: 1 },
    kpi_total: { col: 3, rows: 1 },
    kpi_inreview: { col: 3, rows: 1 },
    kpi_current: { col: 3, rows: 1 },
    kpi_avg: { col: 3, rows: 1 },
    trend: { col: 4, rows: 2 },
    status: { col: 4, rows: 2 },
    calendar: { col: 4, rows: 2 },
    gantt: { col: 12, rows: 4 },
  };
  const [sizeMap, setSizeMap] = useState(defaultSizes);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetchOpps();
      setOpps(
        (data || []).map((d, i) => ({
          id: d.id ?? i + 1,
          title: d.title ?? `Opp ${i + 1}`,
          amount: Number(d.amount ?? 0),
          status: d.status ?? STATUSES[0],
          owner: d.owner ?? currentUser,
          createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
          closeDate: d.closeDate ? new Date(d.closeDate) : new Date(),
          ...d,
        }))
      );
    } catch (e) {
      console.error("loadData() failed →", e);
      setOpps(seedOpps());
      setError("API unavailable. See console for details.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);
  useEffect(() => {
    loadData();
  }, [loadData]);

  const scopedOpps = useMemo(
    () =>
      ownerScope === "me" ? opps.filter((o) => o.owner === currentUser) : opps,
    [opps, ownerScope, currentUser]
  );

  const sortedOpportunities = useMemo(() => {
    if (!sortConfig.key) return scopedOpps;

    const normalizeValue = (item, key) => {
      switch (key) {
        case "salesLead":
          return item.doleSalesLead || item.sales_Lead || "";
        case "customerName":
          return item.customerName || item.customer_Name || "";
        case "estimatedVolume":
          return item.estimatedVolume || item.estimated_Volume || "";
        case "likelyStartDate":
          return (
            item.likelyStartDate ||
            item.likely_Start_Date ||
            item.createdAt ||
            ""
          );
        default:
          return item[key] || "";
      }
    };

    return [...scopedOpps].sort((a, b) => {
      const aValue = normalizeValue(a, sortConfig.key);
      const bValue = normalizeValue(b, sortConfig.key);

      // Handle numbers
      if (!isNaN(aValue) && !isNaN(bValue)) {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      // Handle dates
      const dateFormats = [
        "YYYY-MM-DD",
        "DD-MM-YYYY",
        "YYYY/MM/DD",
        "DD/MM/YYYY",
        "MM/DD/YYYY",
      ];

      if (
        dayjs(aValue, dateFormats, true).isValid() &&
        dayjs(bValue, dateFormats, true).isValid()
      ) {
        const aDate = dayjs(aValue, dateFormats, true);
        const bDate = dayjs(bValue, dateFormats, true);

        return sortConfig.direction === "asc"
          ? aDate.diff(bDate)
          : bDate.diff(aDate);
      }

      // Handle text (case-insensitive)
      return sortConfig.direction === "asc"
        ? String(aValue)
            .toLowerCase()
            .localeCompare(String(bValue).toLowerCase())
        : String(bValue)
            .toLowerCase()
            .localeCompare(String(aValue).toLowerCase());
    });
  }, [scopedOpps, sortConfig]);

  const myOppsOnly = useMemo(
    () => opps.filter((o) => o.owner === currentUser),
    [opps, currentUser]
  );
  const kpiTotal = scopedOpps.length;
  const kpiInStatus = useMemo(
    () => scopedOpps.filter((o) => o.status === "In Review").length,
    [scopedOpps]
  );
  const trendData = useMemo(() => {
    const map = new Map();
    scopedOpps.forEach((o) => {
      const key = monthKey(o.createdAt);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.keys()].sort().map((k) => ({
      month: formatMonthDisplay(k),
      monthKey: k,
      total: map.get(k),
    }));
  }, [scopedOpps]);
  const statusData = useMemo(() => {
    const m = new Map();
    scopedOpps.forEach((o) => m.set(o.status, (m.get(o.status) || 0) + 1));
    return STATUSES.map((s) => ({ name: s, value: m.get(s) || 0 }));
  }, [scopedOpps]);
  const latestFive = useMemo(
    () => pickLatestByCreated(scopedOpps, 5),
    [scopedOpps]
  );

  async function addOpportunity(form) {
    const startDate = form.likely_Start_Date
      ? new Date(form.likely_Start_Date)
      : new Date();

    // Calculate dynamic end date if not manually set
    let computedEndDate = null;

    if (!computedEndDate && form.annual_Or_LTO) {
      const type = form.annual_Or_LTO;

      if (type === "Annual") {
        // 13 periods = 351 days including start date → +350 days
        computedEndDate.setDate(startDate.getDate() + 350);
      } else {
        // Default for LTO or others = 1 period (27 days including start date) → +26 days
        computedEndDate.setDate(startDate.getDate() + 26);
      }
    }
    const payload = {
      customerName: form.customer_Name,
      materialId: form.material_ID,
      title: form.title || `${form.customer_Name} - ${form.product}`,
      amount: Number(form.pipeline_Projected_Revenue || form.amount || 0),
      status:
        form.sales_Stage || form.status || "Lead: No Current Product Solution",
      owner: currentUser,
      closeDate: form.end_Date ? new Date(form.end_Date) : new Date(),
      opportunity_ID: form.opportunity_ID || "",
      salesLead: form.sales_Lead,
      salesTeam: form.sales_Team,
      salesStage: form.sales_Stage,
      opportunityType: form.opportunity_Type,
      opportunitySummary: form.opportunity_Summary,
      product: form.product,
      material_ID: form.material_ID,
      productCategory: form.product_Category,
      baseUoM: form.base_UoM,
      materialWeight: form.material_Weight,
      productSourceLocation: form.product_Source_Location,
      likelyDistributors: form.likely_Distributors,
      estimatedVolume: form.estimated_Volume,
      uoM: form.uoM,
      caseVolume: form.case_Volume_Converted,
      opportunityVolumeInput: form.opportunity_Volume_Input,
      days30Ship: form.days_30_Ship,
      materialProjectedPrice: form.material_Projected_Price,
      equivalizedPipelineLbs: form.equivalized_Pipeline_LBS,
      pipelineProjectedRevenue: form.pipeline_Projected_Revenue,
      likelyStartDate: form.likely_Start_Date,
      annualOrLTO: form.annual_Or_LTO,
      endDate: computedEndDate,
      lastMeetingDate: form.last_Meeting_Date,
      nextStepDescription: form.next_Step_Description,
      winLossReasonCode: form.win_Loss_Reason_Code,
      winLossComments: form.win_Loss_Comments,
      culinarySupportNeeded: form.culinary_Support_Needed,
      culinarySupportDescription: form.culinary_Support_Description,
      culinarySupportStatus: form.culinary_Support_Status,
    };
    try {
      const created = await apiCreateOpp(payload);
      const createdNorm = {
        id: created.id ?? Math.max(0, ...opps.map((o) => o.id)) + 1,
        title: created.title ?? payload.title,
        amount: Number(created.amount ?? payload.amount),
        status: created.status ?? payload.status,
        owner: created.owner ?? payload.owner,
        createdAt: created.createdAt ? new Date(created.createdAt) : new Date(),
        closeDate: created.closeDate
          ? new Date(created.closeDate)
          : new Date(payload.endDate || Date.now()),
        customer_Name: created.customerName || created.customer_Name,
        sales_Lead: created.salesLead || created.sales_Lead,
        sales_Team: created.salesTeam || created.sales_Team,
        sales_Stage: created.salesStage || created.sales_Stage,
        opportunity_Type: created.opportunityType || created.opportunity_Type,
        product: created.product,
        material_ID: created.materialId || created.material_ID,
        estimated_Volume: created.estimatedVolume || created.estimated_Volume,
        pipeline_Projected_Revenue:
          created.pipelineProjectedRevenue ||
          created.pipeline_Projected_Revenue,
        likely_Start_Date: created.likelyStartDate || created.likely_Start_Date,
        end_Date: created.endDate || created.end_Date || computedEndDate,
        ...payload,
        ...created,
      };
      setOpps((prev) => [createdNorm, ...prev]);
      return createdNorm;
    } catch {
      const id = Math.max(0, ...opps.map((o) => o.id)) + 1;
      const createdAt = new Date();
      const closeDate =
        form.end_Date ||
        new Date(
          createdAt.getFullYear(),
          createdAt.getMonth(),
          createdAt.getDate() + 14
        );
      const newOpp = {
        id,
        createdAt,
        closeDate,
        owner: currentUser,
        title: payload.title,
        amount: payload.amount,
        status: payload.status,
        customer_Name: payload.customerName,
        sales_Lead: payload.salesLead,
        sales_Team: payload.salesTeam,
        product: payload.product,
        material_ID: payload.materialId,
        estimated_Volume: payload.estimatedVolume,
        pipeline_Projected_Revenue: payload.pipelineProjectedRevenue,
        likely_Start_Date: payload.likelyStartDate,
        end_Date: payload.endDate,
        ...payload,
      };
      setOpps((prev) => [newOpp, ...prev]);
      return newOpp;
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleSelectAll() {
    const allVisible = myOppsOnly
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((o) => o.id);
    setSelectedIds((prev) => {
      const allSelected =
        allVisible.length > 0 && allVisible.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(allVisible);
    });
  }
  async function performDelete() {
    if (confirmText !== "DELETE" || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    setOpps((prev) => prev.filter((o) => !selectedIds.has(o.id)));
    setConfirmOpen(false);
    setConfirmText("");
    setSelectedIds(new Set());
    try {
      await apiDeleteOpps(ids);
    } catch {}
  }

  const isNight = theme === "sunset";
  const themeChart = isNight
    ? {
        chartLine: CHART_COLORS.teal,
        axisStroke: "rgba(255,255,255,0.7)",
        gridStroke: "rgba(255,255,255,0.12)",
        tooltipBg: "rgba(11,23,64,0.90)",
        tooltipBorder: "1px solid rgba(255,255,255,0.2)",
        tooltipColor: "#fff",
      }
    : {
        chartLine: CHART_COLORS.teal,
        axisStroke: CHART_COLORS.grayAxis,
        gridStroke: "#e5e7eb",
        tooltipBg: "rgba(255,255,255,0.90)",
        tooltipBorder: "1px solid rgba(0,0,0,0.06)",
        tooltipColor: "#111",
      };
  const { axisStroke, gridStroke, tooltipBg, tooltipBorder, tooltipColor } =
    themeChart;

  const tiles = {
    welcome: {
      colLg: 12,
      rows: 1,
      render: () => (
        <Card className="h-full">
          <CardBody className="h-full flex items-center justify-between gap-4">
            <WelcomeCard
              currentUser={currentUser}
              avatarUrl={avatarUrl}
              setAvatarUrl={setAvatarUrl}
              upcomingOpps={myOppsOnly || []}
            />
            <img
              src="/welcome-bg2.png"
              alt="Welcome"
              className="h-[136px] w-auto object-contain"
              style={{ transform: "translate(-15px, 10px)" }}
            />
          </CardBody>
        </Card>
      ),
    },
    kpi_total: {
      colLg: 3,
      rows: 1,
      render: (handle) => (
        <Card>
          <CardHeader
            title="Total Opportunities"
            dragHandle={<span className="cursor-grab">{handle}</span>}
          />
          <CardBody>
            <div className="mt-2 flex items-end gap-2">
              <div
                className={`text-3xl font-bold ${
                  isNight ? "text-white" : "text-black"
                }`}
              >
                {kpiTotal}
              </div>
              <div
                className={`text-xs ${
                  isNight ? "text-white/70" : "text-gray-500"
                }`}
              >
                {ownerScope === "me" ? "for you" : "all"}
              </div>
            </div>
          </CardBody>
        </Card>
      ),
    },
    kpi_inreview: {
      colLg: 3,
      rows: 1,
      render: () => (
        <Card>
          <CardHeader title="In Review" />
          <CardBody>
            <div
              className={`mt-2 text-3xl font-bold ${
                isNight ? "text-white" : "text-black"
              }`}
            >
              {kpiInStatus}
            </div>
          </CardBody>
        </Card>
      ),
    },
    kpi_current: {
      colLg: 3,
      rows: 1,
      render: () => (
        <Card>
          <CardHeader title="Current Month" />
          <CardBody>
            <div className="mt-2 flex items-center gap-2">
              <TrendingUp
                className={`${isNight ? "text-white" : ""} h-5 w-5`}
              />
              <div
                className={`text-3xl font-bold ${
                  isNight ? "text-white" : "text-black"
                }`}
              >
                {trendData.at(-1)?.total ?? 0}
              </div>
            </div>
          </CardBody>
        </Card>
      ),
    },
    kpi_avg: {
      colLg: 3,
      rows: 1,
      render: () => (
        <Card>
          <CardHeader title="Avg Deal Size" />
          <CardBody>
            <div
              className={`mt-2 text-3xl font-bold ${
                isNight ? "text-white" : "text-black"
              }`}
            >
              {"$" +
                Math.round(
                  scopedOpps.reduce((s, o) => s + (Number(o.amount) || 0), 0) /
                    Math.max(1, scopedOpps.length)
                ).toLocaleString()}
            </div>
          </CardBody>
        </Card>
      ),
    },
    trend: {
      colLg: 4,
      rows: 2,
      render: () => (
        <Card className="h-full">
          <CardHeader title="Trend — Opportunities by Month" />
          <CardBody className="h-full flex flex-col">
            <div className="flex-1 min-h-0" style={{ height: "250px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ left: 10, right: 10, top: 10, bottom: 30 }}
                >
                  <defs>
                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={CHART_COLORS.blue}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={CHART_COLORS.blue}
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: axisStroke }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    axisLine={{ stroke: axisStroke }}
                    tickLine={{ stroke: axisStroke }}
                    tickMargin={6}
                  />
                  <YAxis
                    width={30}
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: axisStroke }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: tooltipBg,
                      border: tooltipBorder,
                      borderRadius: 12,
                      color: tooltipColor,
                    }}
                    cursor={{
                      fill: isNight
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.02)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke={CHART_COLORS.blue}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dot={false}
                    activeDot={{ r: 3 }}
                    fill="url(#colorArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      ),
    },
    status: {
      colLg: 4,
      rows: 2,
      render: () => {
        const size = 160;
        return (
          <Card className="h-full">
            <CardHeader title="Opportunity Status Mix" />
            <CardBody>
              <div className="flex items-center gap-4">
                <div className="shrink-0" style={{ width: size, height: size }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={size / 2 - 35}
                        outerRadius={size / 2 - 22}
                        paddingAngle={3}
                        cornerRadius={10}
                        strokeWidth={0}
                      >
                        {statusData.map((entry, idx) => (
                          <Cell
                            key={`c-${idx}`}
                            fill={STATUS_COLORS[entry.name] || "#e5e7eb"}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: tooltipBg,
                          border: tooltipBorder,
                          borderRadius: 12,
                          color: tooltipColor,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {statusData.map((s) => {
                    const pct = kpiTotal
                      ? Math.round((Number(s.value) / Number(kpiTotal)) * 100)
                      : 0;
                    return (
                      <div
                        key={s.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              background: STATUS_COLORS[s.name] || "#e5e7eb",
                            }}
                          />
                          <span
                            className={`${
                              isNight ? "text-white" : "text-gray-700"
                            }`}
                          >
                            {s.name}
                          </span>
                        </div>
                        <span
                          className={`${
                            isNight ? "text-white/70" : "text-gray-500"
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardBody>
          </Card>
        );
      },
    },
    calendar: {
      colLg: 4,
      rows: 2,
      render: () => {
        const dataWithRaw = scopedOpps.map((o) => ({
          name: (o.customerName || o.title || `#${o.id}`)
            .toString()
            .slice(0, 18),
          revenueRaw: Number(
            o.pipeline_Projected_Revenue ||
              o.pipelineProjectedRevenue ||
              o.amount ||
              0
          ),
          priceRaw: Number(
            o.material_Projected_Price || o.materialProjectedPrice || 0
          ),
        }));
        const top = dataWithRaw
          .filter((d) => d.revenueRaw > 0 || d.priceRaw > 0)
          .sort((a, b) => b.revenueRaw - a.revenueRaw)
          .slice(0, 7);
        const maxRev = Math.max(0, ...top.map((d) => d.revenueRaw));
        const maxPrice = Math.max(0, ...top.map((d) => d.priceRaw));
        const exponent = 0.55;
        const radarData = top.map((d) => ({
          name: d.name,
          revenue: maxRev
            ? Math.round(100 * Math.pow(d.revenueRaw / maxRev, exponent))
            : 0,
          price: maxPrice
            ? Math.round(100 * Math.pow(d.priceRaw / maxPrice, exponent))
            : 0,
          revenueRaw: d.revenueRaw,
          priceRaw: d.priceRaw,
        }));
        const radarRevenueColor = CHART_COLORS.purple;
        const radarPriceColor = CHART_COLORS.cyan;

        const RadarTt = ({ active, payload, label }) => {
          if (!active || !payload?.length) return null;
          const d = payload[0].payload;
          return (
            <div
              style={{
                background: tooltipBg,
                border: tooltipBorder,
                borderRadius: 12,
                padding: 8,
                color: tooltipColor,
              }}
            >
              <div className="font-medium">{label}</div>
              <div>Revenue: ${Number(d.revenueRaw).toLocaleString()}</div>
              {d.priceRaw > 0 && (
                <div>Price: ${Number(d.priceRaw).toLocaleString()}</div>
              )}
            </div>
          );
        };

        return (
          <Card className="h-full">
            <CardHeader
              title="Financial Impact"
              right={
                <TrendingUp
                  className={`h-4 w-4 ${
                    isNight ? "text-white/70" : "text-gray-500"
                  }`}
                />
              }
            />
            <CardBody className="h-full flex flex-col">
              {radarData.length === 0 ? (
                <div
                  className={`text-sm ${
                    isNight ? "text-white/70" : "text-gray-600"
                  }`}
                >
                  No financial data available
                </div>
              ) : (
                <div className="flex-1 min-h-0" style={{ height: "250px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={radarData}
                      outerRadius="85%"
                      margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
                      allowDuplicatedCategory
                    >
                      <defs>
                        <linearGradient
                          id="radarRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={radarRevenueColor}
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor={radarRevenueColor}
                            stopOpacity={0.06}
                          />
                        </linearGradient>
                        <linearGradient
                          id="radarPrice"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={radarPriceColor}
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor={radarPriceColor}
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <PolarGrid
                        gridType="circle"
                        radialLines={true}
                        stroke={
                          isNight
                            ? "rgba(255,255,255,0.10)"
                            : "rgba(17,24,39,0.10)"
                        }
                      />
                      <PolarAngleAxis
                        dataKey="name"
                        tick={{
                          fontSize: 10,
                          fill: isNight
                            ? "rgba(255,255,255,0.60)"
                            : "rgba(17,24,39,0.60)",
                        }}
                        tickLine={false}
                      />
                      <PolarRadiusAxis
                        domain={[0, 100]}
                        tickCount={4}
                        tick={{
                          fontSize: 9,
                          fill: isNight
                            ? "rgba(255,255,255,0.45)"
                            : "rgba(17,24,39,0.45)",
                        }}
                        stroke={
                          isNight
                            ? "rgba(255,255,255,0.10)"
                            : "rgba(17,24,39,0.10)"
                        }
                      />
                      <Radar
                        name="Revenue"
                        dataKey="revenue"
                        stroke={radarRevenueColor}
                        strokeWidth={2.6}
                        fill="url(#radarRevenue)"
                        style={{ mixBlendMode: "multiply" }}
                        isAnimationActive
                        animationDuration={600}
                      />
                      <Radar
                        name="Price"
                        dataKey="price"
                        stroke={radarPriceColor}
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        fill="url(#radarPrice)"
                        fillOpacity={0.22}
                        style={{ mixBlendMode: "multiply" }}
                        isAnimationActive
                        animationDuration={600}
                      />
                      <Tooltip content={<RadarTt />} />
                      <Legend
                        verticalAlign="top"
                        height={20}
                        iconType="circle"
                        wrapperStyle={{ fontSize: 11 }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardBody>
          </Card>
        );
      },
    },
    gantt: {
      colLg: 12,
      rows: 4,
      render: () => (
        <Card>
          <CardHeader title="Timeline — Latest 5 (Created → Close)" />
          <CardBody>
            <GanttMonth items={latestFive} monthDate={selectedDate} rows={2} />
          </CardBody>
        </Card>
      ),
    },
  };

  const headerPillCls = (theme) =>
    theme === "sunset"
      ? "rounded-2xl bg-white/10 border border-white/20 px-1 py-1 text-xs text-white"
      : "rounded-2xl bg-white/40 border px-1 py-1 text-xs";
  const selectedPill = () =>
    "bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] text-white shadow-md";

  return (
    <ThemeContext.Provider value={theme}>
      <GlobalStyles />
      {!currentUser || currentUser.trim() === "" ? (
        <LoginPage onSubmit={handleLogin} onSignup={handleSignup} />
      ) : (
        <div
          className={`min-h-screen flex ${
            isNight ? "theme-sunset text-white" : "theme-sunrise text-gray-900"
          }`}
          style={{
            background: isNight
              ? `radial-gradient(1000px 700px at 15% -10%, rgba(0,20,137,0.35), transparent 60%), radial-gradient(900px 600px at 90% 110%, rgba(200,16,46,0.25), transparent 55%), linear-gradient(180deg, #0b1740 0%, #030817 100%)`
              : `radial-gradient(1000px 700px at 12% -5%, rgba(57,180,232,0.10), transparent 60%), radial-gradient(900px 600px at 88% 105%, rgba(0,32,92,0.08), transparent 55%)`,
          }}
        >
          <div className="flex-1 min-w-0 w-full">
            <header
              className={`sticky top-0 z-10 ${
                isNight ? "bg-[#0b1740]/50" : "bg-white/30"
              } backdrop-blur-xl ${isNight ? "" : "border-b border-white/45"} ${
                isNight ? "" : "shadow-[0_1px_0_rgba(255,255,255,0.6)]"
              }`}
            >
              <div
                className={`h-1 w-full ${
                  isNight
                    ? "bg-gradient-to-r from-[#C8102E] via-[#F6E500] to-transparent"
                    : "bg-gradient-to-r from-[#F6E500] via-[#39B4E8] to-transparent"
                }`}
              />
              <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/vector.png"
                    alt="Vector"
                    className="h-16 cursor-pointer transition-transform hover:scale-105 relative top-[2px]"
                    onClick={() => setRoute("dashboard")}
                    title="Go to Dashboard"
                  />
                  <div>
                    <div className="text-left">
                      <h1
                        className={`text-2xl md:text-3xl font-semibold tracking-tight ${
                          isNight ? "text-white" : ""
                        }`}
                      >
                        Vector
                      </h1>
                      <h2
                        className={`text-sm md:text-base font-medium tracking-wide mt-1 ${
                          isNight ? "text-white/80" : "text-gray-600"
                        }`}
                      >
                        Your Opportunity Pipeline Hub
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`${headerPillCls(theme)} relative group`}>
                    {[
                      {
                        k: "auto",
                        icon: <Clock className="h-3.5 w-3.5" />,
                        tooltip: "Auto (7AM-7PM: Day, 7PM-7AM: Night)",
                      },
                      {
                        k: "sunrise",
                        icon: <Sun className="h-3.5 w-3.5" />,
                        tooltip: "Sunrise theme",
                      },
                      {
                        k: "sunset",
                        icon: <Moon className="h-3.5 w-3.5" />,
                        tooltip: "Sunset theme",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.k}
                        onClick={() => setThemeMode(opt.k)}
                        className={`p-1.5 rounded-xl inline-flex items-center justify-center transition ${
                          themeMode === opt.k
                            ? selectedPill(theme)
                            : "hover:bg-white/10"
                        } group/btn relative`}
                      >
                        {opt.icon}
                        <div
                          className={`pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity ${
                            isNight
                              ? "bg-white/15 border border-white/25 text-white backdrop-blur-xl"
                              : "bg-white/70 border border-white/50 text-gray-900 backdrop-blur-xl"
                          } shadow-lg z-50`}
                        >
                          {opt.tooltip}
                        </div>
                      </button>
                    ))}
                  </div>

                  {route === "dashboard" && (
                    <>
                      <div className={`${headerPillCls(theme)} relative group`}>
                        {[
                          { k: "me", label: "My", tooltip: "My Opportunities" },
                          {
                            k: "all",
                            label: "All",
                            tooltip: "All Opportunities",
                          },
                        ].map((opt) => (
                          <button
                            key={opt.k}
                            onClick={() => setOwnerScope(opt.k)}
                            className={`px-3 py-1 rounded-xl transition text-xs ${
                              ownerScope === opt.k
                                ? selectedPill(theme)
                                : "hover:bg-white/10"
                            } group/btn relative`}
                          >
                            {opt.label}
                            <div
                              className={`pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity ${
                                isNight
                                  ? "bg-white/15 border border-white/25 text-white backdrop-blur-xl"
                                  : "bg-white/70 border border-white/50 text-gray-900 backdrop-blur-xl"
                              } shadow-lg z-50`}
                            >
                              {opt.tooltip}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {route === "dashboard" && (
                    <div className={`${headerPillCls(theme)} relative group`}>
                      {[
                        { value: 3, label: "3M", tooltip: "3 Months" },
                        { value: 6, label: "6M", tooltip: "6 Months" },
                        { value: 12, label: "12M", tooltip: "12 Months" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setWindowMonths(opt.value)}
                          className={`px-3 py-1 rounded-xl transition text-xs ${
                            windowMonths === opt.value
                              ? selectedPill(theme)
                              : "hover:bg-white/10"
                          } group/btn relative`}
                        >
                          {opt.label}
                          <div
                            className={`pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity ${
                              isNight
                                ? "bg-white/15 border border-white/25 text-white backdrop-blur-xl"
                                : "bg-white/70 border border-white/50 text-gray-900 backdrop-blur-xl"
                            } shadow-lg z-50`}
                          >
                            {opt.tooltip}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {route !== "add" && (
                    <>
                      <Button onClick={() => setRoute("add")}>
                        <Plus className="h-4 w-4" />{" "}
                        <span className="hidden sm:inline">
                          Add Opportunity
                        </span>
                      </Button>
                      <Button onClick={() => setSearchModalOpen(true)}>
                        <Search className="h-4 w-4" /> Search
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {error && (
                <div
                  className={`max-w-6xl mx-auto px-6 pb-2 text-xs ${
                    isNight ? "text-amber-200" : "text-amber-700"
                  }`}
                >
                  {error}
                </div>
              )}
            </header>

            {route === "dashboard" && (
              <main className="max-w-6xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-1">
                    {tiles.welcome.render()}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {tiles.kpi_total.render()}
                    {tiles.kpi_inreview.render()}
                    {tiles.kpi_current.render()}
                    {tiles.kpi_avg.render()}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tiles.trend.render()}
                    {tiles.calendar.render()}
                    {tiles.status.render()}
                  </div>
                  <div className="grid grid-cols-1">{tiles.gantt.render()}</div>
                </div>
                {loading && (
                  <div
                    className={`text-xs mt-4 ${
                      isNight ? "text-white/70" : "text-gray-600"
                    }`}
                  >
                    Loading…
                  </div>
                )}
              </main>
            )}

            {route === "opps" && (
              <main className="max-w-6xl mx-auto px-6 py-6 grid gap-6">
                <Card>
                  <CardHeader
                    title="Opportunities"
                    right={
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowModal(true)}
                          className={clsx(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition",
                            isNight
                              ? "bg-slate-700 hover:bg-slate-600 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          )}
                        >
                          <Settings size={16} />
                        </button>
                        <div
                          className={`rounded-2xl ${
                            isNight
                              ? "bg-white/10 border border-white/20"
                              : "bg-white/40 border border-white/45"
                          } px-1 py-1 text-xs`}
                        >
                          <button
                            onClick={() => setOwnerScope("me")}
                            className={`px-3 py-1 rounded-xl transition text-xs ${
                              ownerScope === "me"
                                ? isNight
                                  ? "bg-[#F6E500] text-black"
                                  : "bg-[#00205C] text-white"
                                : "hover:bg-white/10"
                            }`}
                          >
                            My
                          </button>
                          <button
                            onClick={() => setOwnerScope("all")}
                            className={`px-3 py-1 rounded-xl transition text-xs ${
                              ownerScope === "all"
                                ? isNight
                                  ? "bg-[#F6E500] text:black"
                                  : "bg-[#00205C] text-white"
                                : "hover:bg-white/10"
                            }`}
                          >
                            All
                          </button>
                        </div>
                        <Button
                          variant="danger"
                          disabled={selectedIds.size === 0}
                          onClick={() => setConfirmOpen(true)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete (
                          {selectedIds.size})
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setRoute("dashboard")}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    }
                  />
                  <CardBody>
                    <div
                      className={`border rounded-2xl ${
                        isNight
                          ? "bg-white/8 border-white/15"
                          : "bg-white/40 border-white/50"
                      } bg-clip-padding backdrop-blur-sm`}
                      style={{ height: "1000px" }}
                    >
                      <div className="overflow-auto scroll-glass h-full">
                        <table className="min-w-full text-sm">
                          <thead className="sticky top-0 z-10">
                            <tr
                              className={`${
                                isNight
                                  ? "text-white/70 bg-slate-800/90"
                                  : "text-gray-600 bg-white/90"
                              } backdrop-blur-sm`}
                            >
                              {/*just hiding Opportunity ID from UI if we want to use them in future can just uncomment this/* <th className="py-2 pr-3 w-8 text-left">
                                <input
                                  type="checkbox"
                                  onChange={toggleSelectAll}
                                  checked={
                                    scopedOpps.length > 0 &&
                                    scopedOpps
                                      .slice()
                                      .sort((a, b) => b.createdAt - a.createdAt)
                                      .every((o) => selectedIds.has(o.id))
                                  }
                                />
                              </th> */}
                              {/* <th className="py-2 pr-4 text-left">
                                Opportunity ID
                              </th> */}
                              {visibleColumns.salesLead && (
                                <th onClick={() => handleSort("salesLead")}>
                                  <div className="flex items-center gap-1">
                                    Sales Leads {getSortIcon("salesLead")}
                                  </div>
                                </th>
                              )}
                              {visibleColumns.customerName && (
                                <th onClick={() => handleSort("customerName")}>
                                  <div className="flex items-center gap-1">
                                    Customer Name {getSortIcon("customerName")}
                                  </div>
                                </th>
                              )}
                              {visibleColumns.product && (
                                <th onClick={() => handleSort("product")}>
                                  <div className="flex items-center gap-1">
                                    Product {getSortIcon("product")}
                                  </div>
                                </th>
                              )}
                              {visibleColumns.status && (
                                <th onClick={() => handleSort("status")}>
                                  <div className="flex items-center gap-1">
                                    Status {getSortIcon("status")}
                                  </div>
                                </th>
                              )}
                              {visibleColumns.estimatedVolume && (
                                <th
                                  onClick={() => handleSort("estimatedVolume")}
                                >
                                  <div className="flex items-center gap-1">
                                    Estimated Volume{" "}
                                    {getSortIcon("estimatedVolume")}
                                  </div>
                                </th>
                              )}
                              {visibleColumns.likelyStartDate && (
                                <th
                                  onClick={() => handleSort("likelyStartDate")}
                                >
                                  <div className="flex items-center gap-1">
                                    Likely Start Date{" "}
                                    {getSortIcon("likelyStartDate")}
                                  </div>
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {sortedOpportunities.map((o) => (
                              <tr
                                key={o.id}
                                className={`border-t ${
                                  isNight
                                    ? "border-white/10 hover:bg-white/5"
                                    : "hover:bg.black/5"
                                }`}
                              >
                                {/* Just hiding the Opportunity ID from UI for now in future if required we can just uncomment
                                  <td className="py-2 pr-3 w-8">
                                    <input
                                      type="checkbox"
                                      checked={selectedIds.has(o.id)}
                                      onChange={() => toggleSelect(o.id)}
                                    />
                                  </td> */}
                                {/* <td className="py-2 pr-4">
                                    <button
                                      onClick={() => {
                                        setDetailId(o.id);
                                        setRoute("details"); 
                                      }}
                                      className={`${
                                        isNight
                                          ? "text-white hover:text-[#F6E500]"
                                          : "text-gray-900 hover:text-blue-700"
                                      } transition-colors`}
                                    >
                                      #{o.id}
                                    </button>
                                  </td> */}
                                {visibleColumns.salesLead && (
                                  <td className="py-2 pr-4">
                                    {o.doleSalesLead || o.sales_Lead || "-"}
                                  </td>
                                )}
                                {visibleColumns.customerName && (
                                  <td className="py-2 pr-4 font-medium">
                                    {o.customerName || o.customer_Name || "-"}
                                  </td>
                                )}
                                {visibleColumns.product && (
                                  <td className="py-2 pr-4">
                                    {o.product || "-"}
                                  </td>
                                )}
                                {visibleColumns.status && (
                                  <td className="py-2 pr-4">
                                    <span
                                      className="px-2 py-1 rounded-lg text-xs whitespace-nowrap"
                                      style={{
                                        background: `${
                                          STATUS_COLORS[o.status] || "#999"
                                        }22`,
                                        color:
                                          STATUS_COLORS[o.status] || "#999",
                                      }}
                                    >
                                      {o.status || o.salesStage || "-"}
                                    </span>
                                  </td>
                                )}
                                {visibleColumns.estimatedVolume && (
                                  <td className="py-2 pr-4">
                                    {o.estimatedVolume ||
                                      o.estimated_Volume ||
                                      "-"}
                                  </td>
                                )}
                                {visibleColumns.likelyStartDate && (
                                  <td className="py-2">
                                    {o.likely_Start_Date
                                      ? new Date(
                                          o.likely_Start_Date
                                        ).toLocaleDateString()
                                      : o.likelyStartDate
                                      ? new Date(
                                          o.likelyStartDate
                                        ).toLocaleDateString()
                                      : new Date(
                                          o.createdAt
                                        ).toLocaleDateString()}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {showModal && (
                          <div className="fixed inset-0 bg-black/50 flex items-start py-3 justify-center z-50">
                            <div
                              className={clsx(
                                "w-full max-w-sm rounded-lg shadow-lg p-6",
                                isNight
                                  ? "bg-slate-800 text-white"
                                  : "bg-white text-gray-800"
                              )}
                            >
                              <h2 className="text-lg font-semibold mb-4">
                                Select Visible Columns
                              </h2>
                              <div className="space-y-2">
                                {Object.keys(visibleColumns).map((key) => (
                                  <label
                                    key={key}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={visibleColumns[key]}
                                      onChange={() => toggleColumn(key)}
                                    />
                                    {key
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str) =>
                                        str.toUpperCase()
                                      )}
                                  </label>
                                ))}
                              </div>

                              <div className="flex justify-end mt-6 gap-3">
                                <button
                                  onClick={() => setShowModal(false)}
                                  className={clsx(
                                    "px-4 py-2 rounded-md text-sm",
                                    isNight
                                      ? "bg-slate-700 hover:bg-slate-600 text-white"
                                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                  )}
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </main>
            )}

            {route === "masterdata" &&
              (isAdminUser ? (
                <main className="max-w-6xl mx-auto px-6 py-6 grid gap-6">
                  <UserRegistrationTable currentUser={currentUser} />
                </main>
              ) : (
                <div
                  className={`${
                    isNight ? "text-white/70" : "text-gray-600"
                  } p-6`}
                >
                  Not authorized
                </div>
              ))}
            {
              route === "approvals" && (
                // (isAdminUser ? (
                <main className="max-w-6xl mx-auto px-6 py-6 grid gap-6">
                  <OverridePriceApprovalRequestsTable
                    currentUser={currentUser}
                  />
                </main>
              )
              // ) : (
              //   <div
              //     className={`${
              //       isNight ? "text-white/70" : "text-gray-600"
              //     } p-6`}
              //   >
              //     Not authorized
              //   </div>
              // ))
            }

            {route === "analytics" && (
              <main className="max-w-7xl mx-auto">
                <AnalyticsPage opps={opps} currentUser={currentUser} />
              </main>
            )}

            {route === "details" && (
              <OpportunityDetailsPage
                opp={opps.find((o) => o.id === detailId)}
                onBack={() => setRoute("opps")}
                onSave={(updatedOpp) => {
                  setOpps((prev) =>
                    prev.map((o) => (o.id === updatedOpp.id ? updatedOpp : o))
                  );
                }}
              />
            )}
            {route === "add" && (
              <AddOpportunityPage
                onCancel={() => setRoute("dashboard")}
                onSave={async (form) => {
                  await addOpportunity(form);
                  setRoute("dashboard");
                }}
              />
            )}

            {confirmOpen && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg.white/10 backdrop-blur-2xl backdrop-saturate-150"
                  onClick={() => setConfirmOpen(false)}
                />
                <div
                  className={`relative w-full max-w-md rounded-3xl ${
                    isNight
                      ? "bg-white/10 border-white/20"
                      : "bg-white/20 border-white/40"
                  } bg-clip-padding backdrop-blur-xl backdrop-saturate-150 border shadow-[0_16px_40px_rgba(0,0,0,0.20)] overflow-hidden`}
                >
                  <CardHeader
                    title="Confirm Deletion"
                    right={
                      <Button
                        variant="ghost"
                        onClick={() => setConfirmOpen(false)}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <CardBody>
                    <p
                      className={`text-sm ${
                        isNight ? "text-white/80" : "text-gray-700"
                      }`}
                    >
                      Type <span className="font-semibold">DELETE</span> to
                      permanently remove{" "}
                      <span className="font-semibold">{selectedIds.size}</span>{" "}
                      selected opportunit{selectedIds.size === 1 ? "y" : "ies"}.
                    </p>
                    <input
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className={`mt-3 w-full rounded-2xl border px-3 py-2 focus:ring-2 outline-none ${
                        isNight
                          ? "bg-white/12 border-white/25 text.white focus:ring-[#F6E500]"
                          : "bg-white/60 focus:ring-[#39B4E8]"
                      }`}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setConfirmOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        onClick={performDelete}
                        disabled={
                          confirmText !== "DELETE" || selectedIds.size === 0
                        }
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </CardBody>
                </div>
              </div>
            )}

            <SearchModal
              isOpen={searchModalOpen}
              onClose={() => setSearchModalOpen(false)}
              opps={opps}
              onViewDetails={(oppId) => {
                setDetailId(oppId);
                setRoute("details");
                setSearchModalOpen(false);
              }}
            />
            <FloatingNav
              goOpps={() => setRoute("opps")}
              onGoDashboard={() => setRoute("dashboard")}
              onSearch={() => setSearchModalOpen(true)}
              onGoMasterData={() => setRoute("masterdata")}
              onGoAnalytics={() => setRoute("analytics")} // Add this line
              onGoApprovals={() => setRoute("approvals")}
              onSignOut={() => {
                try {
                  localStorage.removeItem("oppty_user");
                  localStorage.removeItem("oppty_is_admin");
                } catch {}
                setCurrentUser("");
                setIsAdminUser(false);
                setRoute("dashboard");
              }}
              isAdminUser={isAdminUser}
            />
          </div>
        </div>
      )}
    </ThemeContext.Provider>
  );
}

function ConfirmationModal({
  isOpen,
  title = "Approval Required",
  message = "This action requires approval.",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold mb-3">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function OpportunityVolumeAllocation({ form }) {
  const periods = [
    { key: "P1", start: "23-03-2025", end: "19-04-2025" },
    { key: "P2", start: "20-04-2025", end: "17-05-2025" },
    { key: "P3", start: "18-05-2025", end: "14-06-2025" },
    { key: "P4", start: "15-06-2025", end: "12-07-2025" },
    { key: "P5", start: "13-07-2025", end: "09-08-2025" },
    { key: "P6", start: "10-08-2025", end: "06-09-2025" },
    { key: "P7", start: "07-09-2025", end: "04-10-2025" },
    { key: "P8", start: "05-10-2025", end: "01-11-2025" },
    { key: "P9", start: "02-11-2025", end: "29-11-2025" },
    { key: "P10", start: "30-11-2025", end: "27-12-2025" },
    { key: "P11", start: "28-12-2025", end: "24-01-2026" },
    { key: "P12", start: "25-01-2026", end: "21-02-2026" },
    { key: "P13", start: "22-02-2026", end: "21-03-2026" },
  ];

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const d = dayjs(dateStr, "DD-MM-YYYY");
    return d.isValid() ? d : null;
  };

  const likelyStart = dayjs(form?.start_date, "YYYY-MM-DD");
  const likelyEnd = dayjs(form?.end_date, "YYYY-MM-DD");
  console.log(likelyStart, likelyEnd);

  const volumes = useMemo(() => {
    const total = Number(form?.volume) || 0;
    const type = form?.opportunity_Type;
    if (!total || !type) return {};

    const totalDays = 364; // Total ficsal period (adjust if needed)
    const dailyVolume = total / totalDays;
    console.log(dailyVolume);
    const result = {};

    periods.forEach((period, i) => {
      const startDate = parseDate(period.start);
      const endDate = parseDate(period.end);
      console.log(startDate, endDate, "4801");
      if (!startDate || !endDate) {
        result[period.key] = "-";
        return;
      }

      let activeDays = endDate.diff(startDate, "day") + 1;
      console.log(activeDays, "4805");

      // Adjust if the likely start falls in this period
      if (
        likelyStart &&
        likelyStart.isSameOrAfter(startDate) &&
        likelyStart.isSameOrBefore(endDate) &&
        i === 0
      ) {
        activeDays = endDate.diff(likelyStart, "day") + 1;
        console.log("4815", activeDays);
      }

      // Adjust if the likely end falls in this period
      if (
        likelyEnd &&
        likelyEnd.isSameOrAfter(startDate) &&
        likelyEnd.isSameOrBefore(endDate) &&
        i === periods.length - 1
      ) {
        activeDays = likelyEnd.diff(startDate, "day") + 1;
        console.log(activeDays, "4826");
      }

      result[period.key] = Math.round(dailyVolume * activeDays);
    });

    return result;
  }, [form]);

  return (
    <Card className="w-full">
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-500">Total Volume:</Label>
              <span className="text-base font-semibold text-gray-900 dark:text-white">
                {form.volume || 0}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-500">Opportunity Type:</Label>
              <Badge
                variant={
                  form.opportunity_Type === "Annual" ? "success" : "secondary"
                }
                className="px-3 py-1 text-sm font-medium"
              >
                {form.opportunity_Type || "N/A"}
              </Badge>
            </div>
          </div>

          {/* Period Table */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/60 text-left">
                  <th className="py-2 px-3 w-24 font-medium">Period</th>
                  {periods.map((p) => (
                    <th
                      key={p.key}
                      className="py-2 px-3 text-center font-medium"
                    >
                      {p.key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-3 font-medium">Volume</td>
                  {periods.map((p) => (
                    <td key={p.key} className="py-2 px-3 text-center">
                      {volumes[p.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AddOpportunityPage({ onCancel, onSave }) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  const [currentSection, setCurrentSection] = useState("product");
  const [statusOpen, setStatusOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [materialsError, setMaterialsError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingValue, setPendingValue] = useState("");
  const [errors, setErrors] = useState({});

  const handleOverrideChange = () => {
    const override = parseFloat(form.override_Price);
    const projected = parseFloat(form.material_Projected_Price);

    if (override < projected) {
      setShowModal(true);
    }
  };

  const handleConfirm = () => {
    setForm((prev) => ({ ...prev, override_Price: pendingValue }));
    setShowModal(false);
  };

  const handleCancel1 = () => {
    setPendingValue("");
    setShowModal(false);
  };

  const handleAnnual_LTO = (e) => {
    const startDate = typeof e === "string" ? e : e?.target?.value;
    if (!startDate) return;

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 363);

    const formattedEnd = end.toISOString().split("T")[0];

    setForm((prev) => ({
      ...prev,
      likely_Start_Date: startDate,
      end_Date: prev.annual_Or_LTO === "Annual" ? formattedEnd : "",
    }));
  };

  const salesMapping = {
    Bill: "Field Sales",
    Broker: "Broker",
    Canada: "Canada",
    Diana: "Nat'l Account",
    Gregg: "Nat'l Account",
    Jayne: "Field Sales",
    Dan: "Nat'l Account",
    Larry: "Field Sales",
    Meredith: "Field Sales",
    "Michael J": "Field Sales",
    "Mike K": "Field Sales",
    Steve: "Nat'l Account",
    UNKNOWN: "UNKNOWN",
  };

  const salesLeads = Object.keys(salesMapping).sort();
  const salesTeams = [...new Set(Object.values(salesMapping))].sort();

  const sections = [
    { key: "product", label: "Product", icon: "📦" },
    { key: "volume", label: "Volume", icon: "📊" },
    { key: "pricing", label: "Pricing", icon: "💰" },
    { key: "timing", label: "Timing", icon: "📅" },
    { key: "outcome", label: "Outcome", icon: "📝" },
    { key: "support", label: "Culinary", icon: "🤝" },
    { key: "voumeAllocation", label: "Volume Allocation", icon: "🤝" },
  ];

  const getSectionIndex = (key) => sections.findIndex((s) => s.key === key);
  let canGoNext = getSectionIndex(currentSection) < sections.length - 1;
  const canGoPrev = getSectionIndex(currentSection) > 0;

  const goToNextSection = () => {
    const currentIndex = getSectionIndex(currentSection);
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1].key);
    }
  };

  const goToPrevSection = () => {
    const currentIndex = getSectionIndex(currentSection);
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1].key);
    }
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setIsLoadingMaterials(true);
        console.log("=== FETCHING MATERIALS ===");

        const data = await apiFetchMaterials();
        console.log("Materials data received:", data);
        console.log(
          "Data length:",
          Array.isArray(data) ? data.length : "Not an array"
        );
        console.log("=== COMPONENT STATE DEBUG ===");
        console.log("Materials state:", materials);
        console.log("Materials length:", materials.length);
        console.log("Is loading:", isLoadingMaterials);
        console.log("Materials type:", typeof materials);

        if (Array.isArray(data) && data.length > 0) {
          console.log("First material:", data[0]);
          console.log("Available fields:", Object.keys(data[0]));
        }

        setMaterials(data);
        console.log("Materials state updated with:", data);
      } catch (error) {
        console.error("Failed to fetch materials:", error);
      } finally {
        setIsLoadingMaterials(false);
        console.log("Loading state set to false");
      }
    };
    fetchMaterials();
  }, []);

  const productList = materials
    .map((material) => material.product)
    .filter(Boolean)
    .sort();

  const [form, setForm] = useState({
    // Core Details
    customer_Name: "",
    sales_Lead: "",
    sales_Team: "",
    sales_Stage: "Lead: No Current Product Solution",
    opportunity_Type: "",
    opportunity_Summary: "",

    // Product & Material
    product: "",
    material_ID: "",
    product_Category: "",
    base_UoM: "Case",
    material_Weight: "",
    product_Source_Location: "",
    likely_Distributors: "",

    // Volume & Units
    estimated_Volume: "",
    uoM: "Case",
    case_Volume_Converted: "",
    opportunity_Volume_Input: "",
    days_30_Ship: "N",

    // Pricing & Financial Impact
    material_Projected_Price: "",
    equivalized_Pipeline_LBS: "",
    pipeline_Projected_Revenue: "",
    override_Price: "",

    // Timing & Lifecycle
    likely_Start_Date: "",
    annual_Or_LTO: "Annual",
    end_Date: "",
    last_Meeting_Date: "",
    next_Step_Description: "",

    // Outcome & Notes
    win_Loss_Reason_Code: "",
    win_Loss_Comments: "",

    // Support & Enablement
    culinary_Support_Needed: "N",
    culinary_Support_Description: "",
    culinary_Support_Status: "",
  });

  const handleConfirmExit = () => {
    setExitConfirmOpen(false);
    onCancel();
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setExitConfirmOpen(true);
    } else {
      onCancel();
    }
  };

  const handleSave = () => {
    if (!form.customer_Name) {
      alert("Customer Name is required");
      return;
    }
    if (!form.material_ID) {
      alert("Material ID is required - please select a product first");
      return;
    }
    if (!form.likely_Start_Date) {
      alert("Likely Start Date is required");
      return;
    }

    const payload = {
      ...form,
      amount: form.pipeline_Projected_Revenue || 0,
      status: form.sales_Stage || "New",
      title: `${form.customer_Name} - ${form.product}`,
      closeDate: form.end_Date ? new Date(form.end_Date) : new Date(),
    };
    onSave(payload);
  };

  useEffect(() => {
    if (form.material_Projected_Price && form.estimated_Volume) {
      const price = parseFloat(form.material_Projected_Price);
      const volume = parseFloat(form.estimated_Volume);
      if (!isNaN(price) && !isNaN(volume)) {
        const revenue = (price * volume).toFixed(2);
        setForm((prev) => ({ ...prev, pipeline_Projected_Revenue: revenue }));
      }
    }
  }, [form.material_Projected_Price, form.estimated_Volume]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-6 grid gap-6">
      <div className="flex items-center justify-between">
        <div
          className={`text-sm ${isNight ? "text-white/70" : "text-gray-600"}`}
        >
          Add New Opportunity
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 w-full">
        {sections.map((section) => {
          const selectedCls = isNight
            ? "bg-gradient-to-r from-[#C8102E] to-[#001489] text-white shadow-lg"
            : "bg-gradient-to-r from-[rgba(246,229,0,0.6)] to-[rgba(57,180,232,0.6)] text-gray-900 shadow-lg";
          const baseCls = isNight
            ? "bg-white/10 text-white/70 hover:bg-white/20"
            : "bg-white/40 text-gray-600 hover:bg-white/60";

          return (
            <button
              key={section.key}
              onClick={() => setCurrentSection(section.key)}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                section.key === currentSection ? selectedCls : baseCls
              }`}
            >
              <span style={{ fontSize: "16px" }}>{section.icon}</span>
              <span className="hidden sm:inline">{section.label}</span>
            </button>
          );
        })}
      </div>

      <Card noClip>
        <CardHeader
          title="Core Details"
          subtitle="Essential opportunity information"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="grid gap-1">
              <Label>Opportunity ID</Label>
              <Input
                value="Auto-generated"
                disabled
                readOnly
                className="bg-gray-100 text-gray-500"
              />
            </label>
            <label className="grid gap-1">
              <Label>Customer Name *</Label>
              <Input
                value={form.customer_Name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    customer_Name: e.target.value,
                  }))
                }
                placeholder="Enter customer name"
              />
            </label>
            <label className="grid gap-1">
              <Label>Sales Lead *</Label>
              <FrostedSelect
                value={form.sales_Lead}
                onChange={(v) => {
                  setForm((prev) => ({ ...prev, sales_Lead: v }));
                  if (v && salesMapping[v]) {
                    setForm((prev) => ({
                      ...prev,
                      sales_Team: salesMapping[v],
                    }));
                  }
                }}
                options={["", ...salesLeads]}
                placeholder="Select sales lead"
              />
            </label>
            <label className="grid gap-1">
              <Label>Sales Team</Label>
              <Input
                value={form.sales_Team}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sales_Team: e.target.value }))
                }
                placeholder="Sales team"
                readOnly
              />
            </label>
            <label className="grid gap-1">
              <Label>Sales Stage</Label>
              <FrostedSelect
                value={form.sales_Stage}
                onChange={(v) =>
                  setForm((prev) => ({ ...prev, sales_Stage: v }))
                }
                options={[
                  "Lead: No Current Product Solution",
                  "Lead: Deprioritized Account",
                  "Target Account",
                  "Customer Engaged",
                  "Proposal Submitted",
                  "Win - Customer Verbal",
                  "Post-pipeline: Win (order shipped)",
                  "Post-pipeline: Loss",
                  "Post-pipeline: On-hold",
                ]}
                placeholder="Select sales stage"
              />
            </label>
            <label className="grid gap-1">
              <Label>Opportunity Type</Label>
              <FrostedSelect
                value={form.opportunity_Type}
                onChange={(v) =>
                  setForm((prev) => ({ ...prev, opportunity_Type: v }))
                }
                options={[
                  "New Business",
                  "Expansion",
                  "Renewal",
                  "Replacement",
                ]}
                placeholder="Select opportunity type"
              />
            </label>
            <label className="grid gap-1 md:col-span-3">
              <Label>Opportunity Summary</Label>
              <Textarea
                value={form.opportunity_Summary}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    opportunity_Summary: e.target.value,
                  }))
                }
                placeholder="Describe the opportunity"
                rows={3}
              />
            </label>
          </div>
        </CardBody>
      </Card>

      <Card noClip>
        <CardHeader
          title={sections.find((s) => s.key === currentSection)?.label}
          subtitle={`Section ${
            sections.findIndex((s) => s.key === currentSection) + 1
          } of ${sections.length}`}
        />
        <CardBody>
          {currentSection === "product" && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <Label>Product *</Label>
                {isLoadingMaterials ? (
                  <div className="px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-500">
                    Loading products...
                  </div>
                ) : materialsError ? (
                  <div className="px-3 py-2 rounded-xl border border-red-300 bg-red-50 text-red-600">
                    {materialsError}
                  </div>
                ) : (
                  <div className="w-full max-w-2xl">
                    <FrostedSelect
                      value={form.product}
                      onChange={(v) => {
                        console.log("Product selected:", v);
                        setForm((prev) => ({ ...prev, product: v }));

                        if (v && materials.length > 0) {
                          const selectedMaterial = materials.find(
                            (material) => material.PRODUCT === v
                          );
                          console.log(
                            "Selected material found:",
                            selectedMaterial
                          );

                          if (selectedMaterial) {
                            setForm((prev) => ({
                              ...prev,
                              product: v,
                              material_ID: selectedMaterial.MATERIAL_ID,
                              material_Weight: selectedMaterial.MATERIAL_WEIGHT,
                              product_Category:
                                selectedMaterial.PRODUCT_CATEGORY,
                              base_UoM: selectedMaterial.BASE_UOM,
                              material_Projected_Price:
                                selectedMaterial.MATERIAL_PROJECTED_PRICE,
                              pipeline_Projected_Revenue: prev.estimated_Volume
                                ? (
                                    parseFloat(
                                      selectedMaterial.MATERIAL_PROJECTED_PRICE
                                    ) * parseFloat(prev.estimated_Volume)
                                  ).toFixed(2)
                                : "",
                            }));
                          }
                        }
                      }}
                      options={materials.map((material) => material.PRODUCT)}
                      placeholder="Select Product"
                      disabled={isLoadingMaterials}
                      className="w-full"
                      style={{
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    />
                  </div>
                )}
              </label>
              <label className="grid gap-1">
                <Label>Material ID</Label>
                <Input
                  value={form.material_ID}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      material_ID: e.target.value,
                    }))
                  }
                  placeholder="Material ID"
                  readOnly
                />
              </label>
              <label className="grid gap-1">
                <Label>Product Category</Label>
                <Input
                  value={form.product_Category}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      product_Category: e.target.value,
                    }))
                  }
                  placeholder="Product category"
                  readOnly
                />
              </label>
              <label className="grid gap-1">
                <Label>Base UoM</Label>
                <Input
                  value={form.base_UoM}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, base_UoM: e.target.value }))
                  }
                  placeholder="Base UoM"
                  readOnly
                />
              </label>
              <label className="grid gap-1">
                <Label>Material Weight</Label>
                <Input
                  type="number"
                  value={form.material_Weight}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      material_Weight: e.target.value,
                    }))
                  }
                  placeholder="Weight"
                  readOnly
                />
              </label>
              <label className="grid gap-1">
                <Label>Product Source Location</Label>
                <Input
                  value={form.product_Source_Location}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      product_Source_Location: e.target.value,
                    }))
                  }
                  placeholder="Source location"
                />
              </label>
              <label className="grid gap-1">
                <Label>Likely Distributors</Label>
                <Input
                  value={form.likely_Distributors}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      likely_Distributors: e.target.value,
                    }))
                  }
                  placeholder="Distributors"
                />
              </label>
            </div>
          )}
          {currentSection === "volume" && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <Label>Estimated Volume *</Label>
                <Input
                  type="number"
                  value={form.estimated_Volume}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      estimated_Volume: e.target.value,
                    }))
                  }
                  placeholder="Enter volume"
                />
              </label>
              <label className="grid gap-1">
                <Label>Unit of Measure</Label>
                <FrostedSelect
                  value={form.uoM}
                  onChange={(v) => setForm((prev) => ({ ...prev, uoM: v }))}
                  options={["Case", "Pallet", "Each", "Pound", "Kilogram"]}
                  placeholder="Select UoM"
                />
              </label>
              <label className="grid gap-1">
                <Label>Case Volume (Converted)</Label>
                <Input
                  type="number"
                  value={form.case_Volume_Converted}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      case_Volume_Converted: e.target.value,
                    }))
                  }
                  placeholder="Case volume"
                />
              </label>
              <label className="grid gap-1">
                <Label>Opportunity Volume Input</Label>
                <Input
                  type="number"
                  value={form.opportunity_Volume_Input}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      opportunity_Volume_Input: e.target.value,
                    }))
                  }
                  placeholder="Volume input"
                />
              </label>
              <label className="grid gap-1">
                <Label>30 Days Ship</Label>
                <FrostedSelect
                  value={form.days_30_Ship}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, days_30_Ship: v }))
                  }
                  options={["Y", "N"]}
                  placeholder="Select"
                />
              </label>
            </div>
          )}

          {currentSection === "pricing" && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <Label>Material Projected Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70">
                    $
                  </span>
                  <Input
                    type="number"
                    value={form.material_Projected_Price}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        material_Projected_Price: e.target.value,
                      }))
                    }
                    className="pl-6"
                    placeholder="0.00"
                    readOnly
                  />
                </div>
              </label>
              <label className="grid gap-1">
                <Label>Equivalized Pipeline LBS</Label>
                <Input
                  type="number"
                  value={form.equivalized_Pipeline_LBS}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      equivalized_Pipeline_LBS: e.target.value,
                    }))
                  }
                  placeholder="Pipeline LBS"
                />
              </label>
              <label className="grid gap-1">
                <Label>Pipeline Projected Revenue</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70">
                    $
                  </span>
                  <Input
                    type="number"
                    value={form.pipeline_Projected_Revenue}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        pipeline_Projected_Revenue: e.target.value,
                      }))
                    }
                    className="pl-6"
                    placeholder="0.00"
                    readOnly
                  />
                </div>
              </label>
              <label className="grid gap-1">
                <Label>Override Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70">
                    $
                  </span>
                  <Input
                    type="number"
                    value={form.override_Price}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        override_Price: e.target.value,
                      }))
                    }
                    className="pl-6"
                    placeholder="0.00"
                  />
                </div>
              </label>
            </div>
          )}

          <ConfirmationModal
            isOpen={showModal}
            title="Approval Required"
            message="Entered price is less than the projected price. This requires approval from an approver."
            onConfirm={handleConfirm}
            onCancel={handleCancel1}
          />

          {currentSection === "timing" && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <Label>Annual or LTO</Label>
                <FrostedSelect
                  value={form.annual_Or_LTO}
                  onChange={(v) => {
                    setForm((prev) => ({
                      ...prev,
                      annual_Or_LTO: v,

                      end_Date: v === "Annual" ? "" : prev.end_Date,
                    }));

                    // Re-run date logic if we switch annual_Or_LTO from Annual to LTO
                    if (form.likely_Start_Date) {
                      handleAnnual_LTO({
                        target: { value: form.likely_Start_Date },
                      });
                    }

                    setErrors((prev) => ({ ...prev, end_Date: "" }));
                  }}
                  options={["Annual", "LTO"]}
                />
              </label>
              <label className="grid gap-1">
                <Label>Likely Start Date</Label>
                <FrostedDate
                  value={form.likely_Start_Date}
                  onChange={handleAnnual_LTO}
                  placeholder="Start Date"
                />
              </label>

              <label className="grid gap-1">
                <div className="flex items-center gap-1">
                  <Label>End Date</Label>
                  {form?.annual_Or_LTO === "LTO" && (
                    <span className="text-red-500">*</span>
                  )}
                </div>

                <FrostedDate
                  value={form.end_Date}
                  onChange={(v) => {
                    setForm((prev) => ({ ...prev, end_Date: v }));
                    setErrors((prev) => ({ ...prev, end_Date: "" }));
                  }}
                  placeholder="End Date"
                  required={form?.annual_Or_LTO === "LTO"}
                  error={errors.end_Date}
                />

                {errors.end_Date && (
                  <span className="text-red-500 text-sm">
                    {errors.end_Date}
                  </span>
                )}
              </label>

              <label className="grid gap-1">
                <Label>Date of Last Meeting</Label>
                <FrostedDate
                  value={form.last_Meeting_Date}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, last_Meeting_Date: v }))
                  }
                  placeholder="Select meeting date"
                />
              </label>
              <label className="grid gap-1 md:col-span-2">
                <Label>Next Step Description</Label>
                <Textarea
                  value={form.next_Step_Description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      next_Step_Description: e.target.value,
                    }))
                  }
                  placeholder="Describe next steps"
                  rows={3}
                />
              </label>
            </div>
          )}
          {currentSection === "outcome" && (
            <div className="grid grid-cols-1 gap-4">
              <label className="grid gap-1">
                <Label>Win/Loss Reason Code</Label>
                <FrostedSelect
                  value={form.win_Loss_Reason_Code}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, win_Loss_Reason_Code: v }))
                  }
                  options={[
                    "",
                    "Price",
                    "Product Quality",
                    "Relationship",
                    "Competition",
                    "Timing",
                    "Product Availability",
                    "Contract Terms",
                    "Technical Requirements",
                    "Budget Constraints",
                    "Internal Decision",
                    "Other",
                  ]}
                  placeholder="Select reason"
                />
              </label>
              <label className="grid gap-1">
                <Label>Win/Loss Comments</Label>
                <Textarea
                  value={form.win_Loss_Comments}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      win_Loss_Comments: e.target.value,
                    }))
                  }
                  placeholder="Add comments"
                  rows={4}
                />
              </label>
            </div>
          )}
          {currentSection === "support" && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <Label>Culinary Support Needed</Label>
                <FrostedSelect
                  value={form.culinary_Support_Needed}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, culinary_Support_Needed: v }))
                  }
                  options={["Y", "N"]}
                  placeholder="Select"
                />
              </label>
              {form.culinary_Support_Needed === "Y" && (
                <>
                  <label className="grid gap-1">
                    <Label>Culinary Support Status</Label>
                    <Input
                      value={form.culinary_Support_Status}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          culinary_Support_Status: e.target.value,
                        }))
                      }
                      placeholder="Status"
                    />
                  </label>
                  <label className="grid gap-1 md:col-span-2">
                    <Label>Culinary Support Description</Label>
                    <Textarea
                      value={form.culinary_Support_Description}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          culinary_Support_Description: e.target.value,
                        }))
                      }
                      placeholder="Describe support needed"
                      rows={2}
                    />
                  </label>
                </>
              )}
            </div>
          )}
          {currentSection === "voumeAllocation" && (
            <OpportunityVolumeAllocation
              form={{
                opportunity_Type: form.annual_Or_LTO,
                volume: form.estimated_Volume,
                start_date: form.likely_Start_Date,
                end_Date: form.end_Date,
              }}
            />
          )}
        </CardBody>
      </Card>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
        <div className="flex gap-2">
          {canGoPrev && (
            <Button variant="ghost" onClick={goToPrevSection}>
              Previous
            </Button>
          )}
          {canGoNext && (
            <Button
              onClick={(e) => {
                e.preventDefault();

                const newErrors = {};

                if (form.annual_Or_LTO === "LTO" && !form.end_Date) {
                  newErrors.end_Date = "End Date is required";
                }

                setErrors(newErrors);

                if (Object.keys(newErrors).length > 0) return;

                handleOverrideChange(e);
                goToNextSection();
              }}
            >
              Next
            </Button>
          )}

          {!canGoNext && (
            <Button onClick={handleSave}>Create Opportunity</Button>
          )}
        </div>
      </div>

      {exitConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <CardHeader
              title="Unsaved Changes"
              subtitle="You have unsaved changes. Are you sure you want to exit?"
            />
            <CardBody className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setExitConfirmOpen(false)}>
                Continue Editing
              </Button>
              <Button onClick={handleConfirmExit}>Exit Without Saving</Button>
            </CardBody>
          </Card>
        </div>
      )}
    </main>
  );
}

function OpportunityDetailsPage({ opp, onBack, onSave }) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  const [editMode, setEditMode] = useState(false);
  const [currentSection, setCurrentSection] = useState("product");
  const [materials, setMaterials] = useState([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [materialsError, setMaterialsError] = useState(null);

  const handleAnnual_LTO = (e) => {
    const startDate = typeof e === "string" ? e : e?.target?.value;
    if (!startDate) return;

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 363);

    const formattedEnd = end.toISOString().split("T")[0];

    setForm((prev) => ({
      ...prev,
      likely_Start_Date: startDate,
      end_Date: prev.annual_Or_LTO === "Annual" ? formattedEnd : "",
    }));
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setIsLoadingMaterials(true);
        const data = await apiFetchMaterials();
        setMaterials(Array.isArray(data) ? data : []);
        setMaterialsError(null);
      } catch (e) {
        setMaterials([]);
        setMaterialsError("Failed to load products");
      } finally {
        setIsLoadingMaterials(false);
      }
    };
    fetchMaterials();
  }, []);

  const productList = useMemo(
    () =>
      materials
        .map((m) => m.PRODUCT)
        .filter(Boolean)
        .sort(),
    [materials]
  );

  const sections = [
    { key: "product", label: "Product", icon: "📦" },
    { key: "volume", label: "Volume", icon: "📊" },
    { key: "pricing", label: "Pricing", icon: "💰" },
    { key: "timing", label: "Timing", icon: "📅" },
    { key: "outcome", label: "Outcome", icon: "📝" },
    { key: "support", label: "Culinary", icon: "🤝" },
  ];
  const getSectionIndex = (key) => sections.findIndex((s) => s.key === key);
  const canGoNext = getSectionIndex(currentSection) < sections.length - 1;
  const canGoPrev = getSectionIndex(currentSection) > 0;
  const goToNextSection = () => {
    const idx = getSectionIndex(currentSection);
    if (idx < sections.length - 1) setCurrentSection(sections[idx + 1].key);
  };
  const goToPrevSection = () => {
    const idx = getSectionIndex(currentSection);
    if (idx > 0) setCurrentSection(sections[idx - 1].key);
  };

  const [form, setForm] = useState({});
  useEffect(() => {
    if (opp) {
      setForm({
        // Core Details
        opportunity_ID: opp.opportunity_ID || opp.id || "",
        sales_Lead: opp.sales_Lead || opp.doleSalesLead || "",
        sales_Team: opp.sales_Team || opp.salesTeam || "",
        customer_Name: opp.customer_Name || opp.customerName || "",
        sales_Stage:
          opp.sales_Stage ||
          opp.salesStage ||
          opp.status ||
          "Lead: No Current Product Solution",
        opportunity_Type: opp.opportunity_Type || opp.opportunityType || "",
        opportunity_Summary:
          opp.opportunity_Summary || opp.opportunitySummary || "",

        // Product & Material
        product: opp.product || "",
        material_ID: opp.material_ID || opp.materialId || "",
        product_Category: opp.product_Category || opp.productCategory || "",
        base_UoM: opp.base_UoM || opp.materialBaseUnit || "Case",
        material_Weight: opp.material_Weight || opp.materialNetWeightLbs || "",
        product_Source_Location:
          opp.product_Source_Location || opp.productSourceLocation || "",
        likely_Distributors:
          opp.likely_Distributors || opp.likelyDistributors || "",

        // Volume & Units
        estimated_Volume: opp.estimated_Volume || opp.estimatedVolume || "",
        uoM: opp.uoM || opp.uom || "Case",
        case_Volume_Converted:
          opp.case_Volume_Converted || opp.caseVolume || "",
        opportunity_Volume_Input: opp.opportunity_Volume_Input || "",
        days_30_Ship: opp.days_30_Ship || "N",

        // Pricing & Financial Impact
        material_Projected_Price:
          opp.material_Projected_Price || opp.materialProjectedPrice || "",
        equivalized_Pipeline_LBS:
          opp.equivalized_Pipeline_LBS || opp.equalizedPipelineLbs || "",
        pipeline_Projected_Revenue:
          opp.pipeline_Projected_Revenue ||
          opp.pipelineProjectedRevenue ||
          opp.amount ||
          "",

        // Timing & Lifecycle
        likely_Start_Date:
          opp.likely_Start_Date || toISODate(opp.createdAt) || "",
        annual_Or_LTO: opp.annual_Or_LTO || "Annual",
        end_Date: opp.end_Date || toISODate(opp.closeDate) || "",
        last_Meeting_Date: opp.last_Meeting_Date || "",
        next_Step_Description: opp.next_Step_Description || "",

        // Outcome & Notes
        win_Loss_Reason_Code: opp.win_Loss_Reason_Code || "",
        win_Loss_Comments: opp.win_Loss_Comments || "",

        // Support & Enablement
        culinary_Support_Needed: opp.culinary_Support_Needed || "N",
        culinary_Support_Description: opp.culinary_Support_Description || "",
        culinary_Support_Status: opp.culinary_Support_Status || "",
      });
    }
  }, [opp]);

  const handleSave = () => {
    const updatedOpp = {
      ...opp,
      ...form,
      closeDate: form.end_Date ? new Date(form.end_Date) : opp.closeDate,
      amount: form.pipeline_Projected_Revenue || opp.amount,
    };
    onSave(updatedOpp);
    setEditMode(false);
    setCurrentSection("product");
  };

  useEffect(() => {
    if (form.material_Projected_Price && form.estimated_Volume) {
      const price = parseFloat(form.material_Projected_Price);
      const volume = parseFloat(form.estimated_Volume);
      if (!isNaN(price) && !isNaN(volume)) {
        const revenue = (price * volume).toFixed(2);
        setForm((prev) => ({ ...prev, pipeline_Projected_Revenue: revenue }));
      }
    }
  }, [form.material_Projected_Price, form.estimated_Volume]);

  const canEdit =
    opp &&
    !opp.sales_Stage?.includes("Post-pipeline: Win") &&
    !opp.sales_Stage?.includes("Post-pipeline: Loss");

  if (!opp) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-6 grid gap-6">
        <Card>
          <CardBody className="flex items-center justify-between">
            <div
              className={`text-sm ${
                isNight ? "text-white/70" : "text-gray-700"
              }`}
            >
              Opportunity not found.
            </div>
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
          </CardBody>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-6 grid gap-6">
      <div className="flex items-center justify-between">
        <div
          className={`text-sm ${isNight ? "text-white/70" : "text-gray-600"}`}
        >
          Opportunity #{opp.id} Details
        </div>
        <div className="flex gap-2">
          {canEdit && !editMode && (
            <Button onClick={() => setEditMode(true)}>Edit Details</Button>
          )}
          {!editMode && (
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
          )}
        </div>
      </div>

      {(editMode || canEdit) && (
        <div className="flex items-center justify-between gap-2 w-full">
          {sections.map((section) => {
            const selectedCls = isNight
              ? "bg-gradient-to-r from-[#C8102E] to-[#001489] text-white shadow-lg"
              : "bg-gradient-to-r from-[rgba(246,229,0,0.6)] to-[rgba(57,180,232,0.6)] text-gray-900 shadow-lg";
            const baseCls = isNight
              ? "bg-white/10 text-white/70 hover:bg-white/20"
              : "bg-white/40 text-gray-600 hover:bg-white/60";
            return (
              <button
                key={section.key}
                onClick={() => setCurrentSection(section.key)}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  section.key === currentSection ? selectedCls : baseCls
                }`}
              >
                <span style={{ fontSize: "16px" }}>{section.icon}</span>
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <Card noClip>
        <CardHeader
          title="Core Details"
          subtitle="Essential opportunity information"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="grid gap-1">
              <Label>Opportunity ID</Label>
              <Input value={form.opportunity_ID} disabled readOnly />
            </label>
            <label className="grid gap-1">
              <Label>Customer Name</Label>
              <Input
                value={form.customer_Name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    customer_Name: e.target.value,
                  }))
                }
                disabled={!editMode}
                readOnly={!editMode}
              />
            </label>
            <label className="grid gap-1">
              <Label>Sales Lead</Label>
              {editMode ? (
                <FrostedSelect
                  value={form.sales_Lead}
                  onChange={(v) => {
                    setForm((prev) => ({ ...prev, sales_Lead: v }));
                  }}
                  options={[
                    "Bill",
                    "Broker",
                    "Canada",
                    "Diana",
                    "Gregg",
                    "Jayne",
                    "Dan",
                    "Larry",
                    "Meredith",
                    "Michael J",
                    "Mike K",
                    "Steve",
                    "UNKNOWN",
                  ]}
                  disabled={!editMode}
                />
              ) : (
                <Input value={form.sales_Lead} disabled readOnly />
              )}
            </label>
            <label className="grid gap-1">
              <Label>Sales Team</Label>
              <Input
                value={form.sales_Team}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sales_Team: e.target.value }))
                }
                disabled={!editMode}
                readOnly={!editMode}
              />
            </label>
            <label className="grid gap-1">
              <Label>Sales Stage</Label>
              {editMode ? (
                <FrostedSelect
                  value={form.sales_Stage}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, sales_Stage: v }))
                  }
                  options={[
                    "Lead: No Current Product Solution",
                    "Lead: Deprioritized Account",
                    "Target Account",
                    "Customer Engaged",
                    "Proposal Submitted",
                    "Win - Customer Verbal",
                    "Post-pipeline: Win (order shipped)",
                    "Post-pipeline: Loss",
                    "Post-pipeline: On-hold",
                  ]}
                  disabled={!editMode}
                />
              ) : (
                <Input value={form.sales_Stage} disabled readOnly />
              )}
            </label>
            <label className="grid gap-1">
              <Label>Opportunity Type</Label>
              {editMode ? (
                <FrostedSelect
                  value={form.opportunity_Type}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, opportunity_Type: v }))
                  }
                  options={[
                    "New Business",
                    "Expansion",
                    "Renewal",
                    "Replacement",
                  ]}
                  disabled={!editMode}
                />
              ) : (
                <Input value={form.opportunity_Type} disabled readOnly />
              )}
            </label>
            <label className="grid gap-1 md:col-span-3">
              <Label>Opportunity Summary</Label>
              <Textarea
                value={form.opportunity_Summary}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    opportunity_Summary: e.target.value,
                  }))
                }
                disabled={!editMode}
                readOnly={!editMode}
                rows={3}
              />
            </label>
          </div>
        </CardBody>
      </Card>

      <Card noClip>
        <CardHeader
          title={sections.find((s) => s.key === currentSection)?.label}
          subtitle={`Section ${getSectionIndex(currentSection) + 1} of ${
            sections.length
          }`}
        />
        <CardBody>
          {currentSection === "product" && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <Label>Product</Label>
                {editMode ? (
                  isLoadingMaterials ? (
                    <div className="px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-500">
                      Loading products...
                    </div>
                  ) : materialsError ? (
                    <div className="px-3 py-2 rounded-xl border border-red-300 bg-red-50 text-red-600">
                      {materialsError}
                    </div>
                  ) : (
                    <FrostedSelect
                      value={form.product}
                      onChange={(v) => {
                        setForm((prev) => ({ ...prev, product: v }));
                        if (v && materials.length > 0) {
                          const selectedMaterial = materials.find(
                            (m) => m.PRODUCT === v
                          );
                          if (selectedMaterial) {
                            setForm((prev) => ({
                              ...prev,
                              product: v,
                              material_ID: selectedMaterial.MATERIAL_ID,
                              material_Weight: selectedMaterial.MATERIAL_WEIGHT,
                              product_Category:
                                selectedMaterial.PRODUCT_CATEGORY,
                              base_UoM: selectedMaterial.BASE_UOM,
                              material_Projected_Price:
                                selectedMaterial.MATERIAL_PROJECTED_PRICE,
                              pipeline_Projected_Revenue: prev.estimated_Volume
                                ? (
                                    parseFloat(
                                      selectedMaterial.MATERIAL_PROJECTED_PRICE
                                    ) * parseFloat(prev.estimated_Volume)
                                  ).toFixed(2)
                                : prev.pipeline_Projected_Revenue,
                            }));
                          }
                        }
                      }}
                      options={productList}
                      disabled={!editMode || isLoadingMaterials}
                    />
                  )
                ) : (
                  <Input value={form.product} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>Material ID</Label>
                <Input
                  value={form.material_ID}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      material_ID: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
              <label className="grid gap-1">
                <Label>Product Category</Label>
                {editMode ? (
                  <FrostedSelect
                    value={form.product_Category}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, product_Category: v }))
                    }
                    options={[
                      "",
                      "Snacking",
                      "Beverage",
                      "Pantry",
                      "Frozen",
                      "Other",
                    ]}
                    disabled={!editMode}
                  />
                ) : (
                  <Input value={form.product_Category} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>Base UoM</Label>
                {editMode ? (
                  <FrostedSelect
                    value={form.base_UoM}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, base_UoM: v }))
                    }
                    options={["Case", "Pound"]}
                    disabled={!editMode}
                  />
                ) : (
                  <Input value={form.base_UoM} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>Material Weight</Label>
                <Input
                  type="number"
                  value={form.material_Weight}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      material_Weight: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
              <label className="grid gap-1">
                <Label>Product Source Location</Label>
                <Input
                  value={form.product_Source_Location}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      product_Source_Location: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
              <label className="grid gap-1">
                <Label>Likely Distributors</Label>
                <Input
                  value={form.likely_Distributors}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      likely_Distributors: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
            </div>
          )}

          {currentSection === "volume" && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <Label>Estimated Volume</Label>
                <Input
                  type="number"
                  value={form.estimated_Volume}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      estimated_Volume: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
              <label className="grid gap-1">
                <Label>Unit of Measure</Label>
                {editMode ? (
                  <FrostedSelect
                    value={form.uoM}
                    onChange={(v) => setForm((prev) => ({ ...prev, uoM: v }))}
                    options={["Case", "Pallet", "Each", "Pound", "Kilogram"]}
                    disabled={!editMode}
                  />
                ) : (
                  <Input value={form.uoM} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>Case Volume (Converted)</Label>
                <Input
                  type="number"
                  value={form.case_Volume_Converted}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      case_Volume_Converted: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
              <label className="grid gap-1">
                <Label>Opportunity Volume Input</Label>
                <Input
                  type="number"
                  value={form.opportunity_Volume_Input}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      opportunity_Volume_Input: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
              <label className="grid gap-1">
                <Label>30 Days Ship</Label>
                {editMode ? (
                  <FrostedSelect
                    value={form.days_30_Ship}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, days_30_Ship: v }))
                    }
                    options={["Y", "N"]}
                    disabled={!editMode}
                  />
                ) : (
                  <Input
                    value={form.days_30_Ship === "Y" ? "Yes" : "No"}
                    disabled
                    readOnly
                  />
                )}
              </label>
            </div>
          )}

          {currentSection === "pricing" && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <Label>Material Projected Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70">
                    $
                  </span>
                  <Input
                    type="number"
                    value={form.material_Projected_Price}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        material_Projected_Price: e.target.value,
                      }))
                    }
                    className="pl-6"
                    disabled={!editMode}
                    readOnly={!editMode}
                  />
                </div>
              </label>
              <label className="grid gap-1">
                <Label>Equivalized Pipeline LBS</Label>
                <Input
                  type="number"
                  value={form.equivalized_Pipeline_LBS}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      equivalized_Pipeline_LBS: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </label>
              <label className="grid gap-1">
                <Label>Pipeline Projected Revenue</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70">
                    $
                  </span>
                  <Input
                    type="number"
                    value={form.pipeline_Projected_Revenue}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        pipeline_Projected_Revenue: e.target.value,
                      }))
                    }
                    className="pl-6"
                    disabled={!editMode}
                    readOnly={!editMode}
                  />
                </div>
              </label>
            </div>
          )}

          {currentSection === "timing" && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <Label>Likely Start Date</Label>
                {editMode ? (
                  <FrostedDate
                    value={form.likely_Start_Date}
                    onChange={(e) => handleAnnual_LTO(e)}
                    disabled={!editMode}
                  />
                ) : (
                  <Input value={form.likely_Start_Date} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>End Date</Label>
                {editMode ? (
                  <FrostedDate
                    value={form.end_Date}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, end_Date: v }))
                    }
                    disabled={!editMode}
                  />
                ) : (
                  <Input value={form.end_Date} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>Annual or LTO</Label>
                {editMode ? (
                  <FrostedSelect
                    value={form.annual_Or_LTO}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, annual_Or_LTO: v }))
                    }
                    options={["Annual", "LTO"]}
                    disabled={!editMode}
                  />
                ) : (
                  <Input value={form.annual_Or_LTO} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>Date of Last Meeting</Label>
                {editMode ? (
                  <FrostedDate
                    value={form.last_Meeting_Date}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, last_Meeting_Date: v }))
                    }
                    disabled={!editMode}
                  />
                ) : (
                  <Input value={form.last_Meeting_Date} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1 md:col-span-2">
                <Label>Next Step Description</Label>
                <Textarea
                  value={form.next_Step_Description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      next_Step_Description: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                  rows={3}
                />
              </label>
            </div>
          )}

          {currentSection === "outcome" && (
            <div className="grid grid-cols-1 gap-4">
              <label className="grid gap-1">
                <Label>Win/Loss Reason Code</Label>
                {editMode ? (
                  <FrostedSelect
                    value={form.win_Loss_Reason_Code}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, win_Loss_Reason_Code: v }))
                    }
                    options={[
                      "",
                      "Price",
                      "Product Quality",
                      "Relationship",
                      "Competition",
                      "Timing",
                      "Product Availability",
                      "Contract Terms",
                      "Technical Requirements",
                      "Budget Constraints",
                      "Internal Decision",
                      "Other",
                    ]}
                    disabled={!editMode}
                  />
                ) : (
                  <Input value={form.win_Loss_Reason_Code} disabled readOnly />
                )}
              </label>
              <label className="grid gap-1">
                <Label>Win/Loss Comments</Label>
                <Textarea
                  value={form.win_Loss_Comments}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      win_Loss_Comments: e.target.value,
                    }))
                  }
                  disabled={!editMode}
                  readOnly={!editMode}
                  rows={4}
                />
              </label>
            </div>
          )}

          {currentSection === "support" && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <Label>Culinary Support Needed</Label>
                {editMode ? (
                  <FrostedSelect
                    value={form.culinary_Support_Needed}
                    onChange={(v) =>
                      setForm((prev) => ({
                        ...prev,
                        culinary_Support_Needed: v,
                      }))
                    }
                    options={["Y", "N"]}
                    disabled={!editMode}
                  />
                ) : (
                  <Input
                    value={form.culinary_Support_Needed === "Y" ? "Yes" : "No"}
                    disabled
                    readOnly
                  />
                )}
              </label>
              {(form.culinary_Support_Needed === "Y" ||
                (!editMode && form.culinary_Support_Status)) && (
                <>
                  <label className="grid gap-1">
                    <Label>Culinary Support Status</Label>
                    <Input
                      value={form.culinary_Support_Status}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          culinary_Support_Status: e.target.value,
                        }))
                      }
                      disabled={!editMode}
                      readOnly={!editMode}
                    />
                  </label>
                  <label className="grid gap-1 md:col-span-2">
                    <Label>Culinary Support Description</Label>
                    <Textarea
                      value={form.culinary_Support_Description}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          culinary_Support_Description: e.target.value,
                        }))
                      }
                      disabled={!editMode}
                      readOnly={!editMode}
                      rows={2}
                    />
                  </label>
                </>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {!canEdit && (
        <Card>
          <CardBody>
            <div
              className={`text-sm ${
                isNight ? "text-white/70" : "text-gray-600"
              }`}
            >
              This opportunity has reached {opp.sales_Stage} stage and cannot be
              edited.
            </div>
          </CardBody>
        </Card>
      )}

      {editMode && (
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setEditMode(false);
              setCurrentSection("product");
            }}
          >
            Cancel Edit
          </Button>
          <div className="flex gap-2">
            {canGoPrev && (
              <Button variant="ghost" onClick={goToPrevSection}>
                Previous
              </Button>
            )}
            {canGoNext && <Button onClick={goToNextSection}>Next</Button>}
            {!canGoNext && <Button onClick={handleSave}>Save Changes</Button>}
          </div>
        </div>
      )}
    </main>
  );
}

function WelcomeCard({
  currentUser,
  avatarUrl,
  setAvatarUrl,
  upcomingOpps = [],
}) {
  const theme = useContext(ThemeContext);
  const [currentReminderIndex, setCurrentReminderIndex] = useState(0);
  const emailName = currentUser.split("@")[0];
  const firstName = emailName.split(".")[0];
  const capitalizedFirstName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  const today = new Date();
  const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

  const urgentOpps = (upcomingOpps || [])
    .filter((opp) => {
      if (!opp || !opp.closeDate) return false;
      const closeDate = new Date(opp.closeDate);
      return (
        closeDate >= today &&
        closeDate <= threeDaysFromNow &&
        opp.status !== "Closed Won" &&
        opp.status !== "Closed Lost"
      );
    })
    .sort((a, b) => new Date(a.closeDate) - new Date(b.closeDate))
    .slice(0, 3);

  useEffect(() => {
    if (urgentOpps.length > 1) {
      const interval = setInterval(() => {
        setCurrentReminderIndex((prev) => (prev + 1) % urgentOpps.length);
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [urgentOpps.length]);

  const getPersonalReminder = (opp) => {
    if (!opp) return "";

    const closeDate = new Date(opp.closeDate);
    const dayDiff = Math.ceil((closeDate - today) / (1000 * 60 * 60 * 24));

    const getDayText = () => {
      if (dayDiff === 0) return "today";
      if (dayDiff === 1) return "tomorrow";
      if (dayDiff === 2)
        return (
          "this " + closeDate.toLocaleDateString("en-US", { weekday: "long" })
        );
      return (
        "this " + closeDate.toLocaleDateString("en-US", { weekday: "long" })
      );
    };

    const greetings = [
      "Hey there",
      "Quick reminder",
      "Don't forget",
      "Heads up",
      "Just so you know",
    ];

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    const getActionMessage = () => {
      const customer = opp.customerName || "your client";
      const amount = opp.amount
        ? ` ($${Number(opp.amount).toLocaleString()} deal)`
        : "";

      switch (opp.status) {
        case "New":
          return `${greeting}, you've got an initial meeting to schedule with ${customer} ${getDayText()}${amount}`;
        case "In Review":
          return `${greeting}, you have a review to complete for ${customer} ${getDayText()}${amount}`;
        case "Negotiation":
          return `${greeting}, you have a negotiation to finalize with ${customer} ${getDayText()}${amount}`;
        default:
          return `${greeting}, you need to follow up with ${customer} ${getDayText()}${amount}`;
      }
    };

    return getActionMessage();
  };

  function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result);
      try {
        localStorage.setItem("oppty_avatar", reader.result);
      } catch {}
    };
    reader.readAsDataURL(file);
  }

  const currentOpp = urgentOpps[currentReminderIndex];

  return (
    <div className="flex items-center gap-4 w-full">
      <label
        className="cursor-pointer"
        title={avatarUrl ? "Change photo" : "Add photo"}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="h-20 w-20 rounded-2xl object-cover"
          />
        ) : (
          <div
            className={
              "h-20 w-20 rounded-2xl avatar-grad grid place-items-center"
            }
          >
            <UserIcon className="h-10 w-10" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPick}
        />
      </label>
      <div className="flex-1">
        <div className={`text-xl ${theme === "sunset" ? "text-white" : ""}`}>
          <span className="font-normal">Welcome back </span>
          <span className="font-bold">{capitalizedFirstName}!</span>
        </div>

        {currentOpp && (
          <div
            className={`text-sm mt-1 ${
              theme === "sunset" ? "text-white/70" : "text-gray-600"
            } transition-all duration-500`}
          >
            <div className="flex items-start gap-2">
              <Clock className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <div>
                <div>{getPersonalReminder(currentOpp)}</div>
                {urgentOpps.length > 1 && (
                  <div
                    className={`text-xs mt-1 ${
                      theme === "sunset" ? "text-white/50" : "text-gray-400"
                    }`}
                  >
                    ({currentReminderIndex + 1} of {urgentOpps.length} urgent
                    tasks)
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!currentOpp && (
          <div
            className={`text-sm mt-1 ${
              theme === "sunset" ? "text-white/70" : "text-gray-600"
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Great job! No urgent actions needed in the next 3 days
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- mockSeed ----------------
function seedOpps() {
  const now = new Date();

  const ownerMapping = {
    Bill: "bill@doleintl.com",
    Diana: "diana@doleintl.com",
    Gregg: "gregg@doleintl.com",
    Dan: "dan@doleintl.com",
    Steve: "steve@doleintl.com",
  };

  const opportunities = [
    // Bill's Field Sales opportunities (rows 1-25)
    {
      id: 1,
      title: "&Pizza - Pineapple Juice",
      amount: 0,
      status: "Lead: Deprioritized Account",
      owner: "bill@doleintl.com",
      doleSalesLead: "Bill",
      salesTeam: "Field Sales",
      customerName: "&Pizza",
      product: "12/46 FL OZ PINEAPPLE JUICE (CONVENIENCE)",
      units2023: 59,
      salesStage: "Lead: Deprioritized Account",
      materialId: "3890000818",
      productCategory: "BEVERAGE",
      createdAt: new Date(2024, 0, 1),
      closeDate: new Date(2025, 5, 1),
    },
    {
      id: 2,
      title: "bb.q Chicken - Pineapple Juice SW",
      amount: 0,
      status: "Lead: Deprioritized Account",
      owner: "bill@doleintl.com",
      doleSalesLead: "Bill",
      salesTeam: "Field Sales",
      customerName: "bb.q Chicken",
      product: "2/24/6 OZ PINEAPPLE JUICE SW (CONVENIENCE)",
      units2023: 165,
      salesStage: "Lead: Deprioritized Account",
      materialId: "3890000914",
      productCategory: "BEVERAGE",
      createdAt: new Date(2024, 0, 1),
      closeDate: new Date(2025, 5, 1),
    },
    {
      id: 3,
      title: "Ben & Jerry's - Pineapple Juice",
      amount: 0,
      status: "Lead: Deprioritized Account",
      owner: "bill@doleintl.com",
      doleSalesLead: "Bill",
      salesTeam: "Field Sales",
      customerName: "Ben & Jerry's",
      product: "8/6/6OZ PINEAPPLE JUICE (CONVENIENCE)",
      units2023: 187,
      salesStage: "Lead: Deprioritized Account",
      materialId: "3890000947",
      createdAt: new Date(2024, 0, 1),
      closeDate: new Date(2025, 5, 1),
    },
    {
      id: 4,
      title: "Bruegger's - Pineapple Sliced",
      amount: 0,
      status: "Lead: Deprioritized Account",
      owner: "bill@doleintl.com",
      doleSalesLead: "Bill",
      salesTeam: "Field Sales",
      customerName: "Bruegger's",
      product: "12/8 OZ FANCY PINEAPPLE SLICED IN JUICE (CONVENIENCE)",
      units2023: 181,
      salesStage: "Lead: Deprioritized Account",
      materialId: "3890001139",
      createdAt: new Date(2024, 0, 1),
      closeDate: new Date(2025, 5, 1),
    },
    {
      id: 5,
      title: "Bruster's - Pineapple Chunk",
      amount: 0,
      status: "Lead: Deprioritized Account",
      owner: "bill@doleintl.com",
      doleSalesLead: "Bill",
      salesTeam: "Field Sales",
      customerName: "Bruster's Real Ice Cream",
      product: "12/20 OZ FANCY PINEAPPLE CHUNK JUICE (CONVENIENCE)",
      units2023: 194,
      salesStage: "Lead: Deprioritized Account",
      materialId: "3890001473",
      createdAt: new Date(2024, 0, 1),
      closeDate: new Date(2025, 5, 1),
    },
    {
      id: 6,
      title: "D'Angelo - Mixed Fruit",
      amount: 0,
      status: "Lead: Deprioritized Account",
      owner: "bill@doleintl.com",
      doleSalesLead: "Bill",
      salesTeam: "Field Sales",
      customerName: "D'Angelo",
      product: "6/4/4OZ MIXED FRUIT JUICE CUP (CONVENIENCE)",
      units2023: 83,
      salesStage: "Lead: Deprioritized Account",
      materialId: "3890003060",
      createdAt: new Date(2024, 0, 1),
      closeDate: new Date(2025, 5, 1),
    },
    {
      id: 7,
      title: "Dibella's - Pineapple Chunk",
      amount: 0,
      status: "Lead: Deprioritized Account",
      owner: "bill@doleintl.com",
      doleSalesLead: "Bill",
      salesTeam: "Field Sales",
      customerName: "Dibella's",
      product: "12/8 OZ FANCY PINAPPLE CHUNK IN JUICE (CONVENIENCE)",
      units2023: 43,
      salesStage: "Lead: Deprioritized Account",
      materialId: "3890011469",
      createdAt: new Date(2024, 0, 1),
      closeDate: new Date(2025, 5, 1),
    },
    {
      id: 8,
      title: "Duck Donuts - Pineapple Juice",
      amount: 0,
      status: "Lead: Deprioritized Account",
      owner: "bill@doleintl.com",
      doleSalesLead: "Bill",
      salesTeam: "Field Sales",
      customerName: "Duck Donuts",
      product: "12/46 FL OZ PINEAPPLE JUICE (CONVENIENCE)",
      units2023: 125,
      salesStage: "Lead: Deprioritized Account",
      estimatedVolume: 10000,
      materialId: "3890000818",
      createdAt: new Date(2024, 0, 1),
      closeDate: new Date(2025, 5, 1),
    },
    {
      id: 9,
      title: "Famous Dave's - Pineapple Juice SW",
      amount: 0,
      status: "Lead: Deprioritized Account",
      owner: "bill@doleintl.com",
      doleSalesLead: "Bill",
      salesTeam: "Field Sales",
      customerName: "Famous Dave's",
      product: "2/24/6 OZ PINEAPPLE JUICE SW (CONVENIENCE)",
      units2023: 116,
      salesStage: "Lead: Deprioritized Account",
      estimatedVolume: 45000,
      materialId: "3890000914",
      createdAt: new Date(2024, 0, 1),
      closeDate: new Date(2025, 5, 1),
    },
    {
      id: 10,
      title: "Gino's Pizza - Pineapple Juice",
      amount: 0,
      status: "Lead: Deprioritized Account",
      owner: "bill@doleintl.com",
      doleSalesLead: "Bill",
      salesTeam: "Field Sales",
      customerName: "Gino's Pizza & Spaghetti House",
      product: "8/6/6OZ PINEAPPLE JUICE (CONVENIENCE)",
      units2023: 52,
      salesStage: "Lead: Deprioritized Account",
      estimatedVolume: 23400,
      materialId: "3890000947",
      createdAt: new Date(2024, 0, 1),
      closeDate: new Date(2025, 5, 1),
    },

    // Diana's National Account opportunities (rows 26-52)
    {
      id: 26,
      title: "Texas Roadhouse - Pineapple Juice",
      amount: 498261.67,
      status: "Customer Engaged",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "Texas Roadhouse",
      product: "Pineapple Juice",
      industrySegment: "Casual Dining",
      units2023: 638,
      salesStage: "Customer Engaged",
      estimatedVolume: 15000,
      materialId: "3890011469",
      samplesNeeded: "Y",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2024, 9, 10),
    },
    {
      id: 27,
      title: "Texas Roadhouse - Lemons",
      amount: 127281,
      status: "Customer Engaged",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "Texas Roadhouse",
      product: "Lemons",
      industrySegment: "Casual Dining",
      units2023: 638,
      salesStage: "Customer Engaged",
      estimatedVolume: 44660,
      materialId: "3890000818",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2024, 9, 10),
    },
    {
      id: 28,
      title: "Twin Peaks - Lemons",
      amount: 1710000,
      status: "Customer Engaged",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "Twin Peaks",
      product: "Lemons",
      industrySegment: "Casual Dining",
      units2023: 103,
      salesStage: "2. Customer Engaged",
      opportunityType: "New Business",
      estimatedVolume: 20000,
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 2, 20),
    },
    {
      id: 29,
      title: "Wendy's - IQF Lemons",
      amount: 309339,
      status: "Customer Engaged",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "Wendy's",
      product: "IQF Lemons",
      industrySegment: "QSR",
      units2023: 6030,
      salesStage: "2. Customer Engaged",
      estimatedVolume: 108540,
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 5, 1),
    },
    {
      id: 30,
      title: "Wienerschnitzel - Target",
      amount: 0,
      status: "Target Account",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "Wienerschnitzel",
      industrySegment: "QSR",
      units2023: 323,
      salesStage: "1. Target Account",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 3, 25),
    },
    {
      id: 31,
      title: "Wingstop - Dole Whip",
      amount: 3000,
      status: "Customer Engaged",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "Wingstop",
      product: "Dole Whip Pineapple",
      industrySegment: "Fast Casual",
      units2023: 1950,
      salesStage: "2. Customer Engaged",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 5, 1),
    },
    {
      id: 32,
      title: "IHOP - Good Crunch",
      amount: 114720,
      status: "Customer Engaged",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "IHOP",
      product: "Good Crunch",
      industrySegment: "Midscale",
      units2023: 1696,
      salesStage: "2. Customer Engaged",
      opportunityType: "New Business",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 3, 15),
    },
    {
      id: 33,
      title: "Landry's - 4+1 Strawberries",
      amount: 57176.92,
      status: "Win - Customer Verbal",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "Landry's",
      product: "4+1 Strawberries",
      salesStage: "4. Win - Customer Verbal",
      opportunityType: "New Business",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 3, 30),
    },
    {
      id: 34,
      title: "Little Caesar - PA Tidbits",
      amount: 105501,
      status: "Customer Engaged",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "Little Caesar",
      product: "PA Tidbits",
      industrySegment: "QSR",
      salesStage: "2. Customer Engaged",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 9, 1),
    },
    {
      id: 35,
      title: "IHOP - Dragon Fruit",
      amount: 213280,
      status: "Customer Engaged",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "IHOP",
      product: "Chef-Ready Cuts Diced Dragon Fruit",
      salesStage: "2. Customer Engaged",
      opportunityType: "New Business",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 9, 1),
    },
    {
      id: 36,
      title: "Kahala - IQF Mango",
      amount: 285500,
      status: "Post-pipeline: On-hold",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "Kahala (Planet Smoothie)",
      product: "IQF Mango Chunks",
      salesStage: "Post-pipeline: On-hold",
      opportunityType: "New Business",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 3, 14),
    },
    {
      id: 38,
      title: "Famous Dave's - Pineapple Crushed",
      amount: 18467.48,
      status: "Proposal Submitted",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "Famous Dave's (BBQ Holdings)",
      product: "Pineapple Fancy Crushed",
      salesStage: "Proposal Submitted",
      opportunityType: "New Business",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 3, 30),
    },
    {
      id: 42,
      title: "BBQ Holdings - Pineapple Juice VIT SW",
      amount: 1948.8,
      status: "Post-pipeline: Win (order shipped)",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "BBQ Holdings- Barrio Queen",
      product: "pineapple Juice VIT SW",
      salesStage: "Post-pipeline: Win (order shipped)",
      opportunityType: "New Business",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 3, 29),
    },
    {
      id: 45,
      title: "Ladle & Leaf - IQF Avocado",
      amount: 17600,
      status: "Post-pipeline: Loss",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "Ladle & Leaf",
      product: "IQF Chef-Ready Avocado Diced",
      salesStage: "Post-pipeline: Loss",
      opportunityType: "New Business",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 4, 1),
    },
    {
      id: 46,
      title: "Nordstrom - Beverage RFP",
      amount: 30023.47,
      status: "Proposal Submitted",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "Nordstrom",
      product: "Beverage RFP ( Pineapple Juice)",
      salesStage: "Proposal Submitted",
      opportunityType: "New Business",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 4, 7),
    },
    {
      id: 47,
      title: "Landry's - Strawberry Tub",
      amount: 445980,
      status: "Post-pipeline: Win (order shipped)",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "Landry's",
      product: "Strawberry SL 6/6.5# 4+1 Tub",
      salesStage: "Post-pipeline: Win (order shipped)",
      opportunityType: "New Business",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 4, 13),
    },
    {
      id: 48,
      title: "Nordstrom - Dole Pineapple juice",
      amount: 30023.47,
      status: "Proposal Submitted",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "Nordstrom",
      product: "Dole Pineapple juice",
      salesStage: "Proposal Submitted",
      opportunityType: "New Business",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 7, 1),
    },
    {
      id: 49,
      title: "PF Changs - Good Crunch",
      amount: 33200,
      status: "Customer Engaged",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "PF Changs",
      product: "Pineapple Good Crunch",
      salesStage: "2. Customer Engaged",
      opportunityType: "New Business",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 5, 3),
    },
    {
      id: 50,
      title: "PF Changs - IQF Lemons",
      amount: 205200,
      status: "Customer Engaged",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "PF Changs",
      product: "IQF Lemons",
      salesStage: "2. Customer Engaged",
      opportunityType: "New Business",
      createdAt: new Date(2024, 7, 1),
      closeDate: new Date(2025, 5, 3),
    },

    // Add 3 urgent opportunities for testing "Needs Attention"
    {
      id: 100,
      title: "URGENT: Kroger - Review Today",
      amount: 85000,
      status: "Proposal Submitted",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "Kroger",
      product: "Mixed Produce",
      salesStage: "Proposal Submitted",
      opportunityType: "New Business",
      createdAt: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 10
      ),
      closeDate: now,
    },
    {
      id: 101,
      title: "URGENT: Walmart - Tomorrow",
      amount: 120000,
      status: "Customer Engaged",
      owner: "diana@doleintl.com",
      doleSalesLead: "Diana",
      salesTeam: "Nat'l Account",
      customerName: "Walmart",
      product: "Fresh Produce",
      salesStage: "2. Customer Engaged",
      opportunityType: "Renewal",
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
      closeDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    },
    {
      id: 102,
      title: "URGENT: Target - 2 Days",
      amount: 95000,
      status: "Customer Engaged",
      owner: "bill@doleintl.com",
      doleSalesLead: "Bill",
      salesTeam: "Field Sales",
      customerName: "Target",
      product: "Juice Products",
      salesStage: "2. Customer Engaged",
      opportunityType: "Expansion",
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
      closeDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
    },
  ];

  console.log("Loaded opportunities from dataset:", opportunities.length);
  return opportunities;
}

// ---------------- Lightweight runtime self-checks ("tests") ----------------
(function runSelfChecks() {
  try {
    console.assert(
      monthKey(new Date(2025, 0, 1)) === "2025-01",
      "monthKey should format YYYY-MM (Jan)"
    );
    console.assert(
      monthKey(new Date(2025, 11, 1)) === "2025-12",
      "monthKey should format YYYY-MM (Dec)"
    );

    const seeded = seedOpps();
    console.assert(
      Array.isArray(seeded) && seeded.length > 0,
      "seedOpps should return non-empty array"
    );
    const shapeOk = seeded.every(
      (o) =>
        typeof o.id === "number" &&
        typeof o.title === "string" &&
        STATUSES.includes(o.status)
    );
    console.assert(shapeOk, "seedOpps items should have expected shape");

    const colorOk = STATUSES.every((s) =>
      Object.prototype.hasOwnProperty.call(STATUS_COLORS, s)
    );
    console.assert(colorOk, "Each status should have a color mapping");

    console.assert(
      [1, 2, 3].every((r) => ALLOWED_ROWS.includes(r)),
      "ALLOWED_ROWS should include 1,2,3"
    );
    console.assert(
      [3, 4, 6, 8, 12].every((c) => ALLOWED_COLS.includes(c)),
      "ALLOWED_COLS should include 3,4,6,8,12"
    );
    console.assert(GAP_PX === 16, "GAP_PX should be 16");

    const datesOk = seeded.every(
      (o) => o.createdAt instanceof Date && o.closeDate instanceof Date
    );
    console.assert(
      datesOk,
      "seedOpps should emit Date objects for createdAt/closeDate"
    );

    const now = new Date();
    const a = { createdAt: new Date(now.getTime() - 1000) };
    const b = { createdAt: new Date(now.getTime()) };
    const c = { createdAt: new Date(now.getTime() - 500) };
    const ordered = pickLatestByCreated([a, b, c], 3);
    console.assert(
      ordered[0] === b && ordered[1] === c && ordered[2] === a,
      "pickLatestByCreated should sort descending by createdAt"
    );

    const d1 = new Date(2025, 0, 2);
    const d2 = new Date(2025, 0, 2, 23, 59, 59);
    const d3 = new Date(2025, 0, 3);
    console.assert(
      isSameDay(d1, d2) && !isSameDay(d1, d3),
      "isSameDay should compare Y/M/D only"
    );

    const limited = pickLatestByCreated([a, b, c], 2);
    console.assert(
      limited.length === 2 && limited[0] === b && limited[1] === c,
      "pickLatestByCreated should return at most n items in order"
    );
    console.assert(
      monthKey(new Date(2024, 1, 9)) === "2024-02",
      "monthKey should zero-pad month (Feb)"
    );

    console.assert(
      /^\d{4}-\d{2}-\d{2}$/.test(toISODate(new Date())),
      "toISODate always returns YYYY-MM-DD"
    );
    console.assert(
      toISODate(new Date(2024, 0, 5)) === "2024-01-05",
      "toISODate should format YYYY-MM-DD"
    );
  } catch (e) {
    console.warn("Self-checks failed:", e);
  }
})();
