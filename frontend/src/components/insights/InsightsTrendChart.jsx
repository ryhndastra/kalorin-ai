/* eslint-disable react-hooks/static-components */
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { BarChart3 } from "lucide-react";

const METRICS = [
  {
    key: "calories",
    label: "Calories",
    color: "#22C55E",
  },
  {
    key: "proteins",
    label: "Protein",
    color: "#3B82F6",
  },
  {
    key: "carbs",
    label: "Carbs",
    color: "#F59E0B",
  },
  {
    key: "fat",
    label: "Fat",
    color: "#EF4444",
  },
];

const InsightsTrendChart = ({ trends }) => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const metricLabels = {
    calories: isId ? "Kalori" : "Calories",
    proteins: "Protein",
    carbs: isId ? "Karbo" : "Carbs",
    fat: isId ? "Lemak" : "Fat",
  };
  // ACTIVE METRIC
  const [activeMetric, setActiveMetric] = useState("calories");

  // LAST 7 DAYS
  const days = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const localDate = date.toLocaleDateString("en-CA", {
        timeZone: "Asia/Jakarta",
      });

      const existing = trends?.find((item) => item.date === localDate) || {};

      result.push({
        day: date.toLocaleDateString(isId ? "id-ID" : "en-US", {
          weekday: "short",
        }),

        calories: existing.calories || 0,
        proteins: existing.proteins || 0,
        carbs: existing.carbs || 0,
        fat: existing.fat || 0,
      });
    }

    return result;
  }, [trends, isId]);

  // ACTIVE CONFIG
  const activeConfig = METRICS.find((metric) => metric.key === activeMetric);

  // ANALYTICS
  const activeValues = days.map((day) => day[activeMetric]);
  const highestValue = Math.max(...activeValues);
  const highestDay = days.find((day) => day[activeMetric] === highestValue);

  // EMPTY STATE CHECK
  const hasTrendData = days.some(
    (day) =>
      day.calories > 0 || day.proteins > 0 || day.carbs > 0 || day.fat > 0,
  );

  // TOOLTIP
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-100 shadow-xl rounded-2xl px-4 py-3">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <p
            className="text-sm font-medium"
            style={{
              color: activeConfig.color,
            }}
          >
            {metricLabels[activeConfig.key] || activeConfig.label} :
            <span className="font-bold"> {payload[0].value}</span>
          </p>
        </div>
      );
    }

    return null;
  };

  // EMPTY STATE
  if (!hasTrendData) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-10 mb-8 shadow-sm overflow-hidden relative">
        {/* GLOW */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#22C55E]/5 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 rounded-3xl bg-[#22C55E]/10 flex items-center justify-center mb-6">
            <BarChart3 className="text-[#22C55E]" size={30} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            {isId ? "Tren Nutrisi" : "Nutrition Trends"}
          </h2>
          <p className="text-gray-500 leading-relaxed text-lg">
            {isId
              ? "Lacak meal secara konsisten beberapa hari untuk membuka tren nutrisi mingguan dan analisis perilaku."
              : "Track meals consistently for a few days to unlock weekly nutrition trends and behavior analysis."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isId ? "Tren Nutrisi" : "Nutrition Trends"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isId
              ? "Ringkasan nutrisi 7 hari terakhir"
              : "Last 7 days nutrition overview"}
          </p>
        </div>

        {/* METRIC TOGGLE */}
        <div className="flex items-center gap-2 flex-wrap">
          {METRICS.map((metric) => {
            const active = activeMetric === metric.key;
            return (
              <button
                key={metric.key}
                onClick={() => setActiveMetric(metric.key)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                  active
                    ? "bg-[#111827] text-white border-[#111827] shadow-md scale-105"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {metricLabels[metric.key] || metric.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CHART */}
      <div className="w-full h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={days} barCategoryGap="30%">
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "#9CA3AF",
                fontSize: 13,
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "#9CA3AF",
                fontSize: 12,
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: "rgba(0,0,0,0.03)",
              }}
            />
            <Bar
              dataKey={activeMetric}
              fill={activeConfig.color}
              radius={[12, 12, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* INSIGHT */}
      <div className="mt-5 bg-[#F8FAFC] border border-gray-100 rounded-2xl p-4">
        <p className="text-sm text-gray-600 leading-relaxed">
          {isId ? "Asupan " : "Highest "}
          <span className="font-semibold text-gray-900">
            {(metricLabels[activeConfig.key] || activeConfig.label).toLowerCase()}
          </span>{" "}
          {isId ? "tertinggi terjadi pada " : "intake occurred on "}
          <span className="font-semibold text-gray-900">{highestDay?.day}</span>
          .
        </p>
      </div>
    </div>
  );
};

export default InsightsTrendChart;
