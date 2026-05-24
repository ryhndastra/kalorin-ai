import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";
import { addMealLog } from "../../api/trackService";
import toast from "react-hot-toast";
import { useUser } from "../../context/UserContext";

const SearchFoodCard = ({ food }) => {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const { fetchProfile } = useUser();

  // ADD TO MEAL
  const handleAddMeal = async () => {
    try {
      if (!user) {
        toast.error("Please sign in to add meals to your log.");
        return;
      }
      setIsAdding(true);
      
      await addMealLog({
        userId: user.id || user.uid,
        foodId: food.id,
        foodName: food.name,
        calories: food.calories,
        proteins: food.proteins,
        fat: food.fat,
        carbs: food.carbohydrate,
        quantity: 1,
        mealType: "meal",
      });
      // REFRESH PROFILE
      await fetchProfile(user.id || user.uid, true);

      toast.success(`${food.name} added to meal log`);
    } catch (error) {
      console.error("❌ Failed add meal:", error);
      toast.error("Failed to add meal log.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
      {/* IMAGE */}
      <img
        src={food.image}
        alt={food.name}
        className="w-24 h-24 rounded-2xl object-cover bg-gray-100"
      />

      {/* CONTENT */}
      <div className="flex-1">
        <h3 className="font-bold text-gray-800 text-lg mb-1">{food.name}</h3>
        <p className="text-sm text-[#22C55E] font-semibold mb-4">
          {food.calories} kcal
        </p>

        {/* MACROS */}
        <div className="flex gap-5 text-sm mb-4">
          <div>
            <span className="font-bold text-gray-800">{food.proteins}g</span>
            <p className="text-gray-500 text-xs">Protein</p>
          </div>

          <div>
            <span className="font-bold text-gray-800">
              {food.carbohydrate}g
            </span>
            <p className="text-gray-500 text-xs">Carbs</p>
          </div>

          <div>
            <span className="font-bold text-gray-800">{food.fat}g</span>
            <p className="text-gray-500 text-xs">Fat</p>
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleAddMeal}
          disabled={isAdding}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#22C55E] text-white text-sm font-semibold hover:bg-[#16A34A] transition-all disabled:opacity-50"
        >
          <Plus size={16} />
          {isAdding ? "Adding..." : "Add to Meal"}
        </button>
      </div>
    </div>
  );
};

export default SearchFoodCard;
