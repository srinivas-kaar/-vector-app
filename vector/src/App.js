import React, { useEffect, useMemo, useState, useCallback } from "react";

import {
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

import { Plus, TrendingUp, Sun, Moon, Clock, Search } from "lucide-react";

import "react-day-picker/dist/style.css";
import {
  ALLOWED_COLS,
  ALLOWED_ROWS,
  CHART_COLORS,
  GAP_PX,
  seedOpps,
  STATUS_COLORS,
  STATUSES,
} from "./metadata";
import { Button } from "./ui/common/Button";
import { Card } from "./ui/common/Card";
import { CardHeader } from "./ui/common/CardHeader";
import { CardBody } from "./ui/common/CardBody";
import {
  formatMonthDisplay,
  isSameDay,
  monthKey,
  pickLatestByCreated,
  toISODate,
} from "./utils";
import {
  apiCreateOpp,
  apiCreatePendingUser,
  apiFetchOpps,
  apiGetUserByEmail,
} from "./api";
import { WelcomeCard } from "./components/WelcomeCard";
import { LoginPage } from "./components/Login";
import { FloatingNav } from "./components/FloatingNav";
import { SearchModal } from "./components/SearchModal";
import { GanttMonth } from "./components/GanttMonth";
import { GlobalStyles } from "./GlobalStyles";
import { UserRegistrationTable } from "./components/UserRegistrationTable";
import { OverridePriceApprovalRequestsTable } from "./components/OverridePriceApprovalRequestsTable";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { OpportunitiesPage } from "./pages/OpportunitiesPage";
import { AdminPage } from "./pages/AdminPage";
import { AddOpportunityPage } from "./components/AddOpportunityPage";
import { OpportunityDetailsPage } from "./components/OpportunityDetailsPage";
import { useLocalState } from "./hooks/useLocalState";

export const ThemeContext = React.createContext("sunrise");

export default function App() {
  const defaultColumns = {
    salesLead: true,
    customerName: true,
    product: true,
    status: true,
    estimatedVolume: true,
    likelyStartDate: true,
  };
  const [currentUser, setCurrentUser] = useLocalState("oppty_user", "");
  const [isAdminUser, setIsAdminUser] = useLocalState("oppty_is_admin", false);
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(defaultColumns);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [route, setRoute] = useState("dashboard");
  const [detailId, setDetailId] = useState(null);
  const [themeMode, setThemeMode] = useState(() => {
    try {
      return localStorage.getItem("oppty_themeMode") || "auto";
    } catch {
      return "auto";
    }
  });
  const [ownerScope, setOwnerScope] = useLocalState("oppty_ownerScope", "me");
  const [windowMonths, setWindowMonths] = useLocalState(
    "oppty_windowMonths",
    6
  );
  const [avatarUrl, setAvatarUrl] = useLocalState("oppty_avatar", "");
  const scopedOpps = useMemo(
    () =>
      ownerScope === "me" ? opps.filter((o) => o.owner === currentUser) : opps,
    [opps, ownerScope, currentUser]
  );
  const getAutoTheme = () => {
    const hour = new Date().getHours();
    return hour >= 7 && hour < 19 ? "sunrise" : "sunset";
  };
  const theme = themeMode === "auto" ? getAutoTheme() : themeMode;
  const kpiTotal = scopedOpps.length;
  const myOppsOnly = useMemo(
    () => opps.filter((o) => o.owner === currentUser),
    [opps, currentUser]
  );
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
    const now = new Date();
    setSelectedDate(now);
    try {
      localStorage.setItem("oppty_selectedDate", now.toISOString());
    } catch {}
  }, []);
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
  useEffect(() => {
    const saved = localStorage.getItem("visibleColumns");
    if (saved) setVisibleColumns(JSON.parse(saved));
  }, []);

  // Save preferences whenever changed
  useEffect(() => {
    localStorage.setItem("visibleColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);
  useEffect(() => {}, [route]);
  useEffect(() => {
    try {
      localStorage.setItem("oppty_ownerScope", ownerScope);
    } catch {}
  }, [ownerScope]);
  useEffect(() => {
    try {
      localStorage.setItem("oppty_windowMonths", String(windowMonths));
    } catch {}
  }, [windowMonths]);
  useEffect(() => {
    loadData();
  }, [loadData]);
  console.log({ opps });
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
          priceRaw: Number(o.material_Price || o.materialProjectedPrice || 0),
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
  async function addOpportunity(form) {
    console.log({ form });
    const payload = {
      customerName: form.customer_Name,
      materialId: form.material_ID,
      title: form.title || `${form.customer_Name} - ${form.product}`,
      amount: Number(form.pipeline_Projected_Revenue || form.amount || 0),
      status:
        form.sales_Stage || form.status || "Lead: No Current Product Solution",
      owner: currentUser,
      closeDate: form.end_Date ? new Date(form.end_Date) : new Date(),
      opportunity_ID:
        form.opportunity_ID || Math.max(0, ...opps.map((o) => o.id)) + 1,
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
      materialProjectedPrice: form.material_Price,
      overridePrice: form.override_Price,
      businessJustification: form.business_justification,
      equivalizedPipelineLbs: form.equivalized_Pipeline_LBS,
      pipelineProjectedRevenue: form.pipeline_Projected_Revenue,
      likelyStartDate: form.likely_Start_Date,
      annualOrLTO: form.annual_Or_LTO,
      endDate: form.end_Date,
      lastMeetingDate: form.last_Meeting_Date,
      nextStepDescription: form.next_Step_Description,
      winLossReasonCode: form.win_Loss_Reason_Code,
      winLossComments: form.win_Loss_Comments,
      culinaryNeeded: form.culinary_Needed,
      culinarySupportDescription: form.culinary_Support_Description,
      culinarySupportStatus: form.culinary_Support_Status,
      brokerLed: form.broker_Led,
      materialDesc: form.material_Desc,
      probability: form.probability,
      poundVolume: form.pound_Volume,
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
        end_Date: created.endDate || created.end_Date,
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
  return (
    <div>
      <ThemeContext.Provider value={theme}>
        <GlobalStyles />
        {!currentUser || currentUser.trim() === "" ? (
          <LoginPage onSubmit={handleLogin} onSignup={handleSignup} />
        ) : (
          <div
            className={`min-h-screen flex ${
              isNight
                ? "theme-sunset text-white"
                : "theme-sunrise text-gray-900"
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
                } backdrop-blur-xl ${
                  isNight ? "" : "border-b border-white/45"
                } ${isNight ? "" : "shadow-[0_1px_0_rgba(255,255,255,0.6)]"}`}
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
                        <div
                          className={`${headerPillCls(theme)} relative group`}
                        >
                          {[
                            {
                              k: "me",
                              label: "My",
                              tooltip: "My Opportunities",
                            },
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
                    <div className="grid grid-cols-1">
                      {tiles.gantt.render()}
                    </div>
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
                <OpportunitiesPage
                  currentUser={currentUser}
                  setRoute={setRoute}
                  isNight={isNight}
                  visibleColumns={visibleColumns}
                  setVisibleColumns={setVisibleColumns}
                  opps={opps}
                  setOpps={setOpps}
                />
              )}

              {route === "admin-page" && (
                <AdminPage setRoute={setRoute} isNight={isNight} />
              )}

              {
                route === "masterdata" && (
                  // (isAdminUser ? (
                  <main className="max-w-6xl mx-auto px-6 py-6 grid gap-6">
                    <UserRegistrationTable currentUser={currentUser} />
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
                  currentUser={currentUser}
                />
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
                onGoAnalytics={() => setRoute("analytics")}
                onGoApprovals={() => setRoute("approvals")}
                onGoAdmin={() => setRoute("admin-page")}
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
    </div>
  );
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
