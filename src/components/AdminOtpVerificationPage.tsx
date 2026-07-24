import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Shield, KeyRound, Clock, RefreshCcw, AlertTriangle, Check, Info } from "lucide-react";
import { api } from "../utils/api";
import { setAuth } from "../utils/auth";

type InlineMsg = { type: "error" | "success" | "info"; text: string };

function InlineAlert({ msg }: { msg: InlineMsg | null }) {
  if (!msg) return null;

  const base = "mt-3 rounded-lg border px-4 py-3 text-sm flex items-start gap-2";
  const style =
    msg.type === "error"
      ? "bg-red-500/15 border-red-300/30 text-red-100"
      : msg.type === "success"
      ? "bg-emerald-500/15 border-emerald-300/30 text-emerald-100"
      : "bg-cyan-500/15 border-cyan-300/30 text-cyan-100";

  const Icon = msg.type === "error" ? AlertTriangle : msg.type === "success" ? Check : Info;

  return (
    <div className={`${base} ${style}`}>
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span className="leading-5">{msg.text}</span>
    </div>
  );
}

export function AdminOtpVerificationPage() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<InlineMsg | null>(null);

  const email = sessionStorage.getItem("otpEmail");
  const otpFlow = sessionStorage.getItem("otpFlow") || ""; // admin_login / admin_signup

  // ✅ If someone comes here with user flow, push to user OTP page
  useEffect(() => {
    if (otpFlow.startsWith("user_")) {
      navigate("/otp-verification", { replace: true });
    }
  }, [otpFlow, navigate]);

  const cleanup = () => {
    sessionStorage.removeItem("otpEmail");
    sessionStorage.removeItem("otpFlow");
    sessionStorage.removeItem("otpSource");
    sessionStorage.removeItem("pendingUser");
    sessionStorage.removeItem("flashMsg");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!otp || otp.length !== 6) {
      setMessage({ type: "error", text: "Please enter a valid 6-digit OTP code." });
      return;
    }
    if (!email) {
      setMessage({ type: "error", text: "Session expired. Please login/signup again." });
      return;
    }

    try {
      setIsVerifying(true);

      const res = await api.post("/api/auth/verify-otp", { email, otp , otpFlow });
      const data = res.data;

      const role: "admin" | "user" = data?.role === "admin" ? "admin" : "user";
      if (role !== "admin") {
        setMessage({ type: "error", text: "User OTP cannot be verified on Admin OTP page." });
        return;
      }

      // ✅ Admin login -> store token + go dashboard
      if (otpFlow === "admin_login") {
        if (!data?.token) {
          setMessage({ type: "error", text: "Token missing from server." });
          return;
        }

        setAuth({
          token: data.token,
          user: { name: data.name || "", email: data.email || email, role: "admin" },
        });

        cleanup();
        setMessage({ type: "success", text: "Admin OTP verified! Redirecting..." });
        setTimeout(() => navigate("/admin-dashboard"), 650);
        return;
      }

      // ✅ Admin signup -> verified, go admin login
      cleanup();
      sessionStorage.setItem("flashMsg", "Admin verified successfully. Please login.");
      setMessage({ type: "success", text: "Admin verified! Redirecting to Admin Login..." });
      setTimeout(() => navigate("/admin-login"), 750);
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Invalid or expired OTP.";
      setMessage({ type: "error", text: msg });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setMessage(null);

    if (!email) {
      setMessage({ type: "error", text: "Session expired. Please login/signup again." });
      return;
    }

    try {
      setIsResending(true);
      await api.post("/api/auth/resend-otp", { email, purpose: otpFlow });
      setMessage({ type: "success", text: "A new OTP has been sent to your email." });
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Failed to resend OTP.";
      setMessage({ type: "error", text: msg });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Shield className="w-16 h-16 text-cyan-300" />
                <KeyRound className="w-6 h-6 text-amber-400 absolute -top-1 -right-1" />
              </div>
            </div>

            <h1 className="mb-2 text-white">Admin OTP Verification</h1>
            <p className="text-cyan-200/90">Enter the OTP sent to admin email</p>
          </div>

          <Card className="bg-slate-800/80 border-cyan-500/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">OTP Verification</CardTitle>
              <CardDescription className="text-cyan-200">
                Extra security verification step
              </CardDescription>

              <InlineAlert msg={message} />
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-slate-200">
                    6-digit Verification Code
                  </Label>

                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    className="tracking-widest text-center text-lg bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/50"
                  />

                  {/* ✅ FIXED: explicitly light color (no black) */}
                  <p className="text-xs text-slate-200 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-200" />
                    This code expires shortly.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="flex items-center gap-2 text-sm text-cyan-300 hover:underline disabled:opacity-60"
                >
                  <RefreshCcw className="w-4 h-4" />
                  {isResending ? "Resending..." : "Resend code"}
                </button>

                <Button type="submit" className="w-full" disabled={isVerifying}>
                  {isVerifying ? "Verifying..." : "Verify & Continue"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-xs text-slate-200/80">
            If you didn’t receive the code, check spam or resend.
          </div>
        </div>
      </div>
    </div>
  );
}

