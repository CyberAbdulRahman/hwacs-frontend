import { DashboardNavbar } from "./DashboardNavbar";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Download, FileText, Search, Brain } from "lucide-react";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useSearchParams } from "react-router-dom";

interface LogFilesPageProps {
  userRole: "admin" | "user";
}

type AttackLog = {
  _id: string;
  honeypot?: string;
  url?: string;
  method?: string;
  payload?: string;
  ip?: string;
  user_agent?: string | null;
  created_at?: string;
  attack_type?: string;
  subtype?: string;
  severity?: string;
  confidence?: number | string;
};

export function LogFilesPage({ userRole }: LogFilesPageProps) {
  const [searchParams] = useSearchParams();
  const selectedSite = searchParams.get("site") || "";
  const selectedUrl = searchParams.get("url") || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<AttackLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("limit", "100");

      if (selectedSite) {
        params.set("honeypot", selectedSite);
      }

      if (selectedUrl) {
        params.set("base_url", selectedUrl);
      }

      const res = await api.get(`/api/attacks?${params.toString()}`);
      const items = Array.isArray(res.data?.attacks) ? res.data.attacks : [];
      setLogs(items);
    } catch (error) {
      console.error("Failed to load logs:", error);
      toast.error("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedSite, selectedUrl]);

  const handleDownloadLog = (log: AttackLog) => {
    const content = [
      `Honeypot: ${log.honeypot || "-"}`,
      `URL: ${log.url || "-"}`,
      `Method: ${log.method || "-"}`,
      `IP: ${log.ip || "-"}`,
      `Attack Type: ${log.attack_type || "-"}`,
      `Subtype: ${log.subtype || "-"}`,
      `Severity: ${log.severity || "-"}`,
      `Confidence: ${log.confidence ?? "-"}`,
      `Payload: ${log.payload || "-"}`,
      `Created At: ${log.created_at || "-"}`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${log.honeypot || "honeypot"}_${log.method || "request"}_${log._id}.log`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Log downloaded");
  };

  const handleDownloadPdfReport = async (log: AttackLog) => {
    try {
      setDownloadingReportId(log._id);

      const res = await api.post(
        `/api/attacks/${log._id}/generate-report`,
        { format: "pdf" },
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `HWACS_Report_${log.honeypot || "honeypot"}_${log.attack_type || "attack"}_${log._id}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
      toast.success("PDF report downloaded");
    } catch (error) {
      console.error("Failed to generate PDF report:", error);
      toast.error("Failed to generate PDF report");
    } finally {
      setDownloadingReportId(null);
    }
  };

  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;

    const q = searchTerm.toLowerCase();

    return logs.filter((log) => {
      const haystack =
        `${log.honeypot || ""} ${log.method || ""} ${log.url || ""} ${log.payload || ""} ${log.ip || ""} ${log.attack_type || ""} ${log.subtype || ""} ${log.severity || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [logs, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
      <DashboardNavbar userRole={userRole} />

      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Log Files</h1>
          <p className="text-muted-foreground">
            {selectedSite
              ? `Showing logs for ${selectedSite}`
              : userRole === "admin"
              ? "Review system-wide captured attack logs"
              : "Review your captured honeypot attack logs"}
          </p>
        </div>

        {selectedSite && (
          <Card className="p-4 mb-6 bg-card/80 backdrop-blur">
            <div className="space-y-1 text-sm">
              <p>
                <strong>Selected Website:</strong> {selectedSite}
              </p>
              {selectedUrl && (
                <p className="break-all">
                  <strong>Base URL:</strong> {selectedUrl}
                </p>
              )}
            </div>
          </Card>
        )}

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
            <Input
              type="text"
              placeholder="Search logs..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Loading logs...</p>
          </Card>
        ) : filteredLogs.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No captured logs found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredLogs.map((log) => {
              const isSuspicious =
                log.attack_type &&
                log.attack_type !== "Normal" &&
                log.attack_type !== "Unknown";

              return (
                <Card
                  key={log._id}
                  className="p-4 bg-card/80 backdrop-blur hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-medium truncate">
                          {log.honeypot || "Unknown Honeypot"} - {log.method || "REQUEST"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                        <span>
                          {log.created_at ? new Date(log.created_at).toLocaleString() : "-"}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {log.method || "Unknown"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <p className="font-medium">Attack Type</p>
                          <p className="text-muted-foreground">{log.attack_type || "-"}</p>
                        </div>

                        <div>
                          <p className="font-medium">Severity</p>
                          <p className="text-muted-foreground">{log.severity || "-"}</p>
                        </div>

                        <div>
                          <p className="font-medium">Subtype</p>
                          <p className="text-muted-foreground">{log.subtype || "-"}</p>
                        </div>

                        <div>
                          <p className="font-medium">Confidence</p>
                          <p className="text-muted-foreground">
                            {log.confidence !== undefined && log.confidence !== null
                              ? String(log.confidence)
                              : "-"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium">URL</p>
                          <p className="break-all text-muted-foreground">{log.url || "-"}</p>
                        </div>

                        <div>
                          <p className="font-medium">IP</p>
                          <p className="text-muted-foreground">{log.ip || "-"}</p>
                        </div>

                        <div>
                          <p className="font-medium">Payload</p>
                          <div className="mt-1 rounded-md bg-muted/60 p-2 max-h-28 overflow-y-auto overflow-x-hidden">
                            <p className="whitespace-pre-wrap break-words text-muted-foreground">
                              {log.payload || "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleDownloadLog(log)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Log
                      </Button>

                      {isSuspicious && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPdfReport(log)}
                          disabled={downloadingReportId === log._id}
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          {downloadingReportId === log._id ? "Generating..." : "PDF Report"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
