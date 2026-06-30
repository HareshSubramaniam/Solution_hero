import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { ReactNode, useEffect } from "react";

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation("/auth");
      } else if (requireAdmin && user?.role !== "admin") {
        setLocation("/feed");
      }
    }
  }, [isLoading, isAuthenticated, requireAdmin, user, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (requireAdmin && user?.role !== "admin") return null;

  return <>{children}</>;
}
