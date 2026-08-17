import type { CreateCustomComponentPayload, CreateCustomComponentResponse, CustomComponentSummary, CustomComponentDetail } from '../types/customComponent';

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
      if (errorData.code) error.code = errorData.code;
      if (errorData.existingComponent) error.existingComponent = errorData.existingComponent;
      throw error;
    }

    return response.json();
  },

  getCustomComponents: async (): Promise<CustomComponentSummary[]> => {
    const response = await fetch(`${API_URL}/custom-components`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: any = new Error(errorData.error || "Failed to fetch custom components");
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return data.map((item: any) => ({
      ...item,
      id: item.id ?? item._id
    }));
  },

  getCustomComponent: async (id: string): Promise<CustomComponentDetail> => {
    const response = await fetch(`${API_URL}/custom-components/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: any = new Error(errorData.error || "Failed to fetch custom component details");
      error.status = response.status;
      throw error;
    }

    return response.json();
  },

  deleteCustomComponent: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/custom-components/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: any = new Error(errorData.error || "Failed to delete custom component");
      error.status = response.status;
      throw error;
    }
  }
};
