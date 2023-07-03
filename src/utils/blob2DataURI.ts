export default async function blob2DataURI(blob: Blob) {
  const fileReader = new FileReader();
  return await new Promise((resolve, reject) => {
    fileReader.onerror = () => {
      reject(new Error("FileReader error"));
    };
    fileReader.onload = (evt: ProgressEvent<FileReader>) => {
      resolve(evt.target?.result);
    };
    fileReader.readAsDataURL(blob);
  });
}
