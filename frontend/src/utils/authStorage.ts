import type { AuthUser } from '../types/auth';

export const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const getAuthUser = (): AuthUser | null => {
  const userStr = localStorage.getItem("authUser");
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
};

export const clearAuthStorage = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("authUser");
};

export const getDashboardPathByRole = (role?: string): string => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "user-developer") return "/developer/dashboard";
  return "/login";
};
