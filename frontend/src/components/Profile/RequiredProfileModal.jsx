import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { updateUserProfile } from "../../api/userService";
import {
  ACTIVITY_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  getActivityLevelDescription,
} from "../../utils/profileOptions";

const RequiredProfileModal = () => {
  const { user } = useAuth();
  const { userData, fetchProfile } = useUser();
  const [formData, setFormData] = useState({
    birthdate: "",
    gender: "",
    activityLevel: "sedentary",
    weight: "",
    height: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrorMsg("");
  };

  const handleSave = async () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);

    if (
      !formData.birthdate ||
      !formData.gender ||
      !formData.activityLevel ||
      !weight ||
      !height
    ) {
      setErrorMsg("Tanggal lahir, gender, aktivitas, berat, dan tinggi wajib diisi.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      const response = await updateUserProfile({
        userId: user.id,
        name: user.displayName || userData?.fullName || "User",
        email: user.email || userData?.email,
        birthdate: formData.birthdate,
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        weight,
        height,
        goal: userData?.goal || "Stay Healthy",
        dailyCalories: 0,
        proteinTarget: 0,
      });

      if (response.success) {
        await fetchProfile(user.id, true);
      }
    } catch (error) {
      console.error("Gagal menyimpan data awal profile:", error);
      setErrorMsg("Gagal simpan data. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />

      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[32px] bg-white p-8 shadow-2xl">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Lengkapi Data Tubuh
          </h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Isi data ini dulu supaya KaloriN AI bisa menghitung BMI dan
            rekomendasi asupan harian kamu.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMsg}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Birthdate
            </label>
            <input
              type="date"
              className="mt-1 w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 font-bold text-gray-700 outline-none transition-all focus:border-green-500"
              value={formData.birthdate}
              onChange={(e) => handleChange("birthdate", e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Gender
              </label>
              <select
                className="mt-1 w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 font-bold text-gray-700 outline-none transition-all focus:border-green-500"
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
              >
                <option value="">Select</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Activity
              </label>
              <select
                className="mt-1 w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 font-bold text-gray-700 outline-none transition-all focus:border-green-500"
                value={formData.activityLevel}
                onChange={(e) => handleChange("activityLevel", e.target.value)}
              >
                {ACTIVITY_LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 min-h-5 text-xs font-medium leading-5 text-gray-500">
                {getActivityLevelDescription(formData.activityLevel)}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Weight (kg)
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                className="mt-1 w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 font-bold text-gray-700 outline-none transition-all focus:border-green-500"
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
              />
            </div>

            <div className="flex-1">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Height (cm)
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                className="mt-1 w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 font-bold text-gray-700 outline-none transition-all focus:border-green-500"
                value={formData.height}
                onChange={(e) => handleChange("height", e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#22C55E] px-4 py-3 font-bold text-white shadow-lg shadow-green-100 transition-all hover:bg-[#1eb053] disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            "Save and Continue"
          )}
        </button>
      </div>
    </div>
  );
};

export default RequiredProfileModal;
