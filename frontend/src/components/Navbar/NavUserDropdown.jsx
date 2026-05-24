import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import toast from "react-hot-toast";
import { useUser } from "../../context/UserContext";

const NavUserDropdown = ({ user }) => {
  const { userData } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const displayName = userData?.fullName || user?.displayName || "User";
  const avatarSrc = userData?.photoURL || user?.photoURL;

  // tutup dd kalo klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);

      sessionStorage.removeItem("welcomeToastShown");

      toast.success("Berhasil logout!");
      navigate("/");
    } catch (error) {
      toast.error("Gagal logout", error);
    }
  };

  // ambil huruf pertama kalo user gaada foto
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-green-500 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold border-2 border-green-500">
            {initial}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100 mb-2">
            <p className="text-sm font-bold text-gray-800 truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>

          <Link
            to="/profile"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <User size={16} /> Profile
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 pt-3"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default NavUserDropdown;
