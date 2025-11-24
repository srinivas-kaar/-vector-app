import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../App";
import { formatDateToYYYYMMDD } from "../utils";
import { apiFetchZdate } from "../api";

export function QuantityModal({ open, onClose, start_date, volume, onTotalUpdate }) {
  const modalRef = useRef(null);
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";

  const [loading, setLoading] = useState(false);
  const [zDate, setZdate] = useState(null);
  const [error, setError] = useState("");
  const [periods, setPeriods] = useState([]);
  const [originalPeriods, setOriginalPeriods] = useState([]);

  const missingStart = !start_date;
  const missingVolume = !volume;
  const hasMissingInputs = missingStart || missingVolume;

  useEffect(() => {
    if (!open || hasMissingInputs) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const formatted = formatDateToYYYYMMDD(start_date);
        const data = await apiFetchZdate(formatted);
        setZdate(data);
      } catch (err) {
        setError("Failed to load zDate.");
        setZdate(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, start_date, volume]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!zDate || hasMissingInputs) return;

    const daysPassed = Number(zDate.DAYS_PASSED);
    const startPeriod = Number(zDate.ZIFISCPER.slice(4));
    const startYear = Number(zDate.ZIFISCPER.slice(0, 4));

    const perDayVolume = volume / 364;

    let generated = [];

    const remaining = 28 - daysPassed;
    generated.push({
      year: startYear,
      period: startPeriod,
      days: remaining,
      volume: Number(perDayVolume * remaining).toFixed(2),
    });

    let cy = startYear;
    let cp = startPeriod;

    for (let i = 1; i < 13; i++) {
      cp++;
      if (cp > 13) {
        cp = 1;
        cy++;
      }
      generated.push({
        year: cy,
        period: cp,
        days: 28,
        volume: Number(perDayVolume * 28).toFixed(2),
      });
    }

    generated.push({
      year: generated[generated.length - 1].year,
      period: startPeriod,
      days: daysPassed,
      volume: Number(perDayVolume * daysPassed).toFixed(2),
    });

    setPeriods(generated);
    setOriginalPeriods(JSON.parse(JSON.stringify(generated)));
  }, [zDate]);

  if (!open) return null;

  if (hasMissingInputs) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
        <div
          ref={modalRef}
          className={`rounded-xl shadow-xl p-6 w-[400px] text-center ${
            isNight ? "bg-[#1E1E1E] text-white" : "bg-white text-gray-900"
          }`}
        >
          <h2 className="text-lg font-semibold mb-3">Missing Information</h2>
          {missingStart && <p>Start Date is required.</p>}
          {missingVolume && <p>Volume is required.</p>}
        </div>
      </div>
    );
  }

  if (loading || !zDate || periods.length === 0) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
        <div
          ref={modalRef}
          className={`p-6 rounded-xl shadow-xl ${
            isNight ? "bg-[#1E1E1E] text-white" : "bg-white text-gray-900"
          }`}
        >
          Loading…
        </div>
      </div>
    );
  }

  const hasChanges = JSON.stringify(periods) !== JSON.stringify(originalPeriods);

  const handleUpdateAll = () => {
    const total = periods.reduce((sum, p) => sum + Number(p.volume || 0), 0);
    console.log({total})
    if (onTotalUpdate) onTotalUpdate(total);
    onClose();
  };

  const handleCancelAll = () => {
    setPeriods(JSON.parse(JSON.stringify(originalPeriods)));
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div
        ref={modalRef}
        className={`rounded-xl shadow-xl p-6 w-[95%] max-w-[1100px] animate-slideUp ${
          isNight
            ? "bg-[#1E1E1E] border border-white/20 text-white"
            : "bg-white border border-gray-300 text-gray-900"
        }`}
      >
        <h2 className="text-xl font-semibold text-center mb-6">Period Rolling</h2>

        <div className="grid grid-cols-7 gap-6 auto-rows-auto">
          {periods.map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <label className="text-sm opacity-80">
                {p.year} P{p.period}
              </label>

              <input
                type="number"
                value={p.volume}
                onChange={(e) => {
                  let val = e.target.value;
                
                  if (val === "") {
                    const updated = [...periods];
                    updated[i] = { ...updated[i], volume: "" };
                    setPeriods(updated);
                    return;
                  }
                
                  if (!/^\d*\.?\d*$/.test(val)) return;
                
                  const updated = [...periods];
                  updated[i] = { ...updated[i], volume: val };
                  setPeriods(updated);
                }}
                className={`text-xs px-3 py-2 border rounded-lg text-center w-full ${
                  isNight
                    ? "bg-white/10 border-white/30 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                }`}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={handleCancelAll}
            className="px-5 py-2 rounded-lg bg-gray-400 text-white text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdateAll}
            disabled={!hasChanges}
            className={`px-5 py-2 rounded-lg text-sm text-white transition ${
              hasChanges
                ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            Update All
          </button>
        </div>
      </div>
    </div>
  );
}