import { useLayoutEffect, useMemo, useRef } from "react";
import useForceUpdate from "./useForceUpdate";
import useIsomorphicLayoutEffect from "./useIsomorphicLayoutEffect";

type Breakpoint = "xxl" | "xl" | "lg" | "md" | "sm" | "xs";
type BreakpointMap = Record<Breakpoint, string>;
type SceenMap = Partial<Record<Breakpoint, boolean>>;
type SubscribeFunc = (screens: SceenMap) => void;

const responsiveMap: BreakpointMap = {
  xs: "(max-width: 576px)",
  sm: "(min-width: 576px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 992px)",
  xl: "(min-width: 1200px)",
  xxl: "(min-width: 1400px)",
};

const useScreenObserver = () => {
  return useMemo(() => {
    const subscribers = new Map<number, SubscribeFunc>();
    let subUid = -1;
    let screens: SceenMap = {};
    return {
      matchHandlers: {} as {
        [props: string]: {
          mql: MediaQueryList;
          listener: (e: MediaQueryListEvent) => void;
        };
      },
      subscribe(func: SubscribeFunc) {
        if (subscribers.size === 0) this.register();
        subUid += 1;
        subscribers.set(subUid, func);
        func(screens);
        return subUid;
      },
      unsubscribe(paramToken: number) {
        subscribers.delete(paramToken);
        if (subscribers.size === 0) this.unregister();
      },
      register() {
        Object.entries(responsiveMap).map(([pb, query]) => {
          const listener = ({ matches }: { matches: boolean }) => {
            this.dispatch({
              ...screens,
              [pb]: matches,
            });
          };
          const mql = window.matchMedia(query);
          mql.addEventListener("change", listener);
          listener(mql);
          this.matchHandlers[query] = {
            mql,
            listener,
          };
        });
      },
      unregister() {
        Object.values(responsiveMap).forEach((query) => {
          const handler = this.matchHandlers[query];
          handler.mql.removeEventListener("change", handler.listener);
        });
        subscribers.clear();
      },
      dispatch(newScreen: SceenMap) {
        screens = newScreen;
        subscribers.forEach((subscriberFunc) => subscriberFunc(screens));
      },
    };
  }, []);
};

const useBreakpoint = () => {
  const forceUpdate = useForceUpdate();
  const screenRef = useRef<SceenMap>({});
  const observer = useScreenObserver();

  useIsomorphicLayoutEffect(() => {
    const uid = observer.subscribe((newScreen) => {
      screenRef.current = newScreen;
      forceUpdate();
    });
    return () => observer.unsubscribe(uid);
  }, []);

  return screenRef.current;
};

export default useBreakpoint;
