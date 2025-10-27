import { useContext, useState } from "react";
import { ThemeContext } from "../App";
import { Button } from "./Button";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function MiniCalendar({ value, onChange }) {
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

  function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

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
          const isSelected =
            d !== null &&
            isSameDay(value, new Date(view.getFullYear(), view.getMonth(), d));
          const isTodayActive =
            d !== null &&
            isSameDay(today, new Date(view.getFullYear(), view.getMonth(), d));
          return (
            <Button
              key={i}
              onClick={() =>
                d && onChange(new Date(view.getFullYear(), view.getMonth(), d))
              }
              className={`aspect-square rounded-lg text-sm grid place-items-center leading-none tabular-nums ${
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
            </Button>
          );
        })}
      </div>
    </div>
  );
}