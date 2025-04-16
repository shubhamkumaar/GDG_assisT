import ClassBox from "./ClassBox";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { getToken } from "../utils/jwt";
import { useDispatch } from "react-redux";
import { setTeacher } from "../store/auth/authSlice";
const API_URL = import.meta.env.VITE_API_URL;

export default function HomePage() {
  const dispatch = useDispatch();
  const token = getToken();
  const [showDialog, setShowDialog] = useState(false);
  const setIsTeacher = async () => {
    try {
      const response = await axios.get(`${API_URL}/profile/update_isteacher`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = localStorage.getItem("user");
      const parsedUserData = userData ? JSON.parse(userData) : null;
      if (parsedUserData) {
        parsedUserData.is_teacher = true;
        localStorage.setItem("user", JSON.stringify(parsedUserData));
      }
    
      dispatch(setTeacher(true));
      toast.success("You are a teacher now");
    } catch (error) {
      console.error("Error updating teacher status:", error);
      toast.error("Failed to update teacher status");      
    }
    finally {
      setShowDialog(false);
      console.log("Teacher status updated");
    }
  };
  useEffect(() => {
    const new_user = localStorage.getItem("new_user");
    if (new_user === "True") {
      setShowDialog(true);
    }
  }, []);
  return (
    <>
      {showDialog && (
        <div className="absolute top-[24rem] left-[54rem] w-[28rem] h-[16rem] flex items-center justify-center z-[69]">
          <div className="w-full max-w-md mx-4 shadow-xl border border-[#bac4df] rounded-xl bg-[#ced3df] transition-all duration-300 hover:shadow-2xl">
            <div className="p-8 space-y-6">
              <h2 className="text-3xl font-bold text-center leading-tight tracking-tight">
                Are you a teacher?
              </h2>

              <div className="flex gap-8">
                <div
                  onClick={() => {
                    toast.success("You are not a teacher");
                    setShowDialog(false);
                  }}
                  className="w-full py-3 px-4 font-semibold rounded-lg bg-[#545E79] text-[#F2F4F8] text-center hover:scale-[1.02] transform transition-all duration-200 active:scale-95
        cursor-pointer"
                >
                  No
                </div>
                <div
                  onClick={() => {
                    setIsTeacher();
                    localStorage.setItem("new_user", "False");
                  }}
                  className="w-full py-3 px-4 font-semibold rounded-lg bg-[#545E79] text-[#F2F4F8] text-center hover:scale-[1.02] transform transition-all duration-200 active:scale-95
        cursor-pointer"
                >
                  Yes
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-row flex-wrap items-Start justify-start overflow-y-auto h-full pb-12">
        <ClassBox />
      </div>
    </>
  );
}
