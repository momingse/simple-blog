import { FC, ReactNode } from "react";
import AppHeader from "./AppHeader";
import ReturnToTopButton from "./ReturnToTopButton";

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="relative">
      <AppHeader />
      {children}
      <ReturnToTopButton className="fixed bottom-6 right-6" />
    </div>
  );
};

export default AppLayout;
