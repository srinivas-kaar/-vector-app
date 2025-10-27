import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../App";
import { CalendarIcon } from "lucide-react";
import MiniCalendar from "./MiniCalendar";

export default function FrostedDate({
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
