import { useContext } from "react";
import { ThemeContext } from "../App";

const BRAND = {
  yellow: "#F6E500",
  blue: "#39B4E8",
  navy: "#00205C",
  deepBlue: "#001489",
  green: "#78BE20",
  red: "#C8102E",
};

export const Button = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  type = "button",
  disabled = false,
}) => {
  const theme = useContext(ThemeContext);
  const primaryGradient =
    theme === "sunset"
      ? `bg-gradient-to-r from-[${BRAND.red}] to-[${BRAND.deepBlue}] text-white`
      : `bg-gradient-to-r from-[rgba(246,229,0,0.6)] to-[rgba(57,180,232,0.6)] text-gray-900`;
  const ghostBg =
    theme === "sunset"
      ? "bg-transparent hover:bg-white/15 text-white"
      : "bg-transparent hover:bg-white/50";
  const neutralBg =
    theme === "sunset"
      ? "bg-white/10 border border-white/20 hover:bg-white/15 text-white"
      : "bg-white/60 hover:bg-white";
  const dangerBg =
    theme === "sunset"
      ? "bg-red-600/80 text-white hover:bg-red-600 border border-red-500/20"
      : "bg-red-600 text-white hover:bg-red-700";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all active:scale-[.99] ${
        variant === "primary"
          ? primaryGradient
          : variant === "ghost"
          ? ghostBg
          : variant === "danger"
          ? dangerBg
          : neutralBg
      } ${disabled ? "opacity-50 pointer-events-none" : ""} ${className}`}
    >
      {children}
    </button>
  );
};