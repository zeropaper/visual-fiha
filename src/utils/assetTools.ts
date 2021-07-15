// TODO: explore WebStream usage
// https://developer.mozilla.org/en-US/docs/Web/API/Streams_API
// https://nodejs.org/en/blog/release/v16.5.0/

let fetchedURLBlobs: any = {};

async function fetchBlob(url: string, force?: boolean): Promise<Blob> {
  fetchedURLBlobs[url] = force
    ? fetch(url).then((r) => r.blob())
    : fetchedURLBlobs[url] || fetch(url).then((r) => r.blob());
  return fetchedURLBlobs[url];
}

export function clearFetchedAssets(url?: string) {
  if (!url) {
    fetchedURLBlobs = {};
  } else {
    delete fetchedURLBlobs[url];
  }
}

export async function loadImage(url: string) {
  const blob = await fetchBlob(url);
  const img = await createImageBitmap(blob);
  return img;
}

export async function loadVideo(url: string) {
  const blob = await fetchBlob(url);
  const img = await createImageBitmap(blob);
  return img;
}

export async function asset(url: string) {
  const blob = await fetchBlob(url);
  if (blob.type.startsWith('image/')) {
    return loadImage(url);
  }
  if (blob.type.startsWith('video/')) {
    return loadVideo(url);
  }
  return blob;
}
