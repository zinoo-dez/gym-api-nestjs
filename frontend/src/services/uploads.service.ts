import { apiClient } from "@/lib/api-client";

interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export const uploadsService = {
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<{ data: UploadResponse }>("/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },
};
