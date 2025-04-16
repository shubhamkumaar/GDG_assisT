import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../store/auth/authSlice";

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");

    const new_user = params.get("new_user");  
    
    if (token) {
      dispatch(setToken(token));
      dispatch(setUser(user));
      localStorage.setItem("new_user", new_user || "false");
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <>
      <p>Signing you in...</p>
    </>
  );
};

export default AuthCallback;
