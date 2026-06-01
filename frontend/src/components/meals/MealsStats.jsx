import React from "react";
import { useTranslation } from "react-i18next";
import { Flame, Beef, Apple } from "lucide-react";

const MealsStats = () => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");

  return (
    <div className="max-w-5xl mx-auto px-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500">
                {isId ? "Kalori Harian" : "Daily Calories"}
              </p>
              <h3 className="text-2xl font-bold text-gray-800">1,840</h3>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500">
              <Flame size={22} />
            </div>
          </div>

          <p className="text-xs text-green-600 font-medium">
            {isId
              ? "Sesuai dengan target harianmu"
              : "On track with your daily goal"}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500">
                {isId ? "Asupan Protein" : "Protein Intake"}
              </p>
              <h3 className="text-2xl font-bold text-gray-800">92g</h3>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-500">
              <Beef size={22} />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            {isId
              ? "Progres bagus untuk pemulihan otot"
              : "Great progress for muscle recovery"}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500">
                {isId ? "Pilihan Sehat" : "Healthy Choices"}
              </p>
              <h3 className="text-2xl font-bold text-gray-800">87%</h3>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-500">
              <Apple size={22} />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            {isId ? "Berdasarkan meal terakhirmu" : "Based on your recent meals"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MealsStats;
