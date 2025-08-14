import type { AssetConfig, RuntimeData } from "../types";
import type { ReadPath } from "./Scriptable.editor.types";

declare global {
  interface Window {
    assetsCache: Record<string, File | ImageBitmap>;
  }
}

const __cache__: Record<string, any | ImageBitmap> = {};
if (typeof window !== "undefined") {
  window.assetsCache = __cache__;
}

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

export async function imageBitmapFromUrl(url: string): Promise<ImageBitmap> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch image from URL: ${response.status} ${response.statusText}`,
    );
  }
  const blob = await response.blob();
  return createImageBitmap(blob);
}

async function handleImageAsset(found: AssetConfig & { url: string }) {
  let result: ImageBitmap;
  if (found.id.startsWith("blob:")) {
    result = await imageBitmapFromBlobUrl(found.id);
  } else {
    result = await imageBitmapFromUrl(found.id);
  }
  if (result) {
    __cache__[found.id!] = result;
  }
}

function handleAsset<O extends RuntimeData, R extends ReadPath, D = any>(
  obj: O,
  path: R,
  defaultVal?: D,
) {
  const parts = path.split(".");
  parts.shift();
  const id = parts.join(".");
  const found = obj.assets.find((asset) => asset.id === id);
  if (!found || !found.id) {
    return defaultVal;
  }
  const cached = __cache__[found.id];
  if (cached) {
    return cached;
  }

  if (found.source === "layer") {
    return found.canvas;
  }

  const ext = found.id.split(".").pop() || "";
  if (["jpg", "png", "jpeg", "gif", "webp"].includes(ext)) {
    handleImageAsset(found as any).catch(() => {});
  } else {
    fetch(found.id).then((res) => {
      if (!res.ok) {
        return;
      }
      res.blob().then((blob) => {
        __cache__[found.id!] = URL.createObjectURL(blob);
      });
    });
  }
  return defaultVal;
}

export function makeRead(obj: RuntimeData) {
  return <R extends ReadPath, D = any>(path: R, defaultVal?: D) => {
    const parts = path.split(".");
    if (parts[0] === "asset") {
      return handleAsset(obj, path, defaultVal);
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
