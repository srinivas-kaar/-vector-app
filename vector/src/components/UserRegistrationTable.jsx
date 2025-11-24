import { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../App";
import { apiApprovePendingUser, apiFetchPendingUsers, apiFetchUsers, apiRejectPendingUser, apiUpdateUser } from "../api";
import { Card } from "../ui/common/Card";
import { CardHeader } from "../ui/common/CardHeader";
import { Button } from "../ui/common/Button";
import { CardBody } from "../ui/common/CardBody";
import { Input } from "../ui/common/Input";

export function UserRegistrationTable({ currentUser }) {
  const theme = useContext(ThemeContext);
  const isNight = theme === "sunset";

  const [liveUsers, setLiveUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editEmail, setEditEmail] = useState(null);
  const [draft, setDraft] = useState(null);

  async function refresh() {
    try {
      setLoading(true);
      const [live, pend] = await Promise.all([
        apiFetchUsers(),
        apiFetchPendingUsers(),
      ]);
      setLiveUsers(Array.isArray(live) ? live : []);
      setPending(
        (Array.isArray(pend) ? pend : []).map((u) => ({
          ...u,
          pending: true,
          isRsm: !!u.isRsm,
          isAll: !!u.isAll,
          isAdmin: !!u.isAdmin,
        }))
      );
      setError("");
    } catch {
      setLiveUsers([]);
      setPending([]);
      setError("Failed to load user registrations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const isAdmin = liveUsers.some(
    (r) =>
      (r.email || "").toLowerCase() === (currentUser || "").toLowerCase() &&
      !!r.isAdmin
  );

  const rows = useMemo(() => [...liveUsers, ...pending], [liveUsers, pending]);

  async function approve(row) {
    if (!(row.isRsm || row.isAll || row.isAdmin)) {
      alert("Select at least one role (RSM, All, or Admin) before approving.");
      return;
    }
    try {
      await apiApprovePendingUser(row.email, {
        isRsm: !!row.isRsm,
        isAll: !!row.isAll,
        isAdmin: !!row.isAdmin,
      });
      await refresh();
    } catch {
      alert("Failed to approve user.");
    }
  }

  async function reject(row) {
    try {
      await apiRejectPendingUser(row.email);
      await refresh();
    } catch {
      alert("Failed to reject user.");
    }
  }

  async function saveLiveEdits(email, updated) {
    try {
      await apiUpdateUser(email, {
        firstName: updated.firstName,
        lastName: updated.lastName,
        preferredName: updated.preferredName,
        isRsm: !!updated.isRsm,
        isAll: !!updated.isAll,
        isAdmin: !!updated.isAdmin,
      });
      setEditEmail(null);
      setDraft(null);
      await refresh();
    } catch {
      alert("Failed to save changes.");
    }
  }

  const tableShell =
    (isNight ? "bg-white/8 border-white/15" : "bg-white/40 border-white/50") +
    " bg-clip-padding backdrop-blur-sm";

  return (
    <Card>
      <CardHeader
        title="User Registration"
        subtitle="Users from SAP Datasphere"
        right={<Button onClick={refresh}>Refresh</Button>}
      />
      <CardBody>
        {error && (
          <div
            className={`${
              isNight ? "text-amber-200" : "text-amber-700"
            } text-xs mb-2`}
          >
            {error}
          </div>
        )}
        <div
          className={`overflow-x-auto border rounded-2xl scroll-glass ${tableShell}`}
        >
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr
                className={`${
                  isNight
                    ? "text-white/80 bg-white/10"
                    : "text-gray-700 bg-white/80"
                } backdrop-blur-md`}
              >
                <th className="py-2 px-3 w-32">First</th>
                <th className="py-2 px-3 w-32">Last</th>
                <th className="py-2 px-3 w-40">Preferred</th>
                <th className="py-2 px-3 w-80">Email</th>
                <th className="py-2 px-3 w-20">RSM</th>
                <th className="py-2 px-3 w-20">All</th>
                <th className="py-2 px-3 w-24">Admin</th>
                <th className="py-2 px-3 w-28">Status</th>
                {isAdmin && <th className="py-2 px-3 w-40">Action</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 9 : 8}
                    className={`${
                      isNight ? "text-white/70" : "text-gray-600"
                    } py-6 px-3`}
                  >
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 9 : 8}
                    className={`${
                      isNight ? "text-white/60" : "text-gray-500"
                    } py-6 px-3`}
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const isPending = !!row.pending;
                  const isEditing = !isPending && editEmail === row.email;
                  const view = isEditing ? draft : row;

                  return (
                    <tr
                      key={`${row.email}${isPending ? ":pending" : ""}`}
                      className={`border-t ${
                        isNight ? "border-white/10" : "border-white/60"
                      }`}
                    >
                      <td className="py-2 px-3">
                        {isEditing ? (
                          <Input
                            value={view.firstName || ""}
                            onChange={(e) =>
                              setDraft({ ...view, firstName: e.target.value })
                            }
                          />
                        ) : (
                          row.firstName
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {isEditing ? (
                          <Input
                            value={view.lastName || ""}
                            onChange={(e) =>
                              setDraft({ ...view, lastName: e.target.value })
                            }
                          />
                        ) : (
                          row.lastName
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {isEditing ? (
                          <Input
                            value={view.preferredName || ""}
                            onChange={(e) =>
                              setDraft({
                                ...view,
                                preferredName: e.target.value,
                              })
                            }
                          />
                        ) : (
                          row.preferredName || "-"
                        )}
                      </td>
                      <td className="py-2 px-3">{row.email}</td>
                      <td className="py-2 px-3">
                        {isPending && isAdmin ? (
                          <input
                            type="checkbox"
                            checked={!!row.isRsm}
                            onChange={(e) =>
                              setPending((prev) =>
                                prev.map((u) =>
                                  u.email === row.email
                                    ? { ...u, isRsm: e.target.checked }
                                    : u
                                )
                              )
                            }
                          />
                        ) : isEditing ? (
                          <input
                            type="checkbox"
                            checked={!!view.isRsm}
                            onChange={(e) =>
                              setDraft({ ...view, isRsm: e.target.checked })
                            }
                          />
                        ) : row.isRsm ? (
                          "✓"
                        ) : (
                          <span
                            className={
                              isNight ? "text-white/30" : "text-gray-300"
                            }
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {isPending && isAdmin ? (
                          <input
                            type="checkbox"
                            checked={!!row.isAll}
                            onChange={(e) =>
                              setPending((prev) =>
                                prev.map((u) =>
                                  u.email === row.email
                                    ? { ...u, isAll: e.target.checked }
                                    : u
                                )
                              )
                            }
                          />
                        ) : isEditing ? (
                          <input
                            type="checkbox"
                            checked={!!view.isAll}
                            onChange={(e) =>
                              setDraft({ ...view, isAll: e.target.checked })
                            }
                          />
                        ) : row.isAll ? (
                          "✓"
                        ) : (
                          <span
                            className={
                              isNight ? "text-white/30" : "text-gray-300"
                            }
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {isPending && isAdmin ? (
                          <input
                            type="checkbox"
                            checked={!!row.isAdmin}
                            onChange={(e) =>
                              setPending((prev) =>
                                prev.map((u) =>
                                  u.email === row.email
                                    ? { ...u, isAdmin: e.target.checked }
                                    : u
                                )
                              )
                            }
                          />
                        ) : isEditing ? (
                          <input
                            type="checkbox"
                            checked={!!view.isAdmin}
                            onChange={(e) =>
                              setDraft({ ...view, isAdmin: e.target.checked })
                            }
                          />
                        ) : row.isAdmin ? (
                          "✓"
                        ) : (
                          <span
                            className={
                              isNight ? "text-white/30" : "text-gray-300"
                            }
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {isPending ? (
                          <span
                            className="px-2 py-1 rounded-lg text-xs"
                            style={{
                              background: isNight
                                ? "rgba(255,255,255,0.12)"
                                : "rgba(0,0,0,0.06)",
                            }}
                          >
                            Pending
                          </span>
                        ) : (
                          <span
                            className="px-2 py-1 rounded-lg text-xs"
                            style={{
                              background: isNight
                                ? "rgba(40,167,69,0.25)"
                                : "rgba(34,197,94,0.18)",
                            }}
                          >
                            Active
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-2 px-3">
                          {isPending ? (
                            <div className="flex gap-2">
                              <Button onClick={() => approve(row)}>
                                Approve
                              </Button>
                              <Button onClick={() => reject(row)}>
                                Reject
                              </Button>
                            </div>
                          ) : isEditing ? (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => saveLiveEdits(row.email, draft)}
                              >
                                Save
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setEditEmail(null);
                                  setDraft(null);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setEditEmail(row.email);
                                setDraft({ ...row });
                              }}
                            >
                              Edit
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}