// // src/components/OtpVerificationPage.tsx
// import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Navbar } from "./Navbar";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "./ui/card";
// import {
//   Shield,
//   KeyRound,
//   Clock,
//   RefreshCcw,
//   AlertTriangle,
//   Check,
//   Info,
// } from "lucide-react";
// import { api } from "../utils/api";
// import { setAuth } from "../utils/auth";

// type InlineMsg = { type: "error" | "success" | "info"; text: string };

// function InlineAlert({ msg }: { msg: InlineMsg | null }) {
//   if (!msg) return null;

//   const base =
//     "mt-3 rounded-lg border px-4 py-3 text-sm flex items-start gap-2";

//   const style =
//     msg.type === "error"
//       ? "bg-red-50 border-red-200 text-red-700"
//       : msg.type === "success"
//       ? "bg-green-50 border-green-200 text-green-700"
//       : "bg-blue-50 border-blue-200 text-blue-700";

//   const Icon = msg.type === "error" ? AlertTriangle : msg.type === "success" ? Check : Info;

//   return (
//     <div className={`${base} ${style}`}>
//       <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
//       <span className="leading-5">{msg.text}</span>
//     </div>
//   );
// }

// export function OtpVerificationPage() {
//   const navigate = useNavigate();

//   const [otp, setOtp] = useState("");
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [isResending, setIsResending] = useState(false);
//   const [message, setMessage] = useState<InlineMsg | null>(null);

//   // ✅ These are already used in your flow
//   const email = sessionStorage.getItem("otpEmail") || "";
//   const otpFlow = sessionStorage.getItem("otpFlow") || "";
//   const otpSource = sessionStorage.getItem("otpSource") || "";

//   // ✅ NEW: backend-friendly flow (purpose)
//   // backend expects: user_login / user_signup / admin_login / admin_activation
//   const resolvedOtpFlow = useMemo(() => {
//     // Most common sources
//     if (otpSource === "login") return "user_login";
//     if (otpSource === "signup") return "user_signup";
//     if (otpSource === "admin_signup") return "admin_activation";
//     if (otpSource === "admin_activation") return "admin_activation";

//     // Already correct values?
//     if (otpFlow === "user_login") return "user_login";
//     if (otpFlow === "user_signup") return "user_signup";
//     if (otpFlow === "admin_login") return "admin_login";
//     if (otpFlow === "admin_activation") return "admin_activation";

//     // fallback
//     return "user_login";
//   }, [otpFlow, otpSource]);

//   const decideRedirect = (role: "admin" | "user") => {
//     // user signup -> back to login
//     if (resolvedOtpFlow === "user_signup") return "/login";

//     // user login -> user dashboard
//     if (resolvedOtpFlow === "user_login") return "/user-dashboard";

//     // admin activation/login -> admin dashboard
//     if (resolvedOtpFlow === "admin_activation" || resolvedOtpFlow === "admin_login")
//       return "/admin-dashboard";

//     // fallback
//     return role === "admin" ? "/admin-dashboard" : "/user-dashboard";
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setMessage(null);

//     if (!otp || otp.length !== 6) {
//       setMessage({ type: "error", text: "Please enter a valid 6-digit OTP." });
//       return;
//     }

//     if (!email) {
//       setMessage({ type: "error", text: "Session expired. Please login/signup again." });
//       return;
//     }

//     try {
//       setIsVerifying(true);

//       // ✅ IMPORTANT: send resolvedOtpFlow to backend
//       const res = await api.post("/api/auth/verify-otp", {
//         email,
//         otp,
//         otpFlow: resolvedOtpFlow,
//       });

//       const data = res.data;

//       if (!data?.token) {
//         setMessage({ type: "error", text: "Token missing from server response." });
//         return;
//       }

//       const role: "admin" | "user" = data.role === "admin" ? "admin" : "user";

//       // ✅ existing auth helper
//       setAuth({
//         token: data.token,
//         user: {
//           name: data.name || "",
//           email: data.email || email,
//           role,
//         },
//       });

//       // ✅ STEP 1C: ALSO save token for fetch headers in other pages
//       sessionStorage.setItem("token", data.token);
//       sessionStorage.setItem("role", role);
//       sessionStorage.setItem("email", data.email || email);
//       sessionStorage.setItem("name", data.name || "");

//       setMessage({ type: "success", text: "OTP verified successfully! Redirecting..." });

