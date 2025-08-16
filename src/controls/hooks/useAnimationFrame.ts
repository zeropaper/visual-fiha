import { useCallback, useLayoutEffect, useRef } from "react";

export function useAnimationFrame(cb: () => void) {
  const cbRef = useRef<() => void>();
  const frame = useRef<number>();

  cbRef.current = cb;

  const animate = useCallback(() => {
    cbRef.current?.();
    frame.current = requestAnimationFrame(animate);
  }, []);

  useLayoutEffect(() => {
    frame.current = requestAnimationFrame(animate);
    return () => {
      if (frame.current !== undefined) {
        cancelAnimationFrame(frame.current);
      }
    };
  }, [animate]);
}
