import { useState, useEffect } from "react";
import { useNavigate } from 'react-router';
import { AuthContext } from "../context/AuthContext.jsx";
import { clearTokens, getRefreshToken, setTokens, getAccessToken } from "../helpers/tokens.js";
import { useTranslation } from "react-i18next";
import { BACKEND_URL } from "../config/config.js";
import { apiClient } from "../services/apiClient.js";
const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const AuthContextProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(getUser);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    checkToken();
  }, []);

  const login = async (data) => {
    try {
      const response = await apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const res = await response.json();

      if (!response.ok) throw new Error(res.msg || t("errors.loginFailed"));
      
      const responseData = res.data;

      setTokens(responseData.token, JSON.stringify(responseData.refreshToken));
      delete responseData.token;
      delete responseData.refreshToken;
      localStorage.setItem("user", JSON.stringify(responseData));

      setUser(responseData);
      return responseData;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const register = async (data) => {
    try {
      const response = await apiClient("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const res = await response.json();
      if (!response.ok) throw new Error(res.msg || t("errors.registerFailed"));

      const responseData = res.data;

      setTokens(responseData.token, JSON.stringify(responseData.refreshToken));
      delete responseData.token;
      delete responseData.refreshToken;
      localStorage.setItem("user", JSON.stringify(responseData));

      setUser(responseData);

      return responseData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = async () => {
    try{
      const refreshToken = getRefreshToken();
      const refreshToken_id = refreshToken ? {refreshToken_id : JSON.parse(refreshToken).refreshToken_id} : "";

      const response = await apiClient("/auth/logout", {
        method: "DELETE",
        body: JSON.stringify(refreshToken_id)
      });

      const res = await response.json();
      
      if (!response.ok) throw new Error(res.msg || t("errors.logoutFailed"));
      
    }catch(error){
      console.error("Error during logout: ", error);
    }finally{
      clearTokens();
      setUser(null);
      navigate('/auth/login');
    }
  };

  const checkToken = async () => {
    setIsLoading(true);
    try{
        const acesstoken = getAccessToken();
        const refreshToken = getRefreshToken();
        
        if(!acesstoken || !refreshToken){
            setUser(null);
            return;
        }

        const response = await apiClient('/auth/me', {
            method: 'POST',
        });
        const res = await response.json();
        const responseData = res.data;
        
        if(!response.ok){
            setUser(null);
            clearTokens();
            throw new Error(res.msg || t("errors.checkTokenFailed"));
        }
        
        setUser(responseData);
        return responseData;
    }catch(error){
        console.error("checkToken error:", error);
        throw error;
    }finally{
        setIsLoading(false);
    }
}

  return (
    <AuthContext.Provider value={{ login, user, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContextProvider;
