import React from "react";
import { useTranslation } from "react-i18next";

const HowItWorks = () => {
  const { t } = useTranslation();
  return (
    <section className="py-16 px-4 bg-[#eefaf1]">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-14">
          {t("landing.howTitle")}
        </h2>

        {/* Steps */}
        <div className="relative pl-4 md:pl-8">
          <div className="absolute top-4 bottom-10 left-[40px] md:left-[55px] w-[2px] bg-green-200 z-0"></div>

          <div className="flex flex-col gap-10">
            {/* Step 1 */}
            <div className="relative z-10 flex gap-6 items-start">
              <div className="w-12 h-12 shrink-0 rounded-full bg-[#fcd34d] text-gray-900 flex items-center justify-center font-black text-lg shadow-sm">
                1
              </div>
              <div className="pt-2">
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {t("landing.step1Title")}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t("landing.step1Desc")}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex gap-6 items-start">
              <div className="w-12 h-12 shrink-0 rounded-full bg-[#fcd34d] text-gray-900 flex items-center justify-center font-black text-lg shadow-sm">
                2
              </div>
              <div className="pt-2">
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {t("landing.step2Title")}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t("landing.step2Desc")}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex gap-6 items-start">
              <div className="w-12 h-12 shrink-0 rounded-full bg-[#fcd34d] text-gray-900 flex items-center justify-center font-black text-lg shadow-sm">
                3
              </div>
              <div className="pt-2">
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {t("landing.step3Title")}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t("landing.step3Desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
