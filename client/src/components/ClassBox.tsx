import { useState,useEffect } from 'react'
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getToken } from "../utils/jwt";

export default function ClassBox() {

  const [notification, setNotification] = useState(false);
  // const [classroomBox, setClassroomBox] = useState([{}]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = getToken();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("http://localhost:8000/classes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // console.log("Homepage",response.data);
        setClassrooms(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, [token]);




  return (
    <>
    
    {classrooms.map((classroom) => (
        <Link
          key={classroom.class_id}
          className="bg-[#8591ad] w-[20rem] h-[21rem] rounded-2xl mt-12 ml-16"
          to={`/classroom`}
          state={{ id: classroom.class_id,class_name : classroom.class_name, teacher_name: classroom.teacher_name, 
            teacher_email: classroom.teacher_email}}
        >
          <div className='flex flex-row items-center justify-between'>
            <div className="flex flex-col justify-between p-4">
              <div className="text-3xl font-semibold text-[#F2F4F8] cursor-pointer ml-6">
                {classroom.class_name}
              </div>
              <div className="text-2xl font-medium text-[#F2F4F8] cursor-pointer ml-6">
                {classroom.teacher_name}
              </div>
            </div>
            <div className="flex flex-row justify-center p-4">
              {classroom.notification ? (
                <img 
                  className='h-8 w-8 mx-2 cursor-pointer'
                  src="/YesNotify.svg" 
                  alt="yes-Notification" 
                />
              ) : (
                <img 
                  className='h-8 w-8 mx-2 cursor-pointer'
                  src="/NoNotify.svg" 
                  alt="No-Notification" 
                />
              )}
              <img 
                className='h-8 w-8 mx-2 cursor-pointer'
                src="ThreeDot.svg" 
                alt="ThreeDot" 
              />
            </div>
          </div>

          <hr className="h-px bg-[#AAB2C6] border-0" />

          <div className='flex flex-col items-start justify-start ml-6 mt-2 h-[8rem]'>
          <li className='text-2xl font-semibold text-[#F2F4F8] cursor-pointer mt-2'>
          to for class
        </li>
        <li className='text-2xl font-semibold text-[#F2F4F8] cursor-pointer mt-2'>
          to for class
        </li>
        <li className='text-2xl font-semibold text-[#F2F4F8] cursor-pointer mt-2'>
          to for class
        </li>
          </div>

          <hr className="h-px mt-6 bg-[#AAB2C6] border-0" />

          <div className='flex flex-row items-center justify-end mt-4 mr-4'>
            <img 
              className='h-8 w-8 mx-2 cursor-pointer mr-4'
              src="Collection.svg" 
              alt="Collection" 
            />
            <img 
              className='h-8 w-8 mx-2 cursor-pointer mr-4'
              src="OtherPage.svg" 
              alt="OtherPage" 
            />
          </div>
        </Link>
      ))}
                         
    </>
  )
}
      // <Link
      //   className="bg-[#8591ad] w-[20rem] h-[21rem] rounded-2xl mt-12 ml-16"
      //   to="/classroom">

      // <div className='flex flex-row items-center justify-between'>
      //   <div className="flex flex-col justify-between p-4">
      //     <div className="text-3xl font-semibold text-[#F2F4F8] cursor-pointer ml-6" >name</div>
      //     <div className="text-2xl font-medium text-[#F2F4F8] cursor-pointer ml-6" >Teacher</div>
      //   </div>
      //   <div className="flex flex-row justify-center p-4">
      //     { notification ?
      //         <img className='h-8 w-8 mx-2 cursor-pointer'
      //           src="/NoNotify.svg" alt="No-Notification" />
      //         : <img className='h-8 w-8 mx-2 cursor-pointer'
      //           src="/YesNotify.svg" alt="yes-Notification" />
      //     }
      //     <img className='h-8 w-8 mx-2 cursor-pointer'
      //       src="ThreeDot.svg" alt="ThreeDot" />
      //   </div>
      // </div>

      // <hr className="h-px bg-[#AAB2C6] border-0" />

      // <div className='flex flex-col items-start justify-start ml-6 mt-2 h-[8rem]'>
      //   <li className='text-2xl font-semibold text-[#F2F4F8] cursor-pointer mt-2'>
      //     to for class
      //   </li>
      //   <li className='text-2xl font-semibold text-[#F2F4F8] cursor-pointer mt-2'>
      //     to for class
      //   </li>
      //   <li className='text-2xl font-semibold text-[#F2F4F8] cursor-pointer mt-2'>
      //     to for class
      //   </li>
      // </div>

      // <hr className="h-px mt-6 bg-[#AAB2C6] border-0" />

      // <div className='flex flex-row items-center justify-end mt-4 mr-4'>
      //   <img className='h-8 w-8 mx-2 cursor-pointer mr-4'
      //     src="Collection.svg" alt="Collection" />
      //   <img className='h-8 w-8 mx-2 cursor-pointer mr-4'
      //     src="OtherPage.svg" alt="OtherPage" />
      // </div>

      // </Link>