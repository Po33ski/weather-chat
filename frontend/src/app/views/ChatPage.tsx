import { useState, useEffect, ReactPortal, useContext } from "react";
import { createPortal } from "react-dom";
import { Chat } from "../components/Chat/Chat";
import { AiWeatherPanel } from "../components/AiWeatherPanel/AiWeatherPanel";
import type { AiMeta, AiChatData } from "@/app/types/aiChat";
import { BrickModalContext } from "../contexts/BrickModalContext";
import type { BrickModalContextType } from "../types/types";
import { ModalBrick } from "../components/ModalBrick/ModalBrick";

export const ChatPage = () => {
  const [aiMeta, setAiMeta] = useState<AiMeta | null>(null);
  const [aiData, setAiData] = useState<AiChatData | null>(null);
  const [brickModal, setBrickModal] = useState<ReactPortal | null>(null);

  const brickModalContext = useContext<BrickModalContextType | null>(BrickModalContext);

  useEffect(() => {
    const portal = createPortal(<ModalBrick />, document.body);
    setBrickModal(portal);
    return () => setBrickModal(null);
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Chat — left column, sticky on desktop */}
        <div className="w-full lg:w-[42%] lg:sticky lg:top-20">
          <Chat onMetaChange={setAiMeta} onDataChange={setAiData} />
        </div>

        {/* Weather Panel — right column */}
        <div className="w-full lg:w-[58%]">
          <AiWeatherPanel meta={aiMeta} data={aiData} />
        </div>
      </div>

      {brickModalContext?.isModalShownInChatWeatherPage && brickModal}
    </div>
  );
};
