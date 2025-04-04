import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { isJoiningClass } from "../features/joinPage/joinPageSlice";
import axios from "axios";
import { getToken } from "../utils/jwt";
import toast from "react-hot-toast";
export default function CreateClass() {
  const token = getToken();
  const [className, setClassName] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const data = {
    classId: "123",
    className,
  };

  async function createClasses() {
    if (className) {
      dispatch(isJoiningClass(false));
      try {
        const response = await axios.post(
          "http://localhost:8000/create_class",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            params: {
              class_name: className, // Ensure `className` has a valid value
            },
          }
        );
        if(response.status === 200) {
          toast.success("Class created successfully!");
        }
      } catch (error) {
        toast.error("Error creating class. Please try again.");
        console.error("Error fetching classes:", error);
      }
      setClassName("");
      navigate("/classroom", { state: data });
    } else dispatch(isJoiningClass(false));
    // tost will apper
  }

  return (
    <div className="absolute top-[24rem] left-[54rem] w-[28rem] h-[16rem] flex items-center justify-center z-[69]">
      <div className="w-full max-w-md mx-4 shadow-xl border border-[#bac4df] rounded-xl bg-[#ced3df] transition-all duration-300 hover:shadow-2xl">
        <div className="p-8 space-y-6">
          <h2 className="text-3xl font-bold text-center leading-tight tracking-tight">
            Create Classroom
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium sr-only">Class Name</label>
              <input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                type="text"
                placeholder="Enter Class Name"
                className="w-full px-4 py-3 border-2 border-[#545E79] rounded-lg focus:ring-2 focus:ring-[#545E79] focus:outline-none transition-all duration-200"
              />
            </div>
            <div
              onClick={createClasses}
              className="w-full py-3 px-4 font-semibold rounded-lg bg-[#545E79] text-[#F2F4F8] text-center hover:scale-[1.02] transform transition-all duration-200 active:scale-95
                            cursor-pointer"
            >
              Create Class
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
