import { useEffect, useMemo, useState } from "react";
import { DashboardNavbar } from "./DashboardNavbar";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { api } from "../utils/api";
import { toast } from "sonner";
import {
  Shield,
  Search,
  Globe,
  Activity,
  CheckCircle2,
  Clock3,
  Eye,
  Trash2,
  Settings2,
  User,
} from "lucide-react";

interface HoneypotManagementPageProps {
  userRole: "admin" | "user";
}

type HoneypotRow = {
  _id: string;
  name: string;
  websiteUrl: string;
  ownerEmail: string;
  status: "active" | "inactive";
  trapEnabled: boolean;
  monitorMode: "all_pages" | "selected_pages";
  monitoredPages: string[];
  last_activity?: string | null;
  attacks_today: number;
  created_at?: string;
};

type SitePage = {
  _id: string;
  site_id: string;
  path: string;
  full_url?: string;
  page_trap_enabled: boolean;
  source?: string;
  hit_count?: number;
  discovery_count?: number;
};

function normalizeBoolean(value: any, fallback = true) {
  if (value === true || value === "true" || value === 1 || value === "1") {
    return true;
  }

  if (value === false || value === "false" || value === 0 || value === "0") {
    return false;
  }

  return fallback;
}

function TrapToggle({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "36px",
          height: "20px",
          borderRadius: "9999px",
          backgroundColor: enabled ? "#3b82f6" : "#d1d5db",
          transition: "background-color 0.2s",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "3px",
            left: enabled ? "18px" : "3px",
            width: "14px",
            height: "14px",
            borderRadius: "9999px",
            backgroundColor: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "left 0.2s",
            display: "block",
          }}
        />
      </div>

      <span
        style={{
          fontSize: "12px",
          fontWeight: 500,
          color: enabled ? "#3b82f6" : "#9ca3af",
        }}
      >
        {enabled ? "ON" : "OFF"}
      </span>
    </button>
  );
}

