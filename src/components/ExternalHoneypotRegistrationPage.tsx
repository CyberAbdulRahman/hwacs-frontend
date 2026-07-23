// // ExternalHoneyPotRegistrationPage.tsx
// import { Trash2 } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { DashboardNavbar } from "./DashboardNavbar";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
// import { Button } from "./ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// import { Badge } from "./ui/badge";
// import { Shield, CheckCircle2, Copy, ExternalLink, AlertCircle, Clock, Globe, Eye, Activity } from "lucide-react";
// import { Alert, AlertDescription } from "./ui/alert";
// import { toast } from "sonner";
// import { api } from "../utils/api";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "./ui/dialog";

// interface ExternalHoneypotRegistrationPageProps {
//   userRole: "admin" | "user";
// }

// type Site = {
//   _id?: string;
//   name: string;
//   websiteUrl: string;
//   verificationMethod: "html_meta" | "dns_txt" | "file_upload" | "api_key";
//   status?: "active" | "inactive";
//   apiKey?: string;
//   created_at?: string;
//   last_activity?: string;
//   attacks_today?: number;
// };

// export function ExternalHoneypotRegistrationPage({ userRole }: ExternalHoneypotRegistrationPageProps) {
//   const [websiteUrl, setWebsiteUrl] = useState("");
//   const [honeypotName, setHoneypotName] = useState("");
//   const [verificationMethod, setVerificationMethod] = useState<Site["verificationMethod"] | "">("");

//   const [showVerificationCode, setShowVerificationCode] = useState(false);
//   const [verificationCode, setVerificationCode] = useState<string>("");

//   const [loading, setLoading] = useState(false);
//   const [registeredHoneypots, setRegisteredHoneypots] = useState<Site[]>([]);
//   const navigate = useNavigate();

//   // ✅ Always read token fresh (no memo freeze)
//   const getToken = () => localStorage.getItem("token") || "";

//   const loadMySites = async () => {
//     const token = getToken();
//     if (!token) {
//       // don't toast too aggressively, user might open page without login
//       return;
//     }

//     try {
//       const res = await api.get("/api/sites/my", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const list: Site[] = Array.isArray(res.data) ? res.data : res.data?.sites || [];
//       setRegisteredHoneypots(list);
//     } catch (e: any) {
//       const msg = e?.response?.data?.error || "Failed to load your registered honeypots.";
//       toast.error(msg);
//     }
//   };

//   useEffect(() => {
//     loadMySites();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleRegister = async () => {
//     if (!websiteUrl || !honeypotName || !verificationMethod) {
//       toast.error("Please fill in all fields");
//       return;
//     }

//     const token = getToken();
//     if (!token) {
//       toast.error("Token missing. Please login again.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const res = await api.post(
//         "/api/sites",
//         {
//           websiteUrl,
//           name: honeypotName,
//           verificationMethod, // ✅ direct backend value
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const created: any = res.data?.site || res.data;

//       const apiKeyFromBackend = created?.apiKey || created?.api_key || res.data?.apiKey;
//       const verifyCode = created?.verificationCode || created?.verification_code;

//       // ✅ show correct code
//       if (verificationMethod === "api_key") {
//         setVerificationCode(apiKeyFromBackend || "API key not returned (check backend response)");
//       } else {
//         setVerificationCode(verifyCode || "Verification code not returned (check backend response)");
//       }

//       setShowVerificationCode(true);
//       toast.success("Honeypot registered ✅");

//       await loadMySites();

//       // clear form
//       setWebsiteUrl("");
//       setHoneypotName("");
//       // keep method selected (optional)
//     } catch (e: any) {
//       const msg = e?.response?.data?.error || "Register failed.";
//       toast.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyVerificationCode = () => {
//     navigator.clipboard.writeText(verificationCode);
//     toast.success("Copied!");
//   };

//   const verificationHint = () => {
//     if (verificationMethod === "html_meta") return "Add the following meta tag to your website's <head> section:";
//     if (verificationMethod === "dns_txt") return "Add the following TXT record to your domain's DNS settings:";
//     if (verificationMethod === "file_upload") return "Create a file named 'hwacs-verify.txt' in your website root with this code:";
//     return "Use this API key in your HWACS integration:";
//   };

//   const verificationSnippet = () => {
//     if (verificationMethod === "html_meta") {
//       return `<meta name="hwacs-verification" content="${verificationCode}" />`;
//     }
//     if (verificationMethod === "dns_txt") {
//       return `hwacs-verification=${verificationCode}`;
//     }
//     return verificationCode;
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <DashboardNavbar userRole={userRole} />

