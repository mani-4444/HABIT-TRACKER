import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const RESEND_COOLDOWN_SECONDS = 30;
const OTP_LENGTH = 8;

export default function VerifyOtp() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp } = useAuth();

  // Get email from navigation state
  const email = location.state?.email as string | undefined;

  // Redirect to signup if no email is provided
  useEffect(() => {
    if (!email) {
      navigate("/signup", { replace: true });
    }
  }, [email, navigate]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (email && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const getOtpString = useCallback(() => otp.join(""), [otp]);

  const handleVerify = useCallback(async () => {
    const otpString = getOtpString();
    if (!email || otpString.length !== OTP_LENGTH) return;

    setIsVerifying(true);
    setError("");

    const { error } = await verifyOtp(email, otpString);

    if (error) {
      setIsVerifying(false);
      // Handle specific error cases
      if (error.message.toLowerCase().includes("expired")) {
        setError("Code has expired. Please request a new one.");
      } else if (error.message.toLowerCase().includes("invalid")) {
        setError("Invalid verification code. Please try again.");
      } else {
        setError(error.message);
      }
      // Clear OTP on error so user can retry
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } else {
      // Verification successful - session is established
      navigate("/app", { replace: true });
    }
  }, [email, getOtpString, navigate, verifyOtp]);

  // Auto-submit when all 8 digits are entered
  useEffect(() => {
    if (getOtpString().length === OTP_LENGTH && !isVerifying) {
      handleVerify();
    }
  }, [otp, getOtpString, handleVerify, isVerifying]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/\D/g, "");

    if (numericValue.length === 0) {
      // Clear current input
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    if (numericValue.length === 1) {
      // Single digit input
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);

      // Move to next input
      if (index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const numericData = pastedData.replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (numericData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < OTP_LENGTH; i++) {
        newOtp[i] = numericData[i] || "";
      }
      setOtp(newOtp);

      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex((v) => v === "");
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[OTP_LENGTH - 1]?.focus();
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;

    setIsResending(true);
    setError("");
    setResendSuccess(false);

    const { error } = await resendOtp(email);

    setIsResending(false);

    if (error) {
      setError(error.message);
    } else {
      setResendSuccess(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      // Clear success message after a few seconds
      setTimeout(() => setResendSuccess(false), 5000);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <div className="w-full max-w-md">
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to signup
        </Link>

        <Card variant="elevated" className="animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Mail className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Verify your email</CardTitle>
            <CardDescription>
              Enter the verification code sent to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              Check your spam folder if you don't see it.
            </p>

            {/* OTP Input - 8 digits */}
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={handleFocus}
                  disabled={isVerifying}
                  className="w-10 h-12 text-center text-lg font-semibold border border-input rounded-md bg-background 
                    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-150 caret-primary
                    sm:w-11 sm:h-14 sm:text-xl"
                  aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                />
              ))}
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            {/* Resend success message */}
            {resendSuccess && (
              <div className="flex items-center gap-2 justify-center text-sm text-success">
                <CheckCircle className="h-4 w-4" />
                Verification code sent!
              </div>
            )}

            {/* Verify button */}
            <Button
              className="w-full h-11"
              onClick={handleVerify}
              disabled={getOtpString().length !== OTP_LENGTH || isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>

            {/* Resend button */}
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={isResending || cooldown > 0}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : cooldown > 0 ? (
                  `Resend code in ${cooldown}s`
                ) : (
                  "Resend verification code"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
