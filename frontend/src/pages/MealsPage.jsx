import React from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar/Navbar";
import MealsHero from "../components/meals/MealsHero";
import MealsGrid from "../components/meals/MealsGrid";
import { useAuth } from "../context/AuthProvider";

const MealsPage = () => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* NAVBAR */}
      <Navbar user={user} loading={false} />

      {/* HEADER */}
      <div className="max-w-[1600px] mx-auto px-6 mt-10 pb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {isId ? "Rekomendasi Makanan" : "Meal Recommendations"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isId
            ? "Dipersonalisasi sesuai target dietmu"
            : "Personalized for your diet goal"}
        </p>
      </div>

      {/* GREEN SECTION */}
      <div className="bg-[#eefaf1] pt-6 pb-14">
        <MealsHero />
        <MealsGrid userId={user?.id || user?.uid} />
      </div>
    </div>
  );
};

export default MealsPage;
