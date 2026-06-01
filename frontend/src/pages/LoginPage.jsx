import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { syncUserToDb } from "../utils/authUtils";
import AuthInput from "../components/Auth/AuthInput";
import SocialAuth from "../components/Auth/SocialAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateLoginForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) errors.email = "Email is required.";
    else if (!emailRegex.test(email.trim()))
      errors.email = "Email format is invalid.";

    if (!password) errors.password = "Password is required.";
    return errors;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg("");

    const errors = validateLoginForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg("Please correct the highlighted fields.");
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
      setErrorMsg("Email atau password salah. Silakan coba lagi.");
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
      setErrorMsg("Gagal login dengan Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#dcfce7] flex flex-col items-center justify-center p-4 font-sans py-10">
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
            Welcome back!
          </h2>
          <p className="text-sm text-gray-500">
            Sign in to access your personalized nutrition plan
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleEmailLogin} noValidate className="space-y-5">
          <AuthInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }
            }}
            placeholder="Enter Email"
            error={fieldErrors.email}
          />

          <AuthInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: "" }));
              }
            }}
            placeholder="Enter Password"
            rightLabel="Forgot Password?"
            error={fieldErrors.password}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition-colors shadow-sm mt-2 disabled:bg-green-300"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <SocialAuth onGoogleClick={handleGoogleLogin} isLoading={isLoading} />

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-green-500 font-bold hover:text-green-600"
          >
            Sign Up
          </button>
        </p>
      </div>

      <div className="mt-8 text-center flex flex-col items-center gap-2">
        <p className="text-sm text-gray-500">
          Just want to try the food scanner?
        </p>
        <button
          onClick={() => navigate("/analyze")}
          className="flex items-center gap-2 text-green-600 font-medium hover:text-green-700 transition-colors"
        >
          Continue as Guest <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
