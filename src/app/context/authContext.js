"use client";
import { useState, useContext, createContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });

  console.log("auth", auth);

  // check token
  axios.defaults.headers.common["Authorization"] = auth?.token;

  //
  useEffect(() => {
    const data = localStorage.getItem("auth");

    if (data) {
      const parseData = JSON.parse(data);
      setAuth((prevAuth) => ({
        ...prevAuth,
        user: parseData?.user,
        token: parseData?.accessToken,
      }));
    }
  }, []);

  // // Refresh token on every page load
  // const refreshToken = async () => {
  //   try {
  //     const { data } = await axios.get(
  //       `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/refresh`,
  //       {
  //         withCredentials: true,
  //       }
  //     );
  //     if (data) {
  //       setAuth((prevAuth) => ({
  //         ...prevAuth,
  //         token: data.accessToken,
  //       }));
  //     }
  //   } catch (error) {
  //     console.log("Error refreshing token:", error);
  //     if (error.response?.status === 404) {
  //       setAuth({ user: null, token: "" });
  //       localStorage.removeItem("auth");
  //     }
  //   }
  // };

  // useEffect(() => {
  //   refreshToken();
  // }, []);

  // // Get user info on every page load
  // const getUserInfo = async () => {
  //   try {
  //     const { data } = await axios.get(
  //       `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/userinfo`,
  //       {
  //         withCredentials: true,
  //       }
  //     );
  //     if (data) {
  //       setAuth((prevAuth) => ({
  //         ...prevAuth,
  //         user: data.user,
  //       }));
  //     }
  //   } catch (error) {
  //     console.log("Error fetching user info:", error);
  //   }
  // };

  // useEffect(() => {
  //   getUserInfo();
  // }, []);

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
