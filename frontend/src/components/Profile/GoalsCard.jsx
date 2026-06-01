import React from "react";
import { useTranslation } from "react-i18next";
import { Target, Flame, Zap, PencilLine, Activity } from "lucide-react";
import ProfileItem from "./ProfileItem";
import { useUser } from "../../context/UserContext";

const GoalsCard = ({ onEdit }) => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const { userData } = useUser(); // ambil userData dari UserContext untuk akses goal, dailyCalories, proteinTarget
  const activityLabelMap = {
    sedentary: isId ? "Minim Aktivitas" : "Sedentary",
    light: isId ? "Aktif Ringan" : "Lightly Active",
    moderate: isId ? "Aktif Sedang" : "Moderately Active",
    active: isId ? "Aktif" : "Active",
    very_active: isId ? "Sangat Aktif" : "Very Active",
  };
  const goalLabelMap = {
    "Stay Healthy": isId ? "Tetap Sehat" : "Stay Healthy",
    "Weight Loss": isId ? "Turun Berat Badan" : "Weight Loss",
    Bulking: isId ? "Naik Massa" : "Bulking",
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-gray-800">
          {isId ? "Pengaturan Target" : "Goal Settings"}
        </h3>
        <button
          onClick={onEdit}
          className="text-green-600 flex items-center gap-2 text-sm font-semibold hover:bg-green-50 px-3 py-1 rounded-lg transition-all"
        >
          <PencilLine size={16} /> {isId ? "Ubah Target" : "Change Goal"}
        </button>
      </div>

      <div className="flex flex-col">
        {/* value diambil dari userData yang disinkronkan backend */}
        <ProfileItem
          icon={Target}
          label={isId ? "Target Saat Ini" : "Current Goal"}
          value={
            goalLabelMap[userData?.goal] ||
            userData?.goal ||
            (isId ? "Belum Diatur" : "Not Set")
          }
        />
        <ProfileItem
          icon={Activity}
          label={isId ? "Level Aktivitas" : "Activity Level"}
          value={
            activityLabelMap[userData?.activityLevel] ||
            (isId ? "Belum Diatur" : "Not Set")
          }
        />
        <ProfileItem
          icon={Flame}
          label={isId ? "Kalori Harian" : "Daily Calories"}
          value={userData?.dailyCalories || 0}
          unit="kcal"
        />
        <ProfileItem
          icon={Zap}
          label={isId ? "Target Protein" : "Protein Target"}
          value={userData?.proteinTarget || 0}
          unit={isId ? "g / hari" : "g / day"}
        />
      </div>
    </div>
  );
};

export default GoalsCard;
