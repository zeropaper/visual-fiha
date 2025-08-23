import type { FileUIPart } from "../types";

/**
 * Converts a Blob to a data URL for use in the browser.
 * This is used to create data URLs from uploaded files that can be sent to the AI.
 *
 * @param blob - The Blob object to convert
 * @returns Promise that resolves to a data URL string
 *
 * @example
 * ```typescript
 * const file = new File(['content'], 'test.txt');
 * const dataUrl = await getDataURL(file);
 * // dataUrl will be something like "data:text/plain;base64,Y29udGVudA=="
 * ```
 */
export function getDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Converts an array of File objects to FileUIPart objects.
 * This processes uploaded files and creates the data structure needed for the AI Assistant.
 *
 * @param files - Array of File objects from file input
 * @returns Promise that resolves to an array of FileUIPart objects
 *
 * @example
 * ```typescript
 * const files = Array.from(fileInput.files);
 * const fileUIParts = await filesToFileUIParts(files);
 * // Each FileUIPart will have url, filename, mediaType, and type properties
 * ```
 */
export async function filesToFileUIParts(files: File[]): Promise<FileUIPart[]> {
  return Promise.all(
    files.map(async (file) => {
      const url = await getDataURL(file);
      return {
        type: "file" as const,
        url,
        filename: file.name,
        mediaType: file.type,
      };
    }),
  );
}
