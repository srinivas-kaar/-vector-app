import { ChevronDown } from "lucide-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { ThemeContext } from "../../App";

export function FrostedSelectMaterialID({
  label,
  value,
  onChange,
  options,
  placeholder = "Select option",
  disabled = false,
  required = false,
}) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);

  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 260,
  });
  const [shouldOpenUpward, setShouldOpenUpward] = useState(false);

  const ref = useRef(null);
  const dropdownRef = useRef(null);

  const normalizedOptions = Array.isArray(options)
    ? options
    : Array.isArray(options?.materials)
    ? options.materials
    : [];

  const getLabel = (opt) => {
    if (!opt) return "";
    if (typeof opt === "string") return opt;
    return opt.MATERIAL_ID || opt.label || "";
  };

  const filtered = normalizedOptions.filter((opt) =>
    getLabel(opt).toLowerCase().includes(search.toLowerCase())
  );

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

  useEffect(() => {
    const handler = (e) => {
      if (
        open &&
        ref.current &&
        !ref.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleKeyDown = (e) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlightIndex]) selectOption(filtered[highlightIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

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
    const listener = () => computePosition();
    window.addEventListener("resize", listener);
    window.addEventListener("scroll", listener, true);
    return () => {
      window.removeEventListener("resize", listener);
      window.removeEventListener("scroll", listener, true);
    };
  }, [open, computePosition]);

  const selectOption = (opt) => {
    onChange(getLabel(opt));
    setOpen(false);
    setSearch("");
    setHighlightIndex(0);
  };

  return (
    <div className="flex flex-col gap-1 relative w-full">
      {label && (
        <label className="font-medium text-sm">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        ref={ref}
        className={wrapperCls}
        onClick={() => !disabled && setOpen((p) => !p)}
      >
        <span className="truncate">{value ? value : placeholder}</span>
        <ChevronDown
          className={`ml-2 h-4 w-4 opacity-60 transition-transform ${
            open && shouldOpenUpward ? "rotate-180" : ""
          }`}
        />
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
                : "rgba(0,0,0,0.03)",
            }}
            onClick={() => setOpen(false)}
          />

          {ReactDOM.createPortal(
            <div
              ref={dropdownRef}
              onKeyDown={handleKeyDown}
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
              <div className="sticky top-0 bg-white/90 backdrop-blur-md">
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 border-b border-gray-300 bg-transparent outline-none"
                />
              </div>

              {filtered.length === 0 && (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No options
                </div>
              )}

              {filtered.map((opt, idx) => (
                <div
                  key={idx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectOption(opt);
                  }}
                  className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                    idx === highlightIndex
                      ? isNight
                        ? "bg-white/15"
                        : "bg-blue-600 text-white"
                      : isNight
                      ? "hover:bg-white/10"
                      : "hover:bg-white/60"
                  }`}
                >
                  {getLabel(opt)}
                </div>
              ))}
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}