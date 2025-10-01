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
        } md:block lg:block`}
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
      </nav>
      <button
        aria-label="Open menu"
        title="Menu"
        onClick={() => {
          setIsMobileNavShown((prevValue) => !prevValue);
        }}
        className="md:hidden lg:hidden z-30 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-blue-300 bg-white shadow-sm hover:border-blue-400 hover:shadow-md active:scale-[0.98] transition"
     >
        <Image
          src={burger}
          alt="burger-icon"
          width={18}
          height={18}
          className="opacity-80"
        />
        <span className="sr-only">Menu</span>
      </button>
    </>
  );
}
