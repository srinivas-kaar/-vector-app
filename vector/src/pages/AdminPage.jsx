import clsx from "clsx";
import { Card } from "../ui/common/Card";
import { CardBody } from "../ui/common/CardBody";
import { ClipboardCheck, UserPlus } from "lucide-react";

export function AdminPage({ setRoute, isNight }) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-6 grid gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* User Registration Card */}
          <Card
            className={clsx(
              "cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg",
              isNight
                ? "bg-slate-800/80 border border-white/15 hover:bg-slate-700"
                : "bg-white/60 border border-white/50 hover:bg-white"
            )}
            onClick={() => {
              setRoute("masterdata");
            }}
          >
            <CardBody className="flex flex-col items-center justify-center py-10">
              <div
                className={clsx(
                  "p-4 rounded-full mb-4 flex items-center justify-center",
                  isNight ? "bg-[#F6E500]/20" : "bg-[#00205C]/10"
                )}
              >
                <UserPlus
                  size={36}
                  className={isNight ? "text-[#F6E500]" : "text-[#00205C]"}
                />
              </div>
              <h2
                className={clsx(
                  "text-lg font-semibold",
                  isNight ? "text-white" : "text-gray-800"
                )}
              >
                User Registration
              </h2>
              <p
                className={clsx(
                  "text-sm mt-2 text-center max-w-xs",
                  isNight ? "text-white/60" : "text-gray-600"
                )}
              >
                Manage and onboard new users with ease.
              </p>
            </CardBody>
          </Card>
  
          {/* Approvals Card */}
          <Card
            className={clsx(
              "cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg",
              isNight
                ? "bg-slate-800/80 border border-white/15 hover:bg-slate-700"
                : "bg-white/60 border border-white/50 hover:bg-white"
            )}
            onClick={() => setRoute("approvals")}
          >
            <CardBody className="flex flex-col items-center justify-center py-10">
              <div
                className={clsx(
                  "p-4 rounded-full mb-4 flex items-center justify-center",
                  isNight ? "bg-[#F6E500]/20" : "bg-[#00205C]/10"
                )}
              >
                <ClipboardCheck
                  size={36}
                  className={isNight ? "text-[#F6E500]" : "text-[#00205C]"}
                />
              </div>
              <h2
                className={clsx(
                  "text-lg font-semibold",
                  isNight ? "text-white" : "text-gray-800"
                )}
              >
                Approvals
              </h2>
              <p
                className={clsx(
                  "text-sm mt-2 text-center max-w-xs",
                  isNight ? "text-white/60" : "text-gray-600"
                )}
              >
                Review and approve user requests and submissions.
              </p>
            </CardBody>
          </Card>
        </div>
      </main>
    );
  }