function StatusBadge({ status }: { status: "active" | "inactive" }) {
  const isActive = status === "active";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: 500,
        backgroundColor: isActive ? "#dcfce7" : "#cffafe",
        color: isActive ? "#15803d" : "#0e7490",
      }}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function IconCircle({
  bg,
  children,
}: {
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "9999px",
        backgroundColor: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

export function HoneypotManagementPage({
  userRole,
}: HoneypotManagementPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [honeypots, setHoneypots] = useState<HoneypotRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HoneypotRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [discoveringPages, setDiscoveringPages] = useState(false);

  const [authLoginUrl, setAuthLoginUrl] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authDiscovering, setAuthDiscovering] = useState(false);

  const [otpRequired, setOtpRequired] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  const [pagesDialogOpen, setPagesDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<HoneypotRow | null>(null);
  const [sitePages, setSitePages] = useState<SitePage[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [updatingPageId, setUpdatingPageId] = useState<string | null>(null);

  const loadHoneypots = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/sites/all");
      const list = Array.isArray(res.data?.sites) ? res.data.sites : [];

      const normalized: HoneypotRow[] = list.map((site: any) => ({
        _id: site._id || "",
        name: site.name || site.site_name || "Unnamed Honeypot",
        websiteUrl: site.websiteUrl || site.base_url || "",
        ownerEmail: site.ownerEmail || site.user_email || "Unknown",
        status: site.status || (site.is_active === false ? "inactive" : "active"),
        trapEnabled: normalizeBoolean(site.trapEnabled ?? site.trap_enabled, true),
        monitorMode: site.monitorMode || site.monitor_mode || "all_pages",
        monitoredPages: Array.isArray(site.monitoredPages)
          ? site.monitoredPages
          : Array.isArray(site.monitored_pages)
          ? site.monitored_pages
          : [],
        last_activity: site.last_activity ?? null,
        attacks_today: Number(site.attacks_today || 0),
        created_at: site.created_at,
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "admin") {
      loadHoneypots();
    }
  }, [userRole]);

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const filteredHoneypots = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    if (!q) return honeypots;

    return honeypots.filter(
      (hp) =>
        hp.name.toLowerCase().includes(q) ||
        hp.websiteUrl.toLowerCase().includes(q) ||
        hp.ownerEmail.toLowerCase().includes(q)
    );
  }, [honeypots, searchQuery]);

  const stats = useMemo(
    () => ({
      total: filteredHoneypots.length,
      active: filteredHoneypots.filter((hp) => hp.status === "active").length,
      trapsEnabled: filteredHoneypots.filter((hp) => hp.trapEnabled).length,
      totalAttacksToday: filteredHoneypots.reduce(
        (sum, hp) => sum + (hp.attacks_today || 0),
        0
      ),
    }),
    [filteredHoneypots]
  );

  const loadSitePages = async (site: HoneypotRow) => {
    try {
      setSelectedSite(site);
      setAuthLoginUrl(`${site.websiteUrl.replace(/\/$/, "")}/login`);
      setAuthUsername("");
      setAuthPassword("");
      setPagesDialogOpen(true);
      setLoadingPages(true);
      setOtpRequired(false);
      setOtpSessionId("");
      setAuthOtp("");

      const res = await api.get(`/api/sites/${site._id}/pages`);
      const pages = Array.isArray(res.data?.pages) ? res.data.pages : [];

      setSitePages(
        pages.map((p: any) => ({
          _id: p._id,
          site_id: p.site_id,
          path: p.path || "/",
          full_url: p.full_url || "",
          page_trap_enabled: p.page_trap_enabled !== false,
          source: p.source || "unknown",
          hit_count: Number(p.hit_count || 0),
          discovery_count: Number(p.discovery_count || 0),
        }))
      );
    } catch (error: any) {
      console.error("Failed to load pages:", error);
      toast.error(
        error?.response?.data?.error || "Failed to load discovered pages."
      );
    } finally {
      setLoadingPages(false);
    }
  };

  const runAuthenticatedDiscovery = async () => {
  if (!selectedSite) return;

  if (!authLoginUrl.trim() || !authUsername.trim() || !authPassword.trim()) {
    toast.error("Login URL, username, and password are required.");
    return;
  }

  try {
    setAuthDiscovering(true);
    setOtpRequired(false);
    setOtpSessionId("");
    setAuthOtp("");

    const res = await api.post(
      `/api/sites/${selectedSite._id}/discover-auth-start`,
      {
        login_url: authLoginUrl.trim(),
        username: authUsername.trim(),
        password: authPassword,
      }
    );

    if (res.data?.requires_otp) {
      setOtpRequired(true);
      setOtpSessionId(res.data.session_id || "");
      toast.info("OTP required. Please enter the OTP to continue discovery.");
      return;
    }

    toast.success(
      res.data?.message || "Authenticated discovery completed successfully."
    );

    await loadSitePages(selectedSite);
  } catch (error: any) {
    console.error("Authenticated discovery failed:", error);
    toast.error(
      error?.response?.data?.details ||
        error?.response?.data?.error ||
        "Failed to run authenticated discovery."
    );
  } finally {
    setAuthDiscovering(false);
  }
};

  const togglePageTrap = async (page: SitePage) => {
    if (!selectedSite) return;

    const nextValue = !page.page_trap_enabled;

    try {
      setUpdatingPageId(page._id);

      await api.patch(`/api/sites/${selectedSite._id}/pages/${page._id}/trap`, {
        page_trap_enabled: nextValue,
      });

      setSitePages((prev) =>
        prev.map((p) =>
          p._id === page._id ? { ...p, page_trap_enabled: nextValue } : p
        )
      );

      toast.success(`Page trap ${nextValue ? "enabled" : "disabled"}.`);
    } catch (error: any) {
      console.error("Failed to toggle page trap:", error);
      toast.error(error?.response?.data?.error || "Failed to update page trap.");
    } finally {
      setUpdatingPageId(null);
    }
  };


const submitDiscoveryOtp = async () => {
  if (!selectedSite) return;

  if (!otpSessionId || !authOtp.trim()) {
    toast.error("OTP is required.");
    return;
  }

  try {
    setOtpSubmitting(true);

    const res = await api.post(
      `/api/sites/${selectedSite._id}/discover-auth-otp`,
      {
        session_id: otpSessionId,
        otp: authOtp.trim(),
      }
    );

    toast.success(
      res.data?.message || "OTP verified. Discovery completed successfully."
    );

    setOtpRequired(false);
    setOtpSessionId("");
    setAuthOtp("");

    await loadSitePages(selectedSite);
  } catch (error: any) {
    console.error("OTP discovery failed:", error);
    toast.error(
      error?.response?.data?.details ||
        error?.response?.data?.error ||
        "Failed to continue discovery with OTP."
    );
  } finally {
    setOtpSubmitting(false);
  }
};


  const formatLastActivity = (value?: string | null) => {
    if (!value) return "—";

    try {
      const diffMs = Date.now() - new Date(value).getTime();
      const mins = Math.floor(diffMs / 60000);
      const hours = Math.floor(mins / 60);
      const days = Math.floor(hours / 24);

      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
      if (hours < 24) return `${hours} hr${hours !== 1 ? "s" : ""} ago`;

      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } catch {
      return value;
    }
  };

  const getMonitorModeLabel = (site: HoneypotRow) => {
    if (site.monitorMode === "selected_pages") {
      return `Selected Pages (${site.monitoredPages?.length || 0})`;
    }

    return "All Pages";
  };

  const handleViewLogs = (site: HoneypotRow) => {
    const params = new URLSearchParams();
    params.set("site", site.name);
    params.set("url", site.websiteUrl);
    window.location.hash = `#/admin-logs?${params.toString()}`;
  };

  const toggleTrap = async (site: HoneypotRow) => {
    const nextValue = !site.trapEnabled;

    try {
      await api.patch(`/api/admin/sites/${site._id}/trap`, {
        trap_enabled: nextValue,
      });

      setHoneypots((prev) =>
        prev.map((hp) =>
          hp._id === site._id ? { ...hp, trapEnabled: nextValue } : hp
        )
      );

      toast.success(`Trap ${nextValue ? "enabled" : "disabled"} successfully`);
    } catch (error) {
      console.error("Failed to toggle trap:", error);
      toast.error("Failed to update trap status");
    }
  };

  const handleDeleteClick = (site: HoneypotRow) => {
    setDeleteTarget(site);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await api.delete(`/api/admin/sites/${deleteTarget._id}`);

      setHoneypots((prev) => prev.filter((hp) => hp._id !== deleteTarget._id));
      toast.success("Honeypot deleted successfully");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete honeypot");
    } finally {
      setDeleting(false);
    }
  };

  if (userRole !== "admin") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
        <DashboardNavbar userRole={userRole} />

        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
          <Card style={{ padding: "40px", textAlign: "center" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Admin Access Required
            </h2>

            <p style={{ color: "#6b7280" }}>
              Honeypot management is only available for admins.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  const thStyle: React.CSSProperties = {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: 600,
    color: "#6b7280",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #f3f4f6",
  };

  const tdStyle: React.CSSProperties = {
    padding: "12px 16px",
    verticalAlign: "middle",
    borderBottom: "1px solid #f9fafb",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <DashboardNavbar userRole={userRole} />

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          <Shield size={22} color="#3b82f6" />

          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 600,
                color: "#111827",
                margin: 0,
              }}
            >
              Honeypot Management
            </h1>

            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
                marginTop: "2px",
                marginBottom: 0,
              }}
            >
              Centralized control panel to monitor and manage all user-registered external honeypots
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    margin: "0 0 6px 0",
                  }}
                >
                  Total Honeypots
                </p>

                <p
                  style={{
                    fontSize: "26px",
                    fontWeight: 600,
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  {stats.total}
                </p>
              </div>

              <IconCircle bg="#eff6ff">
                <Globe size={18} color="#3b82f6" />
              </IconCircle>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    margin: "0 0 6px 0",
                  }}
                >
                  Active Status
                </p>

                <p
                  style={{
                    fontSize: "26px",
                    fontWeight: 600,
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  {stats.active}
                </p>
              </div>

              <IconCircle bg="#f0fdf4">
                <CheckCircle2 size={18} color="#22c55e" />
              </IconCircle>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    margin: "0 0 6px 0",
                  }}
                >
                  Traps Enabled
                </p>

                <p
                  style={{
                    fontSize: "26px",
                    fontWeight: 600,
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  {stats.trapsEnabled}
                </p>
              </div>

              <IconCircle bg="#eff6ff">
                <Shield size={18} color="#3b82f6" />
              </IconCircle>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    margin: "0 0 6px 0",
                  }}
                >
                  Attacks Today
                </p>

                <p
                  style={{
                    fontSize: "26px",
                    fontWeight: 600,
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  {stats.totalAttacksToday}
                </p>
              </div>

              <IconCircle bg="#fef2f2">
                <Activity size={18} color="#ef4444" />
              </IconCircle>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "14px 16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            marginBottom: "16px",
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            />

            <Input
              placeholder="Search by website name, URL, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: "36px",
                fontSize: "13px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            />
          </div>
        </div>

        <div
  style={{
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    overflow: "visible",
    minHeight: "360px",
  }}

        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={15} color="#3b82f6" />

              <span
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#111827",
                }}
              >
                All Registered Honeypots
              </span>
            </div>

            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginTop: "2px",
                marginLeft: "23px",
                marginBottom: 0,
              }}
            >
              Monitor and control honeypot traps across all user deployments
            </p>
          </div>

          {loading ? (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: "14px",
              }}
            >
              Loading honeypots...
            </div>
          ) : filteredHoneypots.length === 0 ? (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: "14px",
              }}
            >
              No honeypots found.
            </div>
          ) : (
            <div style={{ overflow: "visible", position: "relative" }}>
              <table
                style={{
                  width: "100%",
                  minWidth: "960px",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>Website Name</th>
                    <th style={thStyle}>URL</th>
                    <th style={thStyle}>Owner</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Last Activity</th>
                    <th style={thStyle}>Attacks Today</th>
                    <th style={thStyle}>Trap Control</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredHoneypots.map((honeypot) => (
                    <tr
                      key={honeypot._id}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.backgroundColor =
                          "#f9fafb")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.backgroundColor =
                          "")
                      }
                      style={{ transition: "background-color 0.15s" }}
                    >
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "9999px",
                              backgroundColor: "#eff6ff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Globe size={13} color="#3b82f6" />
                          </div>

                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 500,
                              color: "#111827",
                            }}
                          >
                            {honeypot.name}
                          </span>
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#6b7280",
                            wordBreak: "break-all",
                          }}
                        >
                          {honeypot.websiteUrl}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <User
                            size={13}
                            color="#9ca3af"
                            style={{ flexShrink: 0 }}
                          />

                          <span
                            style={{
                              fontSize: "13px",
                              color: "#374151",
                              wordBreak: "break-all",
                            }}
                          >
                            {honeypot.ownerEmail}
                          </span>
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <StatusBadge status={honeypot.status} />
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Clock3
                            size={13}
                            color="#9ca3af"
                            style={{ flexShrink: 0 }}
                          />

                          <span style={{ fontSize: "13px", color: "#6b7280" }}>
                            {formatLastActivity(honeypot.last_activity)}
                          </span>
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Activity
                            size={13}
                            color="#9ca3af"
                            style={{ flexShrink: 0 }}
                          />

                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 500,
                              color: "#111827",
                            }}
                          >
                            {honeypot.attacks_today}
                          </span>
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <TrapToggle
                          enabled={honeypot.trapEnabled}
                          onClick={() => toggleTrap(honeypot)}
                        />
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewLogs(honeypot)}
                            style={{
                              height: "30px",
                              padding: "0 10px",
                              fontSize: "12px",
                              borderColor: "#e5e7eb",
                              color: "#374151",
                              gap: "5px",
                            }}
                          >
                            <Eye size={13} />
                            View Logs
                          </Button>

                          <button
                            type="button"
                            title="Page-Level Trap Control"
                            onClick={(e) => {
                              e.stopPropagation();
                              loadSitePages(honeypot);
                            }}
                            style={{
                              width: "30px",
                              height: "30px",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              color: "#6b7280",
                              flexShrink: 0,
                            }}
                          >
                            <Settings2 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId((prev) =>
                                prev === honeypot._id ? null : honeypot._id
                              );
                            }}
                            style={{
                              width: "30px",
                              height: "30px",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              color: "#6b7280",
                              flexShrink: 0,
                              fontSize: "18px",
                              lineHeight: 1,
                            }}
                          >
                            ⋮
                          </button>

                          {openMenuId === honeypot._id && (
                            <div
                              style={{
                                position: "absolute",
                                right: 0,
                                top: "36px",
                                zIndex: 9999,
                                minWidth: "190px",
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb",
                                backgroundColor: "#fff",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                                padding: "4px 0",
                              }}
                            >
                              <button
                                onMouseEnter={(e) =>
                                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                                    "#f9fafb")
                                }
                                onMouseLeave={(e) =>
                                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                                    "")
                                }
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleViewLogs(honeypot);
                                }}
                                style={{
                                  display: "flex",
                                  width: "100%",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "8px 12px",
                                  fontSize: "13px",
                                  color: "#374151",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  textAlign: "left",
                                }}
                              >
                                <Eye size={14} color="#9ca3af" />
                                View Logs
                              </button>

                              <button
                                onMouseEnter={(e) =>
                                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                                    "#f9fafb")
                                }
                                onMouseLeave={(e) =>
                                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                                    "")
                                }
                                onClick={() => {
                                  setOpenMenuId(null);
                                  loadSitePages(honeypot);
                                }}
                                style={{
                                  display: "flex",
                                  width: "100%",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "8px 12px",
                                  fontSize: "13px",
                                  color: "#374151",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  textAlign: "left",
                                }}
                              >
                                <Settings2 size={14} color="#9ca3af" />
                                Page Trap Control
                              </button>

                              <button
                                onMouseEnter={(e) =>
                                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                                    "#fef2f2")
                                }
                                onMouseLeave={(e) =>
                                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                                    "")
                                }
                                onClick={() => handleDeleteClick(honeypot)}
                                style={{
                                  display: "flex",
                                  width: "100%",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "8px 12px",
                                  fontSize: "13px",
                                  color: "#dc2626",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  textAlign: "left",
                                }}
                              >
                                <Trash2 size={14} />
                                Delete Honeypot
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {pagesDialogOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.42)",
            padding: "16px",
          }}
          onClick={() => setPagesDialogOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "760px",
              maxHeight: "82vh",
              overflow: "visible",
              minHeight: "360px",
              borderRadius: "14px",
              backgroundColor: "#fff",
              boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
              border: "1px solid #dbeafe",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "18px 22px",
                borderBottom: "1px solid #eef2ff",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "14px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  Page-Level Trap Control
                </h3>

                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "4px",
                    marginBottom: 0,
                    wordBreak: "break-all",
                  }}
                >
                  {selectedSite
                    ? `${selectedSite.name} — ${selectedSite.websiteUrl}`
                    : "Detected pages for this honeypot"}
                </p>
              </div>

              <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>
  Site ID: {selectedSite?._id}
