import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const GuestRoute = () => {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return null;
  }

  return user ? <Navigate to="/analyze" replace /> : <Outlet />;
};

export default GuestRoute;
