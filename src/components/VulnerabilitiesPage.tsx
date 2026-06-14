// import { DashboardNavbar } from "./DashboardNavbar";
// import { Card } from "./ui/card";
// import { Badge } from "./ui/badge";
// import { AlertTriangle, Activity } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import { api } from "../utils/api";
// import { toast } from "sonner";
// import {
//   PieChart,
//   Pie,
//   BarChart,
//   Bar,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select";

// interface VulnerabilitiesPageProps {
//   userRole: "admin" | "user";
// }

// type VulnerabilityItem = {
//   name: string;
//   value: number;
//   severity: "critical" | "high" | "medium" | "low";
//   color: string;
// };

// type SiteItem = {
//   _id: string;
//   name: string;
//   websiteUrl: string;
// };

// const ATTACK_COLORS: Record<string, string> = {
//   "SQL Injection": "#3B82F6", // blue
//   XSS: "#F59E0B", // orange
//   "Brute Force": "#EAB308", // yellow
//   "Port Scan": "#84CC16", // green
//   LFI: "#EF4444", // red
// };

// const DEFAULT_VULNERABILITY_DATA: VulnerabilityItem[] = [
//   {
//     name: "SQL Injection",
//     value: 0,
//     severity: "high",
//     color: ATTACK_COLORS["SQL Injection"],
//   },
//   {
//     name: "XSS",
//     value: 0,
//     severity: "high",
//     color: ATTACK_COLORS["XSS"],
//   },
//   {
//     name: "Brute Force",
//     value: 0,
//     severity: "medium",
//     color: ATTACK_COLORS["Brute Force"],
//   },
//   {
//     name: "Port Scan",
//     value: 0,
//     severity: "low",
//     color: ATTACK_COLORS["Port Scan"],
//   },
//   {
//     name: "LFI",
//     value: 0,
//     severity: "critical",
//     color: ATTACK_COLORS["LFI"],
//   },
// ];

// export function VulnerabilitiesPage({ userRole }: VulnerabilitiesPageProps) {
//   const [sites, setSites] = useState<SiteItem[]>([]);
//   const [selectedSite, setSelectedSite] = useState<string>("all");
//   const [vulnerabilityData, setVulnerabilityData] = useState<VulnerabilityItem[]>(
//     DEFAULT_VULNERABILITY_DATA
//   );
//   const [loading, setLoading] = useState(true);

// const loadSites = async () => {
//   try {
//     const endpoint = userRole === "admin" ? "/api/sites/all" : "/api/sites/my";
//     const res = await api.get(endpoint);

//     const list = Array.isArray(res.data?.sites) ? res.data.sites : [];
//     const normalizedSites = list.map((site: any) => ({
//       _id: site._id || "",
//       name: site.name || site.site_name || "Unnamed Honeypot",
//       websiteUrl: site.websiteUrl || site.base_url || "",
//     }));

//     setSites(normalizedSites);
//   } catch (error) {
//     console.error("Failed to load honeypots:", error);
//     toast.error("Failed to load honeypots");
//   }
// };

//   const loadStats = async () => {
//     try {
//       setLoading(true);

//       const params = new URLSearchParams();

//       if (selectedSite !== "all") {
//         const site = sites.find((s) => s._id === selectedSite);
//         if (site) {
//           params.set("honeypot", site.name);
//           params.set("base_url", site.websiteUrl);
//         }
//       }

//       const queryString = params.toString();
//       const res = await api.get(
//         `/api/stats/vulnerabilities${queryString ? `?${queryString}` : ""}`
//       );

//       const data = Array.isArray(res.data?.data) ? res.data.data : [];

//       const mergedData: VulnerabilityItem[] = DEFAULT_VULNERABILITY_DATA.map((item) => {
//         const found = data.find((d: any) => d.name === item.name);
//         if (found) {
//           return {
//             ...item,
//             value: Number(found.value || 0),
//             severity: found.severity || item.severity,
//             color: ATTACK_COLORS[found.name] || item.color,
//           };
//         }
//         return item;
//       });

