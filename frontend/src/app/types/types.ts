import { BrickModalData } from "./interfaces";

export type BrickModalContextType = {
  isModalShownInCurrentWeatherPage: boolean;
  isModalShownInChatWeatherPage: boolean;
  setIsModalShownInCurrentWeatherPage: (modalData: boolean) => void;
  setIsModalShownInChatPage: (modalData: boolean) => void;
  modalData: BrickModalData;
  setModalData: (modalData: BrickModalData) => void;
};

export type InfoModalContextType = {
  isInfoModalShown: boolean;
  setIsInfoModalShown: (modalData: boolean) => void;
};

export type UnitSystemContextType = {
  unitSystem: {
    data: string | null;
    setToLocalStorage: (newData: unknown) => void;
  };
};

export type CityContextType = {
  city: {
    data: string | null;
    setToLocalStorage: (newData: unknown) => void;
  };
};

export type Lang = "en" | "pl";

export type LanguageValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string) => string;
};

// Component props moved here for centralization
export type AuthWindowProps = {
  isConnected: boolean;
  googleButtonRef: React.RefObject<HTMLDivElement>;
  setupTotp: any;
  verifyTotp: any;
  checkTotpStatus: any;
};

export type TotpAuthProps = {
  setupTotp: (email: string) => Promise<string | null>;
  verifyTotp: (email: string, code: string) => Promise<any>;
  checkTotpStatus: (email: string) => Promise<{ success: boolean; has_totp: boolean; error?: string }>;
  onSuccess: () => void;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  user: import("./interfaces").User | null;
  sessionId: string | null;
  loading: boolean;
  handleGoogleSignIn: (response: any) => Promise<void>;
  validateSession: (sessionId: string) => Promise<void>;
  logout: () => Promise<void>;
  getSessionId: () => string | null;
  getUser: () => import("./interfaces").User | null;
  setupTotp: (email: string) => Promise<string | null>;
  verifyTotp: (email: string, code: string) => Promise<import("./interfaces").TotpAuthRes>;
  checkTotpStatus: (email: string) => Promise<{ success: boolean; has_totp: boolean; error?: string }>;
};

export type WhereFromType = "current weather" | "chat";