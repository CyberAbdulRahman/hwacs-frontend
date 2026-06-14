// import { DashboardNavbar } from "./DashboardNavbar";
// import { Card } from "./ui/card";
// import { Link, useNavigate } from "react-router-dom";
// import { Button } from "./ui/button";
// import {
//   Shield,
//   Activity,
//   Users,
//   TrendingUp,
//   AlertTriangle,
//   Bell,
//   Brain,
//   FileText,
// } from "lucide-react";

// interface DashboardOverviewProps {
//   userRole: "admin" | "user";
// }

// export function DashboardOverview({ userRole }: DashboardOverviewProps) {
//   const navigate = useNavigate();

//   const handleGenerateAIReport = () => {
//     navigate(`/${userRole}-logs`);
//   };

//   const stats =
//     userRole === "admin"
//       ? {
//           totalUsers: 47,
//           totalHoneypots: 128,
//           activeThreats: 24,
//           totalAttacks: 598,
//         }
//       : {
//           activeHoneypots: 2,
//           attacksBlocked: 57,
//           uptime: "99.8%",
//           lastAttack: "2 min ago",
//         };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
//       <DashboardNavbar userRole={userRole} />

//       <main className="container mx-auto p-6 max-w-7xl">
//         <div className="mb-6">
//           <h1 className="text-3xl font-semibold text-foreground mb-2">
//             {userRole === "admin" ? "Admin Dashboard" : "My Dashboard"}
//           </h1>
//           <p className="text-muted-foreground">
//             {userRole === "admin"
//               ? "Global system overview and management"
//               : "Monitor your captured attacks and generate real XAI reports"}
//           </p>
//         </div>

//         <Card className="p-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white mb-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Brain className="w-8 h-8" />
//               <div>
//                 <h3 className="font-semibold text-lg">Explainable AI Security Report</h3>
//                 <p className="text-sm text-blue-100">
//                   Open logs and generate a real report for a selected suspicious attack
//                 </p>
//               </div>
//             </div>
//             <Button
//               onClick={handleGenerateAIReport}
//               variant="secondary"
//               size="lg"
//               className="bg-white text-primary hover:bg-blue-50"
//             >
//               Go to Logs
//             </Button>
//           </div>
//         </Card>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           {userRole === "admin" ? (
//             <>
//               <Card className="p-6 bg-card/80 backdrop-blur">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm text-muted-foreground">Total Users</span>
//                   <Users className="w-4 h-4 text-primary" />
//                 </div>
//                 <div className="text-3xl font-semibold text-primary">{stats.totalUsers}</div>
//               </Card>

//               <Card className="p-6 bg-card/80 backdrop-blur">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm text-muted-foreground">Total Honeypots</span>
//                   <Shield className="w-4 h-4 text-primary" />
//                 </div>
//                 <div className="text-3xl font-semibold text-primary">{stats.totalHoneypots}</div>
//               </Card>

//               <Card className="p-6 bg-card/80 backdrop-blur">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm text-muted-foreground">Active Threats</span>
//                   <AlertTriangle className="w-4 h-4 text-destructive" />
//                 </div>
//                 <div className="text-3xl font-semibold text-destructive">{stats.activeThreats}</div>
//               </Card>

//               <Card className="p-6 bg-card/80 backdrop-blur">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm text-muted-foreground">Attacks Blocked</span>
//                   <Activity className="w-4 h-4 text-green-600" />
//                 </div>
//                 <div className="text-3xl font-semibold text-green-600">{stats.totalAttacks}</div>
//               </Card>
//             </>
//           ) : (
//             <>
//               <Card className="p-6 bg-card/80 backdrop-blur">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm text-muted-foreground">Active Honeypots</span>
//                   <Shield className="w-4 h-4 text-primary" />
//                 </div>
//                 <div className="text-3xl font-semibold text-primary">{stats.activeHoneypots}</div>
//               </Card>

//               <Card className="p-6 bg-card/80 backdrop-blur">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm text-muted-foreground">Attacks Blocked</span>
//                   <Activity className="w-4 h-4 text-destructive" />
//                 </div>
//                 <div className="text-3xl font-semibold text-destructive">{stats.attacksBlocked}</div>
//               </Card>

//               <Card className="p-6 bg-card/80 backdrop-blur">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm text-muted-foreground">Uptime</span>
//                   <TrendingUp className="w-4 h-4 text-green-600" />
//                 </div>
//                 <div className="text-3xl font-semibold text-green-600">{stats.uptime}</div>
//               </Card>

