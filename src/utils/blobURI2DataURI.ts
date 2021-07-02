import blob2DataURI from './blob2DataURI';

export default function blobURI2DataURI(blobURI) {
  return fetch(blobURI)
    .then((res) => res.blob())
    .then((blob) => blob2DataURI(blob));
}
