import apiClient from "./apiClient";

export const getUserProfile = async (userId) => {
  try {
    // nembak ke app.get("/api/profile/:userId", getProfile) di server.js
    const response = await apiClient.get(`/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    // nembak ke app.post("/api/profile", createOrUpdateProfile) di server.js
    const response = await apiClient.post("/profile", profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const uploadProfileAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await apiClient.post("/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error;
  }
};
