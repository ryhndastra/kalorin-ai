import React from "react";
import { useTranslation } from "react-i18next";
import { LockOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const GuestUpsell = () => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const location = useLocation();

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg">
      <div className="flex items-center gap-2 text-green-600 font-semibold mb-4">
        <LockOpen size={20} />{" "}
        <span>
          {isId
            ? "Buka fitur lebih banyak dengan akun gratis"
            : "Unlock more with a free account"}
        </span>
      </div>
      <ul className="text-sm text-gray-500 space-y-2 pl-6 list-disc mb-6">
        <li>
          {isId
            ? "Lacak kalori & makro harian"
            : "Track daily calories & macros"}
        </li>
        <li>
          {isId
            ? "Dapat rekomendasi makanan personal"
            : "Get personalized meal recommendations"}
        </li>
        <li>
          {isId
            ? "Lihat riwayat & progres makanmu"
            : "View your meal history & progress"}
        </li>
        <li>
          {isId
            ? "Terima insight nutrisi bertenaga AI"
            : "Receive AI-powered nutrition insights"}
        </li>
      </ul>
      <Link
        to="/login"
        state={{ from: location }}
        className="block w-full bg-green-500 text-white py-3.5 rounded-xl font-semibold hover:bg-green-600 transition shadow-sm text-center"
      >
        {isId ? "Masuk / Buat Akun" : "Sign In / Create an Account"}
      </Link>
    </div>
  );
};

export default GuestUpsell;
