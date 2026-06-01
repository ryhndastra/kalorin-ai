import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { auth, googleProvider } from "../config/firebase";
import { syncUserToDb } from "../utils/authUtils";
import AuthInput from "../components/Auth/AuthInput";
import SocialAuth from "../components/Auth/SocialAuth";
import LanguageSwitcher from "../components/common/LanguageSwitcher";

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateLoginForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) errors.email = t("auth.validate.emailRequired");
    else if (!emailRegex.test(email.trim()))
      errors.email = t("auth.validate.emailInvalid");

    if (!password) errors.password = t("auth.validate.passwordRequired");
    return errors;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg("");

    const errors = validateLoginForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg(t("auth.validate.fixFields"));
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // 2. SINKRONKAN KE SUPABASE
      await syncUserToDb(userCredential.user);

      navigate("/analyze");
    } catch (error) {
      console.error("Login Email Gagal:", error);
      setErrorMsg(t("auth.login.invalidCreds"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const result = await signInWithPopup(auth, googleProvider);

      // sinkronkan data user ke Supabase (via Express) setelah login sukses
      await syncUserToDb(result.user);

      navigate("/analyze");
    } catch (error) {
      console.error("Login Google Gagal:", error);
      setErrorMsg(t("auth.googleFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white to-[#dcfce7] flex flex-col items-center justify-center p-4 font-sans py-10">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="mb-8 text-center">
        <img
          src="images/logo/kalorinLogo.png"
          alt="KaloriN AI"
          className="w-64"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("auth.login.title")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("auth.login.subtitle")}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleEmailLogin} noValidate className="space-y-5">
          <AuthInput
            label={t("auth.email")}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }
            }}
            placeholder={t("auth.enterEmail")}
            error={fieldErrors.email}
          />

          <AuthInput
            label={t("auth.password")}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: "" }));
              }
            }}
            placeholder={t("auth.enterPassword")}
            rightLabel={t("auth.forgotPassword")}
            error={fieldErrors.password}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition-colors shadow-sm mt-2 disabled:bg-green-300"
          >
            {isLoading ? t("auth.login.signingIn") : t("common.signIn")}
          </button>
        </form>

        <SocialAuth onGoogleClick={handleGoogleLogin} isLoading={isLoading} />

        <p className="text-center text-sm text-gray-600 mt-6">
          {t("auth.login.noAccount")}{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-green-500 font-bold hover:text-green-600"
          >
            {t("common.signUp")}
          </button>
        </p>
      </div>

      <div className="mt-8 text-center flex flex-col items-center gap-2">
          <p className="text-sm text-gray-500">
          {t("auth.login.scannerTry")}
          </p>
        <button
          onClick={() => navigate("/analyze")}
          className="flex items-center gap-2 text-green-600 font-medium hover:text-green-700 transition-colors"
        >
          {t("common.continueAsGuest")} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
