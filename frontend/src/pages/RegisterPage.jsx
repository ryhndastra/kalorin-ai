import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { syncUserToDb } from "../utils/authUtils";
import AuthInput from "../components/Auth/AuthInput";
import SocialAuth from "../components/Auth/SocialAuth";

const RegisterPage = () => {
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

    if (!fullName.trim()) errors.fullName = "Full name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!emailRegex.test(email.trim()))
      errors.email = "Email format is invalid.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6)
      errors.password = "Password must be at least 6 characters.";
    if (!confirmPassword)
      errors.confirmPassword = "Confirm password is required.";
    else if (password !== confirmPassword)
      errors.confirmPassword = "Password and confirm password do not match.";

    return errors;
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setFieldErrors({});

    const errors = validateRegisterForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg("Please correct the highlighted fields.");
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
        setErrorMsg("Email sudah terdaftar. Silakan login.");
      } else {
        setErrorMsg("Gagal mendaftar. Silakan coba lagi.");
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
      setErrorMsg("Gagal autentikasi dengan Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#dcfce7] flex flex-col items-center justify-center p-4 font-sans py-10">
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
            Create an Account
          </h2>
          <p className="text-sm text-gray-500">
            Join us to start tracking your personalized nutrition plan
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleEmailRegister} noValidate className="space-y-4">
          <AuthInput
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (fieldErrors.fullName) {
                setFieldErrors((prev) => ({ ...prev, fullName: "" }));
              }
            }}
            placeholder="Enter your full name"
            error={fieldErrors.fullName}
          />

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
            placeholder="Create Password"
            error={fieldErrors.password}
          />

          <AuthInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword) {
                setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }
            }}
            placeholder="Repeat Password"
            error={fieldErrors.confirmPassword}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition-colors shadow-sm mt-4 disabled:bg-green-300"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <SocialAuth onGoogleClick={handleGoogleLogin} isLoading={isLoading} />

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-green-500 font-bold hover:text-green-600"
          >
            Sign In
          </button>
        </p>
      </div>

      <div className="mt-6 text-center flex flex-col items-center gap-2">
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

export default RegisterPage;
