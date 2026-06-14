// src/components/AdminSignUpPage.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ShieldCheck, Lock, AlertTriangle, Eye, EyeOff, Check, Info } from "lucide-react";
import { api } from "../utils/api";

type InlineMsg = { type: "error" | "success" | "info"; text: string };

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

/** ✅ Inline alert (DIV box ABOVE the form) — ALWAYS white text */
function InlineAlert({ msg }: { msg: InlineMsg | null }) {
  if (!msg) return null;

  const style =
    msg.type === "error"
      ? "bg-red-500/15 border border-red-400/40 text-white"
      : msg.type === "success"
      ? "bg-emerald-500/15 border border-emerald-400/40 text-white"
      : "bg-cyan-500/15 border border-cyan-400/40 text-white";

  return (
    <div className={`mb-4 rounded-lg px-4 py-3 text-sm flex items-start gap-2 ${style}`}>
      {msg.type === "error" ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      ) : msg.type === "success" ? (
        <Check className="mt-0.5 h-4 w-4 flex-shrink-0" />
      ) : (
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
      )}
      <span className="leading-5">{msg.text}</span>
    </div>
  );
}

/** ✅ Name helpers */
const onlyLettersSpaces = (value: string) => value.replace(/[^A-Za-z ]/g, "");

const blockNonNameKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowed = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Tab",
    "Home",
    "End",
    "Enter",
  ];

  if (e.ctrlKey || e.metaKey) return;
  if (allowed.includes(e.key)) return;
  if (/^[a-zA-Z ]$/.test(e.key)) return;

  e.preventDefault();
};

