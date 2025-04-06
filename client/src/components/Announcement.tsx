import { useState,useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { getClassroomType } from "../features//classroomPage/classroomPageSlice";
import axios from "axios";
import { getToken } from "../utils/jwt";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
import { useLocation } from 'react-router-dom';


export default function Announcement() {

  const { state } = useLocation();
  const class_id = state?.id;
  const class_name = state?.class_name;
  const teacher_name = state?.teacher_name;
  const teacher_email = state?.teacher_email;

 
  const token = getToken();

  const [expandedId, setExpandedId] = useState(null);
  const [canAnnouncement, setCanAnnouncement] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [useIt, setUseIt] = useState(false);

  const isTeacher = useSelector((state: RootState) => state.auth.user?.is_teacher)

  const dispatch = useDispatch();

  // const announcements = [
  //   {
  //     id: 1,
  //     subject: "KYA Announcement",
  //     announcement_time: "2025",
  //     message:
  //       "bFJHWUDFHIU UIWR FWRFHUIRFHVIRUH HGFRHGVIURHFGVUIRG UWRHFGUIRWGHUIRGHUIRGHUIGH WRFGBUIRG",
  //   },
  //   {
  //     id: 2,
  //     subject: "OMG Announcement",
  //     announcement_time: "2025",
  //     message:
  //       "HUIEGHEUIHNILGVUHNNFV IJWRHGIU3RHUIRGHUIJN IUWRIUHNWUIRHRIUG WIURHNIWJNWJF U9WRHU RRU",
  //   },
  //   {
  //     id: 3,
  //     subject: "XYZ Announcement",
  //     announcement_time: "2025",
  //     message:
  //       "GBHARHRYJHN JHIE;OTJHIOETGJIROE GOEJRIGJE TGEORTYHOEIJH OIETHGO EKJEHKETHETH T4HRTH Y JRYH4",
  //   },
  // ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  async function sendAnnouncementend() {

    const formData = new FormData();
    if(!subject || !message) {
      toast.error("Please fill in all fields");
      return;
    }
    if(class_id === null) {
      toast.error("Class ID is null");
      return;
    }
    formData.append("class_id", class_id);
    formData.append("subject", subject);
    formData.append("message", message);

    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await axios.post(
        `${API_URL}/class/announcements`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "message-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );
      setSubject("");
      setMessage("");
      setFile(null);
      setCanAnnouncement(false);
      setUseIt(!useIt);
      console.log(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(()=>{
    const fetchAnnouncment = async () => {
        try {
            const response = await axios.get(`https://${API_URL}/class/announcements`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    class_id: class_id
                }
            });
            setAnnouncements(response.data);

        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };
    fetchAnnouncment();
  },[useIt])

  function doAnnouncement() {
    setCanAnnouncement(true);
    setExpandedId(null);
  }

  const toggleExpand = (id: any) => {
    setExpandedId(expandedId === id ? null : id);
    setCanAnnouncement(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; 
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`; 
    
  };

  return (
    <div 
    className="flex flex-row overflow-y-auto h-[56rem] w-full px-4 py-16 bg-[#F2F4F8] text-[#545E79] hide-scrollbar">

      <div className='flex flex-col justify-start items-center h-[24rem] w-[16rem] mt-[2rem] mx-[6rem]'>

        {isTeacher ? <div className='text-4xl font-bold h-[10rem] bg-white w-[16rem] flex flex-col justify-center items-center'>
          <p className='mt-4 text-center w-full text-2xl font-semibold'> {class_id} </p>
          <div className='w-full flex justify-center items-center h-[4rem] mt-4 bg-amber-50 cursor-pointer'>
            <img className='w-8 h-8'
            src="../../OpenSymbol.svg" alt="share" />
          </div>
          </div > 
          : <div className='flex-col gap-2 text-4xl font-bold h-[10rem] bg-white w-[16rem] flex justify-center items-center'>
              <p className='text-center w-full text-2xl font-semibold'>{class_name}</p>
              <p className='text-center w-full text-xl font-semibold'>Teacher : {teacher_name}</p>
              <p className='text-center w-full text-lg font-semibold'>contact - {teacher_email}</p>
              
          </div > }

        {isTeacher && <div onClick={() => dispatch(getClassroomType("Assignment"))}
        className='text-2xl font-bold h-[6rem] mt-[2rem] bg-white w-[16rem] flex justify-center items-center cursor-pointer '>
          Add Assigement
        </div>}
      </div>

      <div className="space-y-6 w-full mr-[8rem]">

      <div 
        className={`flex flex-col justify-start items-start rounded-lg shadow-md bg-white hover:bg-[#F2F4F8] mb-8 ${
          canAnnouncement ? "min-h-[22rem]" : "h-[4rem] cursor-pointer"
        }`}
        onClick={!canAnnouncement ? doAnnouncement : undefined}
      >
        {!canAnnouncement && (
          <p className='ml-4 mt-4 font-normal opacity-80'>Do announcement</p>
        )}

        {canAnnouncement && (
          <div className='flex flex-col justify-start items-start w-full p-4'>

            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              type='text'
              placeholder='subject'
              className='w-full h-12 px-4 mb-4 rounded-lg border border-gray-300 outline-none'
            />
            
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Write your announcement here...'
              className='w-full h-48 p-4 rounded-lg border border-gray-300 outline-none resize-none'
            />

            <div className='flex flex-col w-full mt-4 border-t-2 border-[#545e79] pt-4'>
              
              <div className='flex items-center mb-4'>
                <label className='cursor-pointer bg-[#8591ad] text-white px-4 py-2 rounded-lg hover:bg-[#7986a3]'>
                  Upload File
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                  />
                </label>
                <div className='ml-4 flex flex-wrap gap-2'>
                  // remove files
                </div>
              </div>

              <div className='flex justify-end items-center'>
                <button
                  onClick={sendAnnouncementend}
                  className='bg-[#8591ad] text-white px-6 py-2 rounded-lg hover:bg-[#7986a3] cursor-pointer'>
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {announcements.map((announcement) => (
        <div
          key={announcement.announcement.id}
          className={`rounded-lg shadow-md transition-all bg-white hover:bg-[#F2F4F8] ${
            expandedId === announcement.announcement.id ? 'ring-2 ring-[#545E79]' : ''
          }`}>
          <div
            className="p-6 cursor-pointer flex justify-between items-center"
            onClick={() => toggleExpand(announcement.announcement.id)}
          >
            <div>
              <h2 className="text-xl font-semibold">{announcement.announcement?.subject}</h2>
              <p className="text-sm text-gray-500">
                {formatDate(announcement.announcement.announcement_time)}
              </p>
            </div>
            <div className="text-gray-400">
              {expandedId === announcement.announcement.id ? '▲' : '▼'}
            </div>
          </div>

          {expandedId === announcement.announcement.id && (
            <div className="px-6 pb-6">
              <p className="text-gray-600 mb-4">
                {announcement.announcement.message}
              </p>
              {announcement.file && (
                <div className="flex items-center text-[#545E79]">
                  <span className="mr-2">📎</span>
                  <a 
                    href={announcement.announcement.file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {announcement.announcement.file.name || 'Download attachment'}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      </div>

    </div>
  );
}

// {canAnnouncement && (
//   <div className="flex flex-col justify-start items-start w-full p-4 bg-[#CED3DF]  rounded-lg shadow-lg mb-2">
//   {/* Input Section */}
//   <div className="w-full">
//     {/* Subject Input */}
//     <label className=" text-sm font-medium mb-1 block">Subject</label>
//     <input
//       type="text"
//       value={subject}
//       onChange={(e) => setSubject(e.target.value)}
//       placeholder="Enter Subject"
//       className="w-full h-10 px-4 mb-3 rounded-lg border border-[#545e79] outline-none focus:ring-2 focus:ring-blue-500"
//     />

//     {/* Message Textarea */}
//     <label className="text-sm font-medium mb-1 block">Description</label>
//     <textarea
//       value={message}
//       onChange={(e) => setMessage(e.target.value)}
//       placeholder="Write your message..."
//       className="w-full h-[8rem] px-4 py-2 mb-3  rounded-lg border border-[#545e79] outline-none resize-none focus:ring-2 focus:ring-blue-500"
//     />

//     {/* File Upload */}
//     <label className="text-sm font-medium mb-1 block">Upload File</label>
//     <input
//       type="file"
//       onChange={handleFileChange}
//       className="w-full px-3 py-2 mb-3 rounded-lg border border-[#545e79] outline-none cursor-pointer file:mr-3 file:py-1 file:px-4 file:border-none file:text-white file:bg-blue-600 file:rounded-lg file:cursor-pointer hover:file:bg-blue-500 focus:ring-2 focus:ring-blue-500"
//     />
//   </div>

//   {/* Action Buttons */}
//   <div className="flex flex-row justify-between items-center w-full border-t-2 border-[#545e79] pt-3">
//     <div className="flex flex-row justify-start items-center">
//       <button
//         onClick={sendAnnouncementend}
//         className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition duration-300"
//       >
//         Send
//       </button>
//     </div>

//     <div className="mr-4">
//       <img
//         onClick={sendAnnouncementend}
//         className="w-8 h-8 cursor-pointer transition transform hover:scale-110"
//         src="../../OpenSymbol.svg"
//         alt="send"
//       />
//     </div>
//   </div>
// </div>

// )}