//               <Card className="p-6 bg-card/80 backdrop-blur">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm text-muted-foreground">Last Attack</span>
//                   <Bell className="w-4 h-4 text-orange-500" />
//                 </div>
//                 <div className="text-xl font-semibold text-orange-500">{stats.lastAttack}</div>
//               </Card>
//             </>
//           )}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <Link to={`/${userRole}-vulnerabilities`}>
//             <Card className="p-6 bg-card/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer group">
//               <div className="flex flex-col items-center text-center">
//                 <AlertTriangle className="w-10 h-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
//                 <h3 className="font-semibold mb-1">Vulnerabilities</h3>
//                 <p className="text-sm text-muted-foreground">View attack analysis</p>
//               </div>
//             </Card>
//           </Link>

//           <Link to={`/${userRole}-logs`}>
//             <Card className="p-6 bg-card/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer group">
//               <div className="flex flex-col items-center text-center">
//                 <FileText className="w-10 h-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
//                 <h3 className="font-semibold mb-1">Log Files</h3>
//                 <p className="text-sm text-muted-foreground">Download logs and XAI reports</p>
//               </div>
//             </Card>
//           </Link>

//           <Link to={`/${userRole}-traffic`}>
//             <Card className="p-6 bg-card/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer group">
//               <div className="flex flex-col items-center text-center">
//                 <TrendingUp className="w-10 h-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
//                 <h3 className="font-semibold mb-1">Traffic</h3>
//                 <p className="text-sm text-muted-foreground">Monitor traffic</p>
//               </div>
//             </Card>
//           </Link>

//           <Link to={`/${userRole}-notifications`}>
//             <Card className="p-6 bg-card/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer group">
//               <div className="flex flex-col items-center text-center">
//                 <Bell className="w-10 h-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
//                 <h3 className="font-semibold mb-1">Notifications</h3>
//                 <p className="text-sm text-muted-foreground">View alerts</p>
//               </div>
//             </Card>
//           </Link>
//         </div>
//       </main>
//     </div>
//   );
// }
import { DashboardNavbar } from "./DashboardNavbar";
import { Card } from "./ui/card";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Shield,
  Activity,
  Users,
  TrendingUp,
  AlertTriangle,
  Bell,
  Brain,
  FileText,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface DashboardOverviewProps {
  userRole: "admin" | "user";
}

type SiteItem = {
  _id: string;
  name: string;
  websiteUrl: string;
};

type DashboardStats = {
  active_honeypots: number;
  attacks_blocked: number;
  uptime: string;
  last_attack: string | null;
  admin?: {
    total_users: number;
    total_honeypots: number;
    active_threats: number;
    total_attacks: number;
  } | null;
};

