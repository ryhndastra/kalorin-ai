import React from "react";
import { CircleCheckBig, Clock3, ChartLine } from "lucide-react";
import { useTranslation } from "react-i18next";

const Features = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20 px-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
          {t("landing.featuresTitle")}
        </h2>
        <p className="text-gray-500">
          {t("landing.featuresSubtitle")}
        </p>
      </div>

      {/* List Cards */}
      <div className="flex flex-col gap-6">
        {/* Card 1 - Track Kalori (Hijau Muda) */}
        <div className="flex items-start gap-5 p-6 rounded-3xl bg-[#eefaf1] border border-green-50 shadow-md">
          {/* Icon Box */}
          <div className="w-14 h-14 shrink-0 rounded-2xl bg-green-500 text-white flex items-center justify-center font-bold text-xl shadow-sm">
            <CircleCheckBig />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              {t("landing.feature1Title")}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t("landing.feature1Desc")}
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex items-start gap-5 p-6 rounded-3xl bg-[#fffbf2] border border-orange-50 shadow-md">
          <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#fed729] text-white flex items-center justify-center font-bold text-xl shadow-sm">
            <Clock3 />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              {t("landing.feature2Title")}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t("landing.feature2Desc")}
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex items-start gap-5 p-6 rounded-3xl bg-[#eefaf1] border border-green-50 shadow-md">
          <div className="w-14 h-14 shrink-0 rounded-2xl bg-green-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
            <ChartLine />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              {t("landing.feature3Title")}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t("landing.feature3Desc")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
