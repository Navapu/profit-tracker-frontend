import { useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useTranslation } from "react-i18next";
import { BACKEND_URL } from "../config/config.js";
import { set } from 'zod';

const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(getUser);

  const { t } = useTranslation();
  const login = async(data) => {
    try{
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.msg || t("errors.loginFailed"));
      }
      const responseData = res.data;
      
      localStorage.setItem("refreshToken", JSON.stringify(responseData.refreshToken));
      localStorage.setItem("accessToken", responseData.token);
      delete responseData.token;
      delete responseData.refreshToken;
      localStorage.setItem("user", JSON.stringify(responseData));
      
      setUser(responseData);
      return responseData;
    }catch(error){
      console.error("Error logging in:", error);
      throw error;
    }
  }
  return (
    <AuthContext.Provider value={{ login, user }}>
        {children}
    </AuthContext.Provider>
  );
};
export default AuthContextProvider;