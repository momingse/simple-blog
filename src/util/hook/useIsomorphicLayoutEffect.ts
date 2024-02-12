import { useEffect, useLayoutEffect } from "react";

type useIsomorphicLayoutEffectI = Parameters<typeof useEffect>;

const useIsomorphicLayoutEffect: (
  ...args: useIsomorphicLayoutEffectI
) => ReturnType<typeof useEffect> = (...args) => {
  const canUseDom = typeof window !== "undefined";

  return canUseDom ? useLayoutEffect(...args) : useEffect(...args);
};

export default useIsomorphicLayoutEffect;
