import { useState, useContext } from "react";
import { useMediaQuery } from "@react-hook/media-query";
import { LanguageContext } from "@/app/contexts/LanguageContext";
import burger from "../../../../public/burger.png";

const MENU_ITEMS = [
  { path: "/history", key: "history" },
  { path: "/current", key: "current" },
  { path: "/forecast", key: "forecast" },
  { path: "/chat", key: "chat" },
];

export function MainMenu() {
  const pathname: string =
    typeof window !== "undefined" ? window.location.pathname : "/";
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
            ? "fixed right-2 bg-white z-20 top-0 py-[100px] w-[50%] opacity-[0.9] min-h-screen text-center"
            : "hidden"
        } md:block lg:block`}
      >
        <ul
          className={`flex text-xl lg:text-base gap-10 ${
            isMobileNavShown ? "flex flex-col" : ""
          }`}
        >
          {MENU_ITEMS.map(({ path, key }) => (
            <li
              key={path}
              className={`${
                pathname === path ? "underline " : ""
              } transition-all font-semibold uppercase hover:font-extrabold`}
            >
              <a href={path} onClick={() => setIsMobileNavShown(false)}>
                {langCtx?.t(`menu.${key}`) ?? key}
              </a>
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
        <img src={burger} alt="burger-icon" className="w-[18px] h-[18px] opacity-80" />
        <span className="sr-only">Menu</span>
      </button>
    </>
  );
}
