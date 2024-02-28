import { useMemo, useRef } from "react";
import useForceUpdate from "./useForceUpdate";
import useIsomorphicLayoutEffect from "./useIsomorphicLayoutEffect";

type CheckFunc = () => boolean;
type UseEventListener = (
  type: keyof WindowEventMap,
  checkFunc: CheckFunc,
) => boolean | null;

type UseObserver = (
  type: keyof WindowEventMap,
  checkFunc: CheckFunc,
) => Observer;
type Observer = {
  subscribe: (returnFunc: SubscribeFunc) => void;
  unsubscribe: () => void;
};

type SubscribeFunc = (returnValue: boolean) => void;

const useObserver: UseObserver = (type, checkFunc) => {
  return useMemo(() => {
    let listenerFunc = null;
    return {
      subscribe(sFunc: SubscribeFunc) {
        listenerFunc = () => {
          sFunc(checkFunc());
        };
        listenerFunc();
        window.addEventListener(type, listenerFunc);
      },
      unsubscribe() {
        window.removeEventListener(type, listenerFunc!);
      },
    };
  }, []);
};

const useEventListener: UseEventListener = (type, checkFunc) => {
  const forceUpdate = useForceUpdate();
  const returnRef = useRef<boolean>(false);
  const observer = useObserver(type, checkFunc);

  useIsomorphicLayoutEffect(() => {
    observer.subscribe((returnValue) => {
      if (returnValue !== returnRef.current) {
        returnRef.current = returnValue;
        forceUpdate();
      }
      returnRef.current = returnValue;
    });
    return () => observer.unsubscribe();
  }, []);

  return returnRef.current;
};

export default useEventListener;
