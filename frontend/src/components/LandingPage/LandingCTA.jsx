import React from "react";
import { Link } from "react-router-dom";

const LandingCTA = () => {
  return (
    <section className="py-24 px-4 bg-green-500 flex flex-col items-center text-center">
      <div className="max-w-2xl mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
          Mulai perjalanan sehatmu <br className="hidden sm:block" /> hari ini
        </h2>

        {/* Subteks pakai warna hijau sangat pudar */}
        <p className="text-green-50 text-base md:text-lg mb-5">
          Gratis selamanya. Tidak perlu kartu kredit.
        </p>

        {/* Button */}
        <Link
          to="/register"
          className="bg-[#facc15] text-gray-900 font-extrabold text-lg px-10 py-4 rounded-full w-full sm:w-auto hover:bg-[#eab308] transition-colors shadow-lg shadow-yellow-500/20 inline-block text-center"
        >
          Daftar Sekarang — Gratis
        </Link>

        {/* Catatan kecil di bawah tombol */}
        <p className="text-green-200 text-sm mt-6 font-medium">
          Login dengan Google, Apple, atau nomor HP
        </p>
      </div>
    </section>
  );
};

export default LandingCTA;
