// ForgotPasswordPage.tsx (simplified)
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Shield } from "lucide-react";

type Msg = { type: "success" | "error"; text: string } | null;

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Msg>(null);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email) {
      setMessage({ type: "error", text: "Please enter your email." });
      return;
    }

    try {
      setIsLoading(true);
      await axios.post("http://127.0.0.1:5000/api/auth/forgot-password", { email });

      setMessage({
        type: "success",
        text: "If an account exists, a password reset link has been sent to your email.",
      });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to send reset link. Please try again.",
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
            <h1 className="mb-2">Forgot Password</h1>
            <p className="text-muted-foreground">Enter your email to receive a reset link</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Request Reset Link</CardTitle>
              <CardDescription>We will email you a secure link to reset your password</CardDescription>

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
              <form onSubmit={handleSendLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Remembered your password?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Back to Login
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

