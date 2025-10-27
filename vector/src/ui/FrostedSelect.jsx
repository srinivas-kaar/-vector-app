import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../App";
import { ChevronDown } from "lucide-react";
import ReactDOM from "react-dom";

export default function FrostedSelect({
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