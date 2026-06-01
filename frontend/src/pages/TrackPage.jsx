/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar/Navbar";
import { useAuth } from "../context/AuthProvider";
import { useUser } from "../context/UserContext";
import { getDailyLogs } from "../api/trackService";
import TrackHeader from "../components/track/TrackHeader";
import NutritionProgressCard from "../components/track/NutritionProgressCard";
import MealHistoryList from "../components/track/MealHistoryList";
import TrackEmptyState from "../components/track/TrackEmptyState";
import TrackSkeleton from "../components/skeletons/TrackSkeleton";

const TrackPage = () => {
  const { user } = useAuth();
  const { userData } = useUser();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [totals, setTotals] = useState({
    calories: 0,
    proteins: 0,
    fat: 0,
    carbs: 0,
  });
  const [loading, setLoading] = useState(true);

  // JAKARTA DATE
  const getJakartaDate = () => {
    return new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });
  };

  // SELECTED DATE
  const [selectedDate, setSelectedDate] = useState(getJakartaDate());

  // CTA VISIBILITY
  const [showCTA, setShowCTA] = useState(true);
  const scrollTimeout = useRef(null);

  // FETCH TRACK LOGS
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        if (!user) {
          return;
        }
        setLoading(true);
        const response = await getDailyLogs(user.uid || user.id, selectedDate);
        setLogs(response?.data?.logs || []);
        setTotals(
          response?.data?.totals || {
            calories: 0,
            proteins: 0,
            fat: 0,
            carbs: 0,
          },
        );
      } catch (error) {
        console.error("❌ Failed loading track logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user, selectedDate]);

  // SCROLL CTA BEHAVIOR
  useEffect(() => {
    const handleScroll = () => {
      setShowCTA(false);

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        setShowCTA(true);
      }, 180);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // CALORIE GOAL
  const calorieGoal = userData?.dailyCalories || 2000;

  // CALORIE PROGRESS
  const calorieProgress = useMemo(() => {
    return Math.min((totals.calories / calorieGoal) * 100, 100);
  }, [totals.calories, calorieGoal]);

  // LOADING STATE
  if (loading) {
    return (
      <>
        <Navbar user={user} loading={true} />
        <TrackSkeleton />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-28">
      <Navbar user={user} loading={false} />

      {/* HEADER SECTION */}
      <div className="max-w-[1600px] mx-auto px-6">
        <TrackHeader
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </div>

      {/* CONTENT SECTION */}
      <div className="bg-[#EEF7F0] pb-32">
        <div className="max-w-[1600px] mx-auto px-6 pt-10">
          <NutritionProgressCard
            calories={totals.calories}
            calorieGoal={calorieGoal}
            progress={calorieProgress}
            selectedDate={selectedDate}
          />

          {logs.length > 0 ? (
            <MealHistoryList logs={logs} selectedDate={selectedDate} />
          ) : (
            <TrackEmptyState />
          )}
        </div>
      </div>

      {/* FLOATING CTA */}
      <AnimatePresence>
        {showCTA && (
          <motion.div
            initial={{
              opacity: 0,
              y: 100,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 100,
            }}
            transition={{
              duration: 0.25,
            }}
            className="fixed bottom-6 inset-x-0 z-30 flex justify-center px-6"
          >
            <div className="w-full max-w-[1600px]">
              <button
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] transition-all duration-300 text-white font-semibold py-5 rounded-2xl shadow-2xl flex items-center justify-center gap-3"
                onClick={() => navigate("/analyze")}
              >
                <ScanLine size={22} />
                <span>Scan & Log Meal</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrackPage;
