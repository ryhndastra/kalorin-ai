import apiClient from "./apiClient";

// GET ALL FOODS
export const getFoods = async () => {
  try {
    const response = await apiClient.get("/foods");
    return response.data;
  } catch (error) {
    console.error("❌ Failed fetching foods:", error);
    throw error;
  }
};
