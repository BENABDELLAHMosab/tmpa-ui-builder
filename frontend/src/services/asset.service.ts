import { getAccessToken } from "../utils/authStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const assetService = {
  async uploadImage(file: File): Promise<{ id: string; originalName: string; mimeType: string; size: number }> {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_URL}/assets/images`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
        // Do NOT set Content-Type here, let the browser set it to multipart/form-data with boundary
      },
      body: formData
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Failed to upload image");
    }

    return response.json();
  },

  async getAssetBlob(assetId: string): Promise<Blob> {
    const token = getAccessToken();
    const response = await fetch(`${API_URL}/assets/${assetId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to load asset");
    }

    return response.blob();
  }
};
