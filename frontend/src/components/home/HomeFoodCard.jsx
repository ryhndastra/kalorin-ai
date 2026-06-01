import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { BrainCircuit } from "lucide-react";
import FoodDetailModal from "../common/FoodDetailModal";
const HomeFoodCard = ({ food, userId }) => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const languageKey = isId ? "id" : "en";
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [aiData, setAiData] = useState(() => {
    if (!userId) {
      return null;
    }
    const cached = sessionStorage.getItem(
      `rinai-${languageKey}-${userId}-${food.id}`,
    );
    return cached ? JSON.parse(cached) : null;
  });

  return (
    <>
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full relative group">
        {/* AI SCORE */}
        {(food.matchScore || aiData?.match_score_percent) && (
          <div className="absolute top-2 right-2 bg-[#22C55E] text-white text-[10px] px-2 py-1 rounded-lg font-bold shadow-sm flex items-center gap-1 z-10">
            <BrainCircuit size={10} />
            {food.matchScore || aiData.match_score_percent}%
          </div>
        )}

        {/* IMAGE */}
        <img
          src={food.image || "https://via.placeholder.com/300"}
          alt={food.name}
          className="w-full h-32 object-cover rounded-xl mb-3 bg-gray-100"
        />

        {/* CONTENT */}
        <h4 className="font-bold text-gray-800 text-sm truncate">
          {food.name}
        </h4>

        <p className="text-[11px] text-gray-400 mb-3">{food.calories} kcal</p>

        {/* BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="mt-auto w-full py-2 bg-gray-50 text-gray-600 text-[11px] font-bold rounded-xl hover:bg-[#22C55E] hover:text-white transition-all border border-gray-100"
        >
          {isId ? "Detail" : "Details"}
        </button>
      </div>

      {/* MODAL */}
      <FoodDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        food={food}
        userId={userId}
        onAiDataReceived={(data) => setAiData(data)}
      />
    </>
  );
};

export default HomeFoodCard;