//       setVulnerabilityData(mergedData);
//     } catch (error) {
//       console.error("Failed to load vulnerability stats:", error);
//       toast.error("Failed to load vulnerability stats");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadSites();
//   }, []);

//   useEffect(() => {
//     loadStats();
//   }, [selectedSite, sites.length]);

//   const totalAttacks = useMemo(
//     () => vulnerabilityData.reduce((sum, v) => sum + v.value, 0),
//     [vulnerabilityData]
//   );

//   const pieData = useMemo(
//     () => vulnerabilityData.filter((item) => item.value > 0),
//     [vulnerabilityData]
//   );

//   const selectedSiteLabel =
//     selectedSite === "all"
//       ? userRole === "admin"
//         ? "All Honeypots"
//         : "Your Honeypots"
//       : sites.find((s) => s._id === selectedSite)?.name || "Selected Honeypot";

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
//       <DashboardNavbar userRole={userRole} />

//       <main className="container mx-auto p-6">
//         <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
//           <div>
//             <h1 className="text-3xl font-semibold text-foreground mb-2">
//               Attack Vulnerabilities
//             </h1>
//             <p className="text-muted-foreground">
//               {userRole === "admin"
//                 ? "System-wide vulnerability analysis across all honeypots"
//                 : "Vulnerability analysis for your honeypots"}
//             </p>
//           </div>

//           <div className="w-full max-w-xs">
//             <p className="text-sm font-medium mb-2">Honeypot Filter</p>
//             <Select value={selectedSite} onValueChange={setSelectedSite}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select honeypot" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Honeypots</SelectItem>
//                 {sites.map((site) => (
//                   <SelectItem key={site._id} value={site._id}>
//                     {site.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {loading ? (
//           <Card className="p-12 text-center">
//             <p className="text-muted-foreground">Loading vulnerability statistics...</p>
//           </Card>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card className="p-6 bg-card/80 backdrop-blur">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-2">
//                   <AlertTriangle className="w-5 h-5 text-primary" />
//                   <h3 className="font-semibold">Attack Distribution</h3>
//                 </div>
//                 <Badge variant="secondary" className="text-xs">
//                   {selectedSiteLabel}
//                 </Badge>
//               </div>

//               <ResponsiveContainer width="100%" height={340}>
//                 {pieData.length > 0 ? (
//                   <PieChart>
//                     <Pie
//                       data={pieData}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ name, percent }: { name?: string; percent?: number }) =>
//                         `${name || "Unknown"}: ${(((percent ?? 0) * 100)).toFixed(0)}%`
//                       }
//                       outerRadius={95}
//                       dataKey="value"
//                     >
//                       {pieData.map((entry, index) => (
//                         <Cell key={`pie-cell-${index}`} fill={entry.color} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 ) : (
//                   <div className="h-[340px] w-full flex items-center justify-center">
//   {pieData.length > 0 ? (
//     <ResponsiveContainer width="100%" height="100%">
//       <PieChart>
//         <Pie
//           data={pieData}
//           cx="50%"
//           cy="50%"
//           labelLine={false}
//           label={({ name, percent }: { name?: string; percent?: number }) =>
//             `${name || "Unknown"}: ${(((percent ?? 0) * 100)).toFixed(0)}%`
//           }
//           outerRadius={95}
//           dataKey="value"
//         >
//           {pieData.map((entry, index) => (
//             <Cell key={`pie-cell-${index}`} fill={entry.color} />
//           ))}
//         </Pie>
//         <Tooltip />
//       </PieChart>
//     </ResponsiveContainer>
//   ) : (
//     <div className="flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-sky-300 bg-sky-50/60 px-8 py-7 max-w-sm">
//       <AlertTriangle className="w-10 h-10 text-sky-500 mb-3" />

//       <h4 className="text-sm font-semibold text-slate-900">
//         No Attack Data Available
//       </h4>

