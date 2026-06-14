// src/components/AdminProfilePage.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardNavbar } from "./DashboardNavbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import {
  User,
  Mail,
  Key,
  Shield,
  Activity,
  Download,
  Settings,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getUserInfo } from "../utils/auth";
import { api } from "../utils/api";

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  status: "success" | "warning" | "error";
  severity?: "high" | "medium" | "low";
}

type AuthUser = {
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  location?: string;
} | null;

export function AdminProfilePage() {
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const loggedInAdmin = (getUserInfo() as AuthUser) || null;

  const [adminInfo, setAdminInfo] = useState({
    name: loggedInAdmin?.name || "Administrator",
    email: loggedInAdmin?.email || "admin@hwacs.com",
    phone: loggedInAdmin?.phone || "",
    location: loggedInAdmin?.location || "",
    profileImage: "",
    apiKey: "hwacs_admin_sk_9z8y7x6w5v4u3t2s1r0q",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    securityAlerts: true,
    systemUpdates: true,
    auditLogs: true,
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [passwordOtp, setPasswordOtp] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const initials =
    adminInfo.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  const loadAdminProfile = async () => {
    try {
      setProfileLoading(true);

      const res = await api.get("/api/admin/profile");

      setAdminInfo((prev) => ({
        ...prev,
        name: res.data?.name || prev.name,
        email: res.data?.email || prev.email,
        phone: res.data?.phone || "",
        location: res.data?.location || "",
        profileImage: res.data?.profile_image || "",
      }));
    } catch (error) {
      console.error("Failed to load admin profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    try {
      setActivityLoading(true);

      const res = await api.get("/api/admin/activity-logs?limit=50");
      const logs = Array.isArray(res.data?.logs) ? res.data.logs : [];

      setActivityLogs(
        logs.map((log: any) => ({
          id: log._id || log.id || crypto.randomUUID(),
          action: log.action || "Unknown activity",
          timestamp: log.timestamp
            ? new Date(log.timestamp).toLocaleString()
            : "—",
          status: log.status || "success",
          severity: log.severity || "low",
        }))
      );
    } catch (error) {
      console.error("Failed to load activity logs:", error);
      toast.error("Failed to load activity logs");
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    loadAdminProfile();
    loadActivityLogs();

    const tab = searchParams.get("tab");
    if (tab && ["info", "security", "activity", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleSave = async () => {
    if (adminInfo.phone && !/^\d{11}$/.test(adminInfo.phone)) {
      toast.error("Phone number must be exactly 11 digits.");
      return;
    }
    if (adminInfo.location && !/^[a-zA-Z\s,]+$/.test(adminInfo.location)) {
  toast.error("Location can only contain letters, spaces, and comma.");
  return;
}

    try {
      setProfileLoading(true);

      await api.patch("/api/admin/profile", {
        phone: adminInfo.phone,
        location: adminInfo.location,
        profile_image: adminInfo.profileImage,
      });

      setIsEditing(false);
      toast.success("Admin profile updated successfully!");
      await loadAdminProfile();
    } catch (error: any) {
      console.error("Profile update failed:", error);
      toast.error(error?.response?.data?.error || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(adminInfo.apiKey);
    toast.success("Admin API Key copied to clipboard!");
  };

  const downloadActivityLog = () => {
    if (activityLogs.length === 0) {
      toast.error("No activity logs to download");
      return;
    }

    const logData = activityLogs
      .map(
        (log) =>
          `${log.timestamp} - ${log.action} [${log.status}] [Severity: ${log.severity}]`
      )
      .join("\n");

    const blob = new Blob([logData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "admin_activity_log.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    toast.success("Admin activity log downloaded!");
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Preference updated");
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

    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`]/.test(password)) {
      return "Password must contain at least one special character.";
    }

    return "";
  };

  const handlePasswordChange = async () => {
    if (!passwordData.current.trim()) {
      toast.error("Please enter your current password!");
      return;
    }

    if (!passwordData.new.trim()) {
      toast.error("Please enter your new password!");
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords don't match!");
      return;
    }

    const passwordError = validateStrongPassword(passwordData.new);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    try {
      setPasswordLoading(true);

      await api.post("/api/admin/profile/password/request-otp", {
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
      });

      toast.success("OTP sent to your admin email");
      setOtpModalOpen(true);
    } catch (error: any) {
      console.error("Password OTP request failed:", error);
      toast.error(error?.response?.data?.error || "Failed to send OTP");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleVerifyPasswordOtp = async () => {
    if (!passwordOtp.trim()) {
      toast.error("Please enter OTP");
      return;
    }

    if (passwordOtp.trim().length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    try {
      setPasswordLoading(true);

      await api.post("/api/admin/profile/password/verify-otp", {
        otp: passwordOtp.trim(),
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
      });

      toast.success("Password updated successfully");

      setPasswordData({
        current: "",
        new: "",
        confirm: "",
      });

      setPasswordOtp("");
      setOtpModalOpen(false);

      await loadActivityLogs();
    } catch (error: any) {
      console.error("Password update failed:", error);
      toast.error(error?.response?.data?.error || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

 const handleProfileImageChange = (file?: File) => {
  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png"];

  if (!allowedTypes.includes(file.type)) {
    toast.error("Only JPG, JPEG, and PNG images are allowed.");
    return;
  }

  if (file.size > 1024 * 1024) {
    toast.error("Image size should be less than 1MB");
    return;
  }

  const reader = new FileReader();

  reader.onloadend = () => {
    setAdminInfo((prev) => ({
      ...prev,
      profileImage: reader.result as string,
    }));
  };

  reader.readAsDataURL(file);
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-100">
      <DashboardNavbar userRole="admin" notificationCount={7} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Card className="mb-6 bg-white/80 backdrop-blur-sm border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-6">
                  <div className="flex flex-col items-center gap-3">
                    <Avatar
                      className="h-24 w-24 border-4 border-cyan-600/50 overflow-hidden cursor-pointer"
                      onClick={() => {
                        if (adminInfo.profileImage) {
                          setImagePreviewOpen(true);
                        }
                      }}
                    >
                      {adminInfo.profileImage ? (
                        <img
                          src={adminInfo.profileImage}
                          alt="Profile"
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="text-2xl bg-cyan-600/20 text-cyan-700">
                          {initials}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    {isEditing && (
                      <div className="w-40">
                        <Label
                          htmlFor="profile-image"
                          className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-primary/20 bg-white px-3 py-2 text-xs hover:bg-primary/5"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Change Photo
                        </Label>

                        <Input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleProfileImageChange(e.target.files?.[0])
                          }
                        />

                        {adminInfo.profileImage && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full text-xs"
                            onClick={() =>
                              setAdminInfo((prev) => ({
                                ...prev,
                                profileImage: "",
                              }))
                            }
                          >
                            Remove Photo
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h1 className="text-3xl mb-2 text-foreground">
                      {adminInfo.name}
                    </h1>

                    <div className="flex items-center gap-3 text-muted-foreground mb-2">
                      <Mail className="w-4 h-4" />
                      <span>{adminInfo.email}</span>
                    </div>

                    <Badge className="gap-1 bg-cyan-600 hover:bg-cyan-700">
                      <Shield className="w-3 h-3" />
                      Administrator
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  className="bg-primary hover:bg-primary/90"
                  disabled={profileLoading}
                >
                  {isEditing
                    ? profileLoading
                      ? "Saving..."
                      : "Save Changes"
                    : "Edit Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>


          

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-2 border-primary/20">
              <TabsTrigger value="info">Personal Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
              <TabsTrigger value="settings">Admin Settings</TabsTrigger>
            </TabsList>

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={adminInfo.name}
                        disabled
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
                        value={adminInfo.email}
                        disabled
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
                        value={adminInfo.phone}
                        onChange={(e) =>
                          setAdminInfo({ ...adminInfo, phone: e.target.value })
                        }
                        disabled={!isEditing}
                        placeholder="03001234567"
                        maxLength={11}
                        className="bg-white border-primary/20"
                      />
                      <p className="text-xs text-muted-foreground">
                        Phone number must be exactly 11 digits.
                      </p>
                    </div>
                  
{/* ✅ Animated Welcome Message with Typewriter */}
<div className="flex items-center justify-center">
  <div className="relative overflow-hidden rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 px-8 py-5 shadow-sm w-full max-w-sm">

    {/* Shimmer sweep */}
    <div
      className="pointer-events-none absolute inset-0 rounded-xl"
      style={{
        background:
          "linear-gradient(120deg, transparent 30%, rgba(103,232,249,0.18) 50%, transparent 70%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 2.5s infinite linear",
      }}
    />

    {/* Typing text */}
    <p className="relative z-10 text-sm font-semibold text-cyan-700 whitespace-nowrap flex items-center gap-2">
      <span style={{ animation: "waveEmoji 1.2s ease-in-out infinite" }}>👋</span>
      <span
        className="overflow-hidden border-r-2 border-cyan-500 whitespace-nowrap"
        style={{
          display: "inline-block",
          width: "0ch",
          animation:
            "typing 2.4s steps(36, end) 0.3s forwards, blink 0.75s step-end 2.7s infinite",
        }}
      >
        Welcome to your Profile, {adminInfo.name}!
      </span>
    </p>

    <style>{`
      @keyframes shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes typing {
        from { width: 0ch; }
        to   { width: 36ch; }
      }
      @keyframes blink {
        0%, 100% { border-color: #0891b2; }
        50%       { border-color: transparent; }
      }
      @keyframes waveEmoji {
        0%,100% { transform: rotate(0deg); }
        20%      { transform: rotate(-15deg); }
        40%      { transform: rotate(15deg); }
        60%      { transform: rotate(-10deg); }
        80%      { transform: rotate(10deg); }
      }
    `}</style>
  </div>
</div>
</div>
                    {/* <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
  id="location"
  value={adminInfo.location}
  onChange={(e) => {
    const onlyLetters = e.target.value.replace(/[^a-zA-Z\s,]/g, "");

    setAdminInfo({
      ...adminInfo,
      location: onlyLetters,
    });
  }}
  disabled={!isEditing}
  placeholder="Pakistan, Islamabad"
  className="bg-white border-primary/20"
/>
                    </div> */}
                  
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
                      Update your admin password to keep your account secure
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
                      />
                      <p className="text-xs text-muted-foreground">
                        Must include uppercase, lowercase, number, and special character.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirm New Password
                      </Label>
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
                      />
                    </div>

                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={handlePasswordChange}
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? "Sending OTP..." : "Update Password"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Admin API Key Management
                    </CardTitle>
                    <CardDescription>
                      Your administrative API key with elevated privileges
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Admin API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          value={adminInfo.apiKey}
                          readOnly
                          className="bg-white border-primary/20"
                        />
                        <Button variant="outline" onClick={copyApiKey}>
                          Copy
                        </Button>
                      </div>
                    </div>
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
                        Activity Log
                      </CardTitle>
                      <CardDescription>
                        Review recent admin account activity
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={loadActivityLogs}>
                        Refresh
                      </Button>

                      <Button variant="outline" onClick={downloadActivityLog}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {activityLoading ? (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      Loading activity logs...
                    </div>
                  ) : activityLogs.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      No activity logs found.
                    </div>
                  ) : (
                    activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between rounded-lg border border-primary/20 bg-white/70 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.timestamp}
                          </p>
                        </div>

                        <Badge
                          variant={
                            log.status === "error" ? "destructive" : "default"
                          }
                        >
                          {log.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Admin Settings
                  </CardTitle>
                  <CardDescription>
                    Manage admin notification and audit preferences
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive system notifications by email
                      </p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={() =>
                        handlePreferenceChange("emailNotifications")
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts for high-risk security events
                      </p>
                    </div>
                    <Switch
                      checked={preferences.securityAlerts}
                      onCheckedChange={() =>
                        handlePreferenceChange("securityAlerts")
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">System Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about system changes
                      </p>
                    </div>
                    <Switch
                      checked={preferences.systemUpdates}
                      onCheckedChange={() =>
                        handlePreferenceChange("systemUpdates")
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Audit Logs</p>
                      <p className="text-sm text-muted-foreground">
                        Keep admin audit logs enabled
                      </p>
                    </div>
                    <Switch
                      checked={preferences.auditLogs}
                      onCheckedChange={() => handlePreferenceChange("auditLogs")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-primary/20">
            <h3 className="text-lg font-semibold mb-2">Verify OTP</h3>

            <p className="text-sm text-muted-foreground mb-4">
              We sent an OTP to your admin email. Enter it below to confirm your
              password update.
            </p>

            <div className="space-y-2 mb-5">
              <Label htmlFor="password-otp">OTP Code</Label>
              <Input
                id="password-otp"
                value={passwordOtp}
                onChange={(e) => setPasswordOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="bg-white border-primary/20"
              />
              <p className="text-xs text-muted-foreground">
                OTP expires quickly, so enter it as soon as you receive it.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOtpModalOpen(false);
                  setPasswordOtp("");
                }}
                disabled={passwordLoading}
              >
                Cancel
              </Button>

              <Button
                onClick={handleVerifyPasswordOtp}
                disabled={passwordLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {passwordLoading ? "Verifying..." : "Verify & Update"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {imagePreviewOpen && adminInfo.profileImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setImagePreviewOpen(false)}
        >
          <div
            className="max-w-2xl rounded-xl bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Profile Picture</h3>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setImagePreviewOpen(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Close
              </Button>
            </div>

            <img
              src={adminInfo.profileImage}
              alt="Profile Preview"
              className="max-h-[70vh] max-w-full rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
