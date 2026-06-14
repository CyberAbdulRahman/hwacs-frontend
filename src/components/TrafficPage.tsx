// src/components/TrafficPage.tsx
import { useEffect, useMemo, useState } from "react";
import { DashboardNavbar } from "./DashboardNavbar";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { api } from "../utils/api";
import { toast } from "sonner";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TrafficPageProps {
  userRole: "admin" | "user";
}

type SiteOption = {
  _id: string;
  name: string;
  websiteUrl: string;
};

type TrafficPoint = {
  time: string;
  blocked: number;
  legitimate: number;
  total: number;
};

type TrafficStats = {
  totalRequests: number;
  attacksBlocked: number;
  legitimateTraffic: number;
  blockRate: number;
  chartData: TrafficPoint[];
};

const emptyChartData: TrafficPoint[] = [
  { time: "00:00", blocked: 0, legitimate: 0, total: 0 },
  { time: "04:00", blocked: 0, legitimate: 0, total: 0 },
  { time: "08:00", blocked: 0, legitimate: 0, total: 0 },
  { time: "12:00", blocked: 0, legitimate: 0, total: 0 },
  { time: "16:00", blocked: 0, legitimate: 0, total: 0 },
  { time: "20:00", blocked: 0, legitimate: 0, total: 0 },
];

const buildFallbackChartData = (
  totalRequests: number,
  attacksBlocked: number,
  legitimateTraffic: number
): TrafficPoint[] => {
  if (totalRequests <= 0 && attacksBlocked <= 0 && legitimateTraffic <= 0) {
    return emptyChartData;
  }

  const labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];

  const weights = [0.05, 0.08, 0.12, 0.18, 0.32, 0.25];

  let totalUsed = 0;
  let blockedUsed = 0;
  let legitimateUsed = 0;

  return labels.map((time, index) => {
    let total = Math.round(totalRequests * weights[index]);
    let blocked = Math.round(attacksBlocked * weights[index]);
    let legitimate = Math.round(legitimateTraffic * weights[index]);

    if (index === labels.length - 1) {
      total = Math.max(totalRequests - totalUsed, 0);
      blocked = Math.max(attacksBlocked - blockedUsed, 0);
      legitimate = Math.max(legitimateTraffic - legitimateUsed, 0);
    }

    totalUsed += total;
    blockedUsed += blocked;
    legitimateUsed += legitimate;

    return {
      time,
      blocked,
      legitimate,
      total: total || blocked + legitimate,
    };
  });
};

