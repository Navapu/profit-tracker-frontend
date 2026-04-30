import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Navigate, useLocation } from "react-router";
import { ClipLoader } from "react-spinners";

export const PublicRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useContext(AuthContext);
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <ClipLoader color="#34d399" size={150} speedMultiplier={0.8} />
        </div>
      </div>
    );
  }
  return isLoggedIn ? <Navigate to={from} replace /> : children ;
};