//       <p className="text-xs text-slate-500 mt-2 leading-relaxed">
//         No vulnerability activity has been detected for this honeypot yet.
//       </p>
//     </div>
//   )}
// </div>
//                 )}
//               </ResponsiveContainer>

//               <div className="mt-4 space-y-2">
//                 {vulnerabilityData.map((vuln, index) => (
//                   <div key={index} className="flex items-center justify-between text-sm">
//                     <div className="flex items-center gap-2">
//                       <span
//                         className="inline-block h-3 w-3 rounded-full"
//                         style={{ backgroundColor: vuln.color }}
//                       />
//                       <span>{vuln.name}</span>
//                     </div>
//                     <Badge variant="outline">{vuln.value} attacks</Badge>
//                   </div>
//                 ))}
//               </div>
//             </Card>

//             <Card className="p-6 bg-card/80 backdrop-blur">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-2">
//                   <Activity className="w-5 h-5 text-primary" />
//                   <h3 className="font-semibold">Attack Comparison</h3>
//                 </div>
//                 <Badge variant="secondary" className="text-xs">
//                   Total: {totalAttacks} attacks
//                 </Badge>
//               </div>

//               <ResponsiveContainer width="100%" height={340}>
//                 <BarChart data={vulnerabilityData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                   <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: "12px" }} />
//                   <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} allowDecimals={false} />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "#fff",
//                       border: "1px solid #e5e7eb",
//                       borderRadius: "8px",
//                     }}
//                   />
//                   <Legend />
//                   <Bar dataKey="value">
//                     {vulnerabilityData.map((entry, index) => (
//                       <Cell key={`bar-cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </Card>

//             <Card className="p-6 lg:col-span-2 bg-card/80 backdrop-blur">
//               <h3 className="font-semibold mb-4">Vulnerability Details</h3>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//                 {vulnerabilityData.map((vuln, index) => (
//                   <div
//                     key={index}
//                     className="p-4 bg-muted/30 rounded-lg border border-border"
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="font-medium text-sm">{vuln.name}</span>
//                       <Badge
//                         variant={vuln.severity === "critical" ? "destructive" : "outline"}
//                         className="text-xs"
//                       >
//                         {vuln.severity}
//                       </Badge>
//                     </div>

//                     <div
//                       className="text-2xl font-semibold"
//                       style={{ color: vuln.color }}
//                     >
//                       {vuln.value}
//                     </div>

//                     <div className="text-xs text-muted-foreground mt-1">
//                       {totalAttacks > 0
//                         ? `${((vuln.value / totalAttacks) * 100).toFixed(1)}% of total`
//                         : "0.0% of total"}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </Card>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

import { DashboardNavbar } from "./DashboardNavbar";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertTriangle, Activity } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { toast } from "sonner";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface VulnerabilitiesPageProps {
  userRole: "admin" | "user";
}

type VulnerabilityItem = {
  name: string;
  value: number;
  severity: "critical" | "high" | "medium" | "low";
  color: string;
};

type SiteItem = {
  _id: string;
  name: string;
  websiteUrl: string;
};

const ATTACK_COLORS: Record<string, string> = {
  "SQL Injection": "#3B82F6",
  XSS: "#F59E0B",
  "Brute Force": "#EAB308",
  "Port Scan": "#84CC16",
  LFI: "#EF4444",
};

const DEFAULT_VULNERABILITY_DATA: VulnerabilityItem[] = [
  {
    name: "SQL Injection",
    value: 0,
    severity: "high",
    color: ATTACK_COLORS["SQL Injection"],
  },
  {
    name: "XSS",
    value: 0,
    severity: "high",
    color: ATTACK_COLORS["XSS"],
  },
  {
    name: "Brute Force",
    value: 0,
    severity: "medium",
    color: ATTACK_COLORS["Brute Force"],
  },
  {
    name: "Port Scan",
    value: 0,
    severity: "low",
    color: ATTACK_COLORS["Port Scan"],
  },
  {
    name: "LFI",
    value: 0,
    severity: "critical",
    color: ATTACK_COLORS["LFI"],
  },
];

