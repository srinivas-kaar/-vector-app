import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../../App";
import { DayPicker } from "react-day-picker";

export function FrostedDate({
  value,
  onChange,
  placeholder = "Select date",
  label,
  required,
  disabled = false,
  readOnly = false,
}) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toDate = (val) => {
    if (!val) return undefined;
    if (val instanceof Date) return val;

    const parsed = new Date(val + "T00:00:00");
    return isNaN(parsed) ? undefined : parsed;
  };

  const selectedDate = toDate(value);

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleInputClick = () => {
    if (disabled || readOnly) return;
    setOpen((prev) => !prev);
  };

  return (
    <div className="relative inline-block w-full" ref={ref}>
      {label && (
        <label className="block mb-1 font-medium">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      <input
        readOnly
        disabled={disabled}
        value={selectedDate ? formatDate(selectedDate) : ""}
        onClick={handleInputClick}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 border rounded-lg bg-white cursor-pointer 
          placeholder:font-semibold
          ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}
          ${readOnly ? "cursor-default" : ""}
          ${
            isNight
              ? "bg-white/10 border-white/25 text-white placeholder-white/50 focus:ring-[#F6E500] disabled:bg-white/5 disabled:text-white/50"
              : "bg-white/60 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#39B4E8] disabled:bg-gray-100 disabled:text-gray-500"
          }
        `}
      />

      {/* Popover */}
      {open && !disabled && !readOnly && (
        <div
          className={`
            absolute left-0 mt-2 z-50 border rounded-xl shadow-lg
            ${
              isNight
                ? "bg-gray-800 border-white/25 text-white"
                : "bg-white border-gray-300 text-black"
            }
          `}
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) return;

              const y = date.getFullYear();
              const m = String(date.getMonth() + 1).padStart(2, "0");
              const d = String(date.getDate()).padStart(2, "0");

              onChange(`${y}-${m}-${d}`);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}