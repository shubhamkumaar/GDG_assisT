import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { getClassroomType } from '../features//classroomPage/classroomPageSlice';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Announcement from './Announcement';
import Assignment from './Assignment';
import Student from './Student';


export default function ClassRoomPage() {

    const classroomPage = useSelector((state: RootState) => state.classroomPage.classroomType)
    const dispatch = useDispatch();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [AnnouncementArr, setAnnouncement] = useState([]);
    const [studentArr, setStudent] = useState([])
    // const [materialArr, setMaterial] = useState([])
    // const [AssignmentArr,setAssignment] = useState([])
    useEffect(() => {
        const fetchClass = async () => {
            try {
                const response = await axios.get("http://localhost:8000/class", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    params: {
                        class_id:"QX3zH9"
                    }
                });
                console.log(response.data);
                setClasses(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching classes:", error);
            }                    
        };
        fetchClass();
    }, []);
    
    useEffect(()=>{
        const fetchAnnouncment = async () => {
            try {
                const response = await axios.get("http://localhost:8000/class/announcements", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    params: {
                        class_id:"QX3zH9"
                    }
                });
                console.log("Annou",response.data);
                setAnnouncement(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching classes:", error);
            }                    
        };
        fetchAnnouncment();
    },[])

    useEffect(()=>{
        const fetchMaterial = async () => {
            try {
                const response = await axios.get("http://localhost:8000/class/materials", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    params: {
                        class_id:"QX3zH9"
                    }
                });
                console.log("Material",response.data);
                setAnnouncement(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching classes:", error);
            }                    
        };
        fetchMaterial();
    },[])

    useEffect(()=>{
        const fetchAnnouncment = async () => {
            try {
                const response = await axios.get("http://localhost:8000/class/assignments", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    params: {
                        class_id:"QX3zH9"
                    }
                });
                console.log("Assignment",response.data);
                setAnnouncement(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching classes:", error);
            }                    
        };
        fetchAnnouncment();
    },[])
    
    useEffect(()=>{
        const fetchStudents = async () => {
            try {
                const response = await axios.get("http://localhost:8000/class/students", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    params: {
                        class_id:"QX3zH9"
                    }
                });
                console.log("Students",response.data);
                setStudent(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching classes:", error);
            }                    
        };
        fetchStudents();
    },[])
    return (
        <div  className=" flex flex-col  bg-[#F2F4F8] w-full h-screen">
            <div className='bg-[#ced3df] w-full h-[5rem]'>
                <div  className='flex flex-row items-center justify-between h-[5rem]'>
                    <Link onClick={() => dispatch(getClassroomType("Announcement"))}
                        to="/">
                        <img className='h-8 w-8 ml-[1.5rem] cursor-pointer'
                            src="/Goback.svg" alt="Goback" />
                    </Link>
                    <div className="flex flex-row z-10  " >
                        <div
                            className='flex flex-row items-center justify-start h-[4rem] ml-[2rem] w-full hover:scale-[1.02] transform transition-all duration-200'
                             onClick={() => dispatch(getClassroomType("Announcement"))}>
                            <img className='h-8 w-8 mx-4 cursor-pointer'
                             src="StudentGroup.svg" alt="StudentGroup" />
                            <div className='text-xl font-semibold text-[#545E79] cursor-pointer'>Announcement</div>
                        </div>

                        <div
                            className='flex flex-row items-center justify-start h-[4rem] ml-[2rem] w-full hover:scale-[1.02] transform transition-all duration-200'
                            onClick={() => dispatch(getClassroomType("Assignment"))}>
                            <img className='h-8 w-8 mx-4 cursor-pointer'
                             src="StudentGroup.svg" alt="StudentGroup" />
                            <div className='text-xl font-semibold text-[#545E79] cursor-pointer'>Assignment</div>
                        </div>

                        <div
                            className='flex flex-row items-center justify-start h-[4rem] ml-[2rem] w-full hover:scale-[1.02] transform transition-all duration-200'
                            onClick={() => dispatch(getClassroomType("Students"))}>
                            <img className='h-8 w-8 mx-4 cursor-pointer'
                             src="StudentGroup.svg" alt="StudentGroup" />
                            <div className='text-xl font-semibold text-[#545E79] cursor-pointer'>Students</div>
                        </div>

                    </div>

                    <div className="flex flex-row">
                        <img className='h-8 w-8 mx-4 cursor-pointer'
                            src="TodoSymbol.svg" alt="TodoSymbol" />
                        <img className='h-8 w-8 mx-4 cursor-pointer'
                            src="FeedbackSymbol.svg" alt="FeedbackSymbol" />
                    </div>

                </div>
            </div>

            <div className='bg-[#F2F4F8] w-full h-screen'>
                {(() => {
                switch (classroomPage) {
                    case 'Announcement':
                    return <Announcement />;
                    case 'Assignment':
                    return <Assignment />;
                    case 'Students':
                    return <Student />;;
                }
                })()}
                  </div>
        </div>
    )
}