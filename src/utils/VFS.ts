// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function writeFile(vfsPath: string, content: string) {
  //
}

export default class VFS {
  #tmppath = '';

  #files: { [vfsPath: string]: string };

  add(vfsPath: string, content: string) {
    this.#files[vfsPath] = this.#files[vfsPath]
      ? `${this.#files[vfsPath]}${content}`
      : content;
  }

  async write() {
    return Promise.all(Object.keys(this.#files)
      .reduce((promises: Promise<any>[], key) => [
        ...promises,
        writeFile(key, this.#files[key]),
      ], []));
  }
}