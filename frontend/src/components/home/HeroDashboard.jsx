import React from "react";

const MacroBar = ({ label, percentage, color, bgTrack }) => (
  <div className="mb-3 last:mb-0">
    <div className="flex justify-between text-white text-xs font-medium mb-1">
      <span>{label}</span>
      <span>{percentage}%</span>
    </div>
    <div className={`w-full h-2 rounded-full overflow-hidden ${bgTrack}`}>
      <div
        className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const HeroDashboard = ({ user, userData }) => {
  // ambil nama depan
  const displayName = userData?.fullName || user?.displayName || "User";
  const firstName = displayName.split(" ")[0];

  // data & stats profile
  const stats = userData?.today_stats;
  const eaten = stats?.calories_consumed || 0;
  const goal = userData?.dailyCalories || 2000;
  const left = goal - eaten;

  // data BMI & ideal
  const bmiStatus = userData?.bmiStatus || "Normal";
  const idealRange = userData?.idealWeightRange?.label || "-- kg";
  const bmiValue = userData?.bmi || "0.0";

  // logic styling status BMI
  const getBmiTheme = (status) => {
    if (status === "Ideal/Normal")
      return "bg-white/20 text-white border-white/40";
    if (status === "Underweight")
      return "bg-yellow-400/30 text-yellow-100 border-yellow-400/50";
    return "bg-red-400/30 text-red-100 border-red-400/50"; // Overweight/Obese
  };

  // rumus hitung persentase
  const calcPercent = (current, target) => {
    if (!target || target === 0) return 0;
    const p = Math.round((current / target) * 100);
    return Math.min(p, 100);
  };

  const dashArray = 502.6;
  const dashOffset = dashArray - (dashArray * calcPercent(eaten, goal)) / 100;

  return (
    <div className="bg-[#22C55E] rounded-b-[40px] pt-8 pb-12 px-6 shadow-sm transition-all duration-500">
      <div className="max-w-5xl mx-auto">
        {/* header section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-white text-sm font-medium opacity-90">
              Hello,
            </h2>
            <h1 className="text-white text-3xl font-bold lowercase tracking-tight">
              {firstName}!
            </h1>
          </div>

          <div className="flex flex-col items-end">
            <div
              className={`px-3 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md uppercase tracking-wider ${getBmiTheme(bmiStatus)}`}
            >
              {bmiStatus}
            </div>
            <div className="text-white/80 text-[10px] mt-2 font-medium text-right uppercase tracking-tighter">
              Ideal Range:{" "}
              <span className="text-white font-bold">{idealRange}</span>
            </div>
          </div>
        </div>

        {/* main card */}
        <div className="bg-[#86EFAC]/40 backdrop-blur-sm border border-white/20 rounded-3xl p-6 flex flex-col md:flex-row gap-8 items-center shadow-xl">
          {/* progress ring */}
          <div className="relative flex flex-col items-center justify-center w-48 h-48 group">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="currentColor"
                strokeWidth="16"
                fill="transparent"
                className="text-green-700/20"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="currentColor"
                strokeWidth="16"
                fill="transparent"
                strokeDasharray={dashArray}
                style={{ strokeDashoffset: dashOffset }}
                className="text-white transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-white text-center">
              <span className="text-3xl font-extrabold tracking-tight">
                {eaten.toLocaleString()}
              </span>
              <span className="text-[10px] opacity-90 uppercase tracking-[0.2em] font-bold">
                kcal eaten
              </span>
              {/* BMI Sub-label */}
              <div className="mt-2 bg-black/10 px-2 py-0.5 rounded-md text-[9px] font-bold">
                BMI {bmiValue}
              </div>
            </div>
          </div>

          {/* macros section */}
          <div className="flex-1 w-full flex flex-col justify-center">
            {/* goal info (hidden di mobile) */}
            <div className="hidden md:block text-white mb-6">
              <p className="font-bold text-xl">
                {left > 0
                  ? `${left.toLocaleString()} kcal left`
                  : "Goal Reached!"}
              </p>
              <p className="text-xs opacity-80 uppercase tracking-widest">
                Target: {goal.toLocaleString()} kcal (
                {userData?.goal || "Stay Healthy"})
              </p>
            </div>

            <div className="space-y-4">
              <MacroBar
                label="Protein"
                percentage={calcPercent(
                  stats?.proteins || 0,
                  userData?.proteinTarget || 100,
                )}
                color="bg-white"
                bgTrack="bg-white/20"
              />

              <MacroBar
                label="Carbs"
                percentage={calcPercent(stats?.carbs || 0, 300)}
                color="bg-[#60A5FA]"
                bgTrack="bg-white/20"
              />

              <MacroBar
                label="Fat"
                percentage={calcPercent(stats?.fat || 0, 70)}
                color="bg-[#F59E0B]"
                bgTrack="bg-white/20"
              />

              {/* buat water masih dummy */}
              <MacroBar
                label="Water"
                percentage={60}
                color="bg-[#818CF8]"
                bgTrack="bg-white/20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDashboard;
