/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Flame,
  Utensils,
  Zap,
  Droplets,
  Sparkles,
  CircleX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getFoodRecommendation } from "../../api/aiService";
import { addMealLog } from "../../api/trackService";
import { useAuth } from "../../context/AuthProvider";
import { useUser } from "../../context/UserContext";
const CACHE_TTL = 1000 * 60 * 30; // 30 menit

const FoodDetailModal = ({ food, isOpen, onClose }) => {
  const { user } = useAuth();
  const { fetchProfile } = useUser();
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isAddingMeal, setIsAddingMeal] = useState(false);

  // TYPEWRITER EFFECT
  const typeText = useCallback((text) => {
    const str = String(text || "RinAI sedang menyiapkan analisis...");
    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      setDisplayedText(str.slice(0, i + 1));
      i++;
      if (i >= str.length) {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, []);

  // CACHE HELPERS
  const getCachedData = (key) => {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // invalid cache structure
      if (!parsed || !parsed.explanation || !parsed.timestamp) {
        sessionStorage.removeItem(key);
        return null;
      }

      // expired cache
      const isExpired = Date.now() - parsed.timestamp > CACHE_TTL;
      if (isExpired) {
        sessionStorage.removeItem(key);
        return null;
      }
      return parsed;
    } catch {
      sessionStorage.removeItem(key);
      return null;
    }
  };

  const saveCache = (key, data) => {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        ...data,
        timestamp: Date.now(),
      }),
    );
  };

  // FETCH AI
  useEffect(() => {
    if (!isOpen) {
      setDisplayedText("");
      setAiData(null);
      return;
    }

    if (!food?.id || !user?.id) return;
    const cacheKey = `rinai-${user.id}-${food.id}`;

    // CHECK CACHE
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      setAiData(cachedData);
      typeText(cachedData.explanation);
      return;
    }

    // FETCH FROM API
    const fetchAI = async () => {
      setLoading(true);
      try {
        const res = await getFoodRecommendation(user.id, parseInt(food.id));
        // ambil explanation secara aman
        const explanation = res?.recommendation?.explanation;
        // validasi explanation
        const safeExplanation =
          typeof explanation === "string" && explanation.trim().length > 0
            ? explanation
            : "RinAI belum bisa memberikan analisis detail untuk makanan ini.";
        const matchScore = res?.recommendation?.match_score_percent || 0;

        const dataToCache = {
          explanation: safeExplanation,
          match_score_percent: matchScore,
        };

        setAiData(dataToCache);
        saveCache(cacheKey, dataToCache);
        typeText(safeExplanation);
      } catch (err) {
        console.error("❌ Food Detail AI Error:", err);
        setDisplayedText(
          "RinAI sementara tidak dapat membuat analisis detail.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAI();
  }, [isOpen, food?.id, user?.id, typeText]);

  // ADD TO MEAL
  const handleAddMeal = async () => {
    try {
      if (!user) {
        return;
      }
      setIsAddingMeal(true);

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

      // REFRESH HOMEPAGE STATS
      await fetchProfile(user.id || user.uid, true);

      toast.success(`${food.name} added to meal log`, {
        icon: <Utensils size={18} />,
      });
    } catch (error) {
      toast.error("Failed to add meal", {
        icon: <CircleX size={18} />,
      });
      console.error("❌ Failed add meal:", error);
    } finally {
      setIsAddingMeal(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && food && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* BACKDROP */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* MODAL */}
          <motion.div
            initial={{
              scale: 0.9,
              opacity: 0,
              y: 20,
            }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
            }}
            exit={{
              scale: 0.9,
              opacity: 0,
              y: 20,
            }}
            className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl z-10 relative"
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white z-20 transition-colors"
            >
              <X size={20} />
            </button>

            {/* FOOD IMAGE */}
            <img
              src={food.image}
              className="w-full h-52 object-cover"
              alt={food.name}
            />

            <div className="p-6 text-left">
              {/* TITLE */}
              <h2 className="text-2xl font-bold text-gray-800">{food.name}</h2>
              <p className="text-gray-500 text-sm mb-6 italic">
                Nutritional info per serving
              </p>

              {/* NUTRITION GRID */}
              <div className="grid grid-cols-4 gap-2 mb-6 text-center">
                <div className="bg-orange-50 p-2 rounded-xl text-orange-500">
                  <Flame size={14} className="mx-auto" />
                  <p className="text-xs font-bold">{food.calories}</p>
                </div>

                <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
                  <Utensils size={14} className="mx-auto" />
                  <p className="text-xs font-bold">{food.proteins}g</p>
                </div>

                <div className="bg-yellow-50 p-2 rounded-xl text-yellow-500">
                  <Zap size={14} className="mx-auto" />
                  <p className="text-xs font-bold">{food.fat}g</p>
                </div>

                <div className="bg-purple-50 p-2 rounded-xl text-purple-500">
                  <Droplets size={14} className="mx-auto" />
                  <p className="text-xs font-bold">{food.carbohydrate}g</p>
                </div>
              </div>

              {/* AI ANALYSIS */}
              <div className="bg-[#22C55E]/5 rounded-2xl p-4 border border-[#22C55E]/10 min-h-[100px]">
                <div className="flex items-center gap-2 mb-2 text-[#22C55E]">
                  <Sparkles size={16} />
                  <span className="font-bold text-sm">RinAI Analysis</span>
                </div>

                {loading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-2 bg-green-100 rounded w-full"></div>
                    <div className="h-2 bg-green-100 rounded w-3/4"></div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed italic">
                    {displayedText}
                    <span className="inline-block w-1 h-4 bg-[#22C55E] ml-1 animate-pulse" />
                  </p>
                )}
              </div>

              {/* BUTTON */}
              <button
                onClick={handleAddMeal}
                disabled={isAddingMeal}
                className="w-full mt-6 py-4 bg-[#22C55E] text-white font-bold rounded-2xl disabled:opacity-50"
              >
                {isAddingMeal ? "Adding..." : "Add to Meal Log"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FoodDetailModal;
