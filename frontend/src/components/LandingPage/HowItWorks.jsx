import React from "react";

const HowItWorks = () => {
  return (
    <section className="py-16 px-4 bg-[#eefaf1]">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-14">
          Cara kerja KaloriN AI
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
                  Daftar & set goal
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Buat akun dan tentukkan tujuan kesehatanmu, seperti menurunkan berat badan, menjaga berat badan, atau meningkatkan massa otot. Kalorin AI akan membantu kamu mencapai tujuan tersebut dengan memberikan rekomendasi makanan yang sesuai dengan kebutuhan nutrisi tubuhmu.
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
                  Catat makananmu
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Masukkan makanan yang kamu konsumsi setiap hari untuk memantau asupan kalori dan nutrisi. Sistem akan membantu mencatat protein, lemak, dan karbohidrat secara praktis dan terorganisir.
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
                  Dapat insight dari AI
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Analisis pola makanmu dengan bantuan AI untuk mendapatkan rekomendasi yang lebih personal. Temukan insight tentang kebutuhan nutrisi, keseimbangan kalori, dan langkah yang dapat membantu mencapai tujuan kesehatanmu.
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
