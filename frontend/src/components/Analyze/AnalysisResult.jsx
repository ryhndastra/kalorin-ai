import React from "react";
import { Plus, Loader2 } from "lucide-react";

const AnalysisResult = ({
  result,
  onClear,
  onAddMeal,
  isAddingMeal = false,
  canAddMeal = true,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 mb-8 shadow-md border border-green-50 animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Analysis Result</h3>
        <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold">
          {result.confidence} Match
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-2xl">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Food Name
          </p>
          <p className="text-lg font-bold text-green-600">{result.foodName}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-2xl">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Est. Calories
          </p>
          <p className="text-lg font-bold text-orange-500">
            {result.calories} kcal
          </p>
        </div>
      </div>

      <div className="flex justify-between gap-2">
        {Object.entries(result.macros).map(([key, value]) => (
          <div
            key={key}
            className="flex-1 bg-white border border-gray-100 p-3 rounded-xl text-center shadow-sm"
          >
            <p className="text-[10px] text-gray-400 uppercase font-bold">
              {key}
            </p>
            <p className="text-sm font-bold text-gray-700">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onAddMeal}
          disabled={isAddingMeal}
          className="flex-1 py-3 rounded-2xl bg-[#22C55E] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#16A34A] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAddingMeal ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          {isAddingMeal
            ? "Adding..."
            : canAddMeal
              ? "Add to Meal Log"
              : "Sign in to Add"}
        </button>

        <button
          onClick={onClear}
          className="flex-1 py-3 rounded-2xl border border-gray-100 text-sm font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"
        >
          Clear Result
        </button>
      </div>
    </div>
  );
};

export default AnalysisResult;
