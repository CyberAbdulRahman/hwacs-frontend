// SignUpPage.tsx
import { api } from "../utils/api";
import { useMemo, useState } from "react";
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
import { Shield, Eye, EyeOff, Check } from "lucide-react";

export function SignUpPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password rules
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

  const passedRules = Object.values(rules).filter(Boolean).length;
  const strength =
    passedRules <= 2 ? "weak" : passedRules <= 4 ? "medium" : "strong";

  const strengthWidth =
    strength === "weak" ? "25%" : strength === "medium" ? "50%" : "100%";

  const strengthColor =
    strength === "weak"
      ? "bg-red-500"
      : strength === "medium"
      ? "bg-yellow-400"
      : "bg-green-500";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setMessage({ type: "error", text: "Please fill all fields." });
      return;
    }

    const email = formData.email.trim().toLowerCase();
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const username = formData.username.trim();

    if (!email.endsWith("@gmail.com")) {
      setMessage({ type: "error", text: "Only @gmail.com email is allowed." });
      return;
    }

    if (username.length < 6) {
      setMessage({
        type: "error",
        text: "Username must be at least 6 characters.",
      });
      return;
    }

    if (!Object.values(rules).every(Boolean)) {
      setMessage({
        type: "error",
        text: "Password does not meet requirements.",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    try {
      setIsLoading(true);

      const res = await api.post("/api/auth/register" , {
        firstName,
        lastName,
        username,
        email,
        password: formData.password,
      });

      // ✅ USER SIGNUP OTP FLOW KEYS (as you asked)
      localStorage.setItem("otpEmail", email);
      localStorage.setItem("otpFlow", "user_signup");
      localStorage.setItem("otpSource", "user_signup");

      // optional (keep if you need later)
      localStorage.setItem(
        "pendingUser",
        JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email,
          role: res.data?.role ?? "user",
        })
      );

      setMessage({
        type: "success",
        text: "Account created! OTP sent to your email. Redirecting...",
      });

      // ✅ your requested redirect time
      setTimeout(() => navigate("/otp-verification"), 900);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Signup failed. Please try again.";
      setMessage({ type: "error", text: msg });
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
            <h1>Create Your Account</h1>
            <p className="text-muted-foreground">
              Join HWACS - Start monitoring threats
            </p>
          </div>

          <Card className="border border-blue-500/90 shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_20px_55px_rgba(59,130,246,0.10)] rounded-xl">
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Fill in your details</CardDescription>

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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) =>
                        /^[a-zA-Z]*$/.test(e.target.value) &&
                        setFormData({
                          ...formData,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) =>
                        /^[a-zA-Z]*$/.test(e.target.value) &&
                        setFormData({
                          ...formData,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Username</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) =>
                      /^[a-zA-Z0-9_]*$/.test(e.target.value) &&
                      setFormData({
                        ...formData,
                        username: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Letters, numbers, underscore (_). Min 6 characters.
                  </p>
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 border rounded-md"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="mt-2 h-[4px] w-full bg-gray-200 rounded overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strengthColor}`}
                      style={{ width: strengthWidth }}
                    />
                  </div>

                  <p className="text-xs mt-1 font-semibold capitalize">{strength}</p>

                  <div className="mt-2 space-y-1 text-sm">
                    {Object.entries(rules).map(([key, ok]) => (
                      <div
                        key={key}
                        className={`flex items-center gap-2 ${
                          ok ? "text-green-600" : "text-gray-400"
                        }`}
                      >
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
                  <Label>Confirm Password</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-2 border rounded-md"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
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

