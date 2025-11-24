import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { apiDeleteOpps } from "../api";
import { ChevronDown, ChevronsUpDown, ChevronUp, Settings, Trash2, XIcon } from "lucide-react";
import { CardHeader } from "../ui/common/CardHeader";
import { Button } from "../ui/common/Button";
import { CardBody } from "../ui/common/CardBody";
import { Card } from "../ui/common/Card";
import clsx from "clsx";
import { STATUS_COLORS } from "../metadata";

export function OpportunitiesPage({ currentUser, setRoute, isNight, visibleColumns, setVisibleColumns,  opps, setOpps,  }) {
  const [showModal, setShowModal] = useState(false);
  const [ownerScope, setOwnerScope] = useState(() => {
    try {
      return localStorage.getItem("oppty_ownerScope") || "me";
    } catch {
      return "me";
    }
  });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const toggleColumn = (key) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
  return (
    <main className="max-w-6xl mx-auto px-6 py-6 grid gap-6">
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
                        <span className="font-semibold">
                          {selectedIds.size}
                        </span>{" "}
                        selected opportunit
                        {selectedIds.size === 1 ? "y" : "ies"}.
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
                <Trash2 className="h-4 w-4" /> Delete ({selectedIds.size})
              </Button>
              <Button variant="ghost" onClick={() => setRoute("dashboard")}>
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
                      <th onClick={() => handleSort("estimatedVolume")}>
                        <div className="flex items-center gap-1">
                          Estimated Volume {getSortIcon("estimatedVolume")}
                        </div>
                      </th>
                    )}
                    {visibleColumns.likelyStartDate && (
                      <th onClick={() => handleSort("likelyStartDate")}>
                        <div className="flex items-center gap-1">
                          Likely Start Date {getSortIcon("likelyStartDate")}
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
                        <td className="py-2 pr-4">{o.product || "-"}</td>
                      )}
                      {visibleColumns.status && (
                        <td className="py-2 pr-4">
                          <span
                            className="px-2 py-1 rounded-lg text-xs whitespace-nowrap"
                            style={{
                              background: `${
                                STATUS_COLORS[o.status] || "#999"
                              }22`,
                              color: STATUS_COLORS[o.status] || "#999",
                            }}
                          >
                            {o.status || o.salesStage || "-"}
                          </span>
                        </td>
                      )}
                      {visibleColumns.estimatedVolume && (
                        <td className="py-2 pr-4">
                          {o.estimatedVolume || o.estimated_Volume || "-"}
                        </td>
                      )}
                      {visibleColumns.likelyStartDate && (
                        <td className="py-2">
                          {o.likely_Start_Date
                            ? new Date(o.likely_Start_Date).toLocaleDateString()
                            : o.likelyStartDate
                            ? new Date(o.likelyStartDate).toLocaleDateString()
                            : new Date(o.createdAt).toLocaleDateString()}
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
                            .replace(/^./, (str) => str.toUpperCase())}
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
  );
}