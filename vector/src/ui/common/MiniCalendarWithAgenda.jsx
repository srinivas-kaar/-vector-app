import { useContext, useState } from "react";
import { ThemeContext } from "../../App";
import { Button } from "./Button";
import { isSameDay } from "../../utils";

export function MiniCalendarWithAgenda({
  value,
  onChange,
  onDateClick,
  getOppsForDate,
}) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  const today = new Date();
  const [view, setView] = useState(
    new Date(value.getFullYear(), value.getMonth(), 1)
  );
  const start = new Date(view.getFullYear(), view.getMonth(), 1);
  const end = new Date(view.getFullYear(), view.getMonth() + 1, 0);
  const startWeekDay = start.getDay();
  const days = [
    ...Array(startWeekDay).fill(null),
    ...Array(end.getDate())
      .fill(0)
      .map((_, i) => i + 1),
  ];

  return (
    <div className="select-none -mt-2">
      <div className="flex items-center justify-between mb-1">
        <Button
          variant="ghost"
          onClick={() =>
            setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))
          }
        >
          ‹
        </Button>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {view.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </div>
          <Button
            variant="ghost"
            className="px-2 py-1 text-xs"
            onClick={() => {
              const t = new Date();
              setView(new Date(t.getFullYear(), t.getMonth(), 1));
              onChange(t);
            }}
          >
            Today
          </Button>
        </div>
        <Button
          variant="ghost"
          onClick={() =>
            setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))
          }
        >
          ›
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-0">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
          <div key={idx} className="text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 -mt-0.5">
        {days.map((d, i) => {
          const currentDate =
            d !== null
              ? new Date(view.getFullYear(), view.getMonth(), d)
              : null;
          const isSelected = d !== null && isSameDay(value, currentDate);
          const isTodayActive = d !== null && isSameDay(today, currentDate);
          const hasItems =
            currentDate &&
            getOppsForDate &&
            getOppsForDate(currentDate).length > 0;
          return (
            <button
              key={i}
              onClick={(e) => {
                if (d) {
                  onChange(currentDate);
                  onDateClick?.(e, currentDate);
                }
              }}
              className={`aspect-square rounded-lg text-sm grid place-items-center leading-none tabular-nums relative ${
                d === null
                  ? "bg-transparent"
                  : isSelected
                  ? "cal-selected shadow-sm"
                  : isNight
                  ? "hover:bg-white/10"
                  : "hover:bg-gray-100"
              } ${
                isTodayActive && !isSelected
                  ? isNight
                    ? "border border-white/40"
                    : "border border-gray-300"
                  : ""
              }`}
            >
              {d ?? ""}
              {hasItems && (
                <div
                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    isSelected
                      ? "bg-white"
                      : isNight
                      ? "bg-yellow-400"
                      : "bg-blue-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}