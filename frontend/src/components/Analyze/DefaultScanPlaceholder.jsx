import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Camera, Upload } from "lucide-react";

const DefaultScanPlaceholder = ({ onStart, onUpload }) => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={onUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="w-16 h-16 bg-green-200/50 rounded-full flex items-center justify-center text-green-600 mb-4">
        <Camera size={32} />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
        {isId ? "Scan Makananmu" : "Scan Your Food"}
      </h2>

      <p className="text-sm text-gray-500 max-w-sm mb-8 text-center leading-relaxed">
        {isId
          ? "Ambil foto atau upload gambar meal kamu dan AI kami akan langsung menganalisis nutrisinya - "
          : "Take a photo or upload an image of your meal and our AI will analyze the nutrition instantly — "}
        <span className="font-medium text-gray-600">
          {isId ? "tanpa akun!" : "no account needed!"}
        </span>
      </p>

      <div className="flex flex-row gap-4 w-full max-w-md">
        <button
          onClick={onStart}
          className="flex-1 bg-green-500 text-white py-3.5 rounded-xl font-bold hover:bg-green-600 transition shadow-sm flex items-center justify-center gap-2"
        >
          {isId ? "Ambil Foto" : "Take Photo"}
        </button>

        <button
          onClick={handleUploadClick}
          className="flex-1 bg-white text-green-700 border border-green-200 py-3.5 rounded-xl font-bold hover:bg-green-50 transition flex items-center justify-center gap-2"
        >
          {isId ? "Upload Foto" : "Upload Photo"}
        </button>
      </div>
    </div>
  );
};

export default DefaultScanPlaceholder;
