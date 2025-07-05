"use client";
import { ReactNode } from "react";
import { Footer } from "../Footer/Footer";
import { Logo } from "../Logo/Logo";
import { MainContent } from "../MainContent/MainContent";
import { MainMenu } from "../MainMenu/MainMenu";
import { SystemSelector } from "../SystemSelector/SystemSelector";
import { TopBar } from "../TopBar/TopBar";
import { InfoButton } from "../InfoButton/InfoButton";
import { ContextProviderComponent } from "../ContextProviderComponent/ContextProviderComponent";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <ContextProviderComponent>
        <div className="min-h-screen flex flex-col">
          <MainContent>
            <TopBar>
              <MainMenu />
              <Logo />
              <SystemSelector />
            </TopBar>
            <main className="flex-1">
              {children}
            </main>
          </MainContent>
          <Footer />
        </div>
      </ContextProviderComponent>
    </>
  );
};
