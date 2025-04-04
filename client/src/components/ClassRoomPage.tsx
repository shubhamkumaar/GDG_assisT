import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { getClassroomType } from "../features//classroomPage/classroomPageSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Announcement from "./Announcement";
import Assignment from "./Assignment";
import Student from "./Student";
import { getToken } from "../utils/jwt";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
export default function ClassRoomPage() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const classId = urlParams.get("class_id");
  const token = getToken();
  const classroomPage = useSelector(
    (state: RootState) => state.classroomPage.classroomType
  );
  const dispatch = useDispatch();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [AnnouncementArr, setAnnouncement] = useState([]);
  const [studentArr, setStudent] = useState([]);
  // const [materialArr, setMaterial] = useState([])
  // const [AssignmentArr,setAssignment] = useState([])

  useEffect(() => {
    const fetchClass = async () => {
      if (!classId) {
        toast.error("Class ID not found");
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/class`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            class_id: classId,
          },
        });
        console.log(response.data);
        setClasses(response.data);
        setLoading(false);
      } catch (error) {
        toast.error("Error fetching class details");
        console.error("Error fetching classes:", error);
      }
    };
    fetchClass();
  }, [classId, token]);

  useEffect(() => {
    const fetchAnnouncment = async () => {
      if (!classId) {
        toast.error("Class ID not found");
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/class/announcements`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            class_id: classId,
          },
        });
        console.log("Annou", response.data);
        setAnnouncement(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchAnnouncment();
  }, [classId, token]);

  useEffect(() => {
    const fetchMaterial = async () => {
      if (!classId) {
        toast.error("Class ID not found");
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/class/materials`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            class_id: classId,
          },
        });
        console.log("Material", response.data);
        setAnnouncement(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchMaterial();
  }, [classId, token]);

  useEffect(() => {
    const fetchAnnouncment = async () => {
      if (!classId) {
        toast.error("Class ID not found");
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/class/assignments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            class_id: classId,
          },
        });
        console.log("Assignment", response.data);
        setAnnouncement(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchAnnouncment();
  }, [classId, token]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!classId) {
        toast.error("Class ID not found");
        return;
      }
      try {
        const response = await axios.get(
          `${API_URL}/class/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              class_id: classId,
            },
          }
        );
        console.log("Students", response.data);
        setStudent(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchStudents();
  }, [classId, token]);

  return (
    <div className=" flex flex-col  bg-[#F2F4F8] w-full h-screen">
      <div className="bg-[#ced3df] w-full h-[10vh]">
        <div className="flex flex-row items-center justify-between h-[10vh]">
          <Link
            onClick={() => dispatch(getClassroomType("Announcement"))}
            to="/"
          >
            <img
              className="h-8 w-8 ml-[1.5rem] cursor-pointer"
              src="/Goback.svg"
              alt="Goback"
            />
          </Link>
          <div className="flex flex-row z-10  ">
            <div
              className="flex flex-row items-center justify-start h-[4rem] ml-[2rem] w-full hover:scale-[1.02] transform transition-all duration-200"
              onClick={() => dispatch(getClassroomType("Announcement"))}
            >
              <img
                className="h-8 w-8 mx-4 cursor-pointer"
                src="StudentGroup.svg"
                alt="StudentGroup"
              />
              <div className="text-xl font-semibold text-[#545E79] cursor-pointer">
                Announcement
              </div>
            </div>

            <div
              className="flex flex-row items-center justify-start h-[4rem] ml-[2rem] w-full hover:scale-[1.02] transform transition-all duration-200"
              onClick={() => dispatch(getClassroomType("Assignment"))}
            >
              <img
                className="h-8 w-8 mx-4 cursor-pointer"
                src="StudentGroup.svg"
                alt="StudentGroup"
              />
              <div className="text-xl font-semibold text-[#545E79] cursor-pointer">
                Assignment
              </div>
            </div>

            <div
              className="flex flex-row items-center justify-start h-[4rem] ml-[2rem] w-full hover:scale-[1.02] transform transition-all duration-200"
              onClick={() => dispatch(getClassroomType("Students"))}
            >
              <img
                className="h-8 w-8 mx-4 cursor-pointer"
                src="StudentGroup.svg"
                alt="StudentGroup"
              />
              <div className="text-xl font-semibold text-[#545E79] cursor-pointer">
                Students
              </div>
            </div>
          </div>

          <div className="flex flex-row">
            <img
              className="h-8 w-8 mx-4 cursor-pointer"
              src="TodoSymbol.svg"
              alt="TodoSymbol"
            />
            <img
              className="h-8 w-8 mx-4 cursor-pointer"
              src="FeedbackSymbol.svg"
              alt="FeedbackSymbol"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#F2F4F8] w-full h-screen">
        {(() => {
          switch (classroomPage) {
            case "Announcement":
              return <Announcement />;
            case "Assignment":
              return <Assignment />;
            case "Students":
              return <Student />;
          }
        })()}
      </div>
    </div>
  );
}
