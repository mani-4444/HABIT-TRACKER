import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
        <div className="w-full max-w-md">
          <Card variant="elevated" className="animate-fade-in">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <h2 className="text-xl font-semibold">
                  Password reset email sent
                </h2>
                <p className="text-sm text-muted-foreground">
                  Please check your inbox and spam folder for{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> The email may take a few minutes to
                    arrive. Be sure to check your spam or junk folder if you
                    don't see it in your inbox.
                  </p>
                </div>
                <div className="pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsSuccess(false)}
                  >
                    Try another email
                  </Button>
                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full">
                      Back to login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <Card variant="elevated" className="animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Mail className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Forgot password?</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
