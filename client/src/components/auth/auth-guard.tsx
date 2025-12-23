import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { OnboardingModal } from "@/components/modals/onboarding-modal";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        setLocation("/");
      } else if (!requireAuth && user) {
        setLocation("/dashboard");
      }
    }
  }, [user, loading, requireAuth, setLocation]);

  // Show onboarding for new users
  useEffect(() => {
    if (user && !user.onboarded && requireAuth) {
      setShowOnboarding(true);
    }
  }, [user, requireAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return (
    <>
      {children}
      <OnboardingModal
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
      />
    </>
  );
}
