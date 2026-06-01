import apiClient from "../api/apiClient";

export const syncUserToDb = async (user, fullName = null) => {
  try {
    const cleanInputName =
      typeof fullName === "string" && fullName.trim().length > 0
        ? fullName.trim()
        : null;
    const cleanDisplayName =
      typeof user?.displayName === "string" && user.displayName.trim().length > 0
        ? user.displayName.trim()
        : null;

    await apiClient.post("/profile", {
      userId: user.uid,
      name: cleanInputName || cleanDisplayName || "User",
      email: user.email,
    });
  } catch (error) {
    console.error("Supabase Sync: Failed", error);
  }
};
