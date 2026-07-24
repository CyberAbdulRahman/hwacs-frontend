// src/components/AdminActivatePage.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { api } from "../utils/api";

export function AdminActivatePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [msg, setMsg] = useState("Activating your account...");
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const token = (params.get("token") || "").trim();

    if (!token) {
      setMsg("Invalid activation link.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        // 🔥 Activate admin via backend
        const res = await api.post("/api/auth/admin/activate", {
          token,
        });

        const email = String(res.data?.email || "").trim().toLowerCase();

        if (!email) {
          throw new Error("Activation succeeded but email missing.");
        }

        // 🧹 Clear any previous OTP session (avoid user/admin mix)
        sessionStorage.removeItem("otpEmail");
        sessionStorage.removeItem("otpFlow");
        sessionStorage.removeItem("otpSource");

        // 🔐 Set correct ADMIN OTP session
        sessionStorage.setItem("otpEmail", email);
        sessionStorage.setItem("otpFlow", "admin_activation");
        sessionStorage.setItem("otpSource", "admin_activation");

        if (!cancelled) {
          setMsg("✅ Account activated. OTP sent to your email...");
          
          timerRef.current = window.setTimeout(() => {
            navigate("/admin-otp-verification");
          }, 1000);
        }

      } catch (error: any) {
        const serverError = error?.response?.data?.error;
        const fallbackError = error?.message;

        if (!cancelled) {
          setMsg(serverError || fallbackError || "Activation failed.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [params, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="bg-slate-800/80 border-cyan-500/40">
            <CardHeader>
              <CardTitle className="text-white">
                Admin Activation
              </CardTitle>
            </CardHeader>

            <CardContent className="text-slate-200 space-y-4">
              <p>{msg}</p>

              {!loading && (
                <Button
                  onClick={() => navigate("/admin-login")}
                  className="w-full"
                >
                  Go to Admin Login
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

