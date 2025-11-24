import { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../App";
import { apiFetchOverridePrice, apiUpdateOverridePrice } from "../api";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { Card } from "../ui/common/Card";
import { CardHeader } from "../ui/common/CardHeader";
import { Button } from "../ui/common/Button";
import { CardBody } from "../ui/common/CardBody";

export function OverridePriceApprovalRequestsTable({ currentUser }) {
    const theme = useContext(ThemeContext);
    const isNight = theme === "sunset";
  
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [approvalNote, setApprovalNote] = useState("");
  
    // Fetch only Pending approvals
    async function refresh() {
      try {
        setLoading(true);
        const data = await apiFetchOverridePrice();
        const pendingOnly = Array.isArray(data)
          ? data.filter((r) => r.STATUS === "Pending")
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
  
    async function handleSubmit(row, action, comment) {
      try {
        const status = action === "approve" ? "Approved" : "Rejected";
  
        await apiUpdateOverridePrice({
          opportunity_id: row.OPPORTUNITY_ID,
          dateofapproval: new Date().toISOString().split("T")[0],
          approvalnote: comment,
          status,
        });
  
        // Update local state
        setApprovals((prev) =>
          prev.filter((r) => r.OPPORTUNITY_ID !== row.OPPORTUNITY_ID)
        );
        closeModal();
      } catch (error) {
        console.error(error);
        alert("Failed to update request.");
      }
    }
  
    const closeModal = () => {
      setModalOpen(false);
      setSelectedRow(null);
      setActionType(null);
      setApprovalNote("");
    };
  
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
      <>
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
                      { key: "PRODUCT_CATEGORY", label: "Product Category" },
                      { key: "CUSTOMER_NAME", label: "Customer Name" },
                      { key: "DATE_OF_REQUEST", label: "Date Raised" },
                      { key: "CURRENT_PRICE", label: "Current Price" },
                      { key: "OVERRIDE_PRICE", label: "Override Price" },
                      { key: "STATUS", label: "Status" },
                      {
                        key: "BUSINESS_JUSTIFICATION",
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
                      <tr
                        key={row.OPPORTUNITY_ID}
                        className={`border-t ${
                          isNight ? "border-white/10" : "border-white/60"
                        }`}
                      >
                        <td className="py-2 px-3">{row.PRODUCT_CATEGORY}</td>
                        <td className="py-2 px-3">{row.CUSTOMER_NAME}</td>
                        <td className="py-2 px-3">
                          {row.DATE_OF_REQUEST?.split(" ")[0]}
                        </td>
                        <td className="py-2 px-3">{row.CURRENT_PRICE}</td>
                        <td className="py-2 px-3">{row.OVERRIDE_PRICE}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs ${
                              isNight
                                ? "bg-yellow-700/30 text-yellow-200"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {row.STATUS}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => {
                              setSelectedRow(row);
                              setModalOpen(true);
                            }}
                            className={`underline text-blue-600 hover:text-blue-800 text-sm`}
                          >
                            View Business Justification
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
  
        {/* Modal */}
        {modalOpen && selectedRow && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div
              className={`rounded-2xl w-full max-w-lg shadow-lg p-6 ${
                isNight ? "bg-slate-800 text-white" : "bg-white text-gray-800"
              }`}
            >
              <h2 className="text-lg font-semibold mb-4">
                Business Justification
              </h2>
              <textarea
                readOnly
                value={
                  selectedRow.BUSINESS_JUSTIFICATION ||
                  "No justification provided."
                }
                className={`w-full p-2 rounded-lg border mb-4 resize-none ${
                  isNight
                    ? "bg-black/20 border-white/20 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-700"
                }`}
                rows={4}
              />
              {!actionType ? (
                <div className="flex justify-end gap-3">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setActionType("approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setActionType("reject")}
                  >
                    Reject
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Approval Note</h3>
                    <textarea
                      rows={3}
                      value={approvalNote}
                      onChange={(e) => setApprovalNote(e.target.value)}
                      placeholder="Enter your approval note..."
                      className={`w-full p-2 rounded-lg border ${
                        isNight
                          ? "bg-black/20 border-white/20 text-white"
                          : "bg-gray-50 border-gray-300 text-gray-700"
                      }`}
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!approvalNote.trim()}
                      onClick={() =>
                        handleSubmit(selectedRow, actionType, approvalNote)
                      }
                    >
                      Submit
                    </Button>
                    <Button variant="ghost" onClick={closeModal}>
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </>
    );
  }