//       <div className="container mx-auto px-6 py-8">
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-2">
//             <Shield className="w-10 h-10 text-primary" />
//             <h1 className="text-3xl">External Honeypot Registration</h1>
//           </div>
//           <p className="text-muted-foreground">
//             Register your external website as a honeypot to capture and analyze attack logs in real-time
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Registration Form */}
//           <div className="space-y-6">
//             <Card className="border-2 border-primary/20">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Shield className="w-5 h-5 text-primary" />
//                   Register New Honeypot
//                 </CardTitle>
//                 <CardDescription>Connect your external website to HWACS monitoring system</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="websiteUrl">Website URL</Label>
//                   <Input
//                     id="websiteUrl"
//                     type="url"
//                     placeholder="http://localhost/dvwa/"
//                     value={websiteUrl}
//                     onChange={(e) => setWebsiteUrl(e.target.value)}
//                     className="border-2 border-border"
//                   />
//                   <p className="text-sm text-muted-foreground">Enter the full URL of the website you want to monitor</p>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="honeypotName">Honeypot Name</Label>
//                   <Input
//                     id="honeypotName"
//                     type="text"
//                     placeholder="DVWA (Local)"
//                     value={honeypotName}
//                     onChange={(e) => setHoneypotName(e.target.value)}
//                     className="border-2 border-border"
//                   />
//                   <p className="text-sm text-muted-foreground">Choose a descriptive name for easy identification</p>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="verificationMethod">Verification Method</Label>
//                   <Select value={verificationMethod} onValueChange={(val) => setVerificationMethod(val as any)}>
//                     <SelectTrigger className="border-2 border-border">
//                       <SelectValue placeholder="Select verification method" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="html_meta">HTML Meta Tag</SelectItem>
//                       <SelectItem value="dns_txt">DNS TXT Record</SelectItem>
//                       <SelectItem value="file_upload">File Upload</SelectItem>
//                       <SelectItem value="api_key">API Key Integration</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <p className="text-sm text-muted-foreground">Choose how you want to verify ownership of your website</p>
//                 </div>

//                 <Button onClick={handleRegister} className="w-full" disabled={!websiteUrl || !honeypotName || !verificationMethod || loading}>
//                   {loading ? "Registering..." : "Generate Verification Code"}
//                 </Button>
//               </CardContent>
//             </Card>

//             {showVerificationCode && (
//               <Card className="border-2 border-primary/20">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <CheckCircle2 className="w-5 h-5 text-green-500" />
//                     Verification Code Generated
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <Alert className="bg-primary/5 border-primary/20">
//                     <AlertCircle className="h-4 w-4 text-primary" />
//                     <AlertDescription>{verificationHint()}</AlertDescription>
//                   </Alert>

//                   <div className="bg-muted/50 p-4 rounded-lg border-2 border-border">
//                     <div className="flex items-center justify-between mb-2">
//                       <code className="text-sm">{verificationSnippet()}</code>
//                       <Button variant="ghost" size="sm" onClick={copyVerificationCode}>
//                         <Copy className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   </div>

//                   <div className="space-y-3">
//                     <h4>Next Steps:</h4>
//                     <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
//                       <li>Add the verification code to your website</li>
//                       <li>For local DVWA: choose API Key Integration (easy)</li>
//                       <li>Start sending logs to HWACS backend</li>
//                       <li>View attacks in logs dashboard</li>
//                     </ol>
//                   </div>

//                   <div className="flex gap-3">
//                     <Button className="flex-1" onClick={() => toast.info("Verification button will be wired later ✅")}>
//                       Verify Ownership
//                     </Button>
//                     <Button variant="outline" className="flex items-center gap-2" onClick={() => toast.info("Docs later ✅")}>
//                       <ExternalLink className="w-4 h-4" />
//                       Documentation
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}
//           </div>

//           {/* Your Registered Honeypots */}
//           <div>
//             <Card className="border-2 border-primary/20">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Globe className="w-5 h-5 text-primary" />
//                   Your Registered Honeypots
//                 </CardTitle>
//                 <CardDescription>Manage and monitor your external honeypot deployments</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   {registeredHoneypots.map((honeypot, idx) => (
//                     <div
//                       key={honeypot._id || `${honeypot.websiteUrl}-${idx}`}
//                       className="p-4 rounded-lg bg-card border border-border hover:border-primary/40 transition-all hover:shadow-sm"
//                     >
//                       <div className="flex items-start justify-between gap-4">
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-2 mb-2">
//                             <Shield className="w-4 h-4 text-primary flex-shrink-0" />
//                             <h4 className="truncate">{honeypot.name}</h4>
//                           </div>

