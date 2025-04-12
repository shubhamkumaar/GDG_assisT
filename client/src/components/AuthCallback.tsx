import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setToken, setUser} from "../store/auth/authSlice";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");

    const new_user = params.get("new_user");
    console.log(new_user);
    
    const setTeacher = async()=>{
        const response = await axios.get(`${API_URL}/profile/update_isteacher`,{
            headers:{
                Authorization: `Bearer ${token}`,
            }
        })
        console.log("res upteacher",response);
    }
    if (token) {
      localStorage.setItem("token", token);
      dispatch(setToken(token));
      dispatch(setUser(user))
      if(new_user=="True"){

        // If user click yes tab ye function call karna.
        // setTeacher();
      }
      navigate("/"); // redirect to homepage
    } else {
      navigate("/login"); // fallback if login failed
    }
  }, [navigate]);

  return <p>Signing you in...</p>;
};

export default AuthCallback;
