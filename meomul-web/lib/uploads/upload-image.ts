import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/lib/config/env";

export type UploadImageTarget = "hotel" | "room" | "member" | "chat";

function getUploadBaseUrl(): string {
  return `${env.apiUrl}/upload`;
}

export async function uploadImageFile(
  file: File,
  target: UploadImageTarget,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const headers = new Headers();
  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${getUploadBaseUrl()}/image?target=${target}`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Upload failed (${response.status})`);
  }

  const json = (await response.json()) as { url?: string };
  if (!json.url) {
    throw new Error("Upload response did not include an image URL.");
  }

  return json.url;
}