//                           <div className="flex items-center gap-2 mb-2">
//                             <Globe className="w-3 h-3 text-muted-foreground flex-shrink-0" />
//                             <p className="text-sm text-muted-foreground truncate">{honeypot.websiteUrl}</p>
//                           </div>

//                           <div className="flex items-center gap-4 text-sm">
//                             <div className="flex items-center gap-1.5">
//                               <Clock className="w-3 h-3 text-muted-foreground" />
//                               <span className="text-muted-foreground">{honeypot.last_activity || "—"}</span>
//                             </div>
//                             <div className="flex items-center gap-1.5">
//                               <Activity className="w-3 h-3 text-muted-foreground" />
//                               <span className="text-muted-foreground">{honeypot.attacks_today ?? 0} attacks today</span>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="flex flex-col items-end gap-2">
//                           <Badge
//                             variant={honeypot.status === "active" ? "default" : "secondary"}
//                             className={honeypot.status === "active" ? "bg-green-500" : ""}
//                           >
//                             {honeypot.status === "active" ? (
//                               <span className="flex items-center gap-1">
//                                 <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
//                                 Active
//                               </span>
//                             ) : (
//                               "Inactive"
//                             )}
//                           </Badge>

//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="flex items-center gap-1.5"
//                           onClick={() =>
//   navigate(
//     `/user-logs?site=${encodeURIComponent(honeypot.name)}&url=${encodeURIComponent(
//       honeypot.websiteUrl
//     )}`
//   )
// }
//                           >
//                             <Eye className="w-3 h-3" />
//                             View Logs
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}

//                   {registeredHoneypots.length === 0 && (
//                     <div className="text-center py-12">
//                       <Globe className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
//                       <p className="text-muted-foreground">
//                         No honeypots registered yet. Register your first honeypot using the form.
//                       </p>
//                       <Button variant="outline" className="mt-4" onClick={loadMySites}>
//                         Refresh
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardNavbar } from "./DashboardNavbar";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { api } from "../utils/api";
import { toast } from "sonner";
import {
  Shield,
  Globe,
  Eye,
  Copy,
  Trash2,
  CheckCircle2,
  Activity,
  Clock,
} from "lucide-react";

interface ExternalHoneypotRegistrationPageProps {
  userRole: "admin" | "user";
}

type SiteItem = {
  _id: string;
  name: string;
  websiteUrl: string;
  verificationMethod?: string;
  apiKey?: string;
  status?: "active" | "inactive";
  created_at?: string;
  attacks_today?: number;
  last_activity?: string | null;
};

