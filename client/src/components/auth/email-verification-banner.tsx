import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, X, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function EmailVerificationBanner() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  // Don't show banner if user is verified or dismissed
  if (!user || user.emailVerified || !isVisible) {
    return null;
  }

  const resendVerification = async () => {
    try {
      setIsResending(true);
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to resend verification email");
      }
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <Mail className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <span className="font-medium text-orange-800">Email not verified.</span>{" "}
          <span className="text-orange-700">
            Please check your email and click the verification link to verify your account.
          </span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            onClick={resendVerification}
            disabled={isResending}
            className="text-orange-600 border-orange-300 hover:bg-orange-100"
          >
            {isResending ? "Sending..." : "Resend"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            className="text-orange-600 hover:bg-orange-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export function EmailVerifiedBadge() {
  const { user } = useAuth();

  if (!user?.emailVerified) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
      <CheckCircle className="h-3 w-3" />
      Verified
    </div>
  );
}