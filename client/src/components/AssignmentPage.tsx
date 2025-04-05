import { Link, useLocation } from "react-router-dom";
import { use, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { isSidebarState } from "../features/isSidebar/isSidebarSlice";
import axios from "axios";
import { getToken } from "../utils/jwt";

export default function AssignmentPage() {

  const token = getToken()

  const isTeacher = useSelector((state: RootState) => state.auth.user?.is_teacher)
  const dispatch = useDispatch();

  const { state } = useLocation();
  const assig_id = state?.id;

  const result = {
    score: 78.0,
    summary_bullets: [
      "Strong conceptual understanding but needs more detailed examples",
      "Consistent formatting errors in citations",
      "Excellent time management evident in completion rate",
    ],
    detailed_feedback: {
      strengths: [
        "Demonstrated mastery of quadratic equations in Q3 and Q7",
        "Clear thesis statement in essay introduction",
        "Consistent use of technical terminology",
      ],
      areas_of_improvement: [
        "Show working steps for mathematical proofs (lost 12% on incomplete proofs)",
        "Include at least 3 peer-reviewed sources per argument",
        "Use APA 7th edition formatting for all citations",
      ],
      question_details: [
        {
          question_id: "Q1",
          score: 4.5,
          rank: "Good",
          basis: "Rubric Section II-A: Proper method but rounding errors",
          feedback:
            "Accurate setup but final answer missing units,Accurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing unitsAccurate setup but final answer missing units",
        },
        {
          question_id: "Q5",
          score: 2.0,
          rank: "Needs Work",
          basis: "Rubric Section III-B: Missing required diagram",
          feedback: "Theoretical answer correct but visual proof absent",
        },
      ],
      rubric_summary:
        "Grading criteria: 40% accuracy, 30% methodology, 20% presentation, 10% timeliness. Level descriptors: Excellent (9-10 pts): Exceeds requirements; Good (7-8.9 pts): Meets all requirements; Needs Work (<7 pts): Missing key elements.",
      actual_summary:
        "Your submission shows strong technical knowledge but lacks attention to formatting requirements. While your calculations are mostly correct (scoring 92% on accuracy), presentation errors cost 15% of total marks. Focus on citation formatting and showing complete working steps to reach A-grade level.",
    },
  };

  // const students = [
  //   ...Array.from({ length: 20 }, (_, i) => ({
  //     id: i + 1,
  //     name: `Student ${i + 1}`,
  //     marks: "85",
  //   })),
  // ];

  const [file, setFile] = useState(null);
  const [submit, setSubmit] = useState(false);
  const [assignmentSubmits, setAssignmentSubmits] = useState([])
  const [isResultOut, setIsResultOut] = useState(true);
  const automationStarted = true
  

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  useEffect(() => {
    const fetchAssignment = async () => {
      const formData = new FormData();
      console.log("file", file);
      
      if (file) {
        formData.append("file", file); 
      }
        const response = await axios.post("http://localhost:8000/assignment/submit_assignment",
          formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "message-Type": "multipart/form-data",
            Accept: "application/json",
          },
          params:{
              assignment_id: assig_id,
          }
        });
        setFile(null);
        console.log("Assignment get",response.data);
      }
      fetchAssignment();
    }, [file]);


  useEffect(() => {
    const getAssignment = async () => {
      const response = await axios.get("http://localhost:8000/assignment", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params:{
            assignment_id: assig_id,
        }
      });
      
      console.log("Assignment get",response.data);
    };
    getAssignment();
  }, [token, assig_id]);

  useEffect(() => {
    const getResult = async () => {
      const response = await axios.get("http://localhost:8000/assignment/submissions", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params:{
            assignment_id: 2,
        }
      });
      setAssignmentSubmits(response.data.submission);
    };
    getResult();
  }, []);

  async function AutomaticChecker() {
    try {
      // const response = await axios.get("http://localhost:8000/automated_feedback", {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     Accept: "application/json",
      //   },
      //   data:{
      //       assignment_id: assig_id,
      //   }
      // });

      // console.log("Automated feedback", response.data);
      
    } catch (error) {
      console.error("Error submitting assignment:", error);
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
            <h2 className="text-3xl font-bold text-gray-900 mt-3 text-center">
              title
            </h2>

            <p className="text-lg text-gray-600 mr-6 mt-4 text-right">
              <span className="font-semibold">Due Date:</span> dueDate
            </p>

            <p className="text-gray-700 text-lg ml-4 mt-4">description</p>

            <div>
              <h3 className="font-bold text-lg text-gray-800 ml-4 mt-2">
                Files:
              </h3>
              <p className="text-gray-700 ml-6">getter</p>
            </div>

            {!isTeacher && (
              <div className="flex items-center ml-4 mt-4">
                <span className="font-bold text-lg text-gray-800">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 text-sm ${
                    status === "Completed"
                      ? "text-green-500 bg-green-100"
                      : "text-red-500 bg-red-100"
                  } text-sm rounded-full`}
                >
                  status
                </span>
              </div>
            )}
          </div>

          {isTeacher ? (
            <div className="mt-4 p-6 border-t border-gray-200 ">
              <h3 className="font-bold text-2xl text-[#545e79]">Mode</h3>
              <div className="flex flex-row justify-start items-center mt-4">
                {/* <div className="text-[#f2f4f8] bg-[#8591ad] w-[10rem] h-[3rem] rounded-lg cursor-pointer hover:bg-[#a0abc7] transition duration-300">
                  <p className="text-center mt-3 font-semibold">Manual</p>
                </div> */}
                <div onClick={AutomaticChecker}
                className="text-center  text-[#f2f4f8] bg-[#8591ad] w-[10rem] h-[3rem] rounded-lg cursor-pointer hover:bg-[#a0abc7] transition duration-300 ml-4">
                  <p className="text-center mt-3 font-semibold"> Automatic </p>
                </div>
              </div>
            </div>
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
                onClick={() => {setSubmit(true)}}
                className="justify-self-center w-[12rem] bg-[#aab2c6] text-center text-black px-4 py-2 rounded-lg cursor-pointer hover:bg-[#8591ad] text-xl transition duration-300 mt-4">
                  Submit
                </button>
            </div>
          )}
        </div>

        {/* result part */}
        {!isResultOut ? isTeacher ? automationStarted ?
          <div className="flex flex-col w-[32rem] h-[32rem] mx-auto bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <h1 className="my-4 font-semibold text-2xl text-center " >Automation Status</h1>

            
          </div>
          : <div className="flex flex-col w-[32rem] h-[32rem] mx-auto bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <h1 className="my-4 font-semibold text-2xl text-center " >Submitted Listed</h1>
            {assignmentSubmits.map((submit) => (
              <div
                key={submit.id}
                className="p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
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
        : <div className="w-[24rem] h-[10rem] mx-auto bg-red-50 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="transition-all duration-300 ease-in-out">
            <p className="text-red-800 text-3xl text-center mt-8">
              Result is not out yet.
            </p>
            <p className="text-red-800 text-xl text-center mt-8">
              Time: 3 days
            </p>
          </div>
        </div>
        : isTeacher ? (
          <div className="flex flex-col w-[32rem] h-[32rem] mx-auto bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="text-green-800 text-4xl mt-2 text-center">
              Result is out!
            </div>
            <div className="transition-all duration-300 ease-in-out overflow-y-auto hide-llbar">
              <div className=" p-4 rounded-lg overflow-y-auto">
                // After the result is out, the teacher can see the result of each student
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-[32rem] h-[32rem] mx-auto bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="transition-all duration-300 ease-in-out">
              <div className=" p-4 rounded-lg">
                <div className="text-green-800 text-4xl text-center">
                  Result is out!
                </div>
                <p className="text-green-700 text-2xl mt-4 ml-4">
                  Your score:{" "}
                  <span className="font-bold">{result.score}/100</span>
                </p>
              </div>

              <div className=" mt-2 p-8 border-t border-gray-200 ">
                <h3 className="font-bold text-2xl text-gray-800">Summary:</h3>
                <ul className="list-disc list-inside mt-4">
                  {result.summary_bullets.map((bullet, index) => (
                    <li
                      key={index}
                      className=" ml-2 mt-2 text-xl text-gray-700"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                onClick={() => dispatch(isSidebarState(true))}
                to="result-feedback"
                state={result}
              >
                <div className="justify-self-center w-[18rem] bg-[#aab2c6] text-center text-black px-4 py-2 rounded-lg cursor-pointer hover:bg-[#8591ad] text-xl transition duration-300">
                  Get detailed feedback
                </div>
              </Link>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
