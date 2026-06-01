import { useTranslation } from "react-i18next";

const ImagePreview = ({ image, onAnalyze, onRetake }) => {
  const { i18n } = useTranslation();
  const isId = i18n.language?.startsWith("id");
  return (
    <div className="w-full flex flex-col items-center">
    <img
      src={image}
      alt={isId ? "Pratinjau" : "Preview"}
      className="rounded-2xl max-w-sm shadow-lg mb-4"
    />
    <div className="flex gap-3">
      <button
        onClick={onAnalyze}
        className="bg-green-500 text-white px-6 py-2 rounded-xl font-bold"
      >
        {isId ? "Analisis" : "Analyze"}
      </button>
      <button
        onClick={onRetake}
        className="bg-white text-gray-700 px-6 py-2 rounded-xl font-bold"
      >
        {isId ? "Foto Ulang" : "Retake"}
      </button>
    </div>
    </div>
  );
};
export default ImagePreview;
