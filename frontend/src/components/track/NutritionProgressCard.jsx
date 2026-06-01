import React from "react";
import { useTranslation } from "react-i18next";

const NutritionProgressCard = ({
  calories,
  calorieGoal,
  progress,
  selectedDate,
}) => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const remainingCalories = Math.max(calorieGoal - calories, 0);

  const formattedDate = new Date(selectedDate).toLocaleDateString(
    isId ? "id-ID" : "en-US",
    {
    weekday: "long",
    month: "long",
    day: "numeric",
    },
  );

  return (
    <div className="bg-[#22C55E] rounded-3xl p-6 shadow-sm mb-8 text-white">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm font-medium opacity-90 mb-3">{formattedDate}</p>
          
          <div className="flex items-end gap-2">
            <h2 className="text-4xl font-bold leading-none">
              {Math.round(calories)}
            </h2>

            <span className="text-sm opacity-90 mb-1">
              / {calorieGoal} kcal
            </span>
          </div>
        </div>

        <span className="text-sm font-semibold opacity-90">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden mb-4">
        <div
          style={{
            width: `${progress}%`,
          }}
          className="h-full bg-white rounded-full transition-all duration-500"
        />
      </div>

      <p className="text-sm font-medium opacity-90">
        {Math.round(remainingCalories)}{" "}
        {isId ? "kkal tersisa" : "kcal remaining"}
      </p>
    </div>
  );
};

export default NutritionProgressCard;
