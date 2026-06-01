import React from "react";
import { useTranslation } from "react-i18next";

const SearchCategoryChips = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}) => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const labelMap = {
    "High Protein": isId ? "Protein Tinggi" : "High Protein",
    "Low Carb": isId ? "Karbo Rendah" : "Low Carb",
    Healthy: isId ? "Sehat" : "Healthy",
    Breakfast: isId ? "Sarapan" : "Breakfast",
    "Low Sugar": isId ? "Gula Rendah" : "Low Sugar",
    Snacks: isId ? "Camilan" : "Snacks",
  };
  return (
    <>
      <p className="text-xs text-gray-500 mb-4">
        {isId ? "Jelajahi Kategori" : "Browse Categories"}
      </p>
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setSelectedCategory(item)}
            className={`px-4 py-2 rounded-xl text-xs transition-all border ${
              selectedCategory === item
                ? "bg-[#22C55E] text-white border-[#22C55E]"
                : "bg-white text-gray-700 border-gray-200 hover:border-[#22C55E] hover:text-[#22C55E]"
            }`}
          >
            {labelMap[item] || item}
          </button>
        ))}
      </div>
    </>
  );
};

export default SearchCategoryChips;