export function DashboardOverview({ userRole }: DashboardOverviewProps) {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats>({
    active_honeypots: 0,
    attacks_blocked: 0,
    uptime: "99.8%",
    last_attack: null,
    admin: null,
  });

  const loadSites = async () => {
  try {
    const endpoint = userRole === "admin" ? "/api/sites/all" : "/api/sites/my";
    const res = await api.get(endpoint);

    const list = Array.isArray(res.data?.sites) ? res.data.sites : [];

    const normalizedSites = list.map((site: any) => ({
      _id: site._id || "",
      name: site.name || site.site_name || "Unnamed Honeypot",
      websiteUrl: site.websiteUrl || site.base_url || "",
    }));

    setSites(normalizedSites);
  } catch (error) {
    console.error("Failed to load honeypots:", error);
    toast.error("Failed to load honeypots");
  }
};

  const loadStats = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (selectedSite !== "all") {
        const site = sites.find((s) => s._id === selectedSite);
        if (site) {
          params.set("honeypot", site.name);
          params.set("base_url", site.websiteUrl);
        }
      }

      const queryString = params.toString();
      const res = await api.get(
        `/api/stats/dashboard${queryString ? `?${queryString}` : ""}`
      );

      setStats({
        active_honeypots: Number(res.data?.active_honeypots || 0),
        attacks_blocked: Number(res.data?.attacks_blocked || 0),
        uptime: res.data?.uptime || "99.8%",
        last_attack: res.data?.last_attack || null,
        admin: res.data?.admin || null,
      });
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    loadStats();
  }, [selectedSite, sites.length]);

  const selectedSiteLabel = useMemo(() => {
    if (selectedSite === "all") {
      return userRole === "admin" ? "All Honeypots" : "Your Honeypots";
    }
    return sites.find((s) => s._id === selectedSite)?.name || "Selected Honeypot";
  }, [selectedSite, sites, userRole]);

  const lastAttackText = useMemo(() => {
    if (!stats.last_attack) return "No attacks yet";
    try {
      return new Date(stats.last_attack).toLocaleString();
    } catch {
      return String(stats.last_attack);
    }
  }, [stats.last_attack]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
      <DashboardNavbar userRole={userRole} />

      <main className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              {userRole === "admin" ? "Admin Dashboard" : "My Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {userRole === "admin"
                ? "Global system overview and management"
                : "Monitor your captured attacks and generate real XAI reports"}
            </p>
          </div>

          <div className="w-full max-w-xs">
            <p className="text-sm font-medium mb-2">Honeypot Filter</p>
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger>
                <SelectValue placeholder="Select honeypot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Honeypots</SelectItem>
                {sites.map((site) => (
                  <SelectItem key={site._id} value={site._id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="p-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white mb-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8" />
              <div>
                <h3 className="font-semibold text-lg">Explainable AI Security Report</h3>
                <p className="text-sm text-blue-100">
                  Open logs and generate a real report for a selected suspicious attack
                </p>
              </div>
            </div>
            <Link to={`/${userRole}-logs`}>
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-primary hover:bg-blue-50"
              >
                Go to Logs
              </Button>
            </Link>
          </div>
        </Card>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Loading dashboard statistics...</p>
          </Card>
        ) : (
          <>
            <div className="mb-4">
              <span className="inline-flex rounded-full bg-cyan-500 text-white text-xs px-3 py-1">
                {selectedSiteLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {userRole === "admin" ? (
                <>
                  <Card className="p-6 bg-card/80 backdrop-blur">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Total Users</span>
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-3xl font-semibold text-primary">
                      {stats.admin?.total_users ?? 0}
                    </div>
                  </Card>

                  <Card className="p-6 bg-card/80 backdrop-blur">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Total Honeypots</span>
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-3xl font-semibold text-primary">
                      {stats.admin?.total_honeypots ?? 0}
                    </div>
                  </Card>

                  <Card className="p-6 bg-card/80 backdrop-blur">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Active Threats</span>
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="text-3xl font-semibold text-destructive">
                      {stats.admin?.active_threats ?? 0}
                    </div>
                  </Card>

                  <Card className="p-6 bg-card/80 backdrop-blur">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Attacks Blocked</span>
                      <Activity className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-3xl font-semibold text-green-600">
                      {stats.admin?.total_attacks ?? 0}
                    </div>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="p-6 bg-card/80 backdrop-blur">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Active Honeypots</span>
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-3xl font-semibold text-primary">
                      {stats.active_honeypots}
                    </div>
                  </Card>

                  <Card className="p-6 bg-card/80 backdrop-blur">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Attacks Blocked</span>
                      <Activity className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="text-3xl font-semibold text-destructive">
                      {stats.attacks_blocked}
                    </div>
                  </Card>

                  <Card className="p-6 bg-card/80 backdrop-blur">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Uptime</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-3xl font-semibold text-green-600">
                      {stats.uptime}
                    </div>
                  </Card>

                  <Card className="p-6 bg-card/80 backdrop-blur">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Last Attack</span>
                      <Bell className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="text-base font-semibold text-orange-500 break-words">
                      {lastAttackText}
                    </div>
                  </Card>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to={`/${userRole}-vulnerabilities`}>
                <Card className="p-6 bg-card/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex flex-col items-center text-center">
                    <AlertTriangle className="w-10 h-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold mb-1">Vulnerabilities</h3>
                    <p className="text-sm text-muted-foreground">View attack analysis</p>
                  </div>
                </Card>
              </Link>

              <Link to={`/${userRole}-logs`}>
                <Card className="p-6 bg-card/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex flex-col items-center text-center">
                    <FileText className="w-10 h-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold mb-1">Log Files</h3>
                    <p className="text-sm text-muted-foreground">Download logs and XAI reports</p>
                  </div>
                </Card>
              </Link>

              <Link to={`/${userRole}-traffic`}>
                <Card className="p-6 bg-card/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex flex-col items-center text-center">
                    <TrendingUp className="w-10 h-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold mb-1">Traffic</h3>
                    <p className="text-sm text-muted-foreground">Monitor traffic</p>
                  </div>
                </Card>
              </Link>

              <Link to={`/${userRole}-notifications`}>
                <Card className="p-6 bg-card/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex flex-col items-center text-center">
                    <Bell className="w-10 h-10 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold mb-1">Notifications</h3>
                    <p className="text-sm text-muted-foreground">View alerts</p>
                  </div>
                </Card>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
