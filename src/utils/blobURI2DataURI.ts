import blob2DataURI from './blob2DataURI'

export default async function blobURI2DataURI (blobURI: string) {
  return await fetch(blobURI)
    .then(async (res) => await res.blob())
    .then(async (blob) => await blob2DataURI(blob))
}
