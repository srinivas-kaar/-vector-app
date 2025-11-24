import { useContext, useMemo, useState } from "react";
import { ThemeContext } from "../App";
import { TrendingUp } from "lucide-react";
import { FrostedSelect } from "../ui/common/FrostedSelect";
import { Card } from "../ui/common/Card";
import { CardBody } from "../ui/common/CardBody";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { CardHeader } from "../ui/common/CardHeader";

export function AnalyticsPage({ opps = [], currentUser }) {
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

  const { axisStroke, gridStroke, } =
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