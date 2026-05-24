import React, { useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AnalyzePage from "./pages/AnalyzePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import GuestRoute from "./components/Navbar/GuestRoute";
import ProfilePage from "./pages/ProfilePage";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";
import { useUser } from "./context/UserContext";
import MealsPage from "./pages/MealsPage";
import TrackPage from "./pages/TrackPage";
import InsightsPage from "./pages/InsightsPage";
import RequiredProfileModal from "./components/Profile/RequiredProfileModal";

const hasCompleteBodyStats = (profile) => {
  if (!profile) return false;
  return Boolean(profile.birthdate && profile.weight > 0 && profile.height > 0);
};

export default function App() {
  const { user } = useAuth();
  const { fetchProfile, userData, loading, isInitialized } = useUser();
  const isFetching = useRef(false);
  const shouldShowRequiredProfileModal =
    Boolean(user?.id) &&
    isInitialized &&
    !loading &&
    !hasCompleteBodyStats(userData);

  useEffect(() => {
    // kalau ada user, belum ada data, lagi ga loading, dan belum pernah fetch
    if (user?.id && !userData && !loading && !isFetching.current) {
      isFetching.current = true; // lock biar gak bisa masuk lagi
      fetchProfile(user.id);
    }
  }, [user?.id, userData, loading, fetchProfile]);
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/meals" element={<MealsPage />} />
        <Route path="/track" element={<TrackPage />} />
        <Route path="/insights" element={<InsightsPage />} />

        <Route element={<GuestRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>

      {shouldShowRequiredProfileModal && <RequiredProfileModal />}
    </>
  );
}
