import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { signOut, updateProfile as updateFirebaseProfile } from "firebase/auth";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar/Navbar";
import ProfileHero from "../components/Profile/ProfileHero";
import StatsCard from "../components/Profile/StatsCard";
import GoalsCard from "../components/Profile/GoalsCard";
import EditModal from "../components/Profile/EditModal";
import { updateUserProfile } from "../api/userService";
import { PencilLine, UserRound } from "lucide-react";
import {
  ACTIVITY_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  getActivityLevelDescription,
} from "../utils/profileOptions";
import {
  PROFILE_LIMITS,
  validateProfileInput,
} from "../utils/profileValidation";

const ProfilePage = () => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const { user } = useAuth();
  const { userData, fetchProfile } = useUser();
  const navigate = useNavigate();

  // state untuk kontrol modal & loading
  const [modalType, setModalType] = useState(null);
  const [tempData, setTempData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const genderLabelMap = {
    male: isId ? "Laki-laki" : "Male",
    female: isId ? "Perempuan" : "Female",
  };
  const activityLabelMap = {
    sedentary: isId ? "Minim Aktivitas" : "Sedentary",
    light: isId ? "Aktif Ringan" : "Lightly Active",
    moderate: isId ? "Aktif Sedang" : "Moderately Active",
    active: isId ? "Aktif" : "Active",
    very_active: isId ? "Sangat Aktif" : "Very Active",
  };
  const activityDescriptionMap = {
    sedentary: isId
      ? "Hampir tidak olahraga, lebih banyak duduk."
      : "Little to no exercise, mostly sitting.",
    light: isId
      ? "Olahraga ringan atau jalan kaki 1-3 hari/minggu."
      : "Light exercise or walking 1-3 days/week.",
    moderate: isId
      ? "Olahraga sedang 3-5 hari/minggu."
      : "Moderate exercise 3-5 days/week.",
    active: isId
      ? "Olahraga berat 6-7 hari/minggu."
      : "Hard exercise 6-7 days/week.",
    very_active: isId
      ? "Latihan sangat berat atau pekerjaan fisik hampir setiap hari."
      : "Very hard training or physical job most days.",
  };
  const goalLabelMap = {
    "Stay Healthy": isId ? "Tetap Sehat" : "Stay Healthy",
    "Weight Loss": isId ? "Turun Berat Badan" : "Weight Loss",
    Bulking: isId ? "Naik Massa" : "Bulking",
  };
  const isPlaceholderName = (value) => {
    if (typeof value !== "string") return true;
    const normalized = value.trim().toLowerCase();
    return normalized.length === 0 || normalized === "user";
  };
  const resolvedDisplayName = !isPlaceholderName(userData?.fullName)
    ? userData?.fullName
    : !isPlaceholderName(auth.currentUser?.displayName)
      ? auth.currentUser?.displayName
      : !isPlaceholderName(user?.displayName)
        ? user?.displayName
        : "User";

  // buka modal dan isi data sementara dengan data dari Context (Backend)
  const openModal = (type) => {
    setTempData({
      fullName: resolvedDisplayName,
      birthdate: userData?.birthdate
        ? new Date(userData.birthdate).toISOString().split("T")[0]
        : "",
      weight: userData?.weight || 0,
      height: userData?.height || 0,
      gender: userData?.gender || "",
      activityLevel: userData?.activityLevel || "sedentary",
      isPregnant: Boolean(userData?.isPregnant),
      isBreastfeeding: Boolean(userData?.isBreastfeeding),
      hasMedicalCondition: Boolean(userData?.hasMedicalCondition),
      goal: userData?.goal || (isId ? "Tetap Sehat" : "Stay Healthy"),
      dailyCalories: userData?.dailyCalories || 2000,
      proteinTarget: userData?.proteinTarget || 100,
    });
    setModalType(type);
  };

  // fungsi simpan data ke Backend (Supabase via Express)
  const handleSave = async () => {
    const currentUserId = user?.id;

    if (!currentUserId) {
      console.error(isId ? "User ID tidak ditemukan!" : "User ID not found!");
      return;
    }

    setIsLoading(true);
    try {
      const cleanName = tempData.fullName?.trim();

      if (modalType === "name" && !cleanName) {
        toast.error(isId ? "Nama tidak boleh kosong!" : "Name cannot be empty!");
        return;
      }

      if (modalType === "name" && auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: cleanName,
        });
      }

      const payload =
        modalType === "name"
          ? {
              userId: currentUserId,
              name: cleanName,
              email: user.email,
            }
          : {
              userId: currentUserId,
              name: resolvedDisplayName,
              email: user.email,
              birthdate: tempData.birthdate,
              gender: tempData.gender,
              activityLevel: tempData.activityLevel,
              isPregnant: tempData.isPregnant,
              isBreastfeeding: tempData.isBreastfeeding,
              hasMedicalCondition: tempData.hasMedicalCondition,
              goal: tempData.goal,
              weight: parseFloat(tempData.weight) || 0,
              height: parseFloat(tempData.height) || 0,
              dailyCalories: 0,
              proteinTarget: 0,
            };

      if (modalType === "stats") {
        const parsedWeight = parseFloat(tempData.weight);
        const parsedHeight = parseFloat(tempData.height);
        const validationError = validateProfileInput({
          birthdate: tempData.birthdate,
          gender: tempData.gender,
          activityLevel: tempData.activityLevel,
          weight: parsedWeight,
          height: parsedHeight,
          isPregnant: tempData.isPregnant,
          isBreastfeeding: tempData.isBreastfeeding,
          language: isId ? "id" : "en",
        });

        if (validationError) {
          toast.error(validationError);
          return;
        }
      }

      const response = await updateUserProfile(payload);

      if (response.success) {
        // ambil data terbaru hasil hitungan backend ke dalam Context
        await fetchProfile(currentUserId, true);

        setModalType(null);
        toast.success(isId ? "Profil berhasil diperbarui." : "Profile updated successfully.");
      }
    } catch (error) {
      console.error("❌ Error Detail:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
          (isId ? "Gagal menyimpan profil." : "Failed to save profile."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Gagal Logout:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#eefaf1] pb-20">
      <Navbar user={user} userData={userData} />

      {/* Hero Section - ambil data Auth Firebase */}
      <div className="mt-20">
        <ProfileHero user={user} userData={userData} />
      </div>

      <main className="max-w-[800px] mx-auto px-6 mt-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-800">
              {isId ? "Nama Akun" : "Account Name"}
            </h3>
            <button
              onClick={() => openModal("name")}
              className="text-green-600 flex items-center gap-2 text-sm font-semibold hover:bg-green-50 px-3 py-1 rounded-lg transition-all"
            >
              <PencilLine size={16} /> {isId ? "Ubah" : "Edit"}
            </button>
          </div>

          <div className="flex items-center gap-5 rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <div className="w-12 h-12 bg-[#E8F5E9] rounded-2xl flex items-center justify-center text-[#2E7D32]">
              <UserRound size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[#616161] font-medium text-base">
                {isId ? "Nama Tampil" : "Display Name"}
              </p>
              <p className="font-bold text-[#212121] text-lg">
                {resolvedDisplayName}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section - ambil data dari UserContext */}
        <StatsCard onEdit={() => openModal("stats")} />

        {/* Goals Section - ambil data dari UserContext */}
        <GoalsCard onEdit={() => openModal("goals")} />

        <button
          onClick={handleLogout}
          className="w-full py-5 text-[#FF4B4B] font-bold text-lg rounded-[24px] border-2 border-[#FFEDED] bg-[#FFF5F5] hover:bg-[#FFEDED] transition-all duration-300 mt-8 mb-10 shadow-sm"
        >
          {isId ? "Keluar" : "Sign Out"}
        </button>
      </main>

      {/* Reusable Modal untuk Edit Stats & Goals */}
      <EditModal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        onSave={handleSave}
        isLoading={isLoading}
        title={
          modalType === "name"
            ? isId
              ? "Ubah Nama Akun"
              : "Edit Account Name"
            : modalType === "stats"
              ? isId
                ? "Ubah Data Tubuh"
                : "Edit Body Stats"
              : isId
                ? "Ubah Pengaturan Target"
                : "Change Goal Settings"
        }
      >
        {modalType === "name" ? (
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
              {isId ? "Nama Lengkap" : "Full Name"}
            </label>
            <input
              type="text"
              className="w-full mt-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-green-500 outline-none font-bold text-gray-700 transition-all"
              value={tempData.fullName || ""}
              onChange={(e) =>
                setTempData({ ...tempData, fullName: e.target.value })
              }
            />
          </div>
        ) : modalType === "stats" ? (
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
                {isId ? "Tanggal Lahir" : "Birthdate"}
              </label>
              <input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                className="w-full mt-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-green-500 outline-none font-bold text-gray-700 transition-all"
                value={tempData.birthdate || ""}
                onChange={(e) =>
                  setTempData({ ...tempData, birthdate: e.target.value })
                }
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
                  {isId ? "Jenis Kelamin" : "Gender"}
                </label>
                <select
                  className="w-full mt-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-green-500 outline-none font-bold text-gray-700"
                  value={tempData.gender || ""}
                  onChange={(e) =>
                    setTempData((current) => {
                      const nextGender = e.target.value;
                      const nextData = { ...current, gender: nextGender };
                      if (nextGender === "male") {
                        nextData.isPregnant = false;
                        nextData.isBreastfeeding = false;
                      }
                      return nextData;
                    })
                  }
                >
                  <option value="">{isId ? "Pilih" : "Select"}</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {genderLabelMap[option.value] || option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
                  {isId ? "Aktivitas" : "Activity"}
                </label>
                <select
                  className="w-full mt-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-green-500 outline-none font-bold text-gray-700"
                  value={tempData.activityLevel || "sedentary"}
                  onChange={(e) =>
                    setTempData({
                      ...tempData,
                      activityLevel: e.target.value,
                    })
                  }
                >
                  {ACTIVITY_LEVEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {activityLabelMap[option.value] || option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 min-h-5 text-xs font-medium leading-5 text-gray-500">
                  {activityDescriptionMap[tempData.activityLevel] ||
                    getActivityLevelDescription(tempData.activityLevel)}
                </p>
              </div>
            </div>
            <div className="space-y-2 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(tempData.isPregnant)}
                  disabled={tempData.gender === "male"}
                  onChange={(e) =>
                    setTempData({ ...tempData, isPregnant: e.target.checked })
                  }
                />
                {isId ? "Sedang Hamil" : "Pregnant"}
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(tempData.isBreastfeeding)}
                  disabled={tempData.gender === "male"}
                  onChange={(e) =>
                    setTempData({
                      ...tempData,
                      isBreastfeeding: e.target.checked,
                    })
                  }
                />
                {isId ? "Menyusui" : "Breastfeeding"}
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(tempData.hasMedicalCondition)}
                  onChange={(e) =>
                    setTempData({
                      ...tempData,
                      hasMedicalCondition: e.target.checked,
                    })
                  }
                />
                {isId ? "Memiliki kondisi medis" : "Have medical condition"}
              </label>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
                  {isId ? "Berat (kg)" : "Weight (kg)"}
                </label>
                <input
                  type="number"
                  min={PROFILE_LIMITS.minWeight}
                  max={PROFILE_LIMITS.maxWeight}
                  className="w-full mt-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-green-500 outline-none font-bold text-gray-700"
                  value={tempData.weight || ""}
                  onChange={(e) =>
                    setTempData({ ...tempData, weight: e.target.value })
                  }
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
                  {isId ? "Tinggi (cm)" : "Height (cm)"}
                </label>
                <input
                  type="number"
                  min={PROFILE_LIMITS.minHeight}
                  max={PROFILE_LIMITS.maxHeight}
                  className="w-full mt-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-green-500 outline-none font-bold text-gray-700"
                  value={tempData.height || ""}
                  onChange={(e) =>
                    setTempData({ ...tempData, height: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
                {isId ? "Target Saat Ini" : "Current Goal"}
              </label>
              <select
                className="w-full mt-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-green-500 outline-none font-bold text-gray-700 appearance-none"
                value={tempData.goal || ""}
                onChange={(e) =>
                  setTempData({ ...tempData, goal: e.target.value })
                }
              >
                <option value="Stay Healthy">{goalLabelMap["Stay Healthy"]}</option>
                <option value="Weight Loss">{goalLabelMap["Weight Loss"]}</option>
                <option value="Bulking">{goalLabelMap.Bulking}</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
                {isId ? "Level Aktivitas" : "Activity Level"}
              </label>
              <select
                className="w-full mt-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-green-500 outline-none font-bold text-gray-700 appearance-none"
                value={tempData.activityLevel || "sedentary"}
                onChange={(e) =>
                  setTempData({
                    ...tempData,
                    activityLevel: e.target.value,
                  })
                }
              >
                {ACTIVITY_LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {activityLabelMap[option.value] || option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs font-medium leading-5 text-gray-500">
                {activityDescriptionMap[tempData.activityLevel] ||
                  getActivityLevelDescription(tempData.activityLevel)}
              </p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
                {isId ? "Target Kalori Harian (kkal)" : "Daily Calories Goal (kcal)"}
              </label>
              <input
                type="number"
                className="w-full mt-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-green-500 outline-none font-bold text-gray-700"
                value={tempData.dailyCalories || ""}
                onChange={(e) =>
                  setTempData({ ...tempData, dailyCalories: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
                {isId ? "Target Protein (g)" : "Protein Target (g)"}
              </label>
              <input
                type="number"
                className="w-full mt-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-green-500 outline-none font-bold text-gray-700"
                value={tempData.proteinTarget || ""}
                onChange={(e) =>
                  setTempData({ ...tempData, proteinTarget: e.target.value })
                }
              />
            </div>
          </div>
        )}
      </EditModal>
    </div>
  );
};

export default ProfilePage;
