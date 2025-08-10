import type { ReadPath } from "./Scriptable.editor.types";

export function makeRead(obj: any) {
  return (path: ReadPath, defaultVal?: any) => {
    const parts = path.split(".");
    let value: any = obj;
    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = value[part];
      } else {
        return defaultVal;
      }
    }
    return value !== undefined ? value : defaultVal;
  };
}
