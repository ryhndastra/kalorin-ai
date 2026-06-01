/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Target, Brain, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { getDailyInsight } from "../../api/aiService";

const InsightBanners = () => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const navigate = useNavigate();
  const { userData } = useUser();
  const [aiAdvice, setAiAdvice] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // logic hitunf sisa protein
  const proteinGoal = userData?.proteinTarget || 0;
  const proteinEaten = userData?.today_stats?.proteins || 0;
  const proteinLeft = Number(
    Math.max(0, proteinGoal - proteinEaten).toFixed(1),
  );

  // fungsi ambil advice dari AI
  const getAiInsight = async () => {
    if (proteinLeft <= 0 || !userData?.userId) return; // kalo udah terpenuhi, ga usah ambil insight

    setIsAiLoading(true);
    try {
      const macroContext = isId
        ? `User membutuhkan ${proteinLeft}g protein lagi hari ini. Target saat ini ${
            userData.goal || "Tetap Sehat"
          }. Berikan satu saran praktis yang singkat dalam bahasa Indonesia.`
        : `User needs ${proteinLeft}g more protein today. Current goal is ${
            userData.goal || "Stay Healthy"
          }. Give one short practical suggestion in English.`;

      const response = await getDailyInsight(
        userData.userId,
        macroContext,
      );

      setAiAdvice(
        response?.recommendation ||
          (isId
            ? "Coba tambahkan dada ayam atau greek yogurt pada meal berikutnya."
            : "Try adding a chicken breast or Greek yogurt to your next meal!"),
      );
    } catch (error) {
      console.error("AI Error:", error);
      setAiAdvice(
        isId
          ? "Coba tambahkan dada ayam atau greek yogurt pada meal berikutnya."
          : "Try adding a chicken breast or Greek yogurt to your next meal!",
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  // panggil ai tiap kali proteinLeft berubah dan masih ada kebutuhan protein yang harus dipenuhi
  useEffect(() => {
    if (proteinLeft > 0) {
      setAiAdvice("");
      getAiInsight();
    }
  }, [proteinLeft, isId, userData?.userId, userData?.goal]);

  return (
    <div className="max-w-5xl mx-auto px-6 mt-6 flex flex-col gap-4">
      {/* target banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#22C55E]">
            <Target size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500">
              {isId ? "Targetmu saat ini" : "Your current goal"}
            </p>
            <p className="font-bold text-gray-800">
              {userData?.goal || (isId ? "Belum Diatur" : "Not Set")}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center text-[#22C55E] text-sm font-medium hover:underline"
        >
          {isId ? "Ubah" : "Edit"} <ChevronRight size={16} />
        </button>
      </div>

      {/* ai insight banner */}
      <div className="bg-[#DCFCE7] rounded-2xl p-4 flex items-center gap-4 border border-[#BBF7D0]">
        <div className="w-12 h-12 rounded-xl bg-[#86EFAC] flex items-center justify-center text-green-800 shrink-0">
          <Brain size={24} />
        </div>
        <div className="flex-1">
          <p className="text-xs text-green-800 font-medium flex items-center gap-2">
            {isId ? "Insight AI" : "AI Insight"}
            {isAiLoading && <Loader2 size={12} className="animate-spin" />}
          </p>
          <p className="text-sm text-gray-700 mt-0.5">
            {proteinLeft > 0 ? (
              <>
                {isId ? "Kamu butuh " : "You need "}
                <span className="font-bold text-gray-900">
                  {proteinLeft}g {isId ? "protein lagi" : "more protein"}
                </span>{" "}
                {isId ? "lagi hari ini." : "today."}
                <span className="italic block mt-1">
                  {isAiLoading
                    ? isId
                      ? "Menganalisis kebutuhanmu..."
                      : "Analyzing your needs..."
                    : aiAdvice || (isId ? "Memuat saran..." : "Loading advice...")}
                </span>
              </>
            ) : (
              isId
                ? "Keren! Target protein kamu hari ini sudah tercapai."
                : "Awesome! You've reached your protein target for today. Keep it up!"
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsightBanners;
