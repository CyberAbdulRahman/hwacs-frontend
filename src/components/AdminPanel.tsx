import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Users,
  Shield,
  Activity,
  Brain,
  FileText,
  FileType,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../utils/api";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  status: "Active" | "Inactive" | string;
  account_status?: "active" | "suspended" | "blocked";
  suspended_until?: string | null;
  honeypots: number;
  website?: string;
  created_at?: string;
};

type AdminHoneypot = {
  _id: string;
  name: string;
  websiteUrl: string;
  ownerEmail: string;
  status: "active" | "inactive" | string;
  attacks_today: number;
  trapEnabled?: boolean;
  monitorMode?: string;
  last_activity?: string | null;
};

type AdminAttack = {
  _id: string;
  attack_type?: string;
  subtype?: string;
  severity?: string;
  created_at?: string;
  honeypot?: string;
  url?: string;
  method?: string;
  payload?: string;
};

export function AdminPanel() {
  const [showFormatDialog, setShowFormatDialog] = useState(false);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [honeypots, setHoneypots] = useState<AdminHoneypot[]>([]);
  const [attacks, setAttacks] = useState<AdminAttack[]>([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingHoneypots, setLoadingHoneypots] = useState(true);
  const [loadingAttacks, setLoadingAttacks] = useState(true);

  const [actionMessages, setActionMessages] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const setUserActionMessage = (userId: string, message: string) => {
    setActionMessages((prev) => ({
      ...prev,
      [userId]: message,
    }));

    setTimeout(() => {
      setActionMessages((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    }, 3500);
  };

  const setUserActionLoading = (userId: string, loading: boolean) => {
    setActionLoading((prev) => ({
      ...prev,
      [userId]: loading,
    }));
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);

      const res = await api.get("/api/admin/users");

      const normalizedUsers: AdminUser[] = Array.isArray(res.data?.users)
        ? res.data.users.map((user: any) => ({
            _id: user._id,
            name: user.name || "Unnamed User",
            email: user.email || "No email",
            role: user.role || "user",
            status: user.status || "Active",
            account_status: user.account_status || "active",
            suspended_until: user.suspended_until || null,
            honeypots: Number(user.honeypots || 0),
            website: user.website || "No website registered",
            created_at: user.created_at,
          }))
        : [];

      setUsers(normalizedUsers);
    } catch (error) {
      console.error("Failed to load admin users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };




  const suspendUser = async (userId: string) => {
    try {
      setUserActionLoading(userId, true);

      await api.patch(`/api/admin/users/${userId}/suspend`);

      toast.success("User suspended for 10 minutes.");
      setUserActionMessage(userId, "Suspended for 10 minutes.");

      await loadUsers();
    } catch (error: any) {
      console.error("Suspend user failed:", error);
      toast.error(error?.response?.data?.error || "Failed to suspend user.");
      setUserActionMessage(userId, "Suspend failed.");
    } finally {
      setUserActionLoading(userId, false);
    }
  };

const unsuspendUser = async (userId: string) => {
  try {
    setUserActionLoading(userId, true);

    await api.patch(`/api/admin/users/${userId}/unsuspend`);

    toast.success("User unsuspended successfully.");
    setUserActionMessage(userId, "User has been unsuspended.");

    await loadUsers();
  } catch (error: any) {
    console.error("Unsuspend user failed:", error);
    toast.error(error?.response?.data?.error || "Failed to unsuspend user.");
    setUserActionMessage(userId, "Unsuspend failed.");
  } finally {
    setUserActionLoading(userId, false);
  }
};


  const blockUser = async (userId: string) => {
    try {
      setUserActionLoading(userId, true);

      await api.patch(`/api/admin/users/${userId}/block`);

      toast.success("User blocked successfully.");
      setUserActionMessage(userId, "User has been blocked.");

      await loadUsers();
    } catch (error: any) {
      console.error("Block user failed:", error);
      toast.error(error?.response?.data?.error || "Failed to block user.");
      setUserActionMessage(userId, "Block failed.");
    } finally {
      setUserActionLoading(userId, false);
    }
  };

  const unblockUser = async (userId: string) => {
    try {
      setUserActionLoading(userId, true);

      await api.patch(`/api/admin/users/${userId}/unblock`);

      toast.success("User unblocked successfully.");
      setUserActionMessage(userId, "User has been unblocked.");

      await loadUsers();
    } catch (error: any) {
      console.error("Unblock user failed:", error);
      toast.error(error?.response?.data?.error || "Failed to unblock user.");
      setUserActionMessage(userId, "Unblock failed.");
    } finally {
      setUserActionLoading(userId, false);
    }
  };

  const loadHoneypots = async () => {
    try {
      setLoadingHoneypots(true);

      const res = await api.get("/api/sites/all");
      const list = Array.isArray(res.data?.sites) ? res.data.sites : [];

      const normalized: AdminHoneypot[] = list.map((site: any) => ({
        _id: site._id || "",
        name: site.name || site.site_name || "Unnamed Honeypot",
        websiteUrl: site.websiteUrl || site.base_url || "",
        ownerEmail: site.ownerEmail || site.user_email || "Unknown",
        status: site.status || (site.is_active === false ? "inactive" : "active"),
        attacks_today: Number(site.attacks_today || 0),
        trapEnabled: site.trapEnabled ?? site.trap_enabled ?? true,
        monitorMode: site.monitorMode || site.monitor_mode || "all_pages",
        last_activity: site.last_activity ?? null,
      }));

      const unique = Array.from(
        new Map(
          normalized.map((site) => [
            `${site.name.toLowerCase()}|${site.websiteUrl.toLowerCase()}|${site.ownerEmail.toLowerCase()}`,
            site,
          ])
        ).values()
      );

      setHoneypots(unique);
    } catch (error) {
      console.error("Failed to load honeypots:", error);
      toast.error("Failed to load honeypots");
    } finally {
      setLoadingHoneypots(false);
    }
  };

const deleteHoneypot = async (siteId: string, siteName: string) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete "${siteName}"?\n\nThis will remove the honeypot and its related logs/notifications.`
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/api/admin/sites/${siteId}`);

    toast.success("Honeypot deleted successfully.");
    await loadHoneypots();
    await loadUsers();
    await loadAttacks();
  } catch (error: any) {
    console.error("Delete honeypot failed:", error);
    toast.error(error?.response?.data?.error || "Failed to delete honeypot.");
  }
};


  const loadAttacks = async () => {
    try {
      setLoadingAttacks(true);

      const res = await api.get("/api/attacks?limit=10");

      setAttacks(Array.isArray(res.data?.attacks) ? res.data.attacks : []);
    } catch (error) {
      console.error("Failed to load attacks:", error);
      toast.error("Failed to load recent attacks");
    } finally {
      setLoadingAttacks(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadHoneypots();
    loadAttacks();
  }, []);

  const activeHoneypots = useMemo(() => {
  return honeypots.filter((hp) => hp.trapEnabled !== false).length;
}, [honeypots]);

  const handleGenerateAIReport = () => {
    setShowFormatDialog(true);
  };

  const formatDate = (value?: string) => {
    if (!value) return "—";

    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const getSeverityVariant = (severity?: string) => {
    const s = (severity || "").toLowerCase();

    if (s === "critical") return "destructive";
    if (s === "high") return "default";

    return "secondary";
  };

  const generateReportContent = () => {
    const totalUsers = users.length;
    const totalHoneypots = honeypots.length;
    const totalAttacks = attacks.length;

    const totalAttacksToday = honeypots.reduce(
      (sum, hp) => sum + Number(hp.attacks_today || 0),
      0
    );

    const topHoneypots = [...honeypots]
      .sort((a, b) => Number(b.attacks_today || 0) - Number(a.attacks_today || 0))
      .slice(0, 5);

    const attackSummary = attacks
      .slice(0, 10)
      .map(
        (attack, index) =>
          `${index + 1}. ${attack.attack_type || "Unknown"} | ${
            attack.severity || "N/A"
          } | ${attack.honeypot || "Unknown Honeypot"} | ${formatDate(
            attack.created_at
          )}`
      )
      .join("\n");

    return `
HWACS EXPLAINABLE AI SYSTEM REPORT
=================================

Report Generated: ${new Date().toLocaleString()}
Report Type: System-wide Admin Security Summary

SYSTEM OVERVIEW
---------------
Total Registered Users: ${totalUsers}
Total Registered Honeypots: ${totalHoneypots}
Active Honeypots: ${activeHoneypots}
Recent Attacks Loaded: ${totalAttacks}
Total Attacks Today: ${totalAttacksToday}

HONEYPOT SUMMARY
----------------
${
  topHoneypots.length
    ? topHoneypots
        .map(
          (hp, index) =>
            `${index + 1}. ${hp.name} | ${hp.websiteUrl} | Owner: ${
              hp.ownerEmail
            } | Attacks Today: ${hp.attacks_today}`
        )
        .join("\n")
    : "No honeypots available."
}

RECENT SYSTEM ATTACKS
---------------------
${attackSummary || "No recent attacks available."}

ADMIN OBSERVATION
-----------------
The system is collecting attack activity from registered honeypots and allows admins
to monitor users, honeypots, attacks, and security reports from a central dashboard.

RECOMMENDED ACTIONS
-------------------
1. Review high severity attacks first.
2. Keep unused honeypots disabled.
3. Use trap control to stop monitoring inactive websites.
4. Review XAI/PDF reports for suspicious attack payloads.
5. Maintain clean ownership and duplicate-free honeypot records.

END OF REPORT
=============
`;
  };

  const downloadReport = (format: "doc" | "txt") => {
    const reportContent = generateReportContent();

    if (format === "txt") {
      const blob = new Blob([reportContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `HWACS_AI_Report_${new Date().toISOString().split("T")[0]}.txt`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

      toast.success("AI Report downloaded as .txt file!");
    }

    if (format === "doc") {
      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>HWACS AI Report</title>
          </head>
          <body>
            <pre>${reportContent}</pre>
          </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `HWACS_AI_Report_${new Date().toISOString().split("T")[0]}.doc`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

      toast.success("AI Report downloaded as .doc file!");
    }

    setShowFormatDialog(false);
  };

  return (
    <>
      <div className="space-y-4">
        <Button
          onClick={handleGenerateAIReport}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:from-blue-700 hover:to-cyan-700"
          size="lg"
        >
          <Brain className="w-5 h-5 mr-2" />
          Generate Explainable AI Report
        </Button>

        <Card className="p-4 bg-white/90 backdrop-blur shadow-md border-2 border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-primary">Admin Overview</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{users.length}</p>
              <p className="text-xs text-muted-foreground">Users</p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{honeypots.length}</p>
              <p className="text-xs text-muted-foreground">Honeypots</p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{attacks.length}</p>
              <p className="text-xs text-muted-foreground">Recent Attacks</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/90 backdrop-blur shadow-md border-2 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-primary">All Registered Users</h3>
            </div>

            <Badge variant="outline" className="text-xs">
              {users.length} Total
            </Badge>
          </div>

          <ScrollArea className="h-80 pr-2">
            {loadingUsers ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No users found.
              </div>
            ) : (
              <div className="space-y-3 pr-2">
                {users.map((user) => {
                  const isBlocked = user.account_status === "blocked";
                  const isSuspended = user.account_status === "suspended";
                  const isLoading = Boolean(actionLoading[user._id]);
                  const actionMsg = actionMessages[user._id];

                  return (
                    <div
                      key={user._id}
                      className="flex min-h-[125px] overflow-hidden rounded-xl border border-primary/20 bg-white shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                    >
                      {/* LEFT SIDE */}
                      <div className="flex flex-1 flex-col justify-center gap-1 px-4 py-4">
                        <h4 className="truncate text-sm font-bold text-foreground">
                          {user.name}
                        </h4>
{/* RIGHT BOX */}
                        <p className="break-all text-xs text-muted-foreground">
                          {user.email}
                        </p>

                        <p className="break-all text-xs text-muted-foreground">
                          Website: {user.website || "No website registered"}
                        </p>

                        <p className="text-xs font-semibold text-primary">
                          {user.honeypots || 0} honeypot
                          {(user.honeypots || 0) !== 1 ? "s" : ""} deployed
                        </p>
                      </div>

                      {/* RIGHT SIDE */}
<div className="flex w-[155px] shrink-0 flex-col justify-center gap-2 border-l border-primary/20 bg-slate-50 px-3 py-3">
  <Badge
    className={
      isBlocked
        ? "h-7 w-full justify-center rounded-md bg-red-600 text-[11px] font-semibold text-white hover:bg-red-700"
        : isSuspended
        ? "h-7 w-full justify-center rounded-md bg-orange-500 text-[11px] font-semibold text-white hover:bg-orange-600"
        : "h-7 w-full justify-center rounded-md bg-primary text-[11px] font-semibold text-white hover:bg-primary/90"
    }
  >
    {isBlocked ? "Blocked" : isSuspended ? "Suspended" : "Active"}
  </Badge>

  {isSuspended ? (
    <Button
      size="sm"
      variant="outline"
      onClick={() => unsuspendUser(user._id)}
      disabled={isLoading}
      className="h-7 w-full rounded-md border-green-300 bg-white px-2 text-[11px] font-semibold text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? "..." : "Unsuspend"}
    </Button>
  ) : (
    <Button
      size="sm"
      variant="outline"
      onClick={() => suspendUser(user._id)}
      disabled={isBlocked || isLoading}
      className="h-7 w-full rounded-md border-orange-300 bg-white px-2 text-[11px] font-semibold text-orange-600 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? "..." : "Suspend"}
    </Button>
  )}

  {isBlocked ? (
    <Button
      size="sm"
      variant="outline"
      onClick={() => unblockUser(user._id)}
      disabled={isLoading}
      className="h-7 w-full rounded-md border-green-300 bg-white px-2 text-[11px] font-semibold text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? "..." : "Unblock"}
    </Button>
  ) : (
    <Button
      size="sm"
      variant="destructive"
      onClick={() => blockUser(user._id)}
      disabled={isLoading}
      className="h-7 w-full rounded-md px-2 text-[11px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? "..." : "Block"}
    </Button>
  )}

  {(actionMsg || (isSuspended && user.suspended_until)) && (
    <div className="mt-1">
      {actionMsg ? (
        <p className="rounded-md bg-green-50 px-2 py-1 text-center text-[10px] font-medium leading-tight text-green-700">
          ✓ {actionMsg}
        </p>
      ) : (
        <p className="rounded-md bg-orange-50 px-2 py-1 text-center text-[10px] font-medium leading-tight text-orange-600">
          Until {new Date(user.suspended_until as string).toLocaleTimeString()}
        </p>
      )}
    </div>
  )}
</div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </Card>

        <Card className="p-4 bg-white/90 backdrop-blur shadow-md border-2 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-primary">All Honeypots</h3>
            </div>

            <Badge variant="outline" className="text-xs">
              {activeHoneypots} Active
            </Badge>
          </div>

          <ScrollArea className="h-64">
            {loadingHoneypots ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                Loading honeypots...
              </div>
            ) : honeypots.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No honeypots found.
              </div>
            ) : (
              <div className="space-y-2">
                {honeypots.map((hp) => {
  const isTrapOn = hp.trapEnabled !== false;

  return (
    <div
      key={hp._id}
      className="flex min-h-[125px] overflow-hidden rounded-xl border border-primary/20 bg-white shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
    >
      {/* LEFT SIDE */}
      <div className="flex flex-1 flex-col justify-center gap-1 px-4 py-4">
        <h4 className="truncate text-sm font-bold text-foreground">
          {hp.name}
        </h4>

        <p className="break-all text-xs text-muted-foreground">
          Owner: {hp.ownerEmail}
        </p>

        <p className="break-all text-xs text-muted-foreground">
          Website: {hp.websiteUrl}
        </p>

        <p className="text-xs text-muted-foreground">
          Trap: {isTrapOn ? "ON" : "OFF"} | Mode:{" "}
          {hp.monitorMode === "selected_pages" ? "Selected Pages" : "All Pages"}
        </p>

        <p className="text-xs font-semibold text-primary">
          {hp.attacks_today || 0} attacks captured today
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-[155px] shrink-0 flex-col justify-center gap-2 border-l border-primary/20 bg-slate-50 px-3 py-3">
        <div
  className={
    isTrapOn
      ? "flex h-7 w-full items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-white"
      : "flex h-7 w-full items-center justify-center rounded-md bg-slate-500 text-[11px] font-semibold text-white"
  }
>
  {isTrapOn ? "Monitoring Active" : "Monitoring Paused"}
</div>

        <Button
          size="sm"
          variant="destructive"
          onClick={() => deleteHoneypot(hp._id, hp.name)}
          className="h-7 w-full rounded-md px-2 text-[11px] font-semibold"
        >
          Delete
        </Button>
      </div>
    </div>
  );
})}
              </div>
            )}
          </ScrollArea>
        </Card>

        <Card className="p-4 bg-white/90 backdrop-blur shadow-md border-2 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-primary">Recent Attacks</h3>
            </div>

            <Badge variant="outline" className="text-xs">
              {attacks.length} Loaded
            </Badge>
          </div>

          <ScrollArea className="h-64">
            {loadingAttacks ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                Loading attacks...
              </div>
            ) : attacks.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No recent attacks found.
              </div>
            ) : (
              <div className="space-y-2">
                {attacks.map((attack) => (
                  <div
                    key={attack._id}
                    className="p-3 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {attack.attack_type || "Unknown Attack"}
                      </span>

                      <Badge
                        variant={getSeverityVariant(attack.severity) as any}
                        className="text-xs"
                      >
                        {attack.severity || "N/A"}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Honeypot: {attack.honeypot || "Unknown"}
                    </p>

                    <p className="text-xs text-muted-foreground break-all">
                      URL: {attack.url || "N/A"}
                    </p>

                    <p className="text-xs text-primary mt-1">
                      {formatDate(attack.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>

      <Dialog open={showFormatDialog} onOpenChange={setShowFormatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download AI Report</DialogTitle>
            <DialogDescription>
              Choose the file format for your HWACS AI security report.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => downloadReport("txt")}
            >
              <FileText className="w-6 h-6" />
              Download TXT
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => downloadReport("doc")}
            >
              <FileType className="w-6 h-6" />
              Download DOC
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
