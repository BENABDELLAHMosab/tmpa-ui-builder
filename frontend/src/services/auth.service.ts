import type {
  LoginRequest,
  LoginResponse,
  CreateDeveloperPayload,
  CreateDeveloperResponse,
  AccountStatus,
  DeveloperAccount
} from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const authService = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Authentication failed");
    }

    return response.json();
  },

  createDeveloperAccount: async (payload: CreateDeveloperPayload): Promise<CreateDeveloperResponse> => {
    const response = await fetch(`${API_URL}/auth/users`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to create developer account");
    }

    return response.json();
  },

  getDevelopers: async (): Promise<DeveloperAccount[]> => {
    const response = await fetch(`${API_URL}/auth/users`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch developers");
    }

    const data: DeveloperAccount[] = await response.json();
    return data.map((dev) => ({
      ...dev,
      accountStatus: dev.accountStatus || 'active'
    }));
  },

  updateDeveloperStatus: async (userId: string, accountStatus: AccountStatus): Promise<DeveloperAccount> => {
    const response = await fetch(`${API_URL}/auth/users/${userId}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ accountStatus }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to update developer status");
    }

    const dev: DeveloperAccount = await response.json();
    return {
      ...dev,
      accountStatus: dev.accountStatus || 'active'
    };
  }
};