export function ExternalHoneypotRegistrationPage({
  userRole,
}: ExternalHoneypotRegistrationPageProps) {
  const navigate = useNavigate();

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [name, setName] = useState("");
  const [verificationMethod, setVerificationMethod] = useState("api_key");

  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [creating, setCreating] = useState(false);

  const [generatedSite, setGeneratedSite] = useState<SiteItem | null>(null);
  const [generatedApiKey, setGeneratedApiKey] = useState("");

  const [siteToDelete, setSiteToDelete] = useState<SiteItem | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);

  const loadMySites = async () => {
    try {
      setLoadingSites(true);
      const res = await api.get("/api/sites/my");
      const list = Array.isArray(res.data?.sites) ? res.data.sites : [];
      setSites(list);
    } catch (error) {
      console.error("Failed to load sites:", error);
      toast.error("Failed to load registered honeypots");
    } finally {
      setLoadingSites(false);
    }
  };

  useEffect(() => {
    loadMySites();
  }, []);

  const handleGenerateVerificationCode = async () => {
    if (!websiteUrl.trim() || !name.trim()) {
      toast.error("Website URL and Honeypot Name are required");
      return;
    }

    try {
      setCreating(true);

      const res = await api.post("/api/sites", {
        websiteUrl: websiteUrl.trim(),
        name: name.trim(),
        verificationMethod,
      });

      const site = res.data?.site;
      if (!site) {
        toast.error("Invalid response from server");
        return;
      }

      setGeneratedSite(site);
      setGeneratedApiKey(site.apiKey || "");
      toast.success("Verification code generated successfully");

      await loadMySites();
    } catch (error: any) {
      console.error("Failed to create site:", error);
      toast.error(error?.response?.data?.error || "Failed to register honeypot");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyApiKey = async () => {
    if (!generatedApiKey) return;

    try {
      await navigator.clipboard.writeText(generatedApiKey);
      toast.success("API key copied");
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy API key");
    }
  };

  const handleViewLogs = (site: SiteItem) => {
    const params = new URLSearchParams();
    params.set("site", site.name);
    params.set("url", site.websiteUrl);
    navigate(`/${userRole}-logs?${params.toString()}`);
  };

  const handleOpenDeleteDialog = (site: SiteItem) => {
    setSiteToDelete(site);
    setShowDeleteDialog(true);
  };

  const handleDeleteSite = async () => {
    if (!siteToDelete?._id) return;

    try {
      setDeletingSiteId(siteToDelete._id);

      await api.delete(`/api/sites/${siteToDelete._id}`);

      toast.success(`${siteToDelete.name || "Honeypot"} deleted successfully`);

      if (generatedSite?._id === siteToDelete._id) {
        setGeneratedSite(null);
        setGeneratedApiKey("");
      }

      setShowDeleteDialog(false);
      setSiteToDelete(null);

      await loadMySites();
    } catch (error: any) {
      console.error("Failed to delete site:", error);
      toast.error(error?.response?.data?.error || "Failed to delete honeypot");
    } finally {
      setDeletingSiteId(null);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
        <DashboardNavbar userRole={userRole} />

        <main className="container mx-auto p-6 max-w-7xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-semibold text-foreground">
                External Honeypot Registration
              </h1>
            </div>
            <p className="text-muted-foreground">
              Register your external website as a honeypot to capture and analyze attack logs in real-time
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Form */}
            <Card className="p-6 bg-card/80 backdrop-blur">
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Register New Honeypot</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect your external website to HWACS monitoring system
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    placeholder="http://example.com/home/"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the full URL of the website you want to monitor
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="honeypotName">Honeypot Name</Label>
                  <Input
                    id="honeypotName"
                    placeholder="e.g Steam , Clifter"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose a descriptive name for easy identification
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Verification Method</Label>
                  <Select value={verificationMethod} onValueChange={setVerificationMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select verification method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api_key">API Key Integration</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose how you want to verify ownership of your website
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerateVerificationCode}
                  disabled={creating}
                >
                  {creating ? "Generating..." : "Generate Verification Code"}
                </Button>
              </div>
            </Card>

            {/* Right side - Registered honeypots */}
            <Card className="p-6 bg-card/80 backdrop-blur">
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Your Registered Honeypots</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Manage and monitor your external honeypot deployments
                </p>
              </div>

              {loadingSites ? (
                <div className="py-10 text-center text-muted-foreground">
                  Loading honeypots...
                </div>
              ) : sites.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  No honeypots registered yet. Register your first honeypot using the form.
                </div>
              ) : (
                <div className="space-y-4">
                  {sites.map((site) => (
                    <div
                      key={site._id}
                      className="rounded-xl border border-border bg-background/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold truncate">{site.name}</h3>
                            <span
                              className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${
                                site.status === "active"
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-300 text-black"
                              }`}
                            >
                              {site.status === "active" ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground break-all mb-2">
                            {site.websiteUrl}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {site.last_activity || "—"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {site.attacks_today || 0} attacks today
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDeleteDialog(site)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewLogs(site)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Logs
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Generated API key block */}
          {generatedSite && generatedApiKey && (
            <Card className="p-6 bg-card/80 backdrop-blur mt-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Verification Code Generated</h3>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                  Use this API key in your HWACS integration:
                </div>

                <div className="flex items-center gap-2 rounded-lg border bg-background p-4">
                  <div className="flex-1 break-all font-mono text-sm">{generatedApiKey}</div>
                  <Button size="icon" variant="outline" onClick={handleCopyApiKey}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Next Steps:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Add the verification code to your website</li>
                    <li>Use API Key Integration in your collector</li>
                    <li>Start sending logs to HWACS backend</li>
                    <li>View attacks in logs dashboard</li>
                  </ol>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1">Verify Ownership</Button>
                  <Button variant="outline">Documentation</Button>
                </div>
              </div>
            </Card>
          )}
        </main>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Honeypot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{siteToDelete?.name || "this honeypot"}</strong>?
              <br />
              This will also remove its related attacks and notifications.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSiteToDelete(null);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteSite}
              disabled={deletingSiteId === siteToDelete?._id}
            >
              {deletingSiteId === siteToDelete?._id ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
