import { useMemo, useRef } from "react";
import useForceUpdate from "./useForceUpdate";
import useIsomorphicLayoutEffect from "./useIsomorphicLayoutEffect";

type AcceptType = number | boolean;
type SubscribeType = keyof WindowEventMap;

type CheckFunc<T> = () => T;

type UseObserver = <T>(
  type: keyof WindowEventMap,
  checkFunc: CheckFunc<T>,
) => Observer<T>;

type Observer<T> = {
  subscribe: (returnFunc: SubscribeFunc<T>) => void;
  unsubscribe: () => void;
};

type UseEventListener = <T extends AcceptType>(
  type: keyof WindowEventMap,
  checkFunc: CheckFunc<T>,
  initialValue?: T,
) => T | null;

type SubscribeFunc<T> = (returnValue: T) => void;

const useObserver: UseObserver = <T>(
  type: SubscribeType,
  checkFunc: CheckFunc<T>,
) => {
  return useMemo(() => {
    let listenerFunc = null;
    return {
      subscribe(sFunc: SubscribeFunc<T>) {
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

const useEventListener: UseEventListener = <T extends AcceptType>(
  type: SubscribeType,
  checkFunc: CheckFunc<T>,
  initialValue?: T,
) => {
  const forceUpdate = useForceUpdate();
  const returnRef = useRef<T | null>(initialValue ?? null);
  const observer = useObserver<T>(type, checkFunc);

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
