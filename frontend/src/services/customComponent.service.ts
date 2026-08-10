import type { CreateCustomComponentPayload, CreateCustomComponentResponse } from '../types/customComponent';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const customComponentService = {
  createCustomComponent: async (payload: CreateCustomComponentPayload): Promise<CreateCustomComponentResponse> => {
    const response = await fetch(`${API_URL}/custom-components`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: any = new Error(errorData.error || "Failed to create custom component");
      error.status = response.status;
      throw error;
    }

    return response.json();
  }
};
