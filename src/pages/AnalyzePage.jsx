import React, { useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import { Camera, Search } from "lucide-react";
import CameraScanner from "../components/Analyze/CameraScanner";
import ImagePreview from "../components/Analyze/ImagePreview";
import DefaultScanPlaceholder from "../components/Analyze/DefaultScanPlaceholder";
import AnalysisResult from "../components/Analyze/AnalysisResult";
import GuestUpsell from "../components/Analyze/GuestUpsell";
import LoadingCard from "../components/Analyze/LoadingCard";

const AnalyzePage = () => {
  // states
  const [isGuest] = useState(true);
  const [activeTab, setActiveTab] = useState("scan");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  // handler untuk analisis makanan. nanti bakal ganti ke API call, sekarang masih dummy pakai timeout
  const handleAnalyze = () => {
    setIsLoading(true);
    setTimeout(() => {
      const dummyData = {
        foodName: "Avocado Toast with Egg",
        calories: 350,
        macros: { protein: "12g", carbs: "25g", fat: "22g" },
        confidence: "95%",
      };
      setAnalysisResult(dummyData);
      setIsLoading(false);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 2000);
  };

  // handler untuk upload file
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
        setIsCameraActive(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const capture = useCallback((webcamRef) => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setIsCameraActive(false);
  }, []);

  return (
    <div className="min-h-screen bg-white pt-24 font-sans flex flex-col">
      <Navbar variant={isGuest ? "Guest" : "User"} />

      {isGuest && (
        <div className="w-full bg-green-500 p-6">
          <div className="max-w-7xl mx-auto px-4 text-white font-medium">
            Sign in to track meals & get personalized recommendations
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 w-full py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              Food Analysis
            </h1>
            <p className="text-sm text-gray-500">
              Analyze any food with AI — free, no account needed
            </p>
          </div>
          {isGuest && (
            <span className="px-5 py-2 border border-green-600 bg-[#eefaf1] text-green-600 text-xs font-semibold rounded-lg">
              GuestMode
            </span>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex w-full bg-gray-100/80 rounded-2xl p-1.5 mb-2">
          <button
            onClick={() => setActiveTab("scan")}
            className={`flex-1 py-3 text-base font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === "scan"
                ? "bg-white text-green-500 shadow-sm"
                : "text-gray-500"
            }`}
          >
            <Camera size={20} /> Scan Image
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`flex-1 py-3 text-base font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === "search"
                ? "bg-white text-green-500 shadow-sm"
                : "text-gray-500"
            }`}
          >
            <Search size={20} /> Search Food
          </button>
        </div>
      </div>

      {/* Scan Area */}
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

          {isLoading && <LoadingCard />}
          {analysisResult && (
            <AnalysisResult
              result={analysisResult}
              onClear={() => setAnalysisResult(null)}
            />
          )}
          {isGuest && <GuestUpsell />}
        </div>
      </div>
    </div>
  );
};

export default AnalyzePage;
