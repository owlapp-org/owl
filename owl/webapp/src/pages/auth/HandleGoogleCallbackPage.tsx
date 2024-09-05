import userStore from "@hooks/userStore";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HandleGoogleCallbackPage = () => {
  const navigate = useNavigate();
  const { googleAuth } = userStore();

  useEffect(() => {
    googleAuth();
    Cookies.remove("google-user-name");
    Cookies.remove("google-user-email");
    Cookies.remove("google-user-access_token");
    Cookies.remove("login-remember-me");
    navigate("/");
  }, [navigate]);

  return <div>Redirecting...</div>;
};

export default HandleGoogleCallbackPage;
