import React from "react";
import { Target, Flame, Zap, PencilLine, Activity } from "lucide-react";
import ProfileItem from "./ProfileItem";
import { useUser } from "../../context/UserContext";
import { getActivityLevelLabel } from "../../utils/profileOptions";

const GoalsCard = ({ onEdit }) => {
  const { userData } = useUser(); // ambil userData dari UserContext untuk akses goal, dailyCalories, proteinTarget

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-gray-800">Goal Settings</h3>
        <button
          onClick={onEdit}
          className="text-green-600 flex items-center gap-2 text-sm font-semibold hover:bg-green-50 px-3 py-1 rounded-lg transition-all"
        >
          <PencilLine size={16} /> Change Goal
        </button>
      </div>

      <div className="flex flex-col">
        {/* value diambil dari userData yang disinkronkan backend */}
        <ProfileItem
          icon={Target}
          label="Current Goal"
          value={userData?.goal || "Not Set"}
        />
        <ProfileItem
          icon={Activity}
          label="Activity Level"
          value={getActivityLevelLabel(userData?.activityLevel)}
        />
        <ProfileItem
          icon={Flame}
          label="Daily Calories"
          value={userData?.dailyCalories || 0}
          unit="kcal"
        />
        <ProfileItem
          icon={Zap}
          label="Protein Target"
          value={userData?.proteinTarget || 0}
          unit="g / day"
        />
      </div>
    </div>
  );
};

export default GoalsCard;
