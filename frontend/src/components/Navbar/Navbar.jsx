import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";
import { auth } from "../../config/firebase";
import { useUser } from "../../context/UserContext";
import NavLinks from "./NavLinks";
import NavUserDropdown from "./NavUserDropdown";

const Navbar = ({ user, loading, userData }) => {
  const { userData: contextUserData } = useUser();
  const [isVisible, setIsVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();
  const resolvedUserData = userData || contextUserData;
  const displayName =
    resolvedUserData?.fullName ||
    auth.currentUser?.displayName ||
    user?.displayName ||
    "User";
  const avatarSrc =
    resolvedUserData?.photoURL ||
    user?.photoURL ||
    auth.currentUser?.photoURL ||
    "/images/default-avatar.png";

  // HIDE ON SCROLL
  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
      setIsVisible(false);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsVisible(true);
      }, 250);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // CLOSE MENU
  const closeMobileMenu = () => {
    setMobileOpen(false);
    setAccountOpen(false);
  };

  // SMOOTH NAVIGATION
  const handleMobileNavigate = (path) => {
    closeMobileMenu();
    setTimeout(() => {
      navigate(path);
    }, 280);
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      closeMobileMenu();
      setTimeout(async () => {
        await signOut(auth);
        sessionStorage.removeItem("welcomeToastShown");
        toast.success("Berhasil logout!");
        navigate("/");
      }, 280);
    } catch (error) {
      toast.error("Gagal logout", error);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-5 lg:px-8 py-4 flex items-center justify-between">
          {/* LEFT */}
          <Link
            to={user ? "/analyze" : "/"}
            className="flex items-center gap-2 font-bold text-xl cursor-pointer shrink-0"
          >
            <img
              src="/images/logo/kalorinLogo.png"
              alt="KaloriN AI Logo"
              className="w-24 sm:w-28"
            />
          </Link>

          {/* DESKTOP LINKS */}
          {user && (
            <div className="hidden lg:flex">
              <NavLinks />
            </div>
          )}

          {/* RIGHT */}
          <div className="hidden lg:flex items-center gap-4">
            {loading ? (
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <NavUserDropdown user={user} />
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-600 hover:text-green-600 transition-colors"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-600 transition block"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-11 h-11 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-700 bg-white"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-[80] lg:hidden transition-all duration-300 ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* BACKDROP */}
        <div
          onClick={closeMobileMenu}
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* PANEL */}
        <div
          className={`absolute top-0 right-0 h-full w-[82%] max-w-sm bg-white shadow-2xl border-l border-gray-100 transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="pt-28 px-6 pb-8 flex flex-col h-full">
            {/* NAV LINKS */}
            {user && (
              <div className="flex flex-col gap-2">
                <NavLinks mobile onNavigate={handleMobileNavigate} />
              </div>
            )}

            {/* USER SECTION */}
            <div className="mt-auto pt-8 border-t border-gray-100">
              {loading ? (
                <div className="w-full h-12 rounded-2xl bg-gray-100 animate-pulse" />
              ) : user ? (
                <>
                  {/* USER INFO */}
                  <div className="flex items-center gap-4 bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100 mb-5">
                    <img
                      src={avatarSrc}
                      alt="Profile"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/images/default-avatar.png";
                      }}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 line-clamp-1">
                        {displayName}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* ACCOUNT */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setAccountOpen(!accountOpen)}
                      className="w-full rounded-2xl bg-[#F8FAFC] border border-gray-100 px-4 py-4 text-left font-semibold text-gray-800"
                    >
                      Account
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        accountOpen
                          ? "max-h-60 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pt-2 flex flex-col gap-2">
                        <button
                          onClick={() => handleMobileNavigate("/profile")}
                          className="rounded-2xl px-4 py-3 text-left font-medium text-gray-700 hover:bg-[#F8FAFC] transition"
                        >
                          Profile
                        </button>
                        <button
                          onClick={handleLogout}
                          className="rounded-2xl px-4 py-3 text-left font-medium text-red-600 hover:bg-red-50 transition"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleMobileNavigate("/login")}
                    className="w-full rounded-2xl border border-gray-200 py-3 text-center font-semibold text-gray-700"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleMobileNavigate("/register")}
                    className="w-full rounded-2xl bg-green-500 py-3 text-center font-semibold text-white"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
