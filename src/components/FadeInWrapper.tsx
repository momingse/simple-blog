import { Children, FC, HTMLProps, ReactNode, useEffect, useState } from "react";
import { classNameCombiner } from "../util/helper";

type FadeInWrapperProps = {
  children: ReactNode;
  className?: HTMLProps<HTMLElement>["className"];
  delay?: number;
  duration?: number;
  onComplete?: () => void;
  WrapperTag?: JSX.ElementType;
  ChildTag?: JSX.ElementType;
};

const FadeInWrapper: FC<FadeInWrapperProps> = ({
  children,
  className = "",
  onComplete,
  delay = 0.1,
  duration = 0.8,
  WrapperTag = "div",
  ChildTag = "div",
}) => {
  const [numberOfChildrenVisible, setNumberOfChildrenVisible] = useState(0);
  useEffect(() => {
    setNumberOfChildrenVisible(0);

    const updateNumberOfChildrenVisible = setInterval(() => {
      setNumberOfChildrenVisible((prev) => prev + 1);
      if (numberOfChildrenVisible === Children.count(children) + 1) {
        onComplete && onComplete();
        clearInterval(updateNumberOfChildrenVisible);
      }
    }, delay * 1000);

    return () => clearInterval(updateNumberOfChildrenVisible);
  }, [delay, Children.count(children)]);

  return (
    <WrapperTag className={classNameCombiner(className, "relative top-[20px]")}>
      {Children.map(children, (child, index) => {
        return (
          <ChildTag
            key={index}
            style={{
              transition: `opacity ${duration}s, transform ${duration}s`,
              opacity: index < numberOfChildrenVisible ? 1 : 0,
              transform:
                index < numberOfChildrenVisible
                  ? `translateY(${-20}px)`
                  : "none",
            }}
          >
            {child}
          </ChildTag>
        );
      })}
    </WrapperTag>
  );
};

export default FadeInWrapper;