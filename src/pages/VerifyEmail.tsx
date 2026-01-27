import { useState } from "react";
import { Mail, CheckCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function VerifyEmail() {
  const { user, signOut } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    if (!user?.email) return;

    setIsResending(true);
    setError("");
    setResendSuccess(false);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });

    setIsResending(false);

    if (error) {
      setError(error.message);
    } else {
      setResendSuccess(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <div className="w-full max-w-md">
        <Card variant="elevated" className="animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Mail className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Verify your email</CardTitle>
            <CardDescription>
              We sent a verification link to{" "}
              <span className="font-medium text-foreground">{user?.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Please check your inbox and click the verification link to
              continue. If you don't see the email, check your spam folder.
            </p>

            {resendSuccess && (
              <div className="flex items-center gap-2 justify-center text-sm text-success">
                <CheckCircle className="h-4 w-4" />
                Verification email sent!
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <div className="space-y-2 pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending ? "Sending..." : "Resend verification email"}
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-2">
              After verifying, refresh this page to continue.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
