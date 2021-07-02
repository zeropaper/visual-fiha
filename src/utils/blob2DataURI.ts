export default function blob2DataURI(blob) {
  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onerror = () => reject(new Error('FileReader error'));
    fileReader.onload = (evt) => resolve(evt.target.result);
    fileReader.readAsDataURL(blob);
  });
}
