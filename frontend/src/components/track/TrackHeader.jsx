import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

const TrackHeader = ({ selectedDate, setSelectedDate }) => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        {isId ? "Pelacakan & Riwayat" : "Tracking & History"}
      </h1>

      <div className="relative inline-flex items-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-transparent text-sm text-gray-500 outline-none appearance-none cursor-pointer"
        />

        <ChevronDown
          size={16}
          className="absolute right-0 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
};

export default TrackHeader;
