// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function writeFile(vfsPath: string, content: string) {
  //
}

export default class VFS {
  #tmppath = "";

  #files: Record<string, string>;

  add(vfsPath: string, content: string) {
    this.#files[vfsPath] = this.#files[vfsPath]
      ? `${this.#files[vfsPath]}${content}`
      : content;
  }

  async write() {
    return await Promise.all(
      Object.keys(this.#files).reduce(
        (promises: Array<Promise<any>>, key) => [
          ...promises,
          writeFile(key, this.#files[key]),
        ],
        []
      )
    );
  }
}
