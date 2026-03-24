import type { ReactNode } from "react";
import { Navigate } from "react-router";
import type { Role } from "../utils/auth";
import { readStoredUser } from "../utils/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const user = readStoredUser();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RequireRole({
  children,
  roles,
}: {
  children: ReactNode;
  roles: Role[];
}) {
  const user = readStoredUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

