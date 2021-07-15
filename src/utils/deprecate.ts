const warned: string[] = [];
export default function deprecate(fn: any, message: string) {
  const { name, displayName } = fn;
  return (...args: any[]) => {
    const cached = name || displayName || 'anonymous';
    if (!warned.includes(cached)) {
      warned.push(cached);
      console.warn('[deprecated] %s: %s', cached, message);
    }
    return fn.apply(null, ...args);
  };
}
