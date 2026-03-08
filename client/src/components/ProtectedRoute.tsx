import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import Landing from "@/pages/Landing";
import SetupProfile from "@/pages/SetupProfile";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useUser();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  // Force setup if mandatory fields are missing
  if (!user.ageGroup || !user.preferredLanguage) {
    return <SetupProfile />;
  }

  return <>{children}</>;
}
