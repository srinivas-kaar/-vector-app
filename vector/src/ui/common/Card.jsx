import { useContext } from "react";
import { ThemeContext } from "../../App";
import clsx from "clsx";

export const Card = ({ children, className = "", noClip = false, onClick }) => {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  const frostBg = isNight ? "bg-white/10" : "bg-white/20";
  const borderClr = isNight ? "border-white/20" : "border-white/40";
  const shadow = "shadow-[0_6px_24px_rgba(0,0,0,0.08)]";
  const overflowCls = noClip ? "overflow-visible" : "overflow-hidden";

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={clsx(
        "relative rounded-3xl border bg-clip-padding backdrop-blur-xl backdrop-saturate-150",
        frostBg,
        borderClr,
        shadow,
        overflowCls,
        className,
        onClick && "cursor-pointer select-none"
      )}
    >
      {children}
    </div>
  );
};