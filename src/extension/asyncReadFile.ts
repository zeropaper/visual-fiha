import { readFile } from 'fs';

export default function asyncReadFile(fsPath: string): Promise<string> {
  return new Promise((res, rej) => {
    try {
      readFile(fsPath, 'utf8', (err, content) => {
        if (err) {
          rej(err);
          return;
        }

        res(content);
      });
    } catch (err) {
      rej(err);
    }
  });
}
