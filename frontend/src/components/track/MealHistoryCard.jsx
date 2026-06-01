import React from "react";
import { useTranslation } from "react-i18next";
const MealHistoryCard = ({ log }) => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  return (
    <div className="bg-white rounded-2xl border border-[#E7EFE8] p-5 shadow-sm">
      <h3 className="font-medium text-gray-700 text-base mb-3">
        {log.foodName}
      </h3>
      <p className="text-[#22C55E] font-semibold text-sm mb-5">
        {Math.round(log.calories)} kcal
      </p>
      <div className="flex items-center gap-12 text-sm">
        <div>
          <p className="font-bold text-gray-800">{log.proteins}g</p>
          <p className="text-gray-500 text-xs">{isId ? "Protein" : "Protein"}</p>
        </div>

        <div>
          <p className="font-bold text-gray-800">{log.carbs}g</p>
          <p className="text-gray-500 text-xs">{isId ? "Karbo" : "Carbs"}</p>
        </div>

        <div>
          <p className="font-bold text-gray-800">{log.fat}g</p>
          <p className="text-gray-500 text-xs">{isId ? "Lemak" : "Fat"}</p>
        </div>
      </div>
    </div>
  );
};

export default MealHistoryCard;
