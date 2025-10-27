import { Database, LayoutDashboard, LogOut, TableIcon, TrendingUp, UserIcon } from "lucide-react";
import { useContext, useState } from "react";
import { ThemeContext } from "../App";

export function FloatingNav({
  goOpps,
  onSignOut,
  onGoDashboard,
  onSearch,
  onGoMasterData,
  onGoAnalytics,
  isAdminUser,
  onGoApprovals,
  onGoVolumeAllocation,
}) {
  const theme = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const isNight = theme === "sunset";
  const glass = isNight
    ? "bg-white/12 border-white/20"
    : "bg-white/20 border-white/40";
  const btnBase = `h-14 w-14 rounded-full border ${glass} bg-clip-padding backdrop-blur-xl backdrop-saturate-150 shadow-[0_10px_30px_rgba(0,0,0,0.15)] grid place-items-center`;

  const actions = [
    {
      key: "dashboard",
      icon: <LayoutDashboard className="h-6 w-6" />,
      onClick: () => onGoDashboard?.(),
      label: "Dashboard",
    },
    {
      key: "accounts",
      icon: <UserIcon className="h-6 w-6" />,
      onClick: () => alert("Accounts - Coming Soon"),
      label: "Accounts",
    },
    {
      key: "opps",
      icon: <TableIcon className="h-6 w-6" />,
      onClick: () => goOpps?.(),
      label: "My Opportunities",
    },
    {
      key: "analytics",
      icon: <TrendingUp className="h-6 w-6" />,
      onClick: () => onGoAnalytics?.(),
      label: "Analytics",
    },
    // { key: "search", icon: <Search className="h-6 w-6" />, onClick: () => onSearch?.(), label: "Search" },
    {
      key: "logout",
      icon: <LogOut className="h-6 w-6" />,
      onClick: () => onSignOut?.(),
      label: "Sign Out",
    },
    ``,
  ];

  if (onGoMasterData) {
    actions.splice(4, 0, {
      key: "masterdata",
      icon: <Database className="h-6 w-6" />,
      onClick: () => onGoMasterData?.(),
      label: "Master Data",
    });
  }
  if (onGoApprovals) {
    actions.splice(4, 0, {
      key: "approvals",
      icon: <Database className="h-6 w-6" />,
      onClick: () => onGoApprovals?.(),
      label: "Approvals",
    });
  }
  if (onGoVolumeAllocation) {
    actions.splice(4, 0, {
      key: "volumeAllocation",
      icon: <Database className="h-6 w-6" />,
      onClick: () => onGoVolumeAllocation?.(),
      label: "Volume Allocation",
    });
  }

  const maxHeight = actions.length * 70 + 70;

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{
        height: open ? `${maxHeight}px` : "56px",
        width: "56px",
        transition: "height 0.3s ease",
      }}
    >
      {actions.map((a, index) => {
        const bottomOffset = (index + 1) * 70;
        return (
          <div
            key={a.key}
            className="absolute bottom-0 right-0"
            style={{
              transform: open
                ? `translateY(-${bottomOffset}px)`
                : "translate(0, 0)",
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
              transition: `all ${200 + index * 30}ms cubic-bezier(.2,.8,.2,1)`,
              transitionDelay: open ? `${index * 20}ms` : "0ms",
            }}
          >
            <div className="relative group">
              <button
                className={`${btnBase} hover:scale-110 transition-transform`}
                onClick={a.onClick}
                aria-label={a.label}
                title={a.label}
              >
                {a.icon}
              </button>
              <span
                className={`pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl text-xs whitespace-nowrap shadow-lg opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ${
                  isNight
                    ? "bg-white/20 border border-white/25 text-white"
                    : "bg-white/70 border border-white/50 text-gray-900"
                } backdrop-blur-2xl`}
              >
                {a.label}
              </span>
            </div>
          </div>
        );
      })}
      <button
        className={`${btnBase} ${
          open
            ? isNight
              ? "ring-2 ring-[#F6E500]"
              : "ring-2 ring-[#00205C]"
            : ""
        } hover:scale-110 transition-transform absolute bottom-0 right-0`}
        aria-label="Quick navigation"
        title="Quick Navigation"
      >
        <LayoutDashboard className="h-6 w-6" />
      </button>
    </div>
  );
}