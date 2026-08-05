export type UserRole = "admin" | "user-developer";
export type AccountStatus = "active" | "suspended";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  accountStatus?: AccountStatus;
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
  accountStatus?: AccountStatus;
  createdAt: string;
}

export interface CreateDeveloperResponse {
  message: string;
  user: CreatedDeveloper;
}

export interface DeveloperAccount {
  id: string;
  fullName: string;
  email: string;
  role: "user-developer";
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt?: string;
}