//       // clear otp session keys
//       sessionStorage.removeItem("otpEmail");
//       sessionStorage.removeItem("pendingUser");
//       sessionStorage.removeItem("otpFlow");
//       sessionStorage.removeItem("otpSource");
//       sessionStorage.removeItem("flashMsg");

//       const next = decideRedirect(role);
//       setTimeout(() => navigate(next), 650);
//     } catch (error: any) {
//       const msg = error?.response?.data?.error || "Invalid or expired OTP.";
//       setMessage({ type: "error", text: msg });
//     } finally {
//       setIsVerifying(false);
//     }
//   };

//   const handleResend = async () => {
//     setMessage(null);

//     if (!email) {
//       setMessage({ type: "error", text: "Session expired. Please login/signup again." });
//       return;
//     }

//     try {
//       setIsResending(true);

//       // ✅ purpose MUST be backend-friendly
//       await api.post("/api/auth/resend-otp", {
//         email,
//         purpose: resolvedOtpFlow,
//       });

//       setMessage({ type: "success", text: "A new OTP has been sent to your email." });
//     } catch (error: any) {
//       const msg = error?.response?.data?.error || "Failed to resend OTP.";
//       setMessage({ type: "error", text: msg });
//     } finally {
//       setIsResending(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
//       <Navbar />

//       <div className="container mx-auto px-4 py-16">
//         <div className="max-w-md mx-auto">
//           <div className="text-center mb-8">
//             <div className="flex justify-center mb-4">
//               <div className="relative">
//                 <Shield className="w-16 h-16 text-primary" />
//                 <KeyRound className="w-6 h-6 text-amber-500 absolute -top-1 -right-1" />
//               </div>
//             </div>
//             <h1 className="mb-2">Verify Your Email</h1>
//             <p className="text-muted-foreground">Enter the OTP sent to your email</p>
//           </div>

//           <Card className="border border-blue-500/20 shadow-[0_10px_35px_rgba(59,130,246,0.12)] rounded-xl">
//             <CardHeader>
//               <CardTitle>OTP Verification</CardTitle>
//               <CardDescription>Extra security verification step</CardDescription>

//               {/* ✅ optional info: show resolved flow */}
//               <div className="text-xs text-muted-foreground mt-1">
//                 Current Flow: <b>{resolvedOtpFlow}</b>
//               </div>

//               <InlineAlert msg={message} />
//             </CardHeader>

//             <CardContent>
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="otp">6-digit Verification Code</Label>
//                   <Input
//                     id="otp"
//                     type="text"
//                     inputMode="numeric"
//                     maxLength={6}
//                     placeholder="••••••"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
//                     required
//                     className="tracking-widest text-center text-lg"
//                   />

//                   <p className="text-xs text-muted-foreground flex items-center gap-1">
//                     <Clock className="w-3 h-3" />
//                     This code expires shortly.
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={handleResend}
//                   disabled={isResending}
//                   className="flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-60"
//                 >
//                   <RefreshCcw className="w-4 h-4" />
//                   {isResending ? "Resending..." : "Resend code"}
//                 </button>

//                 <Button type="submit" className="w-full" disabled={isVerifying}>
//                   {isVerifying ? "Verifying..." : "Verify & Continue"}
//                 </Button>
//               </form>
//             </CardContent>
//           </Card>

//           <div className="mt-6 text-center text-xs text-muted-foreground">
//             If you didn’t receive the code, check spam or resend.
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/components/OtpVerificationPage.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Shield,
  KeyRound,
  Clock,
  RefreshCcw,
  AlertTriangle,
  Check,
  Info,
} from "lucide-react";
import { api } from "../utils/api";
import { setAuth } from "../utils/auth";

type InlineMsg = { type: "error" | "success" | "info"; text: string };

function InlineAlert({ msg }: { msg: InlineMsg | null }) {
  if (!msg) return null;

  const base =
    "mt-3 rounded-lg border px-4 py-3 text-sm flex items-start gap-2";

  const style =
    msg.type === "error"
      ? "bg-red-50 border-red-200 text-red-700"
      : msg.type === "success"
      ? "bg-green-50 border-green-200 text-green-700"
      : "bg-blue-50 border-blue-200 text-blue-700";

  const Icon = msg.type === "error" ? AlertTriangle : msg.type === "success" ? Check : Info;

  return (
    <div className={`${base} ${style}`}>
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span className="leading-5">{msg.text}</span>
    </div>
  );
}

