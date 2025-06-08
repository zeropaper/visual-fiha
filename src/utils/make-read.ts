export function makeRead(obj: any): (path: string, defaultValue: any) => any {
  return (path: string, defaultVal?: any) => {
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