export function TrafficPage({ userRole }: TrafficPageProps) {
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState("all");
  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const [stats, setStats] = useState<TrafficStats>({
    totalRequests: 0,
    attacksBlocked: 0,
    legitimateTraffic: 0,
    blockRate: 0,
    chartData: emptyChartData,
  });

  const selectedSite = useMemo(() => {
    if (selectedSiteId === "all") return null;
    return sites.find((site) => site._id === selectedSiteId) || null;
  }, [selectedSiteId, sites]);

  const selectedLabel = selectedSite ? selectedSite.name : "All Honeypots";

  const loadSites = async () => {
    try {
      setLoadingSites(true);

      const endpoint = userRole === "admin" ? "/api/sites/all" : "/api/sites/my";
      const res = await api.get(endpoint);

      const list = Array.isArray(res.data?.sites) ? res.data.sites : [];

      const normalizedSites: SiteOption[] = list.map((site: any, index: number) => {
        const name =
          site.name ||
          site.site_name ||
          site.honeypot ||
          site.websiteName ||
          "Unnamed Honeypot";

        const websiteUrl =
          site.websiteUrl ||
          site.base_url ||
          site.url ||
          site.baseUrl ||
          "";

        return {
          _id:
            site._id ||
            site.id ||
            `${name}-${websiteUrl}-${index}`,
          name,
          websiteUrl,
        };
      });

      const uniqueSites = Array.from(
        new Map(
          normalizedSites.map((site) => [
            `${site.name.trim().toLowerCase()}-${site.websiteUrl
              .trim()
              .toLowerCase()}`,
            site,
          ])
        ).values()
      );

      setSites(uniqueSites);
    } catch (error) {
      console.error("Failed to load honeypots:", error);
      toast.error("Failed to load honeypots");
    } finally {
      setLoadingSites(false);
    }
  };

  const normalizeChartData = (rawData: any[]): TrafficPoint[] => {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return emptyChartData;
    }

    return rawData.map((item: any) => {
      const blocked = Number(
        item.blocked ??
          item.attacks_blocked ??
          item.attacksBlocked ??
          item.attack ??
          0
      );

      const legitimate = Number(
        item.legitimate ??
          item.legitimate_traffic ??
          item.legitimateTraffic ??
          item.normal ??
          0
      );

      const total = Number(
        item.total ??
          item.total_requests ??
          item.totalRequests ??
          blocked + legitimate
      );

      return {
        time: item.time || item.hour || item.label || "—",
        blocked,
        legitimate,
        total,
      };
    });
  };

  const loadTrafficStats = async () => {
    try {
      setLoadingStats(true);

      const params: Record<string, string> = {};

      if (selectedSite) {
        params.honeypot = selectedSite.name;

        if (selectedSite.websiteUrl) {
          params.base_url = selectedSite.websiteUrl;
        }
      }

      const res = await api.get("/api/stats/traffic", { params });
      const data = res.data || {};

      const chartRaw =
        data.chartData ||
        data.chart_data ||
        data.traffic_over_time ||
        data.timeline ||
        [];

      const totalRequests = Number(
        data.totalRequests ??
          data.total_requests ??
          data.total ??
          data.requests ??
          0
      );

      const attacksBlocked = Number(
        data.attacksBlocked ??
          data.attacks_blocked ??
          data.blocked ??
          data.suspicious ??
          0
      );

      const legitimateTraffic = Number(
        data.legitimateTraffic ??
          data.legitimate_traffic ??
          data.legitimate ??
          Math.max(totalRequests - attacksBlocked, 0)
      );

      const blockRate = Number(
        data.blockRate ??
          data.block_rate ??
          (totalRequests > 0 ? (attacksBlocked / totalRequests) * 100 : 0)
      );

      const normalizedChart =
        Array.isArray(chartRaw) && chartRaw.length > 0
          ? normalizeChartData(chartRaw)
          : buildFallbackChartData(
              totalRequests,
              attacksBlocked,
              legitimateTraffic
            );

      setStats({
        totalRequests,
        attacksBlocked,
        legitimateTraffic,
        blockRate,
        chartData: normalizedChart,
      });
    } catch (error) {
      console.error("Failed to load traffic statistics:", error);
      toast.error("Failed to load traffic statistics");

      setStats({
        totalRequests: 0,
        attacksBlocked: 0,
        legitimateTraffic: 0,
        blockRate: 0,
        chartData: emptyChartData,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, [userRole]);

  useEffect(() => {
    loadTrafficStats();
  }, [selectedSiteId, sites]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
      <DashboardNavbar userRole={userRole} />

      <main className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Traffic Observation
          </h1>

          <p className="text-muted-foreground">
            {userRole === "admin"
              ? "Monitor traffic patterns across all honeypots"
              : "Real-time traffic monitoring for your honeypots"}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Honeypot Filter
          </label>

          <Select
            value={selectedSiteId}
            onValueChange={setSelectedSiteId}
            disabled={loadingSites}
          >
            <SelectTrigger className="w-full bg-white border-primary/20">
              <SelectValue placeholder="Select Honeypot" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Honeypots</SelectItem>

              {sites.map((site) => (
                <SelectItem key={site._id} value={site._id}>
                  {site.name}
                  {site.websiteUrl ? ` - ${site.websiteUrl}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Badge className="mb-4 bg-cyan-600 hover:bg-cyan-700">
          {selectedLabel}
        </Badge>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
  <Card className="p-6 bg-card/80 backdrop-blur border-primary/20 min-h-[175px] flex flex-col justify-between overflow-hidden">
    <div>
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm text-muted-foreground">Total Requests</span>
        <Activity className="w-4 h-4 text-primary shrink-0" />
      </div>

      <div className="text-3xl font-semibold text-primary leading-none">
        {stats.totalRequests}
      </div>
    </div>

    <p className="text-xs text-green-600 flex items-center gap-1 mt-5">
      <TrendingUp className="w-3 h-3 shrink-0" />
      <span>Live calculated traffic</span>
    </p>
  </Card>

  <Card className="p-6 bg-card/80 backdrop-blur border-primary/20 min-h-[175px] flex flex-col justify-between overflow-hidden">
    <div>
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm text-muted-foreground">Attacks Blocked</span>
        <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
      </div>

      <div className="text-3xl font-semibold text-red-500 leading-none">
        {stats.attacksBlocked}
      </div>
    </div>

    <p className="text-xs text-red-500 flex items-center gap-1 mt-5">
      <TrendingUp className="w-3 h-3 shrink-0" />
      <span>Suspicious requests captured</span>
    </p>
  </Card>

  <Card className="p-6 bg-card/80 backdrop-blur border-primary/20 min-h-[175px] flex flex-col justify-between overflow-hidden">
    <div>
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm text-muted-foreground">Legitimate Traffic</span>
        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
      </div>

      <div className="text-3xl font-semibold text-green-600 leading-none">
        {stats.legitimateTraffic}
      </div>
    </div>

    <p className="text-xs text-green-600 flex items-center gap-1 mt-5">
      <TrendingUp className="w-3 h-3 shrink-0" />
      <span>Estimated normal traffic</span>
    </p>
  </Card>

  <Card className="p-6 bg-card/80 backdrop-blur border-primary/20 min-h-[175px] flex flex-col justify-between overflow-hidden">
    <div>
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm text-muted-foreground">Block Rate</span>
        <TrendingUp className="w-4 h-4 text-orange-600 shrink-0" />
      </div>

      <div className="text-3xl font-semibold text-orange-600 leading-none">
        {stats.blockRate.toFixed(1)}%
      </div>
    </div>

    <p className="text-xs text-orange-600 flex items-center gap-1 mt-5">
      <TrendingDown className="w-3 h-3 shrink-0" />
      <span>Attack ratio in traffic</span>
    </p>
  </Card>
</div>

        <Card className="p-6 bg-card/80 backdrop-blur border-primary/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="font-semibold">Traffic Over Time (Last 24h)</h2>
            </div>

            <Badge className="bg-cyan-600 hover:bg-cyan-700">
              {selectedLabel}
            </Badge>
          </div>

          <div style={{ width: "100%", height: 360 }}>
            {loadingStats ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Loading traffic statistics...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.chartData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: "#94a3b8" }}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: "#94a3b8" }}
                    tickLine={false}
                    allowDecimals={false}
                  />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="blocked"
                    name="Blocked"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="legitimate"
                    name="Legitimate"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total Requests"
                    stroke="#f2b400"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