export function OtpVerificationPage() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<InlineMsg | null>(null);

  // ✅ These are already used in your flow
  const email = sessionStorage.getItem("otpEmail") || "";
  const otpFlow = sessionStorage.getItem("otpFlow") || "";
  const otpSource = sessionStorage.getItem("otpSource") || "";

  // ✅ NEW: backend-friendly flow (purpose)
  // backend expects: user_login / user_signup / admin_login / admin_activation
  const resolvedOtpFlow = useMemo(() => {
    // Most common sources
    if (otpSource === "login") return "user_login";
    if (otpSource === "signup") return "user_signup";
    if (otpSource === "admin_signup") return "admin_activation";
    if (otpSource === "admin_activation") return "admin_activation";

    // Already correct values?
    if (otpFlow === "user_login") return "user_login";
    if (otpFlow === "user_signup") return "user_signup";
    if (otpFlow === "admin_login") return "admin_login";
    if (otpFlow === "admin_activation") return "admin_activation";

    // fallback
    return "user_login";
  }, [otpFlow, otpSource]);

  const decideRedirect = (role: "admin" | "user") => {
    // user signup -> back to login
    if (resolvedOtpFlow === "user_signup") return "/login";

    // user login -> user dashboard
    if (resolvedOtpFlow === "user_login") return "/user-dashboard";

    // admin activation/login -> admin dashboard
    if (resolvedOtpFlow === "admin_activation" || resolvedOtpFlow === "admin_login")
      return "/admin-dashboard";

    // fallback
    return role === "admin" ? "/admin-dashboard" : "/user-dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!otp || otp.length !== 6) {
      setMessage({ type: "error", text: "Please enter a valid 6-digit OTP." });
      return;
    }

    if (!email) {
      setMessage({ type: "error", text: "Session expired. Please login/signup again." });
      return;
    }

    try {
      setIsVerifying(true);

      // ✅ IMPORTANT: send resolvedOtpFlow to backend
      const res = await api.post("/api/auth/verify-otp", {
        email,
        otp,
        otpFlow: resolvedOtpFlow,
      });

      const data = res.data;

      if (!data?.token) {
        setMessage({ type: "error", text: "Token missing from server response." });
        return;
      }

      const role: "admin" | "user" = data.role === "admin" ? "admin" : "user";

      // ✅ existing auth helper
      setAuth({
        token: data.token,
        user: {
          name: data.name || "",
          email: data.email || email,
          role,
        },
      });

      // ✅ STEP 1C: ALSO save token for fetch headers in other pages
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("role", role);
      sessionStorage.setItem("email", data.email || email);
      sessionStorage.setItem("name", data.name || "");

      setMessage({ type: "success", text: "OTP verified successfully! Redirecting..." });

      // clear otp session keys
      sessionStorage.removeItem("otpEmail");
      sessionStorage.removeItem("pendingUser");
      sessionStorage.removeItem("otpFlow");
      sessionStorage.removeItem("otpSource");
      sessionStorage.removeItem("flashMsg");

      const next = decideRedirect(role);
      setTimeout(() => navigate(next), 650);
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

      // ✅ purpose MUST be backend-friendly
      await api.post("/api/auth/resend-otp", {
        email,
        purpose: resolvedOtpFlow,
      });

      setMessage({ type: "success", text: "A new OTP has been sent to your email." });
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Failed to resend OTP.";
      setMessage({ type: "error", text: msg });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Shield className="w-16 h-16 text-primary" />
                <KeyRound className="w-6 h-6 text-amber-500 absolute -top-1 -right-1" />
              </div>
            </div>
            <h1 className="mb-2">Verify Your Email</h1>
            <p className="text-muted-foreground">Enter the OTP sent to your email</p>
          </div>

          <Card className="border border-blue-500/20 shadow-[0_10px_35px_rgba(59,130,246,0.12)] rounded-xl">
            <CardHeader>
              <CardTitle>OTP Verification</CardTitle>
              <CardDescription>Extra security verification step</CardDescription>

              {/* ✅ optional info: show resolved flow */}
              <div className="text-xs text-muted-foreground mt-1">
                Current Flow: <b>{resolvedOtpFlow}</b>
              </div>

              <InlineAlert msg={message} />
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp">6-digit Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    className="tracking-widest text-center text-lg"
                  />

                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    This code expires shortly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-60"
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

          <div className="mt-6 text-center text-xs text-muted-foreground">
            If you didn’t receive the code, check spam or resend.
          </div>
        </div>
      </div>
    </div>
  );
}

