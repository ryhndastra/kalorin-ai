import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { updateUserProfile } from "../../api/userService";
import {
  ACTIVITY_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  getActivityLevelDescription,
} from "../../utils/profileOptions";
import {
  PROFILE_LIMITS,
  validateProfileInput,
} from "../../utils/profileValidation";

const RequiredProfileModal = () => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const { user } = useAuth();
  const { userData, fetchProfile } = useUser();
  const [formData, setFormData] = useState({
    birthdate: "",
    gender: "",
    activityLevel: "sedentary",
    isPregnant: false,
    isBreastfeeding: false,
    hasMedicalCondition: false,
    weight: "",
    height: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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

  const handleChange = (field, value) => {
    setFormData((current) => {
      const nextData = { ...current, [field]: value };

      if (
        field === "gender" &&
        value === "male" &&
        (nextData.isPregnant || nextData.isBreastfeeding)
      ) {
        nextData.isPregnant = false;
        nextData.isBreastfeeding = false;
      }

      return nextData;
    });
    setErrorMsg("");
  };

  const handleSave = async () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);

    const validationError = validateProfileInput({
      birthdate: formData.birthdate,
      gender: formData.gender,
      activityLevel: formData.activityLevel,
      weight,
      height,
      isPregnant: formData.isPregnant,
      isBreastfeeding: formData.isBreastfeeding,
      language: isId ? "id" : "en",
    });

    if (validationError) {
      setErrorMsg(validationError);
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
        isPregnant: formData.isPregnant,
        isBreastfeeding: formData.isBreastfeeding,
        hasMedicalCondition: formData.hasMedicalCondition,
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
      setErrorMsg(
        isId
          ? "Gagal menyimpan data. Silakan coba lagi."
          : "Failed to save data. Please try again.",
      );
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
            {isId ? "Lengkapi Data Tubuh" : "Complete Body Data"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {isId
              ? "Isi data ini dulu supaya KaloriN AI bisa menghitung BMI dan rekomendasi asupan harian kamu."
              : "Fill this in first so KaloriN AI can calculate BMI and daily intake recommendations."}
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
              {isId ? "Tanggal Lahir" : "Birthdate"}
            </label>
            <input
              type="date"
              max={new Date().toISOString().split("T")[0]}
              className="mt-1 w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 font-bold text-gray-700 outline-none transition-all focus:border-green-500"
              value={formData.birthdate}
              onChange={(e) => handleChange("birthdate", e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {isId ? "Jenis Kelamin" : "Gender"}
              </label>
              <select
                className="mt-1 w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 font-bold text-gray-700 outline-none transition-all focus:border-green-500"
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
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
              <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {isId ? "Aktivitas" : "Activity"}
              </label>
              <select
                className="mt-1 w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 font-bold text-gray-700 outline-none transition-all focus:border-green-500"
                value={formData.activityLevel}
                onChange={(e) => handleChange("activityLevel", e.target.value)}
              >
                {ACTIVITY_LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {activityLabelMap[option.value] || option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 min-h-5 text-xs font-medium leading-5 text-gray-500">
                {activityDescriptionMap[formData.activityLevel] ||
                  getActivityLevelDescription(formData.activityLevel)}
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={formData.isPregnant}
                disabled={formData.gender === "male"}
                onChange={(e) => handleChange("isPregnant", e.target.checked)}
              />
              {isId ? "Sedang Hamil" : "Pregnant"}
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={formData.isBreastfeeding}
                disabled={formData.gender === "male"}
                onChange={(e) =>
                  handleChange("isBreastfeeding", e.target.checked)
                }
              />
              {isId ? "Menyusui" : "Breastfeeding"}
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={formData.hasMedicalCondition}
                onChange={(e) =>
                  handleChange("hasMedicalCondition", e.target.checked)
                }
              />
              {isId ? "Memiliki kondisi medis" : "Have medical condition"}
            </label>
            <p className="text-xs leading-5 text-gray-500">
              {isId
                ? "Untuk kondisi ini, target harian sebaiknya diatur manual dengan panduan profesional."
                : "For these conditions, daily targets are best set manually with professional guidance."}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {isId ? "Berat (kg)" : "Weight (kg)"}
              </label>
              <input
                type="number"
                min={PROFILE_LIMITS.minWeight}
                max={PROFILE_LIMITS.maxWeight}
                step="0.1"
                className="mt-1 w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 font-bold text-gray-700 outline-none transition-all focus:border-green-500"
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
              />
            </div>

            <div className="flex-1">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {isId ? "Tinggi (cm)" : "Height (cm)"}
              </label>
              <input
                type="number"
                min={PROFILE_LIMITS.minHeight}
                max={PROFILE_LIMITS.maxHeight}
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
              {isId ? "Menyimpan..." : "Saving..."}
            </>
          ) : (
            isId ? "Simpan dan Lanjutkan" : "Save and Continue"
          )}
        </button>
      </div>
    </div>
  );
};

export default RequiredProfileModal;
