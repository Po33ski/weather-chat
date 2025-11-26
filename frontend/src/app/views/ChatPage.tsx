"use client";
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
    <>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Chat (shorter) */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-[45vh] overflow-y-auto">
          <Chat onMetaChange={setAiMeta} onDataChange={setAiData} />
        </div>
        {/* AI Weather Panel below chat */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <AiWeatherPanel meta={aiMeta} data={aiData} />
        </div>
        {brickModalContext?.isModalShownInChatWeatherPage && brickModal}
      </div>
    </>
  );
};