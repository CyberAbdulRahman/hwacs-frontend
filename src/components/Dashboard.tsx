// import { useState } from "react";
// import { DashboardNavbar } from "./DashboardNavbar";
// import { AdminPanel } from "./AdminPanel";
// import { Card } from "./ui/card";
// import { useNotificationsPolling } from "../utils/useNotificationsPolling";
// import { Button } from "./ui/button";
// //import { Progress } from "./ui/progress";
// import { ScrollArea } from "./ui/scroll-area";
// import { Badge } from "./ui/badge";
// import { toast } from "sonner";
// import {
//   Download,
//   TrendingUp,
//   AlertTriangle,
//   Bell,
//   Shield,
//   Activity,
// } from "lucide-react";
// import {
//   LineChart, 
//   Line,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// export function Dashboard() {
//   const [userRole] = useState<"admin" | "user">("admin"); // Toggle between "admin" and "user"

//   // Admin data - Aggregated from ALL users and ALL honeypots in the system
//   const systemStats = {
//     totalUsers: 47,
//     totalHoneypots: 128,
//     totalWebsites: 63,
//     activeThreats: 24,
//   };

//   const handleDownloadLog = (fileName: string) => {
//     // Mock download - in real app would trigger actual file download
//     toast.success(`Downloading ${fileName}...`);
//     console.log("Downloading system log file:", fileName);
//   };

//   // Aggregated traffic from ALL monitored systems
//   const trafficData = [
//     { time: "00:00", requests: 245 },
//     { time: "04:00", requests: 123 },
//     { time: "08:00", requests: 478 },
//     { time: "12:00", requests: 845 },
//     { time: "16:00", requests: 698 },
//     { time: "20:00", requests: 467 },
//   ];

//   // Aggregated vulnerability data across ALL users' honeypots
//   const vulnerabilityData = [
//     { name: "SQL Injection", value: 142, severity: "high" },
//     { name: "XSS", value: 98, severity: "high" },
//     { name: "Brute Force", value: 215, severity: "medium" },
//     { name: "Port Scan", value: 87, severity: "low" },
//     { name: "LFI", value: 56, severity: "critical" },
//   ];

//   const COLORS = {
//     critical: "#dc2626",
//     high: "#f59e0b",
//     medium: "#eab308",
//     low: "#84cc16",
//   };

//   // System-wide notifications from ALL users and honeypots
//   const notifications = [
//     {
//       id: 1,
//       type: "critical",
//       message: "LFI attack on user@example.com's HP-Web-01",
//       time: "2 min ago",
//       user: "user@example.com",
//     },
//     {
//       id: 2,
//       type: "warning",
//       message: "Failed logins on alice@company.com's HP-SSH-02",
//       time: "15 min ago",
//       user: "alice@company.com",
//     },
//     {
//       id: 3,
//       type: "info",
//       message: "New user registered: bob@startup.io",
//       time: "1 hour ago",
//       user: "System",
//     },
//     {
//       id: 4,
//       type: "critical",
//       message: "SQL Injection on charlie@shop.com's HP-DB-01",
//       time: "2 hours ago",
//       user: "charlie@shop.com",
//     },
//   ];

//   // Aggregated log files from ALL systems and users
//   const logFiles = [
//     {
//       id: 1,
//       name: "system_wide_attacks_2025-11-04.log",
//       size: "18.4 MB",
//       time: "14:30",
//       scope: "All Users",
//     },
//     {
//       id: 2,
//       name: "global_traffic_analysis_2025-11-04.log",
//       size: "42.1 MB",
//       time: "14:30",
//       scope: "All Systems",
//     },
//     {
//       id: 3,
//       name: "user_activity_audit_2025-11-04.log",
//       size: "3.8 MB",
//       time: "14:30",
//       scope: "Admin Audit",
//     },
//     {
//       id: 4,
//       name: "threat_intelligence_feed_2025-11-04.log",
//       size: "12.2 MB",
//       time: "14:30",
//       scope: "Global",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
//       <DashboardNavbar
//         userRole={userRole}
//         notificationCount={4}
//       />

