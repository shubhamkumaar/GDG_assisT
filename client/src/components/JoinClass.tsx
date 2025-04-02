import { useState, useEffect } from "react";

import { useDispatch } from "react-redux";
import {
  getClassCode,
  isJoiningClass,
} from "../features/joinPage/joinPageSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export default function JoinClass() {
  const [classCode, setClassCode] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function joinClass() {
    dispatch(getClassCode(classCode));
    dispatch(isJoiningClass(false));
    if (classCode === "") {
      alert("Please enter a class code");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/join_class",
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
          params: {
            class_id: classCode, // Ensure `className` has a valid value
          },
        }
      );
      console.log(response.data);
      if (response.status === 200) {
        dispatch(isJoiningClass(false));
        navigate("/classroom", { state: data });
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }

    setClassCode("");
  }

  return (
    <div className="absolute top-[24rem] left-[54rem] w-[28rem] h-[16rem] flex items-center justify-center z-[69]">
      <div className="w-full max-w-md mx-4 shadow-xl border border-[#bac4df] rounded-xl bg-[#ced3df] transition-all duration-300 hover:shadow-2xl">
        <div className="p-8 space-y-6">
          <h2 className="text-3xl font-bold text-center leading-tight tracking-tight">
            Join Classroom
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium sr-only">Class Code</label>
              <input
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                type="text"
                placeholder="Enter Class Code"
                className="w-full px-4 py-3 border-2 border-[#545E79] rounded-lg focus:ring-2 focus:ring-[#545E79] focus:outline-none transition-all duration-200"
              />
            </div>
            <div
              onClick={joinClass}
              className="w-full py-3 px-4 font-semibold rounded-lg bg-[#545E79] text-[#F2F4F8] text-center hover:scale-[1.02] transform transition-all duration-200 active:scale-95
                            cursor-pointer"
            >
              Join Now
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
