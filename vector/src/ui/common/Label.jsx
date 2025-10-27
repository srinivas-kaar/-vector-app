import { useContext } from "react";
import { ThemeContext } from "../../App";

export function Label({ children }) {
  const theme = useContext(ThemeContext);
  return (
    <span
      className={`text-xs ${
        theme === "sunset" ? "text-white/70" : "text-gray-600"
      }`}
    >
      {children}
    </span>
  );
}