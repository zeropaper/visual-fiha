import { readFile } from "fs";

export default async function asyncReadFile(fsPath: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    try {
      readFile(fsPath, "utf8", (err, content) => {
        if (err != null) {
          reject(err);
          return;
        }

        resolve(content);
      });
    } catch (err) {
      reject(err);
    }
  });
}