//       <div className="flex">
//         {/* Left Panel - Admin Only */}
//         {userRole === "admin" && (
//           <aside className="w-96 border-r-2 border-primary/20 bg-gradient-to-b from-slate-50 to-blue-50 p-6 h-[calc(100vh-73px)] overflow-y-auto shadow-lg">
//             <div className="mb-6">
//               <div className="flex items-center gap-2 mb-2">
//                 <Shield className="w-6 h-6 text-primary" />
//                 <h2 className="font-semibold text-primary">
//                   Admin Control Panel
//                 </h2>
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 Manage users, honeypots, and system security
//               </p>
//             </div>
//             <AdminPanel />
//           </aside>
//         )}

//         {/* Right Panel - Main Dashboard */}
//         <main
//           className={`flex-1 p-6 ${userRole === "admin" ? "" : "max-w-7xl mx-auto"}`}
//         >
//           <div className="mb-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h2 className="text-muted-foreground">
//                   Admin Dashboard - Global System Overview
//                 </h2>
//                 <p className="text-sm text-muted-foreground mt-1">
//                   Monitoring all users, honeypots, and security
//                   events
//                 </p>
//               </div>
//               <div className="flex gap-3">
//                 <Badge variant="outline" className="gap-2">
//                   <Shield className="w-3 h-3" />
//                   {systemStats.totalUsers} Users
//                 </Badge>
//                 <Badge variant="outline" className="gap-2">
//                   <Activity className="w-3 h-3" />
//                   {systemStats.totalHoneypots} Honeypots
//                 </Badge>
//               </div>
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Vulnerability Analysis */}
//             <Card className="p-6 bg-card/80 backdrop-blur">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-2">
//                   <AlertTriangle className="w-5 h-5 text-primary" />
//                   <h3 className="font-semibold">
//                     Global Attack Vulnerabilities
//                   </h3>
//                 </div>
//                 <Badge variant="secondary" className="text-xs">
//                   All Honeypots
//                 </Badge>
//               </div>
//               <ResponsiveContainer width="100%" height={250}>
//                 <PieChart>
//                   <Pie
//                     data={vulnerabilityData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                    label={({ name, percent }) => {
//   const p = ((percent ?? 0) * 100).toFixed(0);
//   return `${name}: ${p}%`;
// }}
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="value"
//                   >
//                     {vulnerabilityData.map((entry, index) => (
//                       <Cell
//                         key={`cell-${index}`}
//                         fill={
//                           COLORS[
//                             entry.severity as keyof typeof COLORS
//                           ]
//                         }
//                       />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//               <div className="mt-4 space-y-2">
//                 {vulnerabilityData.map((vuln, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between text-sm"
//                   >
//                     <div className="flex items-center gap-2">
//                       <div
//                         className="w-3 h-3 rounded-full"
//                         style={{
//                           backgroundColor:
//                             COLORS[
//                               vuln.severity as keyof typeof COLORS
//                             ],
//                         }}
//                       />
//                       <span>{vuln.name}</span>
//                     </div>
//                     <Badge variant="outline">
//                       {vuln.value} attacks
//                     </Badge>
//                   </div>
//                 ))}
//               </div>
//             </Card>

//             {/* Downloadable Log Files */}
//             <Card className="p-6 bg-card/80 backdrop-blur">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-2">
//                   <Download className="w-5 h-5 text-primary" />
//                   <h3 className="font-semibold">
//                     System-wide Log Files
//                   </h3>
//                 </div>
//                 <Badge variant="secondary" className="text-xs">
//                   Aggregated
//                 </Badge>
//               </div>
//               <ScrollArea className="h-[300px]">
//                 <div className="space-y-3">
//                   {logFiles.map((log) => (
//                     <div
//                       key={log.id}
//                       className="p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
//                     >
//                       <div className="flex items-center justify-between mb-2">
//                         <span className="text-sm font-medium">
//                           {log.name}
//                         </span>
//                         <Button
//                           size="sm"
//                           variant="ghost"
//                           className="h-8 w-8 p-0"
//                           onClick={() =>
//                             handleDownloadLog(log.name)
//                           }
//                         >
//                           <Download className="w-4 h-4" />
//                         </Button>
//                       </div>
//                       <div className="flex items-center gap-4 text-xs text-muted-foreground">
//                         <span>{log.size}</span>
//                         <span>Scope: {log.scope}</span>
//                         <span>•</span>
//                         <span>{log.time}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </ScrollArea>
//             </Card>

