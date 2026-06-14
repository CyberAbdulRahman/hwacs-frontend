// ResetPasswordPage.tsx
import axios from "axios";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Shield, Eye, EyeOff, Check } from "lucide-react";

type Msg = { type: "success" | "error"; text: string } | null;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Msg>(null);

  const rules = useMemo(
    () => ({
      length: newPassword.length >= 8,
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*]/.test(newPassword),
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
    }),
    [newPassword]
  );

  const allRulesOk = Object.values(rules).every(Boolean);
  const confirmMatches = confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!token) {
      setMessage({ type: "error", text: "Invalid reset link. Please request again." });
      return;
    }

    if (!allRulesOk) {
      setMessage({ type: "error", text: "Password does not meet the required rules." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    try {
      setIsLoading(true);
      await axios.post("http://127.0.0.1:5000/api/auth/reset-password", {
        token,
        newPassword,
      });

      setMessage({ type: "success", text: "Password reset successfully. Please login." });
      setTimeout(() => navigate("/login"), 800);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Reset failed. Please request a new link.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="mb-2">Reset Password</h1>
            <p className="text-muted-foreground">Set a new password for your account</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create New Password</CardTitle>
              <CardDescription>This link expires in a few minutes for your security</CardDescription>

              {message && (
                <div
                  className={`mt-3 rounded-md px-4 py-2 text-sm font-medium ${
                    message.type === "error"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-green-50 text-green-700 border border-green-200"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </CardHeader>

            <CardContent>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <Label>New Password</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="p-2 border rounded-md bg-white">
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="mt-2 space-y-1 text-sm">
                    {Object.entries(rules).map(([key, ok]) => (
                      <div key={key} className={`flex items-center gap-2 ${ok ? "text-green-600" : "text-gray-400"}`}>
                        <Check size={14} />
                        {key === "length" && "Minimum 8 characters"}
                        {key === "number" && "One number"}
                        {key === "special" && "One special character"}
                        {key === "upper" && "One uppercase letter"}
                        {key === "lower" && "One lowercase letter"}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Confirm New Password</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="p-2 border rounded-md bg-white">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {confirmPassword.length > 0 && (
                    <p className={`text-xs mt-1 font-medium ${confirmMatches ? "text-green-600" : "text-red-600"}`}>
                      {confirmMatches ? "Passwords match ✅" : "Passwords do not match ❌"}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Back to{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Login
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

