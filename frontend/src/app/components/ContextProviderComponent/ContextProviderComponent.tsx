import { ReactNode, useState } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { SYSTEMS } from "@/app/constants/unitSystems";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { BrickModalContext } from "@/app/contexts/BrickModalContext";
import { InfoModalContext } from "@/app/contexts/InfoModalContext";
import { CityContext } from "@/app/contexts/CityContextType";
import { BrickModalData } from "@/app/types/interfaces";

export const ContextProviderComponent = ({
  children,
}: {
  children: ReactNode;
}) => {
  const unitSystem = useLocalStorage("unit", SYSTEMS.METRIC);
  const city = useLocalStorage("city", "");
  const [isModalShown, setIsModalShown] = useState(false);
  const [isInfoModalShown, setIsInfoModalShown] = useState<boolean>(false);
  const [modalData, setModalData] = useState<BrickModalData>({
    data: null,
    kindOfData: null,
    title: null,
    desc: null,
  });

  return (
    <CityContext.Provider value={{ city }}>
      <UnitSystemContext.Provider value={{ unitSystem }}>
        <BrickModalContext.Provider
          value={{ isModalShown, setIsModalShown, modalData, setModalData }}
        >
          <InfoModalContext.Provider
            value={{ isInfoModalShown, setIsInfoModalShown }}
          >
            {children}
          </InfoModalContext.Provider>
        </BrickModalContext.Provider>
      </UnitSystemContext.Provider>
    </CityContext.Provider>
  );
};
