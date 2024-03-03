import { ChevronsUp } from "lucide-react";
import { FC, HTMLProps } from "react";
import useEventListener from "../util/hook/useEventListener";

type ReturnToTopButtonProps = {
  className?: HTMLProps<HTMLElement>["className"];
};

const ReturnToTopButton: FC<ReturnToTopButtonProps> = ({ className = "" }) => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const show = useEventListener<boolean>("scroll", () => {
    return window.scrollY > 100;
  });

  if (!show) return null;

  return (
    <div
      className={className + " text-[#9BA4B5] cursor-pointer animate-fade-in"}
      onClick={handleScrollToTop}
    >
      <ChevronsUp />
    </div>
  );
};

export default ReturnToTopButton;
