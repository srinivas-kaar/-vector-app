import { useContext } from "react";
import { ThemeContext } from "../App";
import { STATUS_COLORS } from "../metadata";

export function GanttMonth({ items, monthDate, rows = 1 }) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const monthStart = new Date(y, m, 1);
  const monthEnd = new Date(y, m + 1, 0);
  const daysInMonth = monthEnd.getDate();

  const rowsData = items.map((o) => {
    const start = new Date(
      Math.max(new Date(o.createdAt).getTime(), monthStart.getTime())
    );
    const end = new Date(
      Math.min(new Date(o.closeDate).getTime(), monthEnd.getTime())
    );
    const startDay = start.getDate();
    const span = Math.max(1, end.getDate() - start.getDate() + 1);
    return { id: o.id, title: o.title, status: o.status, startDay, span };
  });

  return (
    <div
      className={
        "border rounded-xl p-2 " +
        (isNight
          ? "bg-white/10 border-white/25 text-white"
          : "bg-white/40 text-gray-800")
      }
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(0,1fr))`,
        }}
      >
        <div></div>
        {Array.from({ length: daysInMonth }).map((_, i) => (
          <div
            key={i}
            className={`text-[10px] text-center ${
              isNight ? "text-white/70" : "text-gray-500"
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
      {rowsData.slice(0, rows === 1 ? 6 : rows === 2 ? 10 : 12).map((r) => (
        <div
          key={r.id}
          className="grid items-center"
          style={{
            gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(0,1fr))`,
          }}
        >
          <div
            className={`truncate text-xs pr-2 ${
              isNight ? "text-white" : "text-gray-700"
            }`}
          >
            {r.title}
          </div>
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const show = day === r.startDay;
            return (
              <div key={i} className="h-5 relative">
                {show && (
                  <div
                    className="absolute inset-y-1 left-0 rounded-full"
                    style={{
                      width: `calc(${r.span} * 100%)`,
                      background: `linear-gradient(90deg, ${
                        STATUS_COLORS[r.status]
                      } 0%, ${STATUS_COLORS[r.status]} 100%)`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
      {rowsData.length === 0 && (
        <div className="text-xs text-gray-400 px-2 py-3">
          No items this month
        </div>
      )}
      <div
        className={`flex flex-wrap gap-3 mt-3 text-xs ${
          isNight ? "text-white/80" : "text-gray-700"
        }`}
      >
        {Object.entries(STATUS_COLORS).map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: v }} />
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}