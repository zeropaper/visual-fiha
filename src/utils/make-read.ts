import type { RuntimeData } from "../types";
import type { ReadPath } from "./Scriptable.editor.types";

const cache: Record<string, File | ImageBitmap> = {};

export async function imageBitmapFromBlobUrl(
  blobUrl: string,
): Promise<ImageBitmap> {
  // Validate the URL (optional, but helps catch silly bugs)
  if (!blobUrl.startsWith("blob:")) {
    throw new Error("Provided URL is not a blob URL");
  }

  // Fetch the blob data
  const response = await fetch(blobUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch blob from URL: ${response.status} ${response.statusText}`,
    );
  }

  const blob = await response.blob();

  // Convert blob into an ImageBitmap
  return createImageBitmap(blob);
}

export function makeRead(obj: RuntimeData) {
  return (path: ReadPath, defaultVal?: any) => {
    const parts = path.split(".");
    if (parts[0] === "asset") {
      parts.shift();
      const id = parts.join(".");
      const found = obj.assets.find((asset) => asset.id === id);
      if (!found || !found.url) {
        return defaultVal;
      }
      const cached = cache[found.url];
      if (cached) {
        return cached;
      }
      const ext = found.id.split(".").pop() || "";
      if (["jpg", "png", "jpeg", "gif", "webp"].includes(ext)) {
        imageBitmapFromBlobUrl(found.url)
          .then((bitmap) => {
            cache[found.url!] = bitmap;
          })
          .catch(() => {});
      }
      return defaultVal;
    }
    let value: any = obj;
    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = value[part];
      } else {
        return defaultVal;
      }
    }
    return value !== undefined ? value : defaultVal;
  };
}
