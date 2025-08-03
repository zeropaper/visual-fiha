import type { FileUIPart } from "ai";

export async function fileToFileUIPart(file: File): Promise<FileUIPart> {
  return {
    filename: file.name,
    url: URL.createObjectURL(file),
    mediaType: file.type,
    type: "file",
  };
}

export async function filesToFileUIParts(files: File[]): Promise<FileUIPart[]> {
  return Promise.all(files.map(fileToFileUIPart));
}

export function getDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
