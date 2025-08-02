import type { Attachment } from "ai";

export async function fileToAttachment(file: File): Promise<Attachment> {
  return {
    name: file.name,
    url: URL.createObjectURL(file),
    contentType: file.type,
  };
}

export async function filesToAttachments(files: File[]): Promise<Attachment[]> {
  return Promise.all(files.map(fileToAttachment));
}

export function getDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
