import { useSelector,useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import {AddStudent} from '../features/addStudent/addStudentSlice';
import AddingStudent from './AddStudent';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { getToken } from "../utils/jwt";
const API_URL = import.meta.env.VITE_API_URL;



export default function Student () {

  const { state } = useLocation();
  const class_id = state?.id;

  const token = getToken();

  const isTeacher = useSelector((state: RootState) => state.auth.user?.is_teacher)
  const isAddStudentValue = useSelector((state: RootState) => state.isAddStudent.isAddStudentValue)
  const dispatch = useDispatch();

  const [student, setStudent] = useState([])
  console.log("Student",student);

  const students = [
    ...Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Student ${i + 1}`,
      rollNumber: `${i + 101}`,
      email: `student${i + 1}@example.com`,
      status: i % 2 === 0 ? 'Active' : 'Inactive',
    })),
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `https://${API_URL}/class/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              class_id: class_id ,
            },
          }
        );
        console.log("Students2", response.data);
        setStudent(response.data);
        
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchStudents();
  }, [token]);


  return (
    <div className={'flex flex-col h-full bg-[#F2F4F8] text-gray-900 rounded-lg shadow-md transition-all duration-300 hover:bg-gray-50 '}>

      { isTeacher && <div onClick={() => dispatch(AddStudent(!isAddStudentValue))}
      className="absolute right-8 flex flex-col justify-center items-center w-[8rem] h-[4rem] mt-[2rem] bg-[#8591ad] rounded-2xl cursor-pointer " >
        <p className="text-[#f2f4f8]">Add Student</p>
      </div>}

      <div className="mx-auto px-4 py-8">
        <div className={'rounded-lg shadow-xl p-6 mt-8 overflow-y-auto hide-scrollbar w-[42rem] h-[50rem]' }>
          <ul className="space-y-4">
            {student.map((student) => (
              <li
                key={student.id}
                className={'p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-300'}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{student.name}</h2>
                    <p className={'text-sm text-gray-500'}>
                      Email: {student.email}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
       {isAddStudentValue &&  <AddingStudent />}
    </div>
  );
};

