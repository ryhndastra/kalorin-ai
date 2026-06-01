import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import FoodCard from "./MealsFoodCard";
import { getFoodRecommendations } from "../../api/aiService";

// MEALS GRID
const MealsGrid = ({ userId }) => {
  const [foods, setFoods] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  // FETCH AI RECOMMENDATIONS
  useEffect(() => {
    let active = true;
    const fetchMeals = async () => {
      if (!userId) {
        return;
      }

      try {
        setIsFetching(true);
        const response = await getFoodRecommendations(userId);
        if (response?.success && active) {
          setFoods(response.data || []);
        }
      } catch (error) {
        console.error("❌ Failed loading meals:", error);
      } finally {
        if (active) {
          setIsFetching(false);
        }
      }
    };
    fetchMeals();
    return () => {
      active = false;
    };
  }, [userId]);

  // CURATED MEALS
  const curatedMeals = useMemo(() => {
    if (foods.length <= 4) {
      return foods.slice(0, 4);
    }

    return foods.slice(4, 10);
  }, [foods]);

  return (
    <div className="max-w-[1600px] mx-auto px-6 mt-10 mb-14">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">More AI Picks</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          RinAI menemukan rekomendasi makanan lain yang tetap cocok dengan
          kebutuhan nutrisi dan goal kamu.
        </p>
      </div>

      {/* LOADING */}
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Loader2 className="animate-spin text-[#22C55E] mb-3" size={34} />
          <p className="text-gray-400 text-sm font-medium">
            RinAI sedang mencari rekomendasi lainnya...
          </p>
        </div>
      ) : curatedMeals.length > 0 ? (
        // GRID
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {curatedMeals.map((food) => (
            <FoodCard key={food.id} food={food} userId={userId} />
          ))}
        </div>
      ) : (
        // EMPTY
        <div className="bg-gray-50 rounded-3xl border border-dashed border-gray-200 py-16 text-center">
          <h3 className="text-gray-700 font-bold mb-2">
            Belum ada rekomendasi tambahan
          </h3>

          <p className="text-sm text-gray-400">
            RinAI masih mempelajari preferensi nutrisimu.
          </p>
        </div>
      )}
    </div>
  );
};

export default MealsGrid;
