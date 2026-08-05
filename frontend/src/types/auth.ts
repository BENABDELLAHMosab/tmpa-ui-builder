export type UserRole = "admin" | "user-developer";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface CreateDeveloperPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface CreatedDeveloper {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface CreateDeveloperResponse {
  message: string;
  user: CreatedDeveloper;
}
