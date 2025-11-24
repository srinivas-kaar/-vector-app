import { useContext } from "react";
import { ThemeContext } from "../../App";

export function Textarea({ ...props }) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";
  return (
    <textarea
      {...props}
      className={`rounded-2xl border px-3 py-2 focus:ring-2 outline-none w-full min-h-[90px] ${
        isNight
          ? "bg-white/10 border-white/25 text-white placeholder-white/50 focus:ring-[#F6E500] disabled:bg-white/5 disabled:text-white/50"
          : "bg-white/60 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#39B4E8] disabled:bg-gray-100 disabled:text-gray-500"
      } ${props.className || ""}`}
    />
  );
}