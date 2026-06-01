/* eslint-disable no-unused-vars */
import React from "react";
import { useTranslation } from "react-i18next";
import { Trophy, CalendarCheck, Beef, Flame } from "lucide-react";

const GoalItem = ({ icon: Icon, title, value }) => {
  return (
    <div className="flex items-center gap-4 bg-white/10 border border-white/10 rounded-3xl px-5 py-5 backdrop-blur-sm">
      <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
        <Icon className="text-white" size={24} />
      </div>
      <div>
        <p className="text-white/65 text-sm">{title}</p>
        <h3 className="text-white text-3xl font-bold leading-tight">{value}</h3>
      </div>
    </div>
  );
};

// STREAK LEVELS
const getStreakLevel = (streak) => {
  if (streak >= 100) {
    return {
      color: "text-pink-300",
      bg: "bg-pink-400/20",
      border: "border-pink-300/20",
      glow: "shadow-pink-500/20",
      label: "Legend",
    };
  }
  if (streak >= 60) {
    return {
      color: "text-blue-200",
      bg: "bg-blue-400/20",
      border: "border-blue-300/20",
      glow: "shadow-blue-500/20",
      label: "Elite",
    };
  }
  if (streak >= 30) {
    return {
      color: "text-violet-200",
      bg: "bg-violet-400/20",
      border: "border-violet-300/20",
      glow: "shadow-violet-500/20",
      label: "Rare",
    };
  }

  if (streak >= 10) {
    return {
      color: "text-orange-200",
      bg: "bg-orange-400/20",
      border: "border-orange-300/20",
      glow: "shadow-orange-500/20",
      label: "Hot",
    };
  }

  if (streak >= 5) {
    return {
      color: "text-yellow-200",
      bg: "bg-yellow-400/20",
      border: "border-yellow-300/20",
      glow: "shadow-yellow-500/20",
      label: "Growing",
    };
  }

  return {
    color: "text-white",
    bg: "bg-white/15",
    border: "border-white/10",
    glow: "shadow-black/10",
    label: "Fresh",
  };
};

const NutritionScoreCard = ({ score, streaks }) => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const streakLevel = getStreakLevel(streaks?.trackingStreak || 0);

  return (
    <div className="bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-[2.25rem] p-10 mb-8 overflow-hidden relative shadow-xl">
      {/* GLOW */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-12">
        {/* LEFT */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-[1.75rem] bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Trophy className="text-white" size={38} />
            </div>

            <div>
              <p className="text-white/70 text-sm font-medium tracking-[0.22em] uppercase">
                {isId ? "Skor Nutrisi Mingguan" : "Weekly Nutrition Score"}
              </p>
              <h2 className="text-7xl font-bold text-white tracking-tight leading-none mt-2">
                {score.overall}
                <span className="text-white/50 text-4xl ml-1">/100</span>
              </h2>
            </div>
          </div>

          <p className="text-white/85 text-xl leading-relaxed">
            {score.message}
          </p>

          {/* STREAK */}
          {streaks?.trackingStreak > 0 && (
            <div className="mt-7">
              <div
                className={`inline-flex items-center gap-4 backdrop-blur-md rounded-3xl px-5 py-4 border shadow-2xl ${streakLevel.border} ${streakLevel.glow}`}
              >
                {/* ICON */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${streakLevel.bg}`}
                >
                  <Flame className={streakLevel.color} size={24} />
                </div>

                {/* TEXT */}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-white/55 text-xs uppercase tracking-[0.22em] font-semibold">
                      {isId ? "Streak Aktif" : "Active Streak"}
                    </p>

                    <div
                      className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${streakLevel.border} ${streakLevel.bg} ${streakLevel.color}`}
                    >
                      {streakLevel.label}
                    </div>
                  </div>

                  <h3 className="text-white text-2xl font-bold leading-tight tracking-tight">
                    {streaks.trackingStreak}{" "}
                    {isId ? "Hari Streak Tracking" : "Day Tracking Streak"}
                  </h3>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full xl:w-auto xl:min-w-[520px]">
          <GoalItem
            icon={CalendarCheck}
            title={isId ? "Target Tracking" : "Tracking Goal"}
            value={`${score.trackingDays}/7 ${isId ? "hari" : "days"}`}
          />
          <GoalItem
            icon={Beef}
            title={isId ? "Target Protein" : "Protein Goal"}
            value={`${score.proteinGoalHitDays}/7 ${isId ? "hari" : "days"}`}
          />
        </div>
      </div>
    </div>
  );
};

export default NutritionScoreCard;
