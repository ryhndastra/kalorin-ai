import React from "react";
import { useTranslation } from "react-i18next";
import { Flame, Beef, Utensils, Target } from "lucide-react";

const InsightsSummaryCards = ({ summary }) => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const cards = [
    {
      label: isId ? "Rata-rata Kalori" : "Avg Calories",
      value: `${summary.averageCalories} kcal`,
      icon: Flame,
      bg: "bg-orange-50",
      color: "text-orange-500",
    },
    {
      label: isId ? "Rata-rata Protein" : "Avg Protein",
      value: `${summary.averageProtein}g`,
      icon: Beef,
      bg: "bg-blue-50",
      color: "text-blue-500",
    },
    {
      label: isId ? "Meal Tercatat" : "Meals Logged",
      value: summary.totalMeals,
      icon: Utensils,
      bg: "bg-green-50",
      color: "text-green-500",
    },
    {
      label: isId ? "Pencapaian Target" : "Goal Completion",
      value: `${summary.goalCompletionRate}%`,
      icon: Target,
      bg: "bg-purple-50",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${card.bg} ${card.color}`}
            >
              <Icon size={22} />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {card.value}
            </h3>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default InsightsSummaryCards;
