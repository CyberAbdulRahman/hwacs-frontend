// src/components/AdminLoginPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ShieldCheck, Lock, AlertTriangle, Info, Check } from "lucide-react";
import { api } from "../utils/api";
import { setAuth } from "../utils/auth";

type InlineMsg = { type: "error" | "success" | "info"; text: string };

function InlineAlert({ msg }: { msg: InlineMsg | null }) {
  if (!msg) return null;

  // ✅ Force all nested text/icons to remain white (no black)
  const base =
    "mb-4 rounded-lg border px-4 py-3 text-sm flex items-start gap-2 backdrop-blur-sm " +
    "text-white [&_*]:text-white";

  const style =
    msg.type === "error"
      ? "bg-red-500/18 border-red-300/40"
      : msg.type === "success"
      ? "bg-emerald-500/18 border-emerald-300/40"
      : "bg-cyan-500/18 border-cyan-300/40";

  const Icon =
    msg.type === "error"
      ? AlertTriangle
      : msg.type === "success"
      ? Check
      : Info;

  return (
    <div className={`${base} ${style}`}>
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span className="leading-5">{msg.text}</span>
    </div>
  );
}

export function AdminLoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [inlineMsg, setInlineMsg] = useState<InlineMsg | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const msg = sessionStorage.getItem("flashMsg");
    if (msg) {
      setInlineMsg({ type: "success", text: msg });
      sessionStorage.removeItem("flashMsg");
    }
  }, []);

  const setField = (key: "email" | "password", value: string) => {
    setInlineMsg(null);
    setFormData((p) => ({ ...p, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineMsg(null);

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setInlineMsg({
        type: "error",
        text: "Please enter admin email and password.",
      });
      return;
    }

    if (!email.endsWith("@gmail.com")) {
      setInlineMsg({ type: "error", text: "Only @gmail.com email is allowed." });
      return;
    }

    if (password.length < 8) {
      setInlineMsg({
        type: "error",
        text: "Password must be at least 8 characters long!",
      });
      return;
    }

    try {
      setIsLoading(true);

      // ✅ Admin login endpoint
      const res = await api.post("/api/auth/admin/login", { email, password });
      const admin = res.data;

      // ✅ Ensure admin only
      if (admin?.role && admin.role !== "admin") {
        setInlineMsg({ type: "error", text: "You are not authorized as admin." });
        return;
      }

      // ✅ If your backend returns requires_otp
      if (admin?.requires_otp) {
        sessionStorage.setItem("otpEmail", email);
        sessionStorage.setItem("otpFlow", "admin_login");
        sessionStorage.setItem("otpSource", "admin_login");

        setInlineMsg({ type: "success", text: "OTP sent. Please verify." });
        setTimeout(() => navigate("/admin-otp-verification"), 600);
        return;
      }

      // ✅ If backend returns token directly
      if (!admin?.token) {
        setInlineMsg({
          type: "error",
          text: "Login success but token not returned.",
        });
        return;
      }

      setAuth({
        token: admin.token,
        user: {
          name: admin.name || "Admin",
          email: admin.email || email,
          role: "admin",
        },
        
      });

      setInlineMsg({ type: "success", text: "Administrator login successful." });
      setTimeout(() => navigate("/admin-dashboard"), 400);
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        "Admin login failed. Please check your credentials.";
      setInlineMsg({ type: "error", text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      <div className="relative z-20">
        <Navbar />
      </div>

      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>

      <div className="absolute left-10 top-1/4 opacity-5 pointer-events-none">
        <Lock className="w-32 h-32 text-cyan-400" />
      </div>
      <div className="absolute right-10 bottom-1/4 opacity-5 pointer-events-none">
        <ShieldCheck className="w-40 h-40 text-blue-400" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <ShieldCheck className="w-20 h-20 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                <Lock className="w-7 h-7 text-amber-400 absolute -top-1 -right-1 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
              </div>
            </div>
            <h1 className="mb-2 text-white drop-shadow-lg">Administrator Portal</h1>
            <p className="text-cyan-300">Secure access for system administrators</p>
          </div>

          <div className="mb-6 p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-200">
                <span className="block mb-1">Restricted Access Area</span>
                This portal is exclusively for authorized administrators. All access attempts are logged and monitored.
              </p>
            </div>
          </div>

          <Card className="bg-slate-800/80 border-cyan-500/40 backdrop-blur-md shadow-2xl shadow-cyan-500/10">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-white text-2xl">Admin Login</CardTitle>
              <CardDescription className="text-cyan-200">
                Enter your administrator credentials
              </CardDescription>
            </CardHeader>

            <CardContent>
              <InlineAlert msg={inlineMsg} />

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-slate-200">
                    Administrator Email
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="administrator@gmail.com"
                    value={formData.email}
                    onChange={(e) => setField("email", e.target.value)}
                    required
                    className="bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-slate-200">
                    Administrator Password
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setField("password", e.target.value)}
                    required
                    className="bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/50"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/30 transition-all duration-200"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isLoading ? "Logging in..." : "Login as Administrator"}
                </Button>

                <div className="pt-2 text-center">
                  <p className="text-sm text-slate-400">
                    Need an admin account?{" "}
                    <Link to="/admin-signup" className="text-cyan-400 hover:underline">
                      Admin Sign Up
                    </Link>
                  </p>

                  <p className="text-sm text-slate-400 mt-2">
                    Not an administrator?{" "}
                    <Link to="/login" className="text-cyan-400 hover:underline">
                      User Login
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Protected by HWACS Security System • All sessions are encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

