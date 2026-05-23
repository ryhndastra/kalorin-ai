import apiClient from "./apiClient";

// ADD MEAL LOG
export const addMealLog = async (payload) => {
  try {
    const response = await apiClient.post("/track/add", payload);
    return response.data;
  } catch (error) {
    console.error("❌ Failed add meal log:", error);
    throw error;
  }
};

// GET DAILY LOGS
export const getDailyLogs = async (userId, date) => {
  try {
    const response = await apiClient.get("/track/logs", {
      params: {
        userId,
        date,
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Failed get daily logs:", error);

    throw error;
  }
};
