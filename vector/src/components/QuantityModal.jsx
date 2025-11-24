import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../App";
import { formatDateToYYYYMMDD } from "../utils";
import { apiFetchZdate } from "../api";

export function QuantityModal({ open, onClose, start_date, volume }) {
  const modalRef = useRef(null);
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";

  const [loading, setLoading] = useState(false);
  const [zDate, setZdate] = useState(null);
  const [error, setError] = useState("");

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
        setError("");
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
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
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

  if (!open) return null;

  if (open && hasMissingInputs) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
        <div
          ref={modalRef}
          className={`rounded-xl shadow-xl p-6 w-[400px] text-center
          ${isNight ? "bg-[#1E1E1E] text-white" : "bg-white text-gray-900"}`}
        >
          <h2 className="text-lg font-semibold mb-3">Missing Information</h2>

          {missingStart && <p className="mb-1">Start Date is required.</p>}
          {missingVolume && <p className="mb-1">Volume is required.</p>}
        </div>
      </div>
    );
  }

  if (loading || !zDate) {
    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
        <div
          ref={modalRef}
          className={`p-6 rounded-xl shadow-xl
           ${isNight ? "bg-[#1E1E1E] text-white" : "bg-white text-gray-900"}`}
        >
          Loading…
        </div>
      </div>
    );
  }

  const daysPassed = Number(zDate.DAYS_PASSED);
  const startPeriod = Number(zDate.ZIFISCPER.slice(4));
  const startYear = Number(zDate.ZIFISCPER.slice(0, 4));

  const perDayVolume = volume / 364;

  let periods = [];

  const remainingDays = 28 - daysPassed;
  periods.push({
    year: startYear,
    period: startPeriod,
    days: remainingDays,
    volume: Number(perDayVolume * remainingDays).toFixed(2),
  });

  let currentYear = startYear;
  let currentPeriod = startPeriod;

  for (let i = 1; i < 13; i++) {
    currentPeriod++;
    if (currentPeriod > 13) {
      currentPeriod = 1;
      currentYear++;
    }

    periods.push({
      year: currentYear,
      period: currentPeriod,
      days: 28,
      volume: Number(perDayVolume * 28).toFixed(2),
    });
  }

  const finalYear = periods[periods.length - 1].year;
  periods.push({
    year: finalYear,
    period: startPeriod,
    days: daysPassed,
    volume: Number(perDayVolume * daysPassed).toFixed(2),
  });

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div
        ref={modalRef}
        className={`
          rounded-xl shadow-xl p-6 w-[95%] max-w-[1100px] animate-slideUp
          ${
            isNight
              ? "bg-[#1E1E1E] border border-white/20 text-white"
              : "bg-white border border-gray-300 text-gray-900"
          }
        `}
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">Period Rolling</h2>
        </div>

        <div className="grid grid-cols-7 gap-6 auto-rows-auto">
          {periods.map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-full">
              <label className="text-sm opacity-80">
                {p.year} P{p.period}
              </label>

              <input
                type="text"
                disabled
                value={p.volume}
                className={`
                  text-sm px-3 py-2 border rounded-lg text-center w-full
                  break-words whitespace-normal
                  ${
                    isNight
                      ? "bg-white/10 border-white/30 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }
                `}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}