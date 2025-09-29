"use client";
import { ReactNode } from "react";
import { Footer } from "../Footer/Footer";
import { Logo } from "../Logo/Logo";
import { MainContent } from "../MainContent/MainContent";
import { MainMenu } from "../MainMenu/MainMenu";
import { SystemSelector } from "../SystemSelector/SystemSelector";
import { LanguageSelector } from "../LanguageSelector/LanguageSelector";
import { TopBar } from "../TopBar/TopBar";
import { ContextProviderComponent } from "../ContextProviderComponent/ContextProviderComponent";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <ContextProviderComponent>
        <div className="min-h-screen flex flex-col">
          <MainContent>
            <TopBar>
              <div className="flex items-center justify-self-start">
                <MainMenu />
              </div>
              <div className="flex items-center justify-center justify-self-center">
                <Logo />
              </div>
              <div className="flex items-center gap-2 justify-self-end">
                <LanguageSelector />
                <SystemSelector />
              </div>
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
