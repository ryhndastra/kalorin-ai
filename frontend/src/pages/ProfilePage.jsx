import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import Navbar from "../components/Navbar/Navbar";
import ProfileHero from "../components/Profile/ProfileHero";
import StatsCard from "../components/Profile/StatsCard";
import GoalsCard from "../components/Profile/GoalsCard";
import EditModal from "../components/Profile/EditModal";
import { updateUserProfile } from "../api/userService";

const ProfilePage = () => {
  const { user } = useAuth();
  const { userData, fetchProfile } = useUser();
  const navigate = useNavigate();

  // state untuk kontrol modal & loading
  const [modalType, setModalType] = useState(null);
  const [tempData, setTempData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // buka modal dan isi data sementara dengan data dari Context (Backend)
  const openModal = (type) => {
    setTempData({
      birthdate: userData?.birthdate
        ? new Date(userData.birthdate).toISOString().split("T")[0]
        : "",
      weight: userData?.weight || 0,
      height: userData?.height || 0,
      goal: userData?.goal || "Stay Healthy",
      dailyCalories: userData?.dailyCalories || 2000,
      proteinTarget: userData?.proteinTarget || 100,
    });
    setModalType(type);
  };

  // fungsi simpan data ke Backend (Supabase via Express)
  const handleSave = async () => {
    const currentUserId = user?.id;

    if (!currentUserId) {
      console.error("User ID tidak ditemukan!");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        userId: currentUserId,
        name: user.displayName,
        email: user.email,
        birthdate: tempData.birthdate,
        goal: tempData.goal,
        weight: parseFloat(tempData.weight) || 0,
        height: parseFloat(tempData.height) || 0,
        dailyCalories: 0,
        proteinTarget: 0,
      };

      console.log("🚀 Mengirim data (Triggering Auto-Calculate):", payload);

      const response = await updateUserProfile(payload);

      if (response.success) {
        console.log("✅ Berhasil! Data baru dari backend:", response.data);

        // ambil data terbaru hasil hitungan backend ke dalam Context
        await fetchProfile(currentUserId, true);

        setModalType(null);
      }
    } catch (error) {
      console.error("❌ Error Detail:", error.response?.data || error.message);
      alert("Gagal simpan data profile!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Gagal Logout:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#eefaf1] pb-20">
      <Navbar user={user} />

      {/* Hero Section - ambil data Auth Firebase */}
      <div className="mt-20">
        <ProfileHero user={user} userData={userData} />
      </div>

      <main className="max-w-[800px] mx-auto px-6 mt-8 space-y-6">
        {/* Stats Section - ambil data dari UserContext */}
        <StatsCard onEdit={() => openModal("stats")} />

        {/* Goals Section - ambil data dari UserContext */}
        <GoalsCard onEdit={() => openModal("goals")} />

        <button
          onClick={handleLogout}
          className="w-full py-5 text-[#FF4B4B] font-bold text-lg rounded-[24px] border-2 border-[#FFEDED] bg-[#FFF5F5] hover:bg-[#FFEDED] transition-all duration-300 mt-8 mb-10 shadow-sm"
        >
          Sign Out
        </button>
      </main>

      {/* Reusable Modal untuk Edit Stats & Goals */}
      <EditModal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        onSave={handleSave}
        isLoading={isLoading}
        title={
          modalType === "stats" ? "Edit Body Stats" : "Change Goal Settings"
        }
      >
        {modalType === "stats" ? (
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
                Birthdate
              </label>
              <input
                type="date"
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
                  Weight (kg)
                </label>
                <input
                  type="number"
                  className="w-full mt-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-green-500 outline-none font-bold text-gray-700"
                  value={tempData.weight || ""}
                  onChange={(e) =>
                    setTempData({ ...tempData, weight: e.target.value })
                  }
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
                  Height (cm)
                </label>
                <input
                  type="number"
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
                Current Goal
              </label>
              <select
                className="w-full mt-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-green-500 outline-none font-bold text-gray-700 appearance-none"
                value={tempData.goal || ""}
                onChange={(e) =>
                  setTempData({ ...tempData, goal: e.target.value })
                }
              >
                <option value="Stay Healthy">Stay Healthy</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Bulking">Bulking</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-wider">
                Daily Calories Goal (kcal)
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
                Protein Target (g)
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
