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
