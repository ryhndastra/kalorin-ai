import React from "react";
import { useTranslation } from "react-i18next";
import { PencilLine, User, Weight, Ruler, UserRound } from "lucide-react";
import ProfileItem from "./ProfileItem";
import { useUser } from "../../context/UserContext";

const StatsCard = ({ onEdit }) => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const { userData } = useUser();
  const genderLabelMap = {
    male: isId ? "Laki-laki" : "Male",
    female: isId ? "Perempuan" : "Female",
  };

  // logic hitung umur dari birthdate
  const calculateAge = (birthdate) => {
    if (!birthdate) return "-";
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    // koreksi jika belum ulang tahun di tahun ini
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-gray-800">
          {isId ? "Data Tubuh" : "Body Stats"}
        </h3>
        <button
          onClick={onEdit}
          className="text-green-600 flex items-center gap-2 text-sm font-semibold hover:bg-green-50 px-3 py-1 rounded-lg transition-all"
        >
          <PencilLine size={16} /> {isId ? "Ubah" : "Edit"}
        </button>
      </div>

      <div className="flex flex-col">
        <ProfileItem
          icon={User}
          label={isId ? "Umur" : "Age"}
          value={calculateAge(userData?.birthdate)}
          unit={isId ? "tahun" : "years"}
        />
        <ProfileItem
          icon={UserRound}
          label={isId ? "Jenis Kelamin" : "Gender"}
          value={genderLabelMap[userData?.gender] || (isId ? "Belum Diatur" : "Not Set")}
        />
        <ProfileItem
          icon={Weight}
          label={isId ? "Berat" : "Weight"}
          value={userData?.weight || 0}
          unit="kg"
        />
        <ProfileItem
          icon={Ruler}
          label={isId ? "Tinggi" : "Height"}
          value={userData?.height || 0}
          unit="cm"
        />
      </div>
    </div>
  );
};

export default StatsCard;
