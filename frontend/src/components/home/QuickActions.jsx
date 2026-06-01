import React from "react";
import { useTranslation } from "react-i18next";

import { Camera, Search, Plus, BarChart2 } from "lucide-react";

import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const navigate = useNavigate();

  const actions = [
    {
      id: 1,
      label: isId ? "Scan Makanan" : "Scan Food",
      icon: Camera,
      path: "/analyze?tab=scan",
    },
    {
      id: 2,
      label: isId ? "Cari" : "Search",
      icon: Search,
      path: "/analyze?tab=search",
    },
    {
      id: 3,
      label: isId ? "Tambah Meal" : "Add Meal",
      icon: Plus,
      path: "/meals",
    },
    {
      id: 4,
      label: isId ? "Insight" : "Insight",
      icon: BarChart2,
      path: "/insights",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 mt-8">
      <h3 className="text-gray-800 font-bold mb-4">
        {isId ? "Aksi Cepat" : "Quick Action"}
      </h3>

      <div className="bg-white rounded-3xl p-6 shadow-sm flex justify-between items-center border border-gray-50">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-2 group transition-transform hover:scale-105 active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#22C55E] flex items-center justify-center group-hover:bg-[#22C55E] group-hover:text-white transition-colors">
              <action.icon size={24} />
            </div>

            <span className="text-xs font-medium text-gray-600">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
