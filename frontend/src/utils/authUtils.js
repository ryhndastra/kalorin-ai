import apiClient from "../api/apiClient";

export const syncUserToDb = async (user, fullName = null) => {
  try {
    await apiClient.post("/profile", {
      userId: user.uid,
      name: fullName || user.displayName || "User",
      email: user.email,
    });
    console.log("Supabase Sync: Success (Identity only)");
  } catch (error) {
    console.error("Supabase Sync: Failed", error);
  }
};
