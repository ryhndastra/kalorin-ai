import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight, Loader2 } from "lucide-react";
import HomeFoodCard from "./HomeFoodCard";
import { getFoodRecommendations } from "../../api/aiService";
import { Link } from "react-router-dom";

// RECOMMENDATION LIST
const RecommendationList = ({
  userId,
  limit = 4,
  title = "Recommended for You",
  showSeeAll = true,
  className = "",
}) => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const [foods, setFoods] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  // FETCH RECOMMENDATION
  useEffect(() => {
    let active = true;
    const fetchRecommendations = async () => {
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
        console.error("❌ Failed loading recommendation:", error);
      } finally {
        if (active) {
          setIsFetching(false);
        }
      }
    };

    fetchRecommendations();
    return () => {
      active = false;
    };
  }, [userId, isId]);

  return (
    <div className={`max-w-5xl mx-auto px-6 mt-8 mb-12 ${className}`}>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-gray-800 font-bold">
            {title === "Recommended for You"
              ? isId
                ? "Rekomendasi untukmu"
                : title
              : title}
          </h3>
          <span className="bg-[#22C55E]/10 text-[#22C55E] text-[10px] px-2 py-0.5 rounded-full font-bold border border-[#22C55E]/20">
            BY RINAI
          </span>
        </div>
        {showSeeAll && (
          <Link
            to="/meals"
            className="flex items-center text-[#22C55E] text-sm font-medium hover:underline"
          >
            {isId ? "Lihat Semua" : "See All"}
            <ChevronRight size={16} />
          </Link>
        )}
      </div>

      {/* LOADING */}
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Loader2 className="animate-spin text-[#22C55E] mb-2" size={32} />
          <p className="text-gray-400 text-sm font-medium">
            {isId
              ? "RinAI sedang memilihkan makanan terbaik untukmu..."
              : "RinAI is selecting the best foods for you..."}
          </p>
        </div>
      ) : foods.length > 0 ? (
        // GRID
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {foods.slice(0, limit).map((food) => (
            <HomeFoodCard key={food.id} food={food} userId={userId} />
          ))}
        </div>
      ) : (
        // EMPTY
        <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-3xl">
          {isId
            ? "Belum ada rekomendasi yang cocok dengan profilmu."
            : "No recommendations match your profile yet."}
        </div>
      )}
    </div>
  );
};

export default RecommendationList;