//             {/* Traffic Observation */}
//             <Card className="p-6 bg-card/80 backdrop-blur">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-2">
//                   <TrendingUp className="w-5 h-5 text-primary" />
//                   <h3 className="font-semibold">
//                     Global Traffic Observation
//                   </h3>
//                 </div>
//                 <Badge variant="secondary" className="text-xs">
//                   Last 24h - All Systems
//                 </Badge>
//               </div>
//               <div className="mb-4 grid grid-cols-3 gap-4">
//                 <div className="text-center p-3 bg-muted/30 rounded-lg">
//                   <p className="text-xs text-muted-foreground">
//                     Total Requests
//                   </p>
//                   <p className="text-2xl font-semibold text-primary">
//                     2,856
//                   </p>
//                 </div>
//                 <div className="text-center p-3 bg-muted/30 rounded-lg">
//                   <p className="text-xs text-muted-foreground">
//                     Attacks Blocked
//                   </p>
//                   <p className="text-2xl font-semibold text-destructive">
//                     598
//                   </p>
//                 </div>
//                 <div className="text-center p-3 bg-muted/30 rounded-lg">
//                   <p className="text-xs text-muted-foreground">
//                     Legitimate
//                   </p>
//                   <p className="text-2xl font-semibold text-green-600">
//                     2,258
//                   </p>
//                 </div>
//               </div>
//               <ResponsiveContainer width="100%" height={220}>
//                 <LineChart data={trafficData}>
//                   <CartesianGrid
//                     strokeDasharray="3 3"
//                     stroke="#e5e7eb"
//                   />
//                   <XAxis
//                     dataKey="time"
//                     stroke="#6b7280"
//                     style={{ fontSize: "12px" }}
//                   />
//                   <YAxis
//                     stroke="#6b7280"
//                     style={{ fontSize: "12px" }}
//                   />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "#fff",
//                       border: "1px solid #e5e7eb",
//                       borderRadius: "8px",
//                     }}
//                   />
//                   <Legend />
//                   <Line
//                     type="monotone"
//                     dataKey="requests"
//                     stroke="#eab308"
//                     strokeWidth={3}
//                     dot={{ fill: "#eab308", r: 4 }}
//                     activeDot={{ r: 6 }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </Card>

//             {/* Popup Notifications */}
//             <Card className="p-6 bg-card/80 backdrop-blur">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-2">
//                   <Bell className="w-5 h-5 text-primary" />
//                   <h3 className="font-semibold">
//                     System-wide Notifications
//                   </h3>
//                 </div>
//                 <Badge variant="secondary" className="text-xs">
//                   All Users
//                 </Badge>
//               </div>
//               <ScrollArea className="h-[300px]">
//                 <div className="space-y-3">
//                   {notifications.map((notif) => (
//                     <div
//                       key={notif.id}
//                       className={`p-3 rounded-lg border ${
//                         notif.type === "critical"
//                           ? "bg-destructive/10 border-destructive/30"
//                           : notif.type === "warning"
//                             ? "bg-orange-500/10 border-orange-500/30"
//                             : "bg-muted/30 border-border"
//                       }`}
//                     >
//                       <div className="flex items-start gap-2">
//                         <div
//                           className={`mt-1 w-2 h-2 rounded-full ${
//                             notif.type === "critical"
//                               ? "bg-destructive"
//                               : notif.type === "warning"
//                                 ? "bg-orange-500"
//                                 : "bg-primary"
//                           }`}
//                         />
//                         <div className="flex-1">
//                           <p className="text-sm">
//                             {notif.message}
//                           </p>
//                           <div className="flex items-center gap-2 mt-1">
//                             <p className="text-xs text-muted-foreground">
//                               {notif.time}
//                             </p>
//                             {notif.user &&
//                               notif.user !== "System" && (
//                                 <>
//                                   <span className="text-xs text-muted-foreground">
//                                     •
//                                   </span>
//                                   <Badge
//                                     variant="outline"
//                                     className="text-xs h-4 px-1"
//                                   >
//                                     {notif.user}
//                                   </Badge>
//                                 </>
//                               )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </ScrollArea>
//             </Card>

