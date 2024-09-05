import userStore from "@hooks/userStore";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HandleGoogleCallbackPage = () => {
  const navigate = useNavigate();
  const { googleAuth, isAuthenticated, access_token } = userStore((state) => ({
    googleAuth: state.googleAuth,
    isAuthenticated: state.isAuthenticated,
    access_token: state.access_token,
  }));

  useEffect(() => {
    !isAuthenticated && googleAuth();
    if (isAuthenticated && access_token) {
      sessionStorage.setItem("access_token", access_token);
    }
    Cookies.remove("google-user-name");
    Cookies.remove("google-user-email");
    Cookies.remove("google-user-access_token");
    Cookies.remove("login-remember-me");
    navigate("/");
  }, [navigate]);

  return <div>Redirecting...</div>;
};

export default HandleGoogleCallbackPage;
