import styles from "./MainPhoto.module.css";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { MAIN_DESCRIPTIONS, MAIN_HEADERS } from "@/app/constants/descriptions";
import { MAIN_PHOTOS } from "@/app/constants/mainPhotos";

export function MainPhoto() {
  let pageName: "current" | "forecast" | "history" | "/";
  let path = "/";
  path = usePathname().slice(1);
  pageName =
    path === "current" || path === "forecast" || path === "history"
      ? path
      : "current";
  console.log("path:", path);

  const photo = path === "/" ? MAIN_PHOTOS["current"] : MAIN_PHOTOS[pageName];
  const description =
    path === "/" ? MAIN_DESCRIPTIONS["current"] : MAIN_DESCRIPTIONS[pageName];
  const header =
    path === "/" ? MAIN_HEADERS["current"] : MAIN_HEADERS[pageName];
  return (
    <div className="relative h-96 md:h-[250px] xl:h-[500px] overflow-hidden">
      <Image src={photo} layout="fill" objectFit="cover" alt="photo" />
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="max-w-5xl mx-auto text-center text-white p-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {header}
          </h2>
          <h4 className="text-lg md:text-xl lg:text-2xl">{description}</h4>
        </div>
      </div>
    </div>
  );
}
