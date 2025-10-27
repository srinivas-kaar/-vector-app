import { useContext } from "react";
import { ThemeContext } from "../App";

export const CardHeader = ({ title, subtitle, right, dragHandle }) => {
  const theme = useContext(ThemeContext);
  const border = theme === "sunset" ? "border-white/15" : "border-white/45";
  const textMuted = theme === "sunset" ? "text-white/70" : "text-gray-600";
  return (
    <div className={`flex items-center justify-between p-4 border-b ${border}`}>
      <div className="flex items-center gap-3">
        {dragHandle}
        <div>
          {title && (
            <h3
              className={`text-lg font-semibold leading-tight ${
                theme === "sunset" ? "text-white" : ""
              }`}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`text-xs ${textMuted} mt-1`}>{subtitle}</p>
          )}
        </div>
      </div>
      {right}
    </div>
  );
};