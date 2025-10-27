import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../App";
import { CardHeader } from "../ui/CardHeader";
import { Button } from "../ui/Button";
import { Search, XIcon } from "lucide-react";
import { CardBody } from "../ui/common/CardBody";
import { STATUS_COLORS } from "../metadata";
import { Label } from "../ui/common/Label";
import { Input } from "../ui/common/Input";

export function SearchModal({ isOpen, onClose, opps, onViewDetails }) {
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