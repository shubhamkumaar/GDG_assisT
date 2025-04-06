import { Link, useLocation } from "react-router-dom";
import { use, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { isSidebarState } from "../features/isSidebar/isSidebarSlice";
import axios from "axios";
import { getToken } from "../utils/jwt";
import toast from "react-hot-toast";
import { isAutomationState } from "../features/isAutomation/isAutomation";
const API_URL = import.meta.env.VITE_API_URL;

type Assignment = {
  assignment_name: string;
  assignment_description: string;
  deadline: string;
  assignment_id: number;
  file: string;
  submission: {
    id: number;
    submission_file: string;
    submission_date: string;
    is_reviewed: boolean;
  };
};

type teacherAssignment = {
  answer_key: string;
  assignment_deadline: string;
  assignment_description: string;
  assignment_file: string;
  assignment_name: string;
  class_id: string;
  id: number;
};
export default function AssignmentPage() {
  const [feedbackData, setFeedbackData] = useState({
    score: 0,
    max_score: 0,
    summary_bullets: [],
  });

  const isAutomation = useSelector(
    (state: RootState) => state.isAutomationPage.isAutomation
  );

  const [file, setFile] = useState(null);
  const [assignmentSubmits, setAssignmentSubmits] = useState([]);
  const [isResultOut, setIsResultOut] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState([]);
  const [getFeedback, setGetFeedback] = useState([]);
  const [assignmentDetials, setAssignmentDetails] = useState<Assignment[]>([]);
  const [teacherAssignment, setTeacherAssignment] = useState<
    teacherAssignment[]
  >([]);
  
  const [resultValue, setResultValue] = useState(false);
  console.log("feedbackData", feedbackData);

  const token = getToken();
  const { state } = useLocation();
  const assig_id = state?.id;

  const isTeacher = useSelector(
    (state: RootState) => state.auth.user?.is_teacher
  );
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      toast.success("File selected successfully!");
      setFile(selectedFile);
    } else {
      toast.error(
        "Please select a valid PDF file. Other formats are not supported."
      );
      setFile(null);
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
  };
  useEffect(() => {
    const getAssignment = async () => {
      const response = await axios.get(`${API_URL}/assignment`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: {
          assignment_id: assig_id,
        },
      });
      console.log("Assignment get", response.data);
      setAssignmentDetails([response.data]);
      setIsResultOut(response.data.submission.is_reviewed);
    };
    getAssignment();
  }, []);

  useEffect(() => {
    const getResult = async () => {
      const response = await axios.get(`${API_URL}/assignment/submissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: {
          assignment_id: assig_id,
        },
      });
      console.log("here", response.data.assignment);
      setTeacherAssignment([response.data.assignment]);
      setAssignmentSubmits(response.data.submission);
    };
    getResult();
  }, [assig_id, token]);

  async function AutomaticChecker() {
    try {
      const formData = new FormData();
      formData.append("assignment_id", assig_id);
      const response = await axios.post(
        `${API_URL}/automated_feedback`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      // console.log("Automated feedback", response.data);
      dispatch(isAutomationState(true));
    } catch (error) {
      console.error("Error submitting assignment:", error);
    }
  }

  useEffect(() => {
    const getResult = async () => {
      const response = await axios.get(`${API_URL}/feedback_status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: {
          assignment_id: assig_id,
        },
      });
      console.log("here or there", response.data.submissions);
      setStatusFeedback(response.data.submissions);
    };
    getResult();
  }, [assig_id, token]);

  //  check result Api call
  async function CheckResult() {
    try {
      const response = await axios.get(`${API_URL}/feedback`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: {
          submission_id: assignmentDetials[0]?.submission?.id,
        },
      });
      console.log("feedback", response.data);
      setFeedbackData(response.data);
      setResultValue(true);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  }

  async function submitAssignment() {
    const formData = new FormData();
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }
    formData.append("assignment_id", assig_id);
    formData.append("file", file);
    try {
      const response = await axios.post(
        `${API_URL}/assignment/submit_assignment`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          params: {
            assignment_id: assig_id,
          },
        }
      );
      console.log(response);

      toast("Good Job! Successfully submitted assignment", {
        icon: "👏",
      });
    } catch (error) {
      toast.error("Error uploading file. Please try again.");
      console.error("Error uploading file:", error);
    }
  }

  async function uploadAnswerKey() {
    const formData = new FormData();
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }
    formData.append("assignment_id", assig_id);
    formData.append("file", file);
    try {
      const response = await axios.post(
        `${API_URL}/assignment/answer_key`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          params: {
            assignment_id: assig_id,
          },
        }
      );
      console.log(response);

      toast("Successfully uploaded answer key", {
        icon: "👏",
      });
    } catch (error) {
      toast.error("Error uploading file. Please try again.");
      console.error("Error uploading file:", error);
    }
  }

  return (
    <div className=" flex flex-col  bg-[#F2F4F8] w-full h-screen">
      {/* upper nav */}
      <div className="bg-[#ced3df] w-full h-[10vh]">
        <div className="flex flex-row items-center justify-between h-[10vh]">
          <Link to="/classroom">
            <img
              className="h-8 w-8 ml-[1.5rem] cursor-pointer"
              src="/Goback.svg"
              alt="Goback"
            />
          </Link>
          <div className="flex flex-row z-10  ">
            <div className="text-xl font-semibold text-[#545E79] cursor-pointer">
              Subject Name
            </div>
          </div>

          <div className="flex flex-row">
            <img
              className="h-8 w-8 mx-4 cursor-pointer"
              src="../TodoSymbol.svg"
              alt="TodoSymbol"
            />
            <img
              className="h-8 w-8 mx-4 cursor-pointer"
              src="../FeedbackSymbol.svg"
              alt="FeedbackSymbol"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center justify-center h-full ">
        {/* assignment part */}

        <div className="w-[48rem] h-[38rem] mx-auto bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-6">
            {isTeacher && teacherAssignment.length != 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mt-3 text-center">
                  {teacherAssignment[0].assignment_name}
                </h2>

                <p className="text-lg text-gray-600 mr-6 mt-4 text-right">
                  <span className="font-semibold">Due Date:</span>{" "}
                  {formatDate(teacherAssignment[0].assignment_deadline)}
                </p>

                <p className="text-gray-700 text-lg ml-4 mt-4">
                  {teacherAssignment[0].assignment_description}
                </p>
                {teacherAssignment[0].assignment_file && (
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 ml-4 mt-2">
                      Files:
                    </h3>
                    <a
                      href={teacherAssignment[0].assignment_file}
                      target="_blank"
                      className="flex items-center gap-3 border border-gray-300 rounded-md p-3 w-fit ml-6 mt-2 hover:shadow-md transition-all cursor-pointer"
                    >
                      <img src="/file_img.svg" alt="file" className="h-6 w-6" />
                      <span className="text-gray-700 hover:text-blue-500 text-sm">
                        {
                          decodeURIComponent(
                            teacherAssignment[0].assignment_file
                              .split("/")
                              .pop() || ""
                          ).split("_")[1]
                        }
                      </span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {assignmentDetials.length != 0 && !isTeacher && (
              <>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mt-3 text-center">
                    {assignmentDetials[0].assignment_name}
                  </h2>

                  <p className="text-lg text-gray-600 mr-6 mt-4 text-right">
                    <span className="font-semibold">Due Date:</span>{" "}
                    {formatDate(assignmentDetials[0].deadline)}
                  </p>

                  <p className="text-gray-700 text-lg ml-4 mt-4">
                    {assignmentDetials[0].assignment_description}
                  </p>

                  {assignmentDetials[0].file && (
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 ml-4 mt-2">
                        Files:
                      </h3>
                      <a
                        href={assignmentDetials[0].file}
                        target="_blank"
                        className="flex items-center gap-3 border border-gray-300 rounded-md p-3 w-fit ml-6 mt-2 hover:shadow-md transition-all cursor-pointer"
                      >
                        <img
                          src="/file_img.svg"
                          alt="file"
                          className="h-6 w-6"
                        />
                        <span className="text-gray-700 hover:text-blue-500 text-sm">
                          {
                            decodeURIComponent(
                              assignmentDetials[0].file.split("/").pop() || ""
                            ).split("_")[1]
                          }
                        </span>
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex items-center ml-4 mt-4">
                  <span className="font-bold text-lg text-gray-800">
                    Status:
                  </span>
                  <span
                    className={`ml-2 px-2 py-1 text-sm ${
                      assignmentDetials[0].submission === null
                        ? "text-red-500 bg-red-100"
                        : "text-green-500 bg-green-100"
                    } text-sm rounded-full`}
                  >
                    {assignmentDetials[0].submission === null
                      ? "Pending"
                      : "Completed"}
                  </span>
                </div>
              </>
            )}
            {/* {!isTeacher && (
              
            )} */}
          </div>

          {isTeacher ? (
            <>
              <div className="mt-4 p-6 border-t border-gray-200 ">
                <div className="flex flex-row justify-start items-center mb-4">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="application/pdf"
                    className="block ml-4 mt-6 w-full text-lg text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <div
                    onClick={() => {
                      uploadAnswerKey();
                    }}
                    className="text-[#f2f4f8] bg-[#8591ad] w-[20rem] h-[3rem] rounded-lg cursor-pointer hover:bg-[#a0abc7] transition duration-300"
                  >
                    <p className="text-center mt-3 font-semibold">
                      Upload Answer Key
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-6 border-t border-gray-200 ">
                <h3 className="font-bold text-2xl text-[#545e79]">Mode</h3>
                <div className="flex flex-row justify-start items-center mt-4">
                  <div
                    onClick={AutomaticChecker}
                    className="text-center  text-[#f2f4f8] bg-[#8591ad] w-[10rem] h-[3rem] rounded-lg cursor-pointer hover:bg-[#a0abc7] transition duration-300 ml-4"
                  >
                    <p className="text-center mt-3 font-semibold">
                      {" "}
                      Automatic{" "}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : assignmentDetials.length != 0 &&
            assignmentDetials[0].submission !== null ? (
            <h1 className="text-2xl ml-4 mt-8 text-green-600">
              Already Submitted the Assignment
            </h1>
          ) : (
            <div className="mt-4 p-6 border-t border-gray-200   ">
              <label className="block text-xl ml-4 font-bold text-gray-700 mb-2">
                Upload your assignment:
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="application/pdf"
                className="block ml-4 mt-6 w-full text-lg text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={() => {
                  submitAssignment();
                }}
                className="justify-self-center w-[12rem] bg-[#aab2c6] text-center text-black px-4 py-2 rounded-lg cursor-pointer hover:bg-[#8591ad] text-xl transition duration-300 mt-4"
              >
                Submit
              </button>
            </div>
          )}
        </div>

        {/* result part */}
        {!isResultOut ? (
          isTeacher ? (
            isAutomation ? (
              <div className="flex flex-col w-[32rem] h-[36rem] mx-auto bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <h1 className="my-4 font-semibold text-2xl text-center">
                  Automation Status
                </h1>

                <div className="flex flex-col justify-center items-center gap-2 overflow-auto w-full hide-scrollbar h-[32rem]">
                  {statusFeedback &&
                    statusFeedback.map((student) => (
                      <div
                        key={student?.id}
                        className="bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-[45vh] flex flex-row justify-around items-start p-4 shadow-md hover:shadow-lg"
                      >
                        <div className="flex flex-col justify-center items-center">
                          <h3 className="text-lg font-medium text-gray-800">
                            {student?.student_name}
                          </h3>
                          <span
                            className={`text-sm px-2 py-1 rounded ${
                              student?.status === "completed"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {student?.status}
                          </span>
                        </div>

                        <Link
                          onClick={() => dispatch(isSidebarState(true))}
                          to="result-review"
                          state={{ id: student?.id }}
                        >
                          <button 
                          key={student.id}
                          {...(student?.status !== "completed" ? { disabled: true } : {})}
                          className="mt-3 py-2 text-sm text-gray-700 hover:scale-[1.05] rounded cursor-pointer transition-colors">
                            View PDF
                          </button>
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col w-[32rem] h-[32rem] mx-auto bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <h1 className="my-4 font-semibold text-2xl text-center">
                  Submitted Listed
                </h1>
                {assignmentSubmits.map((submit) => (
                  <div
                    key={submit.id}
                    className="p-4 m-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-xl font-medium ml-4">
                        {submit.student_name}
                      </p>
                      <span className="cursor-pointer text-xl font-normal ml-2">
                        view pdf
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="w-[24rem] h-[10rem] mx-auto bg-red-50 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="transition-all duration-300 ease-in-out">
                <p className="text-red-800 text-3xl text-center mt-8">
                  Result is not out yet.
                </p>
                <p className="text-red-800 text-xl text-center mt-8">
                  Time: 3 days
                </p>
              </div>
            </div>
          )
        ) : isTeacher ? (
          <div className="flex flex-col w-[32rem] h-[32rem] mx-auto bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="text-green-800 text-4xl mt-2 text-center">
              Result is out!
            </div>
            <div className="transition-all duration-300 ease-in-out overflow-y-auto hide-llbar">
              <div className=" p-4 rounded-lg overflow-y-auto">
                // After the result is out, the teacher can see the result of
                each student
              </div>
            </div>
          </div>
        ) : resultValue ? (
          <div className="flex flex-col w-[32rem] h-[32rem] mx-auto bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="transition-all duration-300 ease-in-out">
              <div className=" p-4 rounded-lg">
                <div className="text-green-800 text-4xl text-center">
                  Result is out!
                </div>
                <p className="text-green-700 text-2xl mt-4 ml-4">
                  Your score:{" "}
                  <span className="font-bold">
                    {feedbackData.score}/{feedbackData.max_score}
                  </span>
                </p>
              </div>

              <div className="px-8 mb-4 border-t border-gray-300 ">
                <h3 className="font-bold text-2xl text-gray-800">Summary:</h3>
                <div className="h-[16rem] overflow-auto hide-scrollbar">
                  <ul className="list-disc list-inside mt-4">
                    {feedbackData.summary_bullets.map((bullet, index) => (
                      <li
                        key={index}
                        className=" ml-2 mt-2 text-xl text-gray-700"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                onClick={() => dispatch(isSidebarState(true))}
                to="result-feedback"
                state={{ id: assignmentDetials[0].submission.id }}
              >
                <div className="justify-self-center w-[18rem] bg-[#aab2c6] text-center text-black px-4 py-2 rounded-lg cursor-pointer hover:bg-[#8591ad] text-xl transition duration-300">
                  Get detailed feedback
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center w-[12rem] h-[4rem] mx-auto bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <div
              onClick={CheckResult}
              className="transition-all duration-300 ease-in-out"
            >
              check Result
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
