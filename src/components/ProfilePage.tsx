import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardNavbar } from "./DashboardNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { User, Mail, Key, Shield, Activity, Download } from "lucide-react";
import { toast } from "sonner";
import { getUserInfo } from "../utils/auth";
import { api } from "../utils/api";

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  status: "success" | "warning" | "error";
}

type LoggedInUser = {
  name?: string;
  email?: string;
  phone?: string;
};

export function ProfilePage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);

  const [showPasswordOtp, setShowPasswordOtp] = useState(false);
  const [passwordOtp, setPasswordOtp] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const loggedInUser = getUserInfo() as LoggedInUser | null;

  const [userInfo, setUserInfo] = useState({
    name: loggedInUser?.name ?? "User",
    email: loggedInUser?.email ?? "user@example.com",
    phone: loggedInUser?.phone ?? "",
    apiKey: "hwacs_sk_1a2b3c4d5e6f7g8h9i0j",
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const phoneRegex = /^\d{11}$/;
  const sanitizePhone = (v: string) => v.replace(/\D/g, "").slice(0, 11);

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab && ["info", "security", "activity"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    loadProfile();
    loadActivityLogs();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/api/profile");

      setUserInfo((prev) => ({
        ...prev,
        name: res.data?.name ?? prev.name,
        email: res.data?.email ?? prev.email,
        phone: res.data?.phone ?? prev.phone,
      }));
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const loadActivityLogs = async () => {
    try {
      setActivityLoading(true);

      const res = await api.get("/api/profile/activity-logs");

      const logs = Array.isArray(res.data?.logs)
        ? res.data.logs.map((log: any) => ({
            id: log._id,
            action: log.action,
            timestamp: log.timestamp,
            status: log.status || "success",
          }))
        : [];

      setActivityLogs(logs);
    } catch (error) {
      console.error("Failed to load activity logs:", error);
      toast.error("Failed to load activity logs.");
    } finally {
      setActivityLoading(false);
    }
  };

  const handleSave = async () => {
    const phone = (userInfo.phone || "").trim();

    if (!phoneRegex.test(phone)) {
      return toast.error("Phone number must be exactly 11 digits.");
    }

    try {
      await api.patch("/api/profile", {
        phone,
      });

      setIsEditing(false);
      toast.success("Profile updated successfully!");
      await loadActivityLogs();
    } catch (error: any) {
      console.error("Profile update failed:", error);
      toast.error(error?.response?.data?.error || "Failed to update profile.");
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(userInfo.apiKey);
    toast.success("API Key copied to clipboard!");
  };

  const downloadActivityLog = () => {
    if (activityLogs.length === 0) {
      return toast.error("No activity logs to download.");
    }

    const logData = activityLogs
      .map(
        (log) =>
          `${new Date(log.timestamp).toLocaleString()} - ${log.action} [${log.status}]`
      )
      .join("\n");

    const blob = new Blob([logData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "activity_log.txt";
    a.click();

    URL.revokeObjectURL(url);

    toast.success("Activity log downloaded!");
  };

  const validateStrongPassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/\d/.test(password)) {
      return "Password must contain at least one number.";
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`]/.test(password)) {
      return "Password must contain at least one special character.";
    }

    return "";
  };

  const handlePasswordChange = async () => {
    if (!passwordData.current.trim()) {
      return toast.error("Please enter your current password.");
    }

    if (!passwordData.new.trim()) {
      return toast.error("Please enter your new password.");
    }

    if (!passwordData.confirm.trim()) {
      return toast.error("Please confirm your new password.");
    }

    if (passwordData.new !== passwordData.confirm) {
      return toast.error("New password and confirm password do not match.");
    }

    if (passwordData.current === passwordData.new) {
      return toast.error("New password cannot be the same as current password.");
    }

    const passwordError = validateStrongPassword(passwordData.new);

    if (passwordError) {
      return toast.error(passwordError);
    }

    try {
      setPasswordLoading(true);

      await api.post("/api/profile/password/request-otp", {
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
        confirmPassword: passwordData.confirm,
      });

      toast.success("OTP sent to your email.");
      setShowPasswordOtp(true);
    } catch (error: any) {
      console.error("Password OTP request failed:", error);
      toast.error(error?.response?.data?.error || "Failed to send OTP.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleVerifyPasswordOtp = async () => {
    if (!passwordOtp.trim()) {
      return toast.error("Please enter OTP.");
    }

    try {
      setPasswordLoading(true);

      await api.post("/api/profile/password/verify-otp", {
        otp: passwordOtp,
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
        confirmPassword: passwordData.confirm,
      });

      toast.success("Password updated successfully.");

      setPasswordData({
        current: "",
        new: "",
        confirm: "",
      });

      setPasswordOtp("");
      setShowPasswordOtp(false);

      await loadActivityLogs();
    } catch (error: any) {
      console.error("Password update failed:", error);
      toast.error(error?.response?.data?.error || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-100">
      <DashboardNavbar userRole="user" notificationCount={3} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border-4 border-primary/30">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {userInfo.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h1 className="text-3xl mb-2 text-foreground">{userInfo.name}</h1>

                    <div className="flex items-center gap-3 text-muted-foreground mb-2">
                      <Mail className="w-4 h-4" />
                      <span>{userInfo.email}</span>
                    </div>

                    <Badge variant="outline" className="gap-1">
                      <Shield className="w-3 h-3" />
                      User Account
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border-2 border-primary/20 rounded-lg p-1 gap-1">
              {[
                { value: "info", label: "Personal Info", icon: User },
                { value: "security", label: "Security", icon: Shield },
                { value: "activity", label: "Activity Log", icon: Activity },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setActiveTab(value)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm transition-all duration-200 ${
                    activeTab === value
                      ? "bg-primary text-white font-extrabold shadow-md"
                      : "text-blue-600 font-bold hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            <TabsContent value="info">
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Manage your personal details and contact information
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={userInfo.name}
                        disabled={true}
                        className="bg-white border-primary/20"
                      />
                      <p className="text-xs text-muted-foreground">
                        Full name is fixed for account identity.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userInfo.email}
                        disabled={true}
                        className="bg-white border-primary/20"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={userInfo.phone}
                        onChange={(e) =>
                          setUserInfo({
                            ...userInfo,
                            phone: sanitizePhone(e.target.value),
                          })
                        }
                        disabled={!isEditing}
                        className="bg-white border-primary/20"
                        placeholder="03001234567"
                      />

                      {isEditing && userInfo.phone && !phoneRegex.test(userInfo.phone.trim()) ? (
                        <p className="text-xs text-destructive">
                          Phone number must be exactly 11 digits.
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Phone number must be exactly 11 digits.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-primary" />
                      Change Password
                    </CardTitle>
                    <CardDescription>
                      Update your password using OTP verification
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        className="bg-white border-primary/20"
                        value={passwordData.current}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            current: e.target.value,
                          })
                        }
                        disabled={passwordLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        className="bg-white border-primary/20"
                        value={passwordData.new}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new: e.target.value,
                          })
                        }
                        disabled={passwordLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        className="bg-white border-primary/20"
                        value={passwordData.confirm}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirm: e.target.value,
                          })
                        }
                        disabled={passwordLoading}
                      />
                    </div>

                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={handlePasswordChange}
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? "Sending OTP..." : "Update Password"}
                    </Button>

                    {showPasswordOtp && (
                      <div className="mt-4 space-y-3 rounded-lg border border-primary/20 bg-white/70 p-4">
                        <div className="space-y-2">
                          <Label htmlFor="passwordOtp">Enter OTP</Label>
                          <Input
                            id="passwordOtp"
                            value={passwordOtp}
                            onChange={(e) =>
                              setPasswordOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                            }
                            placeholder="Enter OTP sent to your email"
                            className="bg-white border-primary/20"
                            disabled={passwordLoading}
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter the OTP sent to your registered email.
                          </p>
                        </div>

                        <Button
                          onClick={handleVerifyPasswordOtp}
                          disabled={passwordLoading}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {passwordLoading ? "Verifying..." : "Verify OTP & Update Password"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      API Key Management
                    </CardTitle>
                    <CardDescription>
                      Your API key for integrating with HWACS honeypots
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          value={userInfo.apiKey}
                          readOnly
                          className="bg-white border-primary/20 font-mono"
                        />
                        <Button onClick={copyApiKey} variant="outline">
                          Copy
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Keep this key secure. Never share it publicly.
                      </p>
                    </div>

                    <Button variant="destructive">Regenerate API Key</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription>
                        Your account activity and login history
                      </CardDescription>
                    </div>

                    <Button onClick={downloadActivityLog} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download Log
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {activityLoading ? (
                      <p className="text-sm text-muted-foreground">
                        Loading activity logs...
                      </p>
                    ) : activityLogs.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No activity logs found.
                      </p>
                    ) : (
                      activityLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-primary/10 bg-white/60"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                log.status === "success"
                                  ? "bg-green-500"
                                  : log.status === "warning"
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                              }`}
                            />

                            <div>
                              <p className="text-foreground">{log.action}</p>
                              <p className="text-sm text-muted-foreground">
                                {log.timestamp
                                  ? new Date(log.timestamp).toLocaleString()
                                  : "No timestamp"}
                              </p>
                            </div>
                          </div>

                          <Badge variant={log.status === "error" ? "destructive" : "outline"}>
                            {log.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
