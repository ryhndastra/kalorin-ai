import React from "react";
import { useTranslation } from "react-i18next";

const LoadingCard = () => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  return (
    <div className="bg-white rounded-3xl p-10 mb-6 text-center shadow-sm border border-green-100 flex flex-col items-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mb-4"></div>
      <p className="text-gray-600 font-medium italic">
        {isId
          ? "AI sedang mengidentifikasi meal kamu..."
          : "AI is identifying your meal..."}
      </p>
    </div>
  );
};

export default LoadingCard;