//             {/* Attack Ratio - Full Width */}
//             <Card className="p-6 md:col-span-2 bg-card/80 backdrop-blur">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-2">
//                   <Activity className="w-5 h-5 text-primary" />
//                   <h3 className="font-semibold">
//                     Global Attack Ratio by Type
//                   </h3>
//                 </div>
//                 <Badge variant="secondary" className="text-xs">
//                   Total:{" "}
//                   {vulnerabilityData.reduce(
//                     (sum, v) => sum + v.value,
//                     0,
//                   )}{" "}
//                   attacks detected across all systems
//                 </Badge>
//               </div>
//               {userRole === "admin" && (
//                 <ResponsiveContainer width="100%" height={300}>
//                   <BarChart data={vulnerabilityData}>
//                     <CartesianGrid
//                       strokeDasharray="3 3"
//                       stroke="#e5e7eb"
//                     />
//                     <XAxis
//                       dataKey="name"
//                       stroke="#6b7280"
//                       style={{ fontSize: "12px" }}
//                     />
//                     <YAxis
//                       stroke="#6b7280"
//                       style={{ fontSize: "12px" }}
//                     />
//                     <Tooltip
//                       contentStyle={{
//                         backgroundColor: "#fff",
//                         border: "1px solid #e5e7eb",
//                         borderRadius: "8px",
//                       }}
//                     />
//                     <Legend />
//                     <Bar dataKey="value" fill="#eab308" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </Card>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
// src/components/Dashboard.tsx
import { useState } from "react";
import { DashboardNavbar } from "./DashboardNavbar";
import { AdminPanel } from "./AdminPanel";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
//import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import {
  Download,
  TrendingUp,
  AlertTriangle,
  Bell,
  Shield,
  Activity,
} from "lucide-react";
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

// ✅ ADD THIS IMPORT (make sure path is correct)
import { useNotificationsPolling } from "../utils/useNotificationsPolling";

