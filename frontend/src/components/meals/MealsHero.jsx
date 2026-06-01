import React from "react";
import { useTranslation } from "react-i18next";

import { Brain } from "lucide-react";

const MealsHero = () => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  return (
    <div className="max-w-[1600px] mx-auto px-6 mt-8">
      <div className="bg-[#22C55E] rounded-2xl px-8 py-5 shadow-lg shadow-[#22C55E]/10">
        <div className="flex items-center gap-4">
          {/* ICON */}
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white flex-shrink-0">
            <Brain size={28} />
          </div>

          {/* TEXT */}
          <div>
            <h2 className="text-white font-bold text-xl leading-none mb-2">
              {isId ? "Pilihan Bertenaga AI" : "AI-Powered Picks"}
            </h2>

            <p className="text-white/80 text-sm">
              {isId
                ? "Berdasarkan target diet & asupan harianmu"
                : "Based on your diet goal & today's intake"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealsHero;
