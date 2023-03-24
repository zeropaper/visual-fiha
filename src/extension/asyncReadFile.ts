import { readFile } from 'fs'

export default async function asyncReadFile (fsPath: string): Promise<string> {
  return await new Promise((res, rej) => {
    try {
      readFile(fsPath, 'utf8', (err, content) => {
        if (err != null) {
          rej(err)
          return
        }

        res(content)
      })
    } catch (err) {
      rej(err)
    }
  })
}
