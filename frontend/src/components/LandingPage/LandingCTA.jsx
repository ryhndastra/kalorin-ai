import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LandingCTA = () => {
  const { t } = useTranslation();
  return (
    <section className="py-24 px-4 bg-green-500 flex flex-col items-center text-center">
      <div className="max-w-2xl mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
          {t("landing.ctaTitleLine1")} <br className="hidden sm:block" />{" "}
          {t("landing.ctaTitleLine2")}
        </h2>

        {/* Subteks pakai warna hijau sangat pudar */}
        <p className="text-green-50 text-base md:text-lg mb-5">
          {t("landing.ctaSubtitle")}
        </p>

        {/* Button */}
        <Link
          to="/register"
          className="bg-[#facc15] text-gray-900 font-extrabold text-lg px-10 py-4 rounded-full w-full sm:w-auto hover:bg-[#eab308] transition-colors shadow-lg shadow-yellow-500/20 inline-block text-center"
        >
          {t("landing.ctaButton")}
        </Link>

        {/* Catatan kecil di bawah tombol */}
        <p className="text-green-200 text-sm mt-6 font-medium">
          {t("landing.ctaNote")}
        </p>
      </div>
    </section>
  );
};

export default LandingCTA;
