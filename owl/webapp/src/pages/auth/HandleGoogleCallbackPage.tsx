import { UserStorage } from "@lib/storage";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HandleGoogleCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = {
      name: Cookies.get("google-user-name") as string,
      email: Cookies.get("google-user-email") as string,
      access_token: Cookies.get("google-user-access_token") as string,
    };
    if (user.email) {
      UserStorage.clear();
      UserStorage.set(user);
    }
    Cookies.remove("google-user-name");
    Cookies.remove("google-user-email");
    Cookies.remove("google-user-access_token");
    navigate("/");
  }, [navigate]);

  return <div>Redirecting...</div>;
};

export default HandleGoogleCallbackPage;
