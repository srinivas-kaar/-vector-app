import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../App";
import { Clock, UserIcon } from "lucide-react";

export function WelcomeCard({
  currentUser,
  avatarUrl,
  setAvatarUrl,
  upcomingOpps = [],
}) {
  const theme = useContext(ThemeContext);
  const [currentReminderIndex, setCurrentReminderIndex] = useState(0);
  const emailName = currentUser.split("@")[0];
  const firstName = emailName.split(".")[0];
  const capitalizedFirstName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  const today = new Date();
  const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

  const urgentOpps = (upcomingOpps || [])
    .filter((opp) => {
      if (!opp || !opp.closeDate) return false;
      const closeDate = new Date(opp.closeDate);
      return (
        closeDate >= today &&
        closeDate <= threeDaysFromNow &&
        opp.status !== "Closed Won" &&
        opp.status !== "Closed Lost"
      );
    })
    .sort((a, b) => new Date(a.closeDate) - new Date(b.closeDate))
    .slice(0, 3);

  useEffect(() => {
    if (urgentOpps.length > 1) {
      const interval = setInterval(() => {
        setCurrentReminderIndex((prev) => (prev + 1) % urgentOpps.length);
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [urgentOpps.length]);

  const getPersonalReminder = (opp) => {
    if (!opp) return "";

    const closeDate = new Date(opp.closeDate);
    const dayDiff = Math.ceil((closeDate - today) / (1000 * 60 * 60 * 24));

    const getDayText = () => {
      if (dayDiff === 0) return "today";
      if (dayDiff === 1) return "tomorrow";
      if (dayDiff === 2)
        return (
          "this " + closeDate.toLocaleDateString("en-US", { weekday: "long" })
        );
      return (
        "this " + closeDate.toLocaleDateString("en-US", { weekday: "long" })
      );
    };

    const greetings = [
      "Hey there",
      "Quick reminder",
      "Don't forget",
      "Heads up",
      "Just so you know",
    ];

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    const getActionMessage = () => {
      const customer = opp.customerName || "your client";
      const amount = opp.amount
        ? ` ($${Number(opp.amount).toLocaleString()} deal)`
        : "";

      switch (opp.status) {
        case "New":
          return `${greeting}, you've got an initial meeting to schedule with ${customer} ${getDayText()}${amount}`;
        case "In Review":
          return `${greeting}, you have a review to complete for ${customer} ${getDayText()}${amount}`;
        case "Negotiation":
          return `${greeting}, you have a negotiation to finalize with ${customer} ${getDayText()}${amount}`;
        default:
          return `${greeting}, you need to follow up with ${customer} ${getDayText()}${amount}`;
      }
    };

    return getActionMessage();
  };

  function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result);
      try {
        localStorage.setItem("oppty_avatar", reader.result);
      } catch {}
    };
    reader.readAsDataURL(file);
  }

  const currentOpp = urgentOpps[currentReminderIndex];

  return (
    <div className="flex items-center gap-4 w-full">
      <label
        className="cursor-pointer"
        title={avatarUrl ? "Change photo" : "Add photo"}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="h-20 w-20 rounded-2xl object-cover"
          />
        ) : (
          <div
            className={
              "h-20 w-20 rounded-2xl avatar-grad grid place-items-center"
            }
          >
            <UserIcon className="h-10 w-10" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPick}
        />
      </label>
      <div className="flex-1">
        <div className={`text-xl ${theme === "sunset" ? "text-white" : ""}`}>
          <span className="font-normal">Welcome back </span>
          <span className="font-bold">{capitalizedFirstName}!</span>
        </div>

        {currentOpp && (
          <div
            className={`text-sm mt-1 ${
              theme === "sunset" ? "text-white/70" : "text-gray-600"
            } transition-all duration-500`}
          >
            <div className="flex items-start gap-2">
              <Clock className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <div>
                <div>{getPersonalReminder(currentOpp)}</div>
                {urgentOpps.length > 1 && (
                  <div
                    className={`text-xs mt-1 ${
                      theme === "sunset" ? "text-white/50" : "text-gray-400"
                    }`}
                  >
                    ({currentReminderIndex + 1} of {urgentOpps.length} urgent
                    tasks)
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!currentOpp && (
          <div
            className={`text-sm mt-1 ${
              theme === "sunset" ? "text-white/70" : "text-gray-600"
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Great job! No urgent actions needed in the next 3 days
            </span>
          </div>
        )}
      </div>
    </div>
  );
}