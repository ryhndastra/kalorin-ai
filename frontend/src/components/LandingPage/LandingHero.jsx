import React from "react";
import { useNavigate } from "react-router-dom";

const LandingHero = () => {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center text-center pt-20 pb-16 px-4 bg-[#eefaf1] relative overflow-hidden min-h-screen">
      {/* blob */}
      <div className="absolute -top-20 -right-20 w-80 h-80 md:w-96 md:h-96 bg-green-200 rounded-full z-0 opacity-50 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-72 h-72 md:w-80 md:h-80 bg-orange-200 rounded-full z-0 opacity-50 blur-3xl pointer-events-none"></div>

      {/* Main */}
      <div className="z-10 relative flex flex-col items-center">
        <img
          src="/images/logo/kalorinLogo.png"
          alt="KaloriN AI Logo"
          className="w-52 mt-8"
        />

        {/* Text Content */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 max-w-2xl leading-tight">
          Makan Cerdas, <br className="hidden md:block" />
          <span className="text-green-500">Hidup Sehat</span> Setiap Hari
        </h1>

        <p className="text-gray-600 mb-10 max-w-xl text-sm md:text-base leading-relaxed">
          Kalorin AI membantu Anda menghitung BMI, 
          menganalisis kebutuhan nutrisi, dan menemukan rekomendasi makanan yang sesuai dengan kondisi tubuh secara cepat dan mudah
        </p>

        {/* Button */}
        <div
          onClick={() => navigate("/analyze")}
          className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto"
        >
          <button className="bg-green-500 text-white px-10 py-3.5 rounded-full font-semibold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 w-full sm:w-auto">
            Mulai Gratis
          </button>
        </div>

        {/* Tracker Card*/}
        {/* <div className="w-full max-w-lg bg-white rounded-3xl shadow-[0_15px_40px_rgb(0,0,0,0.06)] border border-gray-100 p-7 relative">
          <div className="flex justify-between items-center mb-5">
            <span className="text-sm font-medium text-gray-500">
              Kalori hari ini
            </span>
            <span className="text-base font-bold text-green-600">
              1.240 / 1.500 kkal
            </span>
          </div>

          // progress bar
          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-7">
            <div className="bg-green-500 h-2.5 rounded-full w-[80%]"></div>
          </div>

          <div className="grid grid-cols-3 gap-3.5 text-center">
            <div className="border border-green-100 bg-green-50/50 rounded-2xl py-4 text-xs text-gray-600">
              <div className="font-bold text-green-600 text-xl mb-0.5">68g</div>
              Protein
            </div>
            <div className="border border-orange-100 bg-orange-50/50 rounded-2xl py-4 text-xs text-gray-600">
              <div className="font-bold text-orange-500 text-xl mb-0.5">
                142g
              </div>
              Karbo
            </div>
            <div className="border border-red-100 bg-red-50/50 rounded-2xl py-4 text-xs text-gray-600">
              <div className="font-bold text-red-500 text-xl mb-0.5">38g</div>
              Lemak
            </div>
          </div>
        </div> */}
        {/* unused maybe? atau ganti something? */}

        {/* card yg seolah olah sedang analyze nutrisi dari makanan */}
        <div className="w-full max-w-sm bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_15px_40px_rgb(0,0,0,0.08)] border border-white p-5 relative mt-4">
          <div className="flex gap-4 items-center mb-4">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">
              🥗
            </div>
            <div className="flex-1 text-left">
              <div className="text-xs font-bold text-green-500 mb-1 flex items-center gap-1">
                AI sedang menganalisis...
              </div>
              <div className="text-sm font-semibold text-gray-800">
                Salad Ayam Panggang
              </div>
            </div>
          </div>

          {/* Skeleton Loading Seolah olah sedang analyze */}
          <div className="space-y-2">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 w-1/2 animate-pulse rounded-full"></div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-4/5">
              <div className="h-full bg-orange-400 w-1/3 animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
