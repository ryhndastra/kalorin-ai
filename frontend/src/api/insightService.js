import apiClient from "./apiClient";

// GET WEEKLY SUMMARY
export const getWeeklySummary = async (userId) => {
  const response = await apiClient.get("/insights/weekly-summary", {
    params: {
      userId,
    },
  });

  return response.data;
};

// GET WEEKLY TRENDS
export const getWeeklyTrends = async (userId) => {
  const response = await apiClient.get("/insights/weekly-trends", {
    params: {
      userId,
    },
  });

  return response.data;
};

export const getBehavioralInsights = async (userId) => {
  const response = await apiClient.get("/insights/behavioral-insights", {
    params: {
      userId,
    },
  });

  return response.data;
};

export const getWeeklyComparison = async (userId) => {
  const response = await apiClient.get("/insights/weekly-comparison", {
    params: {
      userId,
    },
  });

  return response.data;
};

// GET WEEKLY SCORE
export const getWeeklyScore = async (userId) => {
  const response = await apiClient.get("/insights/weekly-score", {
    params: {
      userId,
    },
  });

  return response.data;
};

// GET STREAKS
export const getStreaks = async (userId) => {
  const response = await apiClient.get("/insights/streaks", {
    params: {
      userId,
    },
  });

  return response.data;
};
