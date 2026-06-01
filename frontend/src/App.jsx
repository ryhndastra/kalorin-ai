import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Routes, Route } from "react-router-dom";
import GuestRoute from "./components/Navbar/GuestRoute";
import ProtectedRoute from "./components/Navbar/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";
import { useUser } from "./context/UserContext";
import GlobalErrorBoundary from "./components/common/GlobalErrorBoundary";
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AnalyzePage = lazy(() => import("./pages/AnalyzePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MealsPage = lazy(() => import("./pages/MealsPage"));
const TrackPage = lazy(() => import("./pages/TrackPage"));
const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const RequiredProfileModal = lazy(
  () => import("./components/Profile/RequiredProfileModal"),
);

const hasCompleteBodyStats = (profile) => {
  if (!profile) return false;
  return Boolean(
    profile.birthdate &&
      profile.weight > 0 &&
      profile.height > 0 &&
      profile.gender &&
      profile.activityLevel,
  );
};

export default function App() {
  const { user } = useAuth();
  const { fetchProfile, userData, loading, isInitialized } = useUser();
  const isFetching = useRef(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
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

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-[#eefaf1] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <h1 className="text-xl font-bold text-gray-900">You are offline</h1>
          <p className="mt-3 text-sm text-gray-600">
            Internet connection is lost. Please reconnect and refresh.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 w-full rounded-2xl bg-[#22C55E] py-3 font-semibold text-white hover:bg-[#1eb053] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <GlobalErrorBoundary>
      <Toaster position="top-center" reverseOrder={false} />
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#eefaf1] flex items-center justify-center">
            <p className="text-sm font-medium text-gray-500">Loading app...</p>
          </div>
        }
      >
        <Routes>
          <Route path="/analyze" element={<AnalyzePage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/meals" element={<MealsPage />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/insights" element={<InsightsPage />} />
          </Route>

          <Route element={<GuestRoute />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Routes>
      </Suspense>

      {shouldShowRequiredProfileModal && <RequiredProfileModal />}
    </GlobalErrorBoundary>
  );
}
