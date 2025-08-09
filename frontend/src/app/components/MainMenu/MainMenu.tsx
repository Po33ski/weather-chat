"use client";
import { useState } from "react";
import { useMediaQuery } from "@react-hook/media-query";
import { OPTIONS } from "@/app/constants/menuOptions";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import burger from "../../../../public/burger.png";
import { useContext } from "react";
import { LanguageContext } from "@/app/contexts/LanguageContext";
import { LanguageSelector } from "@/app/components/LanguageSelector/LanguageSelector";

export function MainMenu() {
  const pathname: string = usePathname();
  const [isMobileNavShown, setIsMobileNavShown] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const langCtx = useContext(LanguageContext);

  if (!isMobile && isMobileNavShown) {
    setIsMobileNavShown(false);
  }
  return (
    <>
      <nav
        className={`${
          isMobileNavShown
            ? "fixed right-2  bg-white z-20 top-0 py-[100px] w-[50%] opacity-[0.9] min-h-screen text-center "
            : "hidden"
        } md:block lg:block pl-8`}
      >
        <ul
          className={`flex text-xl lg:text-base gap-10 ${
            isMobileNavShown ? "flex flex-col" : ""
          }`}
        >
          {OPTIONS.map(({ path, optionName }) => (
            <li
              key={path}
              className={`${pathname === path ? "underline " : ""} 
              transition-all font-semibold uppercase hover:font-extrabold"`}
            >
              <Link href={path} onClick={() => setIsMobileNavShown(false)}>
                {langCtx?.t(`menu.${optionName.toLowerCase()}`) ?? optionName}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 md:mt-0">
          <LanguageSelector />
        </div>
      </nav>
      <Image
        onClick={() => {
          setIsMobileNavShown((prevValue) => !prevValue);
        }}
        className=" md:hidden lg:hidden z-30 mx-2"
        src={burger}
        alt="burger-button"
        width={32}
        height={32}
      />
    </>
  );
}
