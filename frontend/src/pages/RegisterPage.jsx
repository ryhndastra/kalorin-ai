import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { syncUserToDb } from "../utils/authUtils";
import AuthInput from "../components/Auth/AuthInput";
import SocialAuth from "../components/Auth/SocialAuth";
import LanguageSwitcher from "../components/common/LanguageSwitcher";

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateRegisterForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName.trim()) errors.fullName = t("auth.validate.fullNameRequired");
    if (!email.trim()) errors.email = t("auth.validate.emailRequired");
    else if (!emailRegex.test(email.trim()))
      errors.email = t("auth.validate.emailInvalid");
    if (!password) errors.password = t("auth.validate.passwordRequired");
    else if (password.length < 6)
      errors.password = t("auth.validate.passwordMin");
    if (!confirmPassword)
      errors.confirmPassword = t("auth.validate.confirmPasswordRequired");
    else if (password !== confirmPassword)
      errors.confirmPassword = t("auth.validate.passwordMismatch");

    return errors;
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setFieldErrors({});

    const errors = validateRegisterForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg(t("auth.validate.fixFields"));
      return;
    }

    setIsLoading(true);

    try {
      // buat user di Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // update Profile di Firebase
      await updateProfile(user, {
        displayName: fullName,
      });

      // sinkronkan data user ke Supabase (via Express) setelah register sukses
      await syncUserToDb(user, fullName);

      navigate("/analyze");
    } catch (error) {
      console.error("Error Register:", error);
      if (error.code === "auth/email-already-in-use") {
        setErrorMsg(t("auth.register.emailUsed"));
      } else {
        setErrorMsg(t("auth.register.registerFailed"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const result = await signInWithPopup(auth, googleProvider);

      // sinkronkan ke suopabase
      await syncUserToDb(result.user);

      navigate("/analyze");
    } catch (error) {
      console.error("Error Google Auth:", error);
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
      <div className="mb-6 text-center">
        <img
          src="images/logo/kalorinLogo.png"
          alt="KaloriN AI"
          className="w-64"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("auth.register.title")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("auth.register.subtitle")}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleEmailRegister} noValidate className="space-y-4">
          <AuthInput
            label={t("auth.fullName")}
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (fieldErrors.fullName) {
                setFieldErrors((prev) => ({ ...prev, fullName: "" }));
              }
            }}
            placeholder={t("auth.enterFullName")}
            error={fieldErrors.fullName}
          />

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
            placeholder={t("auth.createPassword")}
            error={fieldErrors.password}
          />

          <AuthInput
            label={t("auth.confirmPassword")}
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword) {
                setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }
            }}
            placeholder={t("auth.repeatPassword")}
            error={fieldErrors.confirmPassword}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition-colors shadow-sm mt-4 disabled:bg-green-300"
          >
            {isLoading ? t("auth.register.creating") : t("common.signUp")}
          </button>
        </form>

        <SocialAuth onGoogleClick={handleGoogleLogin} isLoading={isLoading} />

        <p className="text-center text-sm text-gray-600">
          {t("auth.register.haveAccount")}{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-green-500 font-bold hover:text-green-600"
          >
            {t("common.signIn")}
          </button>
        </p>
      </div>

      <div className="mt-6 text-center flex flex-col items-center gap-2">
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

export default RegisterPage;
