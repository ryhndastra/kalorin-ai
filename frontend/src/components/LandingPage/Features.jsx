import React from "react";
import { CircleCheckBig, Clock3, ChartLine } from "lucide-react";

const Features = () => {
  return (
    <section className="py-20 px-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
          Semua yang kamu butuhkan
        </h2>
        <p className="text-gray-500">
          Satu app untuk semua kebutuhan gizi harianmu
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
              Track Kalori Mudah
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Catat makanan dan minuman harianmu dengan cepat untuk memantau asupan kalori secara lebih teratur dan akurat.
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
              Rekomendasi AI Personal
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Dapatkan rekomendasi pola makan dan target nutrisi yang disesuaikan dengan profil, tujuan, dan kebutuhan tubuhmu.
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
              Analisis Nutrisi Lengkap
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Lihat ringkasan nutrisi harian mulai dari kalori, protein, lemak, hingga karbohidrat untuk membantu menjaga pola hidup sehat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
