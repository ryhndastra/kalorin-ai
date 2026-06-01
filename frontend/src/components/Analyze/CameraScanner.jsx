import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import Webcam from "react-webcam";
import { Camera, SwitchCamera } from "lucide-react";

const CameraScanner = ({ facingMode, toggleCamera, capture, onCancel }) => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  const webcamRef = useRef(null);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode }}
        className="rounded-2xl w-full max-w-sm shadow-inner"
      />

      <div className="flex flex-row gap-2 mt-4 w-full max-w-sm px-2">
        <button
          onClick={() => capture(webcamRef)}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 shadow-md whitespace-nowrap text-sm"
        >
          <Camera size={18} />
          <span>{isId ? "Ambil Foto" : "Take Photo"}</span>
        </button>

        <button
          onClick={toggleCamera}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 shadow-sm whitespace-nowrap text-sm"
        >
          <SwitchCamera size={18} />
          <span>{isId ? "Ganti Kamera" : "Switch"}</span>
        </button>

        <button
          onClick={onCancel}
          className="flex-none bg-red-50 text-red-600 px-4 py-3 rounded-xl font-bold text-sm"
        >
          {isId ? "Batal" : "Cancel"}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-400 italic font-sans">
        {isId ? "Mode:" : "Mode:"}{" "}
        {facingMode === "user"
          ? isId
            ? "Kamera Depan"
            : "Front Camera"
          : isId
            ? "Kamera Belakang"
            : "Back Camera"}
      </p>
    </div>
  );
};

export default CameraScanner;
