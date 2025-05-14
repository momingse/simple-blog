import { FC, HTMLProps, useCallback } from "react";
import useEventListener from "../util/hook/useEventListener";
import { classNameCombiner } from "../util/helper";

const ADJUST_PX = 20;

export type Item = {
  title: string;
  id: string;
  level: 2 | 3;
};

type AnchorProps = {
  className?: HTMLProps<HTMLDivElement>["className"];
  items: Item[];
};

const Anchor: FC<AnchorProps> = ({ className, items }) => {
  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const getElementTopList = () => {
    return items.map((item) => {
      const element = document.getElementById(item.id);
      if (!element)
        throw new Error(`Anchor cannot find element with id ${item.id}`);
      return element.offsetTop - ADJUST_PX;
    });
  };

  const scrollProgress = useEventListener(
    "scroll",
    () => {
      const elementTopList = getElementTopList();
      for (let i = 0; i < elementTopList.length; i++) {
        if (elementTopList[i] > window.scrollY) return i;
      }
      return elementTopList.length;
    },
    0,
    [items],
  );

  return (
    <div className={classNameCombiner(className, "flex")}>
      <div
        className="h-4 border border-sky-500 absolute"
        style={{
          borderWidth: scrollProgress === 0 ? 0 : "1px",
          top: `${Math.max(1.25 * (scrollProgress! - 1), 0)}rem`,
          transition: "top 0.2s",
        }}
      ></div>
      <div className="pl-2 overflow-hidden flex flex-col gap-1">
        {items.map((item, index) => {
          return (
            <div
              key={item.id}
              className={classNameCombiner(
                "cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis",
                scrollProgress && scrollProgress - 1 === index
                  ? "text-sky-500"
                  : null,
                item.level === 2 ? "pl-0" : "pl-3",
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
