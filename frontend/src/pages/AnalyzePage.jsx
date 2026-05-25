import React, { useState, useCallback, useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import { Camera, Search, User } from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import CameraScanner from "../components/Analyze/CameraScanner";
import ImagePreview from "../components/Analyze/ImagePreview";
import DefaultScanPlaceholder from "../components/Analyze/DefaultScanPlaceholder";
import AnalysisResult from "../components/Analyze/AnalysisResult";
import GuestUpsell from "../components/Analyze/GuestUpsell";
import LoadingCard from "../components/Analyze/LoadingCard";
import SearchFoodTab from "../components/Analyze/SearchFoodTab";
import { useUser } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import AnalyzeSkeleton from "../components/skeletons/AnalyzeSkeleton";
import { addMealLog } from "../api/trackService";

const AnalyzePage = () => {
  // CONTEXT
  const { user } = useAuth();
  const { isInitialized, loading: profileLoading, fetchProfile } = useUser();
  const isGuest = !user;

  // URL SEARCH PARAMS
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "scan";

  // STATES
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isSwitching, setIsSwitching] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAddingMeal, setIsAddingMeal] = useState(false);

  // PAGE LOADING
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSwitching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const isPageLoading =
    !isInitialized || (user && profileLoading) || isSwitching;

  // ANALYZE HANDLER
  const handleAnalyze = async (e) => {
    e.preventDefault();

    // NO FILE
    if (!selectedFile) {
      toast.error("Please upload an image first.");
      return;
    }

    try {
      setIsAnalyzing(true);

      setAnalysisResult(null);

      // =========================
      // FORM DATA
      // =========================
      const formData = new FormData();

      formData.append("file", selectedFile);

      // =========================
      // API CALL
      // =========================
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // FAILED
      if (!data.success) {
        toast.error(data.message || "Failed to analyze food.");
        return;
      }

      // SUCCESS
      setAnalysisResult({
        foodName: data.food,
        calories: data.calories,
        macros: {
          protein: `${data.proteins}g`,
          carbs: `${data.carbohydrate}g`,
          fat: `${data.fat}g`,
        },
        confidence: `${Math.round(data.confidence)}%`,
        image: data.image,
      });

      // SCROLL
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // FILE UPLOAD
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
        setIsCameraActive(false);
      };

      reader.readAsDataURL(file);
    }
  };

  // CAMERA TOGGLE
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  // CAMERA CAPTURE
  const capture = useCallback((webcamRef) => {
    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) return;
    // PREVIEW
    setCapturedImage(imageSrc);
    // BASE64 → FILE
    const imageFile = dataURLtoFile(imageSrc, "camera-capture.jpg");
    // SAVE FILE
    setSelectedFile(imageFile);
    // CLOSE CAMERA
    setIsCameraActive(false);
  }, []);

  const parseMacroValue = (value) => {
    const parsed = parseFloat(String(value || "0").replace(/[^\d.]/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const handleAddScanResultToMeal = async () => {
    if (!user) {
      toast.error("Please sign in to add meals to your log.");
      return;
    }

    if (!analysisResult) {
      return;
    }

    try {
      setIsAddingMeal(true);

      await addMealLog({
        userId: user.id || user.uid,
        foodName: analysisResult.foodName,
        calories: parseMacroValue(analysisResult.calories),
        proteins: parseMacroValue(analysisResult.macros?.protein),
        carbs: parseMacroValue(analysisResult.macros?.carbs),
        fat: parseMacroValue(analysisResult.macros?.fat),
        quantity: 1,
        mealType: "meal",
      });

      await fetchProfile(user.id || user.uid, true);
      toast.success(`${analysisResult.foodName} added to meal log`);
    } catch (error) {
      console.error("❌ Failed add scanned meal:", error);
      toast.error("Failed to add meal log.");
    } finally {
      setIsAddingMeal(false);
    }
  };

  // WELCOME TOAST
  useEffect(() => {
    if (user) {
      const hasSeenToast = sessionStorage.getItem("welcomeToastShown");

      if (!hasSeenToast) {
        toast.success(`Welcome back, ${user.displayName || "User"}!`, {
          icon: <User />,
        });
        sessionStorage.setItem("welcomeToastShown", "true");
      }
    }
  }, [user]);

  // SKELETON
  if (isPageLoading) {
    return (
      <>
        <Navbar user={user} loading={true} />
        <AnalyzeSkeleton />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 font-sans flex flex-col">
      <Navbar user={user} loading={false} />

      {/* GUEST BANNER */}
      {isGuest && (
        <div className="w-full bg-green-500 p-4 mt-4">
          <div className="max-w-7xl mx-auto px-4 text-white text-sm font-medium flex justify-between items-center">
            <span>
              Sign in to track meals & get personalized recommendations
            </span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-4 w-full py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              Food Analysis
            </h1>
            <p className="text-sm text-gray-500">
              {isGuest
                ? "Analyze any food with AI — free, no account needed"
                : "Identify your meal and track your daily nutrition"}
            </p>
          </div>

          {/* GUEST LABEL */}
          {isGuest && (
            <span className="px-5 py-2 border border-green-600 bg-[#eefaf1] text-green-600 text-xs font-semibold rounded-lg">
              GuestMode
            </span>
          )}
        </div>

        {/* TAB SWITCHER */}
        <div className="flex w-full bg-gray-100/80 rounded-2xl p-1.5 mb-2">
          <button
            onClick={() =>
              setSearchParams({
                tab: "scan",
              })
            }
            className={`flex-1 py-3 text-base font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
              currentTab === "scan"
                ? "bg-white text-green-500 shadow-sm"
                : "text-gray-500"
            }`}
          >
            <Camera size={20} />
            Scan Image
          </button>

          <button
            onClick={() =>
              setSearchParams({
                tab: "search",
              })
            }
            className={`flex-1 py-3 text-base font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
              currentTab === "search"
                ? "bg-white text-green-500 shadow-sm"
                : "text-gray-500"
            }`}
          >
            <Search size={20} />
            Search Food
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      {currentTab === "scan" ? (
        <div className="bg-[#eefaf1] w-full flex-grow mt-4 pt-10 pb-20">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="border-2 border-green-400 border-dashed rounded-3xl p-6 min-h-[400px] flex items-center justify-center bg-black/5 overflow-hidden mb-6">
              {isCameraActive ? (
                <CameraScanner
                  facingMode={facingMode}
                  toggleCamera={toggleCamera}
                  capture={capture}
                  onCancel={() => setIsCameraActive(false)}
                />
              ) : capturedImage ? (
                <ImagePreview
                  image={capturedImage}
                  onAnalyze={handleAnalyze}
                  onRetake={() => setCapturedImage(null)}
                />
              ) : (
                <DefaultScanPlaceholder
                  onStart={() => setIsCameraActive(true)}
                  onUpload={handleFileUpload}
                />
              )}
            </div>

            {isAnalyzing && <LoadingCard />}

            {analysisResult && (
              <AnalysisResult
                result={analysisResult}
                onClear={() => setAnalysisResult(null)}
                onAddMeal={handleAddScanResultToMeal}
                isAddingMeal={isAddingMeal}
                canAddMeal={!isGuest}
              />
            )}

            {isGuest && <GuestUpsell />}
          </div>
        </div>
      ) : (
        <SearchFoodTab />
      )}
    </div>
  );
};

export default AnalyzePage;
