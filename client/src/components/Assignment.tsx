import { Link } from 'react-router-dom';
import { useSelector,useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import {isAddAssigement} from '../features/addAssigement/addAssigementSlice';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { getToken } from "../utils/jwt";
import SetAssignment from './SetAssigement';

export default function Assignment() {

  const { state } = useLocation();
  const class_id = state?.id;


  const token = getToken();

  const [assignment, setAssignment] = useState([])

  const isTeacher = useSelector((state: RootState) => state.auth.user?.is_teacher)
  const isAddAssigementValue = useSelector((state: RootState) => state.addAssigement.isAddAssigementValue)
  const dispatch = useDispatch();

  const assignments = [
    {
      id: 1,
      title: 'Math Homework',
      dueDate: '2025-3-15',
      description: 'Complete exercises 1 to 10 from Chapter 5.',
      getter: 'math_homework.pdf',
      status: 'Pending',
      instructions: 'Submit your work in PDF format.',
    },
    {
      id: 2,
      title: 'Science Project',
      dueDate: '2025-3-20',
      description: 'Create a presentation on the solar system.',
      getter: 'math_homework.pdf',
      status: 'Completed',
      instructions: 'Include at least 5 slides with images and references.',
    },
    {
      id: 3,
      title: 'History Essay',
      dueDate: '2025-3-25',
      description: 'Write a 1000-word essay on World War II.',
      getter: 'math_homework.pdf',
      status: 'Pending',
      instructions: 'Use at least 3 credible sources.',
    }
  ];

  useEffect(() => {
    const fetchAnnouncment = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/class/assignments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              class_id: class_id,
            },
          }
        );
        console.log("Assignment", response.data);
        setAssignment(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchAnnouncment();
  }, [token,class_id]);

  return (
    <>

    { isTeacher && <div onClick={() => dispatch(isAddAssigement(!isAddAssigementValue))} 
    className="absolute right-8 flex flex-col justify-center items-center w-[10rem] h-[4rem] mt-[2rem] bg-[#8591ad] rounded-2xl cursor-pointer " >
        <p className="text-[#f2f4f8]">Add Assigement</p>
    </div>}

      <div className=" flex flex-col justify- items-center overflow-y-auto h-[54rem] w-full px-4 py-16 bg-[#F2F4F8] text-[#545E79]">

        <div className="space-y-6 w-[48rem]">
          {assignment.map((assignment) => (
            <div
              key={assignment.id}
              className={`rounded-lg shadow-md transition-all h-[8rem] duration-300 bg-white hover:bg-gray-50 `}
              >
              <div className="p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{assignment.assignment_name}</h2>
                  {!isTeacher && <p className={`text-sm font-medium ${assignment.status === 'Completed' ? 'text-green-500' : 'text-red-500' }`}>
                    {/* Status: {assignment.status} */}
                  </p>}
                </div>

                <p className={`text-lg text-gray-500 ${
                    assignment.status === 'Completed' ? 'text-green-500' : 'text-red-500'
                    } `}>
                    Due: {assignment.deadline}
                  </p>
              </div>

                <Link
                  to="assignment"
                  state={{ id: assignment.assignment_id }}
                  >
                  <p className ='text-gray-500 text-sm ml-6'>
                    <strong> View Instructions</strong> 
                  </p>
                </Link>
            </div>
          ))}
        </div>
        {isAddAssigementValue &&  <SetAssignment />}
      </div>
  </>
  );
};

