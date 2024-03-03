import {
  FC,
  HTMLProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import useEventListener from "../util/hook/useEventListener";
import { classNameCombiner } from "../util/helper";

const ADJUST_PX = 20;

type Item = {
  title: string;
  id: string;
};

type AnchorProps = {
  className?: HTMLProps<HTMLDivElement>["className"];
  items: Item[];
};

const Anchor: FC<AnchorProps> = ({ className, items }) => {
  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const getElementTopList = useCallback(() => {
    return items.map((item) => {
      const element = document.getElementById(item.id);
      if (!element)
        throw new Error(`Anchor cannot find element with id ${item.id}`);
      return element.offsetTop - ADJUST_PX;
    });
  }, [items]);

  const scrollProgress = useEventListener("scroll", () => {
    const elementTopList = getElementTopList();
    for (let i = 0; i < elementTopList.length; i++) {
      if (elementTopList[i] > window.scrollY) return i;
    }
    return elementTopList.length;
  });

  return (
    <div className={classNameCombiner(className, "flex")}>
      <div
        className="h-6 border border-sky-500 absolute"
        style={{
          borderWidth: scrollProgress === 0 ? 0 : "1px",
          top: `${Math.max(24 * (scrollProgress - 1), 0)}px`,
          transition: "top 0.2s",
        }}
      ></div>
      <div>
        {items.map((item, index) => {
          return (
            <div
              key={item.id}
              className={classNameCombiner(
                "cursor-pointer pl-3 pb-1",
                scrollProgress && scrollProgress - 1 === index
                  ? "text-sky-500"
                  : null,
              )}
              onClick={() => scrollToId(item.id)}
            >
              {item.title}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Anchor;
