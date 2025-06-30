import { BrickModalData } from "./interfaces";

export type BrickModalContextType = {
  isModalShown: boolean;
  setIsModalShown: (modalData: boolean) => void;
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
