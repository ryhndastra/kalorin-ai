import React from "react";
import { useAuth } from "../context/AuthProvider";
import { useUser } from "../context/UserContext";
import { Ham, CircleCheck } from "lucide-react";
import Navbar from "../components/Navbar/Navbar";
import HomeSkeleton from "../components/skeletons/HomeSkeleton";
import HeroDashboard from "../components/home/HeroDashboard";
import QuickActions from "../components/home/QuickActions";
import InsightBanners from "../components/home/InsightBanners";
import RecommendationList from "../components/home/RecommendationList";

const HomePage = () => {
  const { user } = useAuth();
  const { userData, loading, isInitialized } = useUser();
  const showSkeleton = !isInitialized || loading;

  if (showSkeleton) {
    return (
      <div className="pt-20 bg-[#F8FAFC] min-h-screen">
        <Navbar user={user} loading={true} />
        <HomeSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 pt-20 font-sans">
      <Navbar user={user} loading={false} />

      <HeroDashboard user={user} userData={userData} />

      <QuickActions />

      <div className="max-w-5xl mx-auto px-6 mt-8">
        <h3 className="text-gray-800 font-bold mb-4">Today's Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* meals logged */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex flex-col items-center justify-center">
            <div className="text-[#22C55E] mb-2 text-2xl">
              <Ham />
            </div>
            <span className="font-bold text-lg text-gray-800">
              {/* ambil stats real dari backend jika ada, default ke 0 */}
              {userData?.today_stats?.meals_count || 0}
            </span>
            <span className="text-xs text-gray-500">Meals Logged</span>
          </div>

          {/* goals */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex flex-col items-center justify-center">
            <div className="text-[#22C55E] mb-2 text-2xl">
              <CircleCheck />
            </div>
            <span className="font-bold text-lg text-gray-800">
              {/* logic sederhana: on Track jika kalori belum overload */}
              {userData?.today_stats?.is_on_track !== false
                ? "On Track"
                : "Over Goal"}
            </span>
            <span className="text-xs text-gray-500">Goals</span>
          </div>
        </div>
      </div>

      <InsightBanners />

      {user && <RecommendationList userId={user.id || user.uid} />}
    </div>
  );
};

export default HomePage;
