import { FC, ReactNode } from "react";
import AppHeader from "./AppHeader";

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
};

export default AppLayout;
