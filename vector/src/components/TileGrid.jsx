import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../App";
import { clamp } from "date-fns";
import { ALLOWED_COLS, ALLOWED_ROWS, BRAND, GAP_PX } from "../metadata";
import { GripVertical } from "lucide-react";

export function TileGrid({
    order,
    setOrder,
    tiles,
    sizeMap,
    setSizeMap,
    staticMode = false,
  }) {
    const theme = useContext(ThemeContext);
    const [dragId, setDragId] = useState(null);
    const [overId, setOverId] = useState(null);
    const [resizing, setResizing] = useState(null);
    const gridRef = useRef(null);
  
    function onDrop(targetId) {
      if (!dragId || dragId === targetId) return;
      const arr = [...order];
      const from = arr.indexOf(dragId);
      const to = arr.indexOf(targetId);
      if (from === -1 || to === -1) return;
      arr.splice(to, 0, arr.splice(from, 1)[0]);
      setOrder(arr);
      try {
        localStorage.setItem("oppty_layout_v2", JSON.stringify(arr));
      } catch {}
      setDragId(null);
      setOverId(null);
    }
    function startResize(e, id) {
      e.preventDefault();
      const s = sizeMap[id] || { col: tiles[id]?.colLg || 6, rows: 1 };
      setResizing({
        id,
        startX: e.clientX,
        startY: e.clientY,
        startCol: s.col,
        startRows: s.rows,
      });
    }
    function onPointerMove(e) {
      if (!resizing) return;
      const rect = gridRef.current?.getBoundingClientRect();
      const gridWidth = rect ? rect.width : window.innerWidth;
      const colWidth = (gridWidth - GAP_PX * 11) / 12;
      const dx = e.clientX - resizing.startX;
      const dy = e.clientY - resizing.startY;
      const approxColsDelta = Math.round(dx / colWidth);
      const currentIndex = ALLOWED_COLS.indexOf(resizing.startCol);
      let newIndex = clamp(
        currentIndex + approxColsDelta,
        0,
        ALLOWED_COLS.length - 1
      );
      const rowHeight = 180;
      const approxRowsDelta = Math.round(dy / rowHeight);
      const rIndex = ALLOWED_ROWS.indexOf(resizing.startRows);
      let newRIndex = clamp(rIndex + approxRowsDelta, 0, ALLOWED_ROWS.length - 1);
      const next = {
        ...sizeMap,
        [resizing.id]: {
          col: ALLOWED_COLS[newIndex],
          rows: ALLOWED_ROWS[newRIndex],
        },
      };
      setSizeMap(next);
    }
    function endResize() {
      if (!resizing) return;
      try {
        localStorage.setItem("oppty_sizes_v1", JSON.stringify(sizeMap));
      } catch {}
      setResizing(null);
    }
  
    useEffect(() => {
      const onMove = (e) => onPointerMove(e);
      const onUp = () => endResize();
      if (resizing) {
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp, { once: true });
      }
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
    }, [resizing, sizeMap]); // eslint-disable-line react-hooks/exhaustive-deps
  
    const ringColor = theme === "sunset" ? BRAND.yellow : BRAND.blue;
  
    return (
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
        style={{ gridAutoRows: "180px" }}
      >
        {order.map((id) => {
          const t = tiles[id];
          if (!t) return null;
          const size = sizeMap[id] || { col: t.colLg, rows: t.rows || 1 };
          const col = size.col;
          let rows = size.rows;
          if (id === "gantt" && rows !== 2) rows = 2;
          const colClass =
            col === 12
              ? "md:col-span-12"
              : col === 8
              ? "md:col-span-8"
              : col === 6
              ? "md:col-span-6"
              : col === 4
              ? "md:col-span-4"
              : col === 3
              ? "md:col-span-3"
              : "md:col-span-12";
          return (
            <div
              key={id}
              className={`col-span-1 ${colClass} relative group`}
              style={{ gridRow: `span ${rows}` }}
              draggable={!staticMode}
              onDragStart={(e) => {
                setDragId(id);
                e.dataTransfer.setData("text/plain", id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (overId !== id) setOverId(id);
              }}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(id);
              }}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
            >
              <div
                className={`h-full transition ${
                  overId === id && dragId !== id ? "ring-2 rounded-3xl" : ""
                }`}
                style={{
                  boxShadow:
                    overId === id && dragId !== id
                      ? `0 0 0 2px ${ringColor}`
                      : undefined,
                }}
              >
                {t.render(
                  staticMode ? null : (
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  )
                )}
              </div>
              {!staticMode && (
                <div
                  onPointerDown={(e) => startResize(e, id)}
                  className="absolute right-2 bottom-2 h-4 w-4 rounded-md bg-white/70 border border-white/50 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition grid place-items-center text-[10px]"
                  title="Resize"
                >
                  ↘︎
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }