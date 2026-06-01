import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import { useAuth } from "../context/AuthProvider";
import {
  getInsightsDashboard,
  getBehavioralInsights,
} from "../api/insightService";
import InsightsTrendChart from "../components/insights/InsightsTrendChart";
import BehavioralInsightsList from "../components/insights/BehavioralInsightsList";
import WeeklyComparisonCard from "../components/insights/WeeklyComparisonCard";
import NutritionScoreCard from "../components/insights/NutritionScoreCard";
import InsightsPageSkeleton from "../components/skeletons/InsightsPageSkeleton";
import BehavioralInsightsSkeleton from "../components/skeletons/insights/BehavioralInsightsSkeleton";

const InsightsPage = () => {
  const { user } = useAuth();

  // STATES
  const [trends, setTrends] = useState([]);
  const [behavioralInsights, setBehavioralInsights] = useState([]);
  const [behavioralSource, setBehavioralSource] = useState("unknown");
  const [comparison, setComparison] = useState({
    caloriesChange: 0,
    proteinsChange: 0,
    trackingChange: 0,
    hasPreviousData: false,
  });

  const [score, setScore] = useState({
    overall: 0,
    consistency: 0,
    protein: 0,
    calories: 0,
    message: "",
    trackingDays: 0,
    proteinGoalHitDays: 0,
  });

  const [streaks, setStreaks] = useState(null);

  // PAGE LOADING
  const [pageLoading, setPageLoading] = useState(true);
  // AI LOADING
  const [behavioralLoading, setBehavioralLoading] = useState(true);

  // FETCH MAIN INSIGHTS
  useEffect(() => {
    const fetchMainInsights = async () => {
      try {
        if (!user) {
          return;
        }

        const userId = user.uid || user.id;
        setPageLoading(true);

        const dashboardRes = await getInsightsDashboard(userId);
        const dashboardData = dashboardRes?.data || {};

        setTrends(dashboardData.trends || []);
        setComparison(
          dashboardData.comparison || {
            caloriesChange: 0,
            proteinsChange: 0,
            trackingChange: 0,
            hasPreviousData: false,
          },
        );
        setScore(
          dashboardData.score || {
            overall: 0,
            consistency: 0,
            protein: 0,
            calories: 0,
            message: "",
            trackingDays: 0,
            proteinGoalHitDays: 0,
          },
        );
        setStreaks(dashboardData.streaks || null);
      } catch (error) {
        console.error("❌ Failed fetching main insights:", error);
      } finally {
        setPageLoading(false);
      }
    };
    fetchMainInsights();
  }, [user]);

  // FETCH AI INSIGHTS
  useEffect(() => {
    const fetchBehavioralInsights = async () => {
      try {
        if (!user) {
          return;
        }
        const userId = user.uid || user.id;
        setBehavioralLoading(true);
        const response = await getBehavioralInsights(userId);
        setBehavioralInsights(response.data);
        setBehavioralSource(response.source || "unknown");
      } catch (error) {
        console.error("❌ Failed fetching behavioral insights:", error);
      } finally {
        setBehavioralLoading(false);
      }
    };

    fetchBehavioralInsights();
  }, [user]);

  // PAGE LOADING
  if (pageLoading) {
    return <InsightsPageSkeleton user={user} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} loading={false} />
      {/* HERO */}
      <div className="max-w-[1600px] mx-auto px-6 pt-28">
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
                Weekly Insights
              </h1>
              <p className="text-gray-500 mt-2 text-lg">
                Analyze your nutrition behavior and weekly trends
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="bg-[#EEFaf1] pb-20 pt-10">
        <div className="max-w-[1600px] mx-auto px-6">
          {/* SCORE */}
          <NutritionScoreCard score={score} streaks={streaks} />

          {/* WEEKLY COMPARISON */}
          <div className="bg-gradient-to-br from-white to-[#F8FAFC] rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 overflow-hidden relative">
            {/* GLOW */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#22C55E]/5 blur-3xl rounded-full pointer-events-none" />

            {/* HEADER */}
            <div className="mb-8 relative z-10">
              <h2 className="text-3xl font-bold text-gray-900">
                Weekly Comparison
              </h2>
              <p className="text-gray-500 mt-2">
                Compare your nutrition progress with the previous week
              </p>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">
              <WeeklyComparisonCard
                type="calories"
                percentage={comparison.caloriesChange}
                hasPreviousData={comparison.hasPreviousData}
              />
              <WeeklyComparisonCard
                type="protein"
                percentage={comparison.proteinsChange}
                hasPreviousData={comparison.hasPreviousData}
              />
              <WeeklyComparisonCard
                type="tracking"
                percentage={comparison.trackingChange}
                hasPreviousData={comparison.hasPreviousData}
              />
            </div>
          </div>

          {/* TRENDS */}
          <InsightsTrendChart trends={trends} />

          {/* BEHAVIORAL */}
          {behavioralLoading ? (
            <BehavioralInsightsSkeleton />
          ) : (
            <BehavioralInsightsList
              insights={behavioralInsights}
              source={behavioralSource}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
