import { ReactNode, useMemo, useState } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { SYSTEMS } from "@/app/constants/unitSystems";
import { UnitSystemContext } from "@/app/contexts/UnitSystemContext";
import { BrickModalContext } from "@/app/contexts/BrickModalContext";
import { InfoModalContext } from "@/app/contexts/InfoModalContext";
import { CityContext } from "@/app/contexts/CityContextType";
import { AuthContext } from "@/app/contexts/AuthContext";
import { LanguageProvider } from "@/app/components/LanguageProvider/LanguageProvider";
import { BrickModalData } from "@/app/types/interfaces";
import { useAuthService } from "@/app/hooks/authService";

export const ContextProviderComponent = ({
  children,
}: {
  children: ReactNode;
}) => {
  const unitSystem = useLocalStorage("unit", SYSTEMS.METRIC);
  const city = useLocalStorage("city", "");
  const [isModalShownInCurrentWeatherPage, setIsModalShownInCurrentWeatherPage] = useState(false);
  const [isModalShownInChatWeatherPage, setIsModalShownInChatPage] = useState(false);
  const [isInfoModalShown, setIsInfoModalShown] = useState<boolean>(false);
  const [modalData, setModalData] = useState<BrickModalData>({
    data: null,
    kindOfData: null,
    title: null,
    desc: null,
  });

  const auth = useAuthService();
  const authValue = useMemo(() => auth, [auth.isAuthenticated, auth.user, auth.sessionId, auth.loading]);

  return (
    <LanguageProvider>
      <AuthContext.Provider value={authValue}>
        <CityContext.Provider value={{ city }}>
          <UnitSystemContext.Provider value={{ unitSystem }}>
            <BrickModalContext.Provider
              value={{
                isModalShownInCurrentWeatherPage,
                isModalShownInChatWeatherPage,
                setIsModalShownInCurrentWeatherPage,
                setIsModalShownInChatPage,
                modalData,
                setModalData,
              }}
            >
              <InfoModalContext.Provider
                value={{ isInfoModalShown, setIsInfoModalShown }}
              >
                {children}
              </InfoModalContext.Provider>
            </BrickModalContext.Provider>
          </UnitSystemContext.Provider>
        </CityContext.Provider>
      </AuthContext.Provider>
    </LanguageProvider>
  );
};
