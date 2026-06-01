import React from "react";
import { LockOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const GuestUpsell = () => {
  const location = useLocation();

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg">
      <div className="flex items-center gap-2 text-green-600 font-semibold mb-4">
        <LockOpen size={20} /> <span>Unlock more with a free account</span>
      </div>
      <ul className="text-sm text-gray-500 space-y-2 pl-6 list-disc mb-6">
        <li>Track daily calories & macros</li>
        <li>Get personalized meal recommendations</li>
        <li>View your meal history & progress</li>
        <li>Receive AI-powered nutrition insights</li>
      </ul>
      <Link
        to="/login"
        state={{ from: location }}
        className="block w-full bg-green-500 text-white py-3.5 rounded-xl font-semibold hover:bg-green-600 transition shadow-sm text-center"
      >
        Sign In / Create an Account
      </Link>
    </div>
  );
};

export default GuestUpsell;
