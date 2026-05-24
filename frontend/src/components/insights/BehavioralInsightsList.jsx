import React from "react";
import {
  Brain,
  TriangleAlert,
  CircleCheckBig,
  Info,
  Lightbulb,
} from "lucide-react";

const insightStyles = {
  success: {
    icon: CircleCheckBig,
    bg: "bg-green-50",
    border: "border-green-100",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    badge: "bg-green-100 text-green-700",
  },
  warning: {
    icon: TriangleAlert,
    bg: "bg-orange-50",
    border: "border-orange-100",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    badge: "bg-orange-100 text-orange-700",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-100",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
  tip: {
    icon: Lightbulb,
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
  },
};

const sourceLabel = {
  gemini: "RinAi",
  cache: "RinAi",
  fallback: "AiRin",
  "local-low-data": "AiRin",
  "backend-fallback": "AiRin",
  unknown: "AiRin",
};

const BehavioralInsightsList = ({ insights, source = "unknown" }) => {
  return (
    <div className="bg-gradient-to-br from-white to-[#F8FAFC] rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden relative">
      {/* GLOW */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#22C55E]/5 blur-3xl rounded-full pointer-events-none" />

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7] flex items-center justify-center text-[#22C55E]">
          <Brain size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            AI Behavioral Insights
          </h2>
          <p className="text-gray-500 mt-1">
            Personalized observations based on your nutrition patterns
          </p>
        </div>
        <span className="ml-auto rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          {sourceLabel[source] || sourceLabel.unknown}
        </span>
      </div>

      {/* EMPTY */}
      {!insights?.length ? (
        <div className="bg-[#F8FAFC] border border-gray-100 rounded-3xl p-10 text-center relative z-10">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            No Insights Yet
          </h3>
          <p className="text-gray-500 leading-relaxed max-w-xl mx-auto">
            Track more meals consistently to unlock AI-powered nutrition
            behavior analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-5 relative z-10">
          {insights.map((insight, index) => {
            const style = insightStyles[insight.type] || insightStyles.info;
            const Icon = style.icon;
            return (
              <div
                key={index}
                className={`${style.bg} ${style.border} border rounded-3xl p-6 transition-all duration-300 hover:shadow-md`}
              >
                <div className="flex items-start gap-5">
                  {/* ICON */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${style.iconBg}`}
                  >
                    <Icon className={style.iconColor} size={26} />
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-900">
                        {insight.title}
                      </h3>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${style.badge}`}
                      >
                        {insight.type}
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BehavioralInsightsList;
