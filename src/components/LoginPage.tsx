// src/components/LoginPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Shield } from "lucide-react";
import { api } from "../utils/api";

export function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setMessage({
        type: "error",
        text: "Please enter email and password.",
      });
      return;
    }

    if (!email.endsWith("@gmail.com")) {
      setMessage({
        type: "error",
        text: "Only @gmail.com email is allowed.",
      });
      return;
    }

    if (password.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters long.",
      });
      return;
    }

    try {
      setIsLoading(true);

      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      const data = res.data;

      if (data?.requires_otp) {
        localStorage.setItem("otpEmail", data.email || email);
        localStorage.setItem("otpFlow", "user_login");
        localStorage.setItem("otpSource", "user_login");

        setMessage({
          type: "success",
          text: data.message || "OTP sent to your email. Please verify.",
        });

        setTimeout(() => {
          navigate("/otp-verification");
        }, 500);

        return;
      }

      setMessage({
        type: "error",
        text: "OTP step missing. Please try again.",
      });
    } catch (error: any) {
      console.error("Login failed:", error);

      const backendMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "";

      setMessage({
        type: "error",
        text:
          backendMessage ||
          "Login failed. Please check your email and password.",
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
            <div className="flex justify-center mb-4">
              <Shield className="w-16 h-16 text-primary" />
            </div>

            <h1 className="mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Login to HWACS</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your credentials to continue
              </CardDescription>

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
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>

                  <Input
                    id="email"
                    type="email"
                    placeholder="john@gmail.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    required
                    className="bg-input-background"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>

                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
                    required
                    className="bg-input-background"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex justify-end -mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="text-primary hover:underline">
                    Sign up here
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