</p>

              

              <button
                type="button"
                onClick={() => setPagesDialogOpen(false)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  border: "1px solid #bfdbfe",
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                  cursor: "pointer",
                  fontSize: "18px",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "16px 18px", overflowY: "auto", maxHeight: "64vh" }}>
              <div
                style={{
                  marginBottom: "14px",
                  padding: "12px",
                  border: "1px solid #dbeafe",
                  borderRadius: "10px",
                  backgroundColor: "#f8fbff",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#111827",
                    margin: "0 0 8px 0",
                  }}
                >
                  Authenticated Discovery
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1fr 1fr auto",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <Input
                    placeholder="Login URL"
                    value={authLoginUrl}
                    onChange={(e) => setAuthLoginUrl(e.target.value)}
                    style={{ height: "32px", fontSize: "12px" }}
                  />

                  <Input
                    placeholder="Username / Email"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    style={{ height: "32px", fontSize: "12px" }}
                  />

                  <Input
                    placeholder="Password"
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    style={{ height: "32px", fontSize: "12px" }}
                  />

                  <Button
                    size="sm"
                    onClick={runAuthenticatedDiscovery}
                    disabled={authDiscovering}
                    style={{
                      height: "32px",
                      fontSize: "12px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {authDiscovering ? "Running..." : "Run Auth"}
                  </Button>

                  {otpRequired && (
  <div
    style={{
      marginTop: "10px",
      padding: "10px",
      border: "1px solid #fed7aa",
      borderRadius: "8px",
      backgroundColor: "#fff7ed",
    }}
  >
    <p
      style={{
        fontSize: "12px",
        fontWeight: 700,
        color: "#9a3412",
        margin: "0 0 8px 0",
      }}
    >
      OTP / 2FA Required
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "8px",
        alignItems: "center",
      }}
    >
      <Input
        placeholder="Enter OTP / 2FA code"
        value={authOtp}
        onChange={(e) => setAuthOtp(e.target.value)}
        style={{ height: "32px", fontSize: "12px" }}
      />

      <Button
        size="sm"
        onClick={submitDiscoveryOtp}
        disabled={otpSubmitting}
        style={{
          height: "32px",
          fontSize: "12px",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        {otpSubmitting ? "Verifying..." : "Continue"}
      </Button>
    </div>

    <p
      style={{
        fontSize: "11px",
        color: "#9a3412",
        margin: "8px 0 0 0",
      }}
    >
      Enter the OTP from email/SMS/authenticator. HWACS will continue discovery in the same browser session.
    </p>
  </div>
)}
                </div>

                <p
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    margin: "8px 0 0 0",
                  }}
                >
                  Use a test/demo account. HWACS does not need real user cookies.
                </p>
              </div>

              {loadingPages ? (
                <div
                  style={{
                    padding: "36px",
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: "14px",
                  }}
                >
                  Loading discovered pages...
                </div>
              ) : sitePages.length === 0 ? (
                <div
                  style={{
                    padding: "28px",
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: "13px",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "10px",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  No pages discovered yet. Public crawler may only detect linked pages.
                  Real traffic collector and browser crawler can add more pages.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {sitePages.map((page) => (
                    <div
                      key={page._id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 110px 110px",
                        gap: "12px",
                        alignItems: "center",
                        border: "1px solid #dbeafe",
                        borderRadius: "10px",
                        backgroundColor: "#f8fbff",
                        padding: "12px",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#111827",
                            margin: 0,
                            wordBreak: "break-all",
                          }}
                        >
                          {page.path}
                        </p>

                        <p
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            margin: "4px 0 0 0",
                            wordBreak: "break-all",
                          }}
                        >
                          {page.full_url || "No full URL"}
                        </p>

                        <p
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                            margin: "4px 0 0 0",
                          }}
                        >
                          Source: {page.source || "unknown"} | Hits:{" "}
                          {page.hit_count || 0} | Discovery:{" "}
                          {page.discovery_count || 0}
                        </p>
                      </div>

                      <div
                        style={{
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "7px",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#fff",
                          backgroundColor: page.page_trap_enabled
                            ? "#0ea5e9"
                            : "#64748b",
                        }}
                      >
                        {page.page_trap_enabled ? "Trap ON" : "Trap OFF"}
                      </div>

                      <Button
                        size="sm"
                        variant={page.page_trap_enabled ? "outline" : "default"}
                        disabled={updatingPageId === page._id}
                        onClick={() => togglePageTrap(page)}
                        style={{
                          height: "30px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {updatingPageId === page._id
                          ? "Saving..."
                          : page.page_trap_enabled
                          ? "Turn OFF"
                          : "Turn ON"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "440px",
              borderRadius: "12px",
              backgroundColor: "#fff",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#111827",
                marginBottom: "6px",
              }}
            >
              Delete Honeypot
            </h3>

            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
                marginBottom: "16px",
              }}
            >
              Are you sure you want to delete{" "}
              <strong style={{ color: "#111827" }}>{deleteTarget.name}</strong>?
              This will also remove related attacks and notifications.
            </p>

            <div
              style={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
                padding: "12px",
                fontSize: "13px",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ color: "#374151" }}>
                <strong style={{ color: "#111827" }}>Name:</strong>{" "}
                {deleteTarget.name}
              </div>

              <div style={{ color: "#374151", wordBreak: "break-all" }}>
                <strong style={{ color: "#111827" }}>URL:</strong>{" "}
                {deleteTarget.websiteUrl}
              </div>

              <div style={{ color: "#374151", wordBreak: "break-all" }}>
                <strong style={{ color: "#111827" }}>Owner:</strong>{" "}
                {deleteTarget.ownerEmail}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
