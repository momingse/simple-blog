import { FC, ReactNode } from "react";
import AppHeader from "./AppHeader";
import ReturnToTopButton from "./ReturnToTopButton";
import Particles from "./Particles";

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="relative bg-slate-50">
      <Particles />
      <AppHeader />
      <main className="pt-28 px-6">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
      <ReturnToTopButton className="fixed bottom-6 right-6" />
    </div>
  );
};

export default AppLayout;
