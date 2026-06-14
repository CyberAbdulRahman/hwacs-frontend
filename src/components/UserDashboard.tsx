import { useMemo, useState } from "react";
import { DashboardNavbar } from "./DashboardNavbar";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { Download, TrendingUp, AlertTriangle, Bell, Activity, FileText } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { api } from "../utils/api";

type Severity = "critical" | "high" | "medium" | "low";
type NotifType = "critical" | "warning" | "info";

export function UserDashboard() {
  // User-specific data - Only shows data for THIS user's website/honeypots
  const userWebsite = "mywebsite.com";
  const userHoneypots = ["HP-Web-01", "HP-SSH-02"];

  // ✅ XAI report states
  const [payload, setPayload] = useState("");
  const [downloading, setDownloading] = useState(false);

  const handleDownloadLog = (fileName: string) => {
    toast.success(`Downloading ${fileName}...`);
    console.log("Downloading log file:", fileName);
  };

  const trafficData = [
    { time: "00:00", requests: 12 },
    { time: "04:00", requests: 8 },
    { time: "08:00", requests: 25 },
    { time: "12:00", requests: 38 },
    { time: "16:00", requests: 29 },
    { time: "20:00", requests: 19 },
  ];

  // Only attacks detected on THIS user's honeypots
  const vulnerabilityData: { name: string; value: number; severity: Severity }[] = [
    { name: "SQL Injection", value: 15, severity: "high" },
    { name: "XSS", value: 8, severity: "high" },
    { name: "Brute Force", value: 22, severity: "medium" },
    { name: "Port Scan", value: 7, severity: "low" },
    { name: "LFI", value: 5, severity: "critical" },
  ];

  const COLORS: Record<Severity, string> = {
    critical: "#dc2626",
    high: "#f59e0b",
    medium: "#eab308",
    low: "#84cc16",
  };

  // ✅ useState fixed: notifications state
  const [notifications, setNotifications] = useState<
    { id: number; type: NotifType; message: string; time: string }[]
  >([
    {
      id: 1,
      type: "critical",
      message: `LFI attack detected on ${userHoneypots[0]} (${userWebsite})`,
      time: "2 min ago",
    },
    {
      id: 2,
      type: "warning",
      message: `Multiple failed login attempts on ${userHoneypots[1]}`,
      time: "15 min ago",
    },
    {
      id: 3,
      type: "info",
      message: `Honeypot ${userHoneypots[0]} health check: OK`,
      time: "1 hour ago",
    },
    {
      id: 4,
      type: "critical",
      message: `SQL Injection blocked on ${userHoneypots[0]}`,
      time: "2 hours ago",
    },
  ]);

  // ✅ useState fixed: log files state
  const [logFiles] = useState<
    { id: number; name: string; size: string; time: string; source: string }[]
  >([
    {
      id: 1,
      name: `${userWebsite}_attack_log_2025-11-04.log`,
      size: "1.2 MB",
      time: "14:30",
      source: userHoneypots[0],
    },
    {
      id: 2,
      name: `${userWebsite}_traffic_log_2025-11-04.log`,
      size: "2.8 MB",
      time: "14:30",
      source: userWebsite,
    },
    {
      id: 3,
      name: `${userHoneypots[1]}_security_events.log`,
      size: "850 KB",
      time: "14:30",
      source: userHoneypots[1],
    },
    {
      id: 4,
      name: `${userWebsite}_failed_logins_2025-11-04.log`,
      size: "420 KB",
      time: "14:30",
      source: userWebsite,
    },
  ]);

  const clearNotifications = () => {
    setNotifications([]);
    toast.success("Notifications cleared!");
  };

  const totalAttacks = useMemo(
    () => vulnerabilityData.reduce((sum, v) => sum + v.value, 0),
    [vulnerabilityData]
  );

  // ✅ Download PDF report using axios (api.ts)
  const handleDownloadXaiReport = async () => {
    const p = payload.trim();
    if (!p) {
      toast.error("Please paste a payload first.");
      return;
    }

    try {
      setDownloading(true);
      toast.message("Generating report...");

      const res = await api.post(
        "/api/xai/report/pdf",
        { payload: p },
        { responseType: "blob" } // ✅ important for file
      );

      // Try to extract filename from header if backend sends it
      const contentDisposition = res.headers?.["content-disposition"] as string | undefined;
      let filename = `HWACS_XAI_Report_${Date.now()}.pdf`;

      if (contentDisposition) {
        const match = /filename="?([^"]+)"?/i.exec(contentDisposition);
        if (match?.[1]) filename = match[1];
      }

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded ✅");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Report generation failed. Check backend running & endpoint.";
      toast.error(msg);
    } finally {
      setDownloading(false);
    }
  };

  // Quick fill buttons
  const fillSample = (type: "bypass" | "time" | "union" | "drop") => {
    if (type === "bypass") setPayload(`admin' OR '1'='1'--`);
    if (type === "time") setPayload(`1 OR SLEEP(5)#`);
    if (type === "union") setPayload(`1 UNION SELECT username, password FROM users--`);
    if (type === "drop") setPayload(`1; DROP TABLE users;--`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
      <DashboardNavbar userRole="user" notificationCount={notifications.length} />

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-muted-foreground">
                My Honeypot Dashboard - {userWebsite}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Monitoring your deployed honeypots: {userHoneypots.join(", ")}
              </p>
            </div>
            <Badge variant="outline" className="gap-2">
              <Activity className="w-3 h-3" />
              {userHoneypots.length} Active Honeypots
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vulnerability Analysis */}
          <Card className="p-6 bg-card/80 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Attack Vulnerabilities</h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                Your Honeypots Only
              </Badge>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={vulnerabilityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(((percent ?? 0) * 100)).toFixed(0)}%`
                  }
                  outerRadius={80}
                  dataKey="value"
                >
                  {vulnerabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.severity]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {vulnerabilityData.map((vuln, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[vuln.severity] }}
                    />
                    <span>{vuln.name}</span>
                  </div>
                  <Badge variant="outline">{vuln.value} attacks</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Downloadable Log Files */}
          <Card className="p-6 bg-card/80 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">My Log Files</h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {userWebsite}
              </Badge>
            </div>

            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {logFiles.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{log.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownloadLog(log.name)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{log.size}</span>
                      <span>Source: {log.source}</span>
                      <span>•</span>
                      <span>{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* ✅ Explainable AI Report (NEW) */}
          <Card className="p-6 bg-card/80 backdrop-blur md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Explainable AI Report</h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                SQLi Model (RandomForest + TF-IDF)
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              Paste a captured payload (from terminal / logs) and generate a downloadable PDF report.
            </p>

            <textarea
              className="w-full min-h-[110px] rounded-md border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Paste payload here e.g. admin' OR '1'='1'--"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={handleDownloadXaiReport} disabled={downloading}>
                {downloading ? "Generating..." : "Generate & Download PDF"}
              </Button>

              <Button variant="outline" onClick={() => setPayload("")} disabled={downloading}>
                Clear
              </Button>

              <div className="flex-1" />

              {/* quick samples */}
              <Button variant="outline" onClick={() => fillSample("bypass")} disabled={downloading}>
                Sample: Login bypass
              </Button>
              <Button variant="outline" onClick={() => fillSample("time")} disabled={downloading}>
                Sample: Time-based
              </Button>
              <Button variant="outline" onClick={() => fillSample("union")} disabled={downloading}>
                Sample: UNION
              </Button>
              <Button variant="outline" onClick={() => fillSample("drop")} disabled={downloading}>
                Sample: DROP
              </Button>
            </div>
          </Card>

          {/* Traffic Observation */}
          <Card className="p-6 bg-card/80 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">My Traffic Observation</h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                Last 24h
              </Badge>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-semibold text-primary">131</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Attacks Blocked</p>
                <p className="text-2xl font-semibold text-destructive">57</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Legitimate</p>
                <p className="text-2xl font-semibold text-green-600">74</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: "12px" }} />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#eab308"
                  strokeWidth={3}
                  dot={{ fill: "#eab308", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Popup Notifications */}
          <Card className="p-6 bg-card/80 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">My Notifications</h3>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Your Alerts
                </Badge>
                <Button size="sm" variant="outline" onClick={clearNotifications}>
                  Clear
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-3">No notifications 🎉</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg border ${
                        notif.type === "critical"
                          ? "bg-destructive/10 border-destructive/30"
                          : notif.type === "warning"
                          ? "bg-orange-500/10 border-orange-500/30"
                          : "bg-muted/30 border-border"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`mt-1 w-2 h-2 rounded-full ${
                            notif.type === "critical"
                              ? "bg-destructive"
                              : notif.type === "warning"
                              ? "bg-orange-500"
                              : "bg-primary"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Attack Ratio - Full Width */}
          <Card className="p-6 md:col-span-2 bg-card/80 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Attack Ratio by Type</h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                Total: {totalAttacks} attacks detected
              </Badge>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vulnerabilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: "12px" }} />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="value" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </main>
    </div>
  );
}