export function AdminSignUpPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // ✅ Server msg (success/fail on submit)
  const [inlineMsg, setInlineMsg] = useState<InlineMsg | null>(null);

  // ✅ show validation messages only after user starts typing / submit
  const [touched, setTouched] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const rules = useMemo(
    () => ({
      length: formData.password.length >= 8,
      number: /[0-9]/.test(formData.password),
      special: /[^A-Za-z0-9]/.test(formData.password),
      upper: /[A-Z]/.test(formData.password),
      lower: /[a-z]/.test(formData.password),
    }),
    [formData.password]
  );

  const strengthOk = useMemo(() => Object.values(rules).every(Boolean), [rules]);

  const isGmail = (email: string) => email.toLowerCase().endsWith("@gmail.com");
  const onlyLetters = (v: string) => /^[A-Za-z ]+$/.test(v);
  const isPkPhone = (v: string) => /^\+92\d{10}$/.test(v.replace(/\s/g, "")); // +92 + 10 digits

  const validateAll = (data: FormState): FormErrors => {
    const e: FormErrors = {};

    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();
    const email = data.email.trim().toLowerCase();
    const phone = data.phone.trim().replace(/\s/g, "");
    const password = data.password;
    const confirm = data.confirmPassword;

    if (!firstName) e.firstName = "First name is required.";
    else if (!onlyLetters(firstName)) e.firstName = "Only letters/spaces allowed.";

    if (!lastName) e.lastName = "Last name is required.";
    else if (!onlyLetters(lastName)) e.lastName = "Only letters/spaces allowed.";

    if (!email) e.email = "Email is required.";
    else if (!isGmail(email)) e.email = "Only @gmail.com email is allowed.";

    if (!phone) e.phone = "Phone is required.";
    else if (!isPkPhone(phone)) e.phone = "Use Pakistani format: +92XXXXXXXXXX (10 digits after +92).";

    if (!password) e.password = "Password is required.";
    else if (!strengthOk) e.password = "Password does not meet requirements.";

    if (!confirm) e.confirmPassword = "Confirm password is required.";
    else if (password !== confirm) e.confirmPassword = "Passwords do not match.";

    return e;
  };

  const allErrors = useMemo(() => validateAll(formData), [formData, strengthOk]);

  // ✅ show ONE validation message in the top DIV (not under fields)
  const firstValidationMessage = useMemo(() => {
    const order: (keyof FormState)[] = ["firstName", "lastName", "email", "phone", "password", "confirmPassword"];
    for (const k of order) {
      const msg = allErrors[k];
      if (msg) return msg;
    }
    return "";
  }, [allErrors]);

  const isFormValid = useMemo(() => Object.keys(allErrors).length === 0, [allErrors]);

  // ✅ Top message priority:
  // 1) server msg
  // 2) validation msg (after touched)
  const topMsg: InlineMsg | null = useMemo(() => {
    if (inlineMsg) return inlineMsg;
    if (touched && firstValidationMessage) return { type: "error", text: firstValidationMessage };
    return null;
  }, [inlineMsg, touched, firstValidationMessage]);

  const setField = (key: keyof FormState, value: string) => {
    if (!touched) setTouched(true);
    if (inlineMsg) setInlineMsg(null);
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setInlineMsg(null);

    if (!isFormValid) return;

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim().replace(/\s/g, ""),
      password: formData.password,
    };

    try {
      setIsLoading(true);

      // ✅ correct backend endpoint
      await api.post("/api/auth/admin/request-signup", payload);

      // ✅ important: clear any previous OTP session keys from other flows
      localStorage.removeItem("otpEmail");
      localStorage.removeItem("otpFlow");
      localStorage.removeItem("otpSource");

      setInlineMsg({
        type: "success",
        text: "Request submitted ✅ Owner approval required. Activation link will be sent to your email.",
      });

      setTimeout(() => navigate("/admin-login"), 900);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Admin request failed.";
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

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-md lg:max-w-xl mx-auto">
          <div className="text-center mb-8">
            <ShieldCheck className="w-16 h-16 text-cyan-400 mx-auto mb-3" />
            <h1 className="mb-1 text-white">Admin Sign Up</h1>
            <p className="text-cyan-300">Request admin access (owner approval required)</p>
          </div>

          <Card className="bg-slate-800/80 border-cyan-500/40 backdrop-blur-md shadow-2xl shadow-cyan-500/10">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-white text-2xl">Create Admin Request</CardTitle>
              <CardDescription className="text-cyan-200">Fill details to request admin account</CardDescription>
            </CardHeader>

            <CardContent>
              {/* ✅ ALL errors now show HERE (DIV box ABOVE) */}
              <InlineAlert msg={topMsg} />

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-slate-200">First Name</Label>
                    <Input
                      value={formData.firstName}
                      onKeyDown={blockNonNameKeys}
                      onChange={(e) => setField("firstName", onlyLettersSpaces(e.target.value))}
                      className="bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">Last Name</Label>
                    <Input
                      value={formData.lastName}
                      onKeyDown={blockNonNameKeys}
                      onChange={(e) => setField("lastName", onlyLettersSpaces(e.target.value))}
                      className="bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className="bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-400"
                    placeholder="example@gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="+923211234567"
                    className="bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Password</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setField("password", e.target.value)}
                      className="bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="p-2 border border-slate-600 rounded-md text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="mt-2 space-y-1 text-sm">
                    <div className={`flex items-center gap-2 ${rules.length ? "text-green-400" : "text-slate-400"}`}>
                      <Check size={14} /> Minimum 8 characters
                    </div>
                    <div className={`flex items-center gap-2 ${rules.number ? "text-green-400" : "text-slate-400"}`}>
                      <Check size={14} /> One number
                    </div>
                    <div className={`flex items-center gap-2 ${rules.special ? "text-green-400" : "text-slate-400"}`}>
                      <Check size={14} /> One special character
                    </div>
                    <div className={`flex items-center gap-2 ${rules.upper ? "text-green-400" : "text-slate-400"}`}>
                      <Check size={14} /> One uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${rules.lower ? "text-green-400" : "text-slate-400"}`}>
                      <Check size={14} /> One lowercase letter
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Confirm Password</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setField("confirmPassword", e.target.value)}
                      className="bg-slate-700/60 border-slate-600 text-white placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="p-2 border border-slate-600 rounded-md text-white"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white disabled:opacity-60"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isLoading ? "Submitting..." : "Submit Request"}
                </Button>

                <div className="pt-2 text-center">
                  <p className="text-sm text-slate-400">
                    Already have admin?{" "}
                    <Link to="/admin-login" className="text-cyan-400 hover:underline">
                      Admin Login
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

