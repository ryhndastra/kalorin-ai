import React from "react";
import { useTranslation } from "react-i18next";

const LANG_OPTIONS = [
  { code: "en", label: "EN" },
  { code: "id", label: "ID" },
];

export default function LanguageSwitcher({ className = "" }) {
  const { i18n } = useTranslation();

  const handleChangeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("app_language", language);
  };

  return (
    <div className={`inline-flex rounded-lg border border-gray-200 bg-white p-1 ${className}`}>
      {LANG_OPTIONS.map((lang) => {
        const isActive = i18n.language === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleChangeLanguage(lang.code)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              isActive
                ? "bg-green-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
