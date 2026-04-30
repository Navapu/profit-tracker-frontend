import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../context/AuthContext";
import { ClipLoader } from "react-spinners";

export const PrivateRoute = ({ children }) => {
  const { isLoading, isLoggedIn } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <ClipLoader 
            color="#34d399" 
            size={150} 
            speedMultiplier={0.8} 
          />
        </div>
      </div>
    );
  }

  return isLoggedIn ? children : <Navigate to="/auth/login" state={{ from: location }} replace />;
};