export function Dashboard() {
  const [userRole] = useState<"admin" | "user">("admin"); // Toggle between "admin" and "user"

  // ✅ LIVE notifications from backend (API Key based)
  const {
    notifications: apiNotifications,
    unreadCount,
    markAllRead,
  } = useNotificationsPolling(2000);

  // Admin data - Aggregated from ALL users and ALL honeypots in the system
  const systemStats = {
    totalUsers: 47,
    totalHoneypots: 128,
    totalWebsites: 63,
    activeThreats: 24,
  };

  const handleDownloadLog = (fileName: string) => {
    // Mock download - in real app would trigger actual file download
    toast.success(`Downloading ${fileName}...`);
    console.log("Downloading system log file:", fileName);
  };

  // Aggregated traffic from ALL monitored systems
  const trafficData = [
    { time: "00:00", requests: 245 },
    { time: "04:00", requests: 123 },
    { time: "08:00", requests: 478 },
    { time: "12:00", requests: 845 },
    { time: "16:00", requests: 698 },
    { time: "20:00", requests: 467 },
  ];

  // Aggregated vulnerability data across ALL users' honeypots
  const vulnerabilityData = [
    { name: "SQL Injection", value: 142, severity: "high" },
    { name: "XSS", value: 98, severity: "high" },
    { name: "Brute Force", value: 215, severity: "medium" },
    { name: "Port Scan", value: 87, severity: "low" },
    { name: "LFI", value: 56, severity: "critical" },
  ];

  const COLORS = {
    critical: "#dc2626",
    high: "#f59e0b",
    medium: "#eab308",
    low: "#84cc16",
  };

  // (Keeping your existing mock notifications card as-is)
  const notifications = [
    {
      id: 1,
      type: "critical",
      message: "LFI attack on user@example.com's HP-Web-01",
      time: "2 min ago",
      user: "user@example.com",
    },
    {
      id: 2,
      type: "warning",
      message: "Failed logins on alice@company.com's HP-SSH-02",
      time: "15 min ago",
      user: "alice@company.com",
    },
    {
      id: 3,
      type: "info",
      message: "New user registered: bob@startup.io",
      time: "1 hour ago",
      user: "System",
    },
    {
      id: 4,
      type: "critical",
      message: "SQL Injection on charlie@shop.com's HP-DB-01",
      time: "2 hours ago",
      user: "charlie@shop.com",
    },
  ];

  // Aggregated log files from ALL systems and users
  const logFiles = [
    {
      id: 1,
      name: "system_wide_attacks_2025-11-04.log",
      size: "18.4 MB",
      time: "14:30",
      scope: "All Users",
    },
    {
      id: 2,
      name: "global_traffic_analysis_2025-11-04.log",
      size: "42.1 MB",
      time: "14:30",
      scope: "All Systems",
    },
    {
      id: 3,
      name: "user_activity_audit_2025-11-04.log",
      size: "3.8 MB",
      time: "14:30",
      scope: "Admin Audit",
    },
    {
      id: 4,
      name: "threat_intelligence_feed_2025-11-04.log",
      size: "12.2 MB",
      time: "14:30",
      scope: "Global",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
      {/* ✅ Navbar will now show real API notifications */}
      <DashboardNavbar
        userRole={userRole}
        notificationCount={unreadCount}
        notifications={apiNotifications}
        onMarkAllRead={markAllRead}
      />

      <div className="flex">
        {/* Left Panel - Admin Only */}
        {userRole === "admin" && (
          <aside className="w-96 border-r-2 border-primary/20 bg-gradient-to-b from-slate-50 to-blue-50 p-6 h-[calc(100vh-73px)] overflow-y-auto shadow-lg">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="font-semibold text-primary">
                  Admin Control Panel
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Manage users, honeypots, and system security
              </p>
            </div>
            <AdminPanel />
          </aside>
        )}

        {/* Right Panel - Main Dashboard */}
        <main
          className={`flex-1 p-6 ${userRole === "admin" ? "" : "max-w-7xl mx-auto"}`}
        >
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-muted-foreground">
                  Admin Dashboard - Global System Overview
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Monitoring all users, honeypots, and security events
                </p>
              </div>
              <div className="flex gap-3">
                <Badge variant="outline" className="gap-2">
                  <Shield className="w-3 h-3" />
                  {systemStats.totalUsers} Users
                </Badge>
                <Badge variant="outline" className="gap-2">
                  <Activity className="w-3 h-3" />
                  {systemStats.totalHoneypots} Honeypots
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vulnerability Analysis */}
            <Card className="p-6 bg-card/80 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">
                    Global Attack Vulnerabilities
                  </h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  All Honeypots
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={vulnerabilityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      const p = ((percent ?? 0) * 100).toFixed(0);
                      return `${name}: ${p}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {vulnerabilityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.severity as keyof typeof COLORS]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {vulnerabilityData.map((vuln, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            COLORS[vuln.severity as keyof typeof COLORS],
                        }}
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
                  <h3 className="font-semibold">System-wide Log Files</h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Aggregated
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
                        <span>Scope: {log.scope}</span>
                        <span>•</span>
                        <span>{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Traffic Observation */}
            <Card className="p-6 bg-card/80 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Global Traffic Observation</h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Last 24h - All Systems
                </Badge>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-semibold text-primary">2,856</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Attacks Blocked</p>
                  <p className="text-2xl font-semibold text-destructive">598</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Legitimate</p>
                  <p className="text-2xl font-semibold text-green-600">2,258</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="time"
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
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

            {/* Popup Notifications (Mock card - unchanged) */}
            <Card className="p-6 bg-card/80 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">System-wide Notifications</h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  All Users
                </Badge>
              </div>

              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {notifications.map((notif) => (
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
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {notif.time}
                            </p>
                            {notif.user && notif.user !== "System" && (
                              <>
                                <span className="text-xs text-muted-foreground">
                                  •
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-xs h-4 px-1"
                                >
                                  {notif.user}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Attack Ratio - Full Width */}
            <Card className="p-6 md:col-span-2 bg-card/80 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Global Attack Ratio by Type</h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Total:{" "}
                  {vulnerabilityData.reduce((sum, v) => sum + v.value, 0)} attacks
                  detected across all systems
                </Badge>
              </div>

              {userRole === "admin" && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vulnerabilityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      stroke="#6b7280"
                      style={{ fontSize: "12px" }}
                    />
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
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

