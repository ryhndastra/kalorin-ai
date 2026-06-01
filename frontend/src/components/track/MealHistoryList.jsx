import React from "react";
import { useTranslation } from "react-i18next";
import MealHistoryCard from "./MealHistoryCard";

const MealHistoryList = ({ logs, selectedDate }) => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const formattedDate = new Date(selectedDate).toLocaleDateString(
    isId ? "id-ID" : "en-US",
    {
    weekday: "long",
    month: "long",
    day: "numeric",
    },
  );

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-5">
        {formattedDate} {isId ? "Log Makan" : "Meal Log"}
      </h2>

      <div className="space-y-4">
        {logs.map((log) => (
          <MealHistoryCard key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
};

export default MealHistoryList;
