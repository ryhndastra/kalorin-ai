/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { getUserProfile } from "../api/userService";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // useRef untuk mencatat ID terakhir yang berhasil di fetch
  const lastFetchedId = useRef(null);

  const fetchProfile = useCallback(
    async (userId, force = false) => {
      if (!userId) return;

      // OPTIMASI: hanya fetch jika ID berbeda atau jika dipaksa (force = true)
      if (!force && lastFetchedId.current === userId && userData) {
        return;
      }

      if (!force) {
        setLoading(true);
      }

      try {
        const res = await getUserProfile(userId);

        // mengambil data dari res.data.data sesuai struktur API backend
        const actualProfileData = res?.data?.data || res?.data || res;

        setUserData(actualProfileData);
        lastFetchedId.current = userId; // tandai ID ini sudah sukses di fetch
      } catch (err) {
        console.error("❌ Gagal sinkronisasi data user:", err);
        // jika gagal, biarkan lastFetchedId null agar bisa mencoba lagi nanti
        lastFetchedId.current = null;
      } finally {
        if (!force) {
          setLoading(false);
        }
        setIsInitialized(true);
      }
    },
    [userData],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchProfile(user.uid);
      } else {
        setUserData(null);
        lastFetchedId.current = null;
        setLoading(false);
        setIsInitialized(true);
      }
    });

    return () => unsubscribe();
  }, [fetchProfile]);

  const clearUserData = useCallback(() => {
    setUserData(null);
    lastFetchedId.current = null;
    setIsInitialized(false);
  }, []);

  return (
    <UserContext.Provider
      value={{
        userData,
        loading,
        isInitialized,
        fetchProfile,
        setUserData,
        clearUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