export function VulnerabilitiesPage({ userRole }: VulnerabilitiesPageProps) {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [vulnerabilityData, setVulnerabilityData] = useState<
    VulnerabilityItem[]
  >(DEFAULT_VULNERABILITY_DATA);
  const [loading, setLoading] = useState(true);

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
        `/api/stats/vulnerabilities${queryString ? `?${queryString}` : ""}`
      );

      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      const mergedData: VulnerabilityItem[] = DEFAULT_VULNERABILITY_DATA.map(
        (item) => {
          const found = data.find((d: any) => d.name === item.name);

          if (found) {
            return {
              ...item,
              value: Number(found.value || 0),
              severity: found.severity || item.severity,
              color: ATTACK_COLORS[found.name] || item.color,
            };
          }

          return item;
        }
      );

      setVulnerabilityData(mergedData);
    } catch (error) {
      console.error("Failed to load vulnerability stats:", error);
      toast.error("Failed to load vulnerability stats");
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

  const totalAttacks = useMemo(
    () => vulnerabilityData.reduce((sum, v) => sum + v.value, 0),
    [vulnerabilityData]
  );

  const pieData = useMemo(
    () => vulnerabilityData.filter((item) => item.value > 0),
    [vulnerabilityData]
  );

  const selectedSiteLabel =
    selectedSite === "all"
      ? userRole === "admin"
        ? "All Honeypots"
        : "Your Honeypots"
      : sites.find((s) => s._id === selectedSite)?.name || "Selected Honeypot";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
      <DashboardNavbar userRole={userRole} />

      <main className="container mx-auto p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              Attack Vulnerabilities
            </h1>

            <p className="text-muted-foreground">
              {userRole === "admin"
                ? "System-wide vulnerability analysis across all honeypots"
                : "Vulnerability analysis for your honeypots"}
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

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              Loading vulnerability statistics...
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-card/80 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Attack Distribution</h3>
                </div>

                <Badge variant="secondary" className="text-xs">
                  {selectedSiteLabel}
                </Badge>
              </div>

              <div className="h-[340px] w-full flex items-center justify-center">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({
                          name,
                          percent,
                        }: {
                          name?: string;
                          percent?: number;
                        }) =>
                          `${name || "Unknown"}: ${(
                            (percent ?? 0) * 100
                          ).toFixed(0)}%`
                        }
                        outerRadius={95}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`pie-cell-${index}`}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-sky-300 bg-sky-50/70 px-8 py-8 max-w-sm shadow-sm">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 border border-sky-200">
                      <AlertTriangle className="h-8 w-8 text-sky-500" />
                    </div>

                    <h4 className="text-base font-semibold text-slate-900">
                      No Attack Data Available
                    </h4>

                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                      No vulnerability activity has been detected for current honeypot yet.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {vulnerabilityData.map((vuln, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: vuln.color }}
                      />

                      <span>{vuln.name}</span>
                    </div>

                    <Badge variant="outline">{vuln.value} attacks</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-card/80 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Attack Comparison</h3>
                </div>

                <Badge variant="secondary" className="text-xs">
                  Total: {totalAttacks} attacks
                </Badge>
              </div>

              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={vulnerabilityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />

                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                    allowDecimals={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />

                  <Legend />

                  <Bar dataKey="value">
                    {vulnerabilityData.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 lg:col-span-2 bg-card/80 backdrop-blur">
              <h3 className="font-semibold mb-4">Vulnerability Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {vulnerabilityData.map((vuln, index) => (
                  <div
                    key={index}
                    className="p-4 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{vuln.name}</span>

                      <Badge
                        variant={
                          vuln.severity === "critical"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {vuln.severity}
                      </Badge>
                    </div>

                    <div
                      className="text-2xl font-semibold"
                      style={{ color: vuln.color }}
                    >
                      {vuln.value}
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">
                      {totalAttacks > 0
                        ? `${((vuln.value / totalAttacks) * 100).toFixed(
                            1
                          )}% of total`
                        : "0.0% of total"}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
