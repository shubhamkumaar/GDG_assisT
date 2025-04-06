import { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { isAddAssigement } from "../features/addAssigement/addAssigementSlice";
import axios from "axios";
import { getToken } from "../utils/jwt";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
export default function SetAssignment() {
  const token = getToken();
  const { state } = useLocation();
  const class_id = state?.id;

  const isAddAssigementValue = useSelector(
    (state: RootState) => state.addAssigement.isAddAssigementValue
  );
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      //toast
    }
  };

  async function createAssignment() {
    if (title == "" && description == "") {
      return;
    }
    try {
      const formData = new FormData();
      if (!title || !description) {
        toast.error("Please fill in title and description fields");
      }
      formData.append("class_id", class_id);
      formData.append("name", title);

      formData.append("description", description);
      if (file) {
        formData.append("file", file);
      }
      if (dueDate) {
        formData.append("deadline", dueDate);
      }
      const response = await axios.post(
        `${API_URL}/assignment/create_assignment`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );
      if (response.status === 201) {
        toast.success("Assignment created successfully");
        setFile(null);
        setTitle("");
        setDueDate(null);
        setDescription("");
        dispatch(isAddAssigement(!isAddAssigementValue));
      } else {
        toast.error("Failed to create assignment");
      }
    } catch (error) {
      toast.error("Error creating assignment");
      console.error("Error creating assignment:", error);
    }
  }

  return (
    <div className="absolute top-[16rem] left-[54rem] w-[32rem] h-[32rem] flex items-center justify-center z-[69]">
      <div className="w-full max-w-md mx-4 shadow-xl border border-[#bac4df] rounded-xl bg-[#ced3df] transition-all duration-300 hover:shadow-2xl">
        <div className="p-8 space-y-6">
          <h2 className="text-3xl font-bold text-center leading-tight tracking-tight">
            Assignment
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium sr-only">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                placeholder="Title"
                className="w-full px-4 py-3 border-2 border-[#545E79] rounded-lg focus:ring-2 focus:ring-[#545E79] focus:outline-none transition-all duration-200"
              />
              <label className="text-sm font-medium sr-only">Due Date</label>
              <input
                onChange={(e) => setDueDate(e.target.value)}
                type="datetime-local"
                className="w-full px-4 py-3 border-2 border-[#545E79] rounded-lg focus:ring-2 focus:ring-[#545E79] focus:outline-none transition-all duration-200"
              />
              <label className="text-sm font-medium sr-only">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                type="text"
                placeholder="Description"
                className="w-full px-4 py-3 border-2 border-[#545E79] rounded-lg focus:ring-2 focus:ring-[#545E79] focus:outline-none transition-all duration-200"
              />
              <label className="block text-xl ml-4 font-bold text-gray-700 mb-2">
                Upload your assignment:
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="application/pdf"
                className="block ml-4 mt-6 w-full text-lg text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div
              onClick={createAssignment}
              className="w-full py-3 px-4 font-semibold rounded-lg bg-[#545E79] text-[#F2F4F8] text-center hover:scale-[1.02] transform transition-all duration-200 active:scale-95
                            cursor-pointer"
            >
              Create Assignment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
