import type { UiPage, CreatePageRequest, PageSchema } from '../types/page';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const pageService = {
  getPageById: async (pageId: string): Promise<UiPage> => {
    const response = await fetch(`${API_URL}/pages/${pageId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch page");
    }

    return response.json();
  },

  updatePage: async (pageId: string, payload: Partial<CreatePageRequest> & { schema?: PageSchema }): Promise<UiPage> => {
    const response = await fetch(`${API_URL}/pages/${pageId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to update page");
    }

    return response.json();
  },

  submitPage: async (pageId: string): Promise<UiPage> => {
    const response = await fetch(`${API_URL}/pages/${pageId}/submit`, {
      method: "POST",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to submit page");
    }

    return response.json();
  },

  getPages: async (): Promise<UiPage[]> => {
    const response = await fetch(`${API_URL}/pages`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch pages");
    }

    return response.json();
  },

  createPage: async (payload: CreatePageRequest): Promise<UiPage> => {
    const response = await fetch(`${API_URL}/pages`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to create page");
    }

    return response.json();
  },

  deletePage: async (pageId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/pages/${pageId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to delete page");
    }
  }
};
