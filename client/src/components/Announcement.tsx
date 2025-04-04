import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { getClassroomType } from "../features//classroomPage/classroomPageSlice";
import axios from "axios";

export default function Announcement() {
  const [expandedId, setExpandedId] = useState(null);
  const [canAnnouncement, setCanAnnouncement] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const isTeacher = useSelector(
    (state: RootState) => state.isTeacherPage.isTeacher
  );
  const dispatch = useDispatch();

  const announcements = [
    {
      id: 1,
      title: "KYA Announcement",
      date: "2025",
      content:
        "bFJHWUDFHIU UIWR FWRFHUIRFHVIRUH HGFRHGVIURHFGVUIRG UWRHFGUIRWGHUIRGHUIRGHUIGH WRFGBUIRG",
    },
    {
      id: 2,
      title: "OMG Announcement",
      date: "2025",
      content:
        "HUIEGHEUIHNILGVUHNNFV IJWRHGIU3RHUIRGHUIJN IUWRIUHNWUIRHRIUG WIURHNIWJNWJF U9WRHU RRU",
    },
    {
      id: 3,
      title: "XYZ Announcement",
      date: "2025",
      content:
        "GBHARHRYJHN JHIE;OTJHIOETGJIROE GOEJRIGJE TGEORTYHOEIJH OIETHGO EKJEHKETHETH T4HRTH Y JRYH4",
    },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  async function sendAnnouncementend() {
    console.log(announcement);
    const formData = new FormData();
    formData.append("class_id", "QX3zH9");
    formData.append("subject", subject);
    formData.append("message", message);

    if (file) {
      formData.append("file", file);
    }
    console.log(formData);
    
    try {
      const response = await axios.post(
        "http://localhost:8000/class/announcements",
        formData,
        {
          headers: {
            Authorization: `Bearer ${getToken.getItem("token")}`,
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      console.log(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  function doAnnouncement() {
    setCanAnnouncement(true);
    setExpandedId(null);
  }

  const toggleExpand = (id: any) => {
    setExpandedId(expandedId === id ? null : id);
    setCanAnnouncement(false);
  };

  return (
    <div className="flex flex-row overflow-y-auto h-[56rem] w-full px-4 py-16 bg-[#F2F4F8] text-[#545E79] hide-scrollbar">
      <div className="flex flex-col justify-start items-center h-[24rem] w-[16rem] mt-[2rem] mx-[6rem]">
        {isTeacher ? (
          <div className="text-4xl font-bold h-[10rem] bg-white w-[16rem] flex flex-col justify-center items-center">
            <p className="mt-4 text-center w-full text-2xl font-semibold">
              XPL35Z
            </p>
            <div className="w-full flex justify-center items-center h-[4rem] mt-4 bg-amber-50 cursor-pointer">
              <img className="w-8 h-8" src="../../OpenSymbol.svg" alt="share" />
            </div>
          </div>
        ) : (
          <div className="text-4xl font-bold h-[10rem] bg-white w-[16rem] flex justify-center items-center">
            <p className="text-center w-full text-2xl font-semibold">
              Join Class
            </p>
            <img src="../../OpenSymbol.svg" alt="joinclass" />
          </div>
        )}

        {isTeacher && (
          <div
            onClick={() => dispatch(getClassroomType("Assignment"))}
            className="text-2xl font-bold h-[6rem] mt-[2rem] bg-white w-[16rem] flex justify-center items-center cursor-pointer "
          >
            Add Assigement
          </div>
        )}
      </div>

      <div className="space-y-6 w-full mr-[8rem]">
        <div
          className={`flex flex-row justify-start items-start rounded-lg shadow-md h-[4rem] bg-white hover:bg-[#F2F4F8] ${
            canAnnouncement ? "h-[22rem]" : "cursor-pointer"
          }`}
          onClick={doAnnouncement}
        >
          {!canAnnouncement && (
            <p className="ml-4 mt-4 font-normal opacity-80 ">
              {" "}
              Do announcement{" "}
            </p>
          )}

          {canAnnouncement && (
            <div className="flex flex-col justify-start items-start w-full p-4 bg-[#CED3DF]  rounded-lg shadow-lg mb-2">
            {/* Input Section */}
            <div className="w-full">
              {/* Subject Input */}
              <label className=" text-sm font-medium mb-1 block">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter Subject"
                className="w-full h-10 px-4 mb-3 rounded-lg border border-[#545e79] outline-none focus:ring-2 focus:ring-blue-500"
              />
          
              {/* Message Textarea */}
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                className="w-full h-[8rem] px-4 py-2 mb-3  rounded-lg border border-[#545e79] outline-none resize-none focus:ring-2 focus:ring-blue-500"
              />
          
              {/* File Upload */}
              <label className="text-sm font-medium mb-1 block">Upload File</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 mb-3 rounded-lg border border-[#545e79] outline-none cursor-pointer file:mr-3 file:py-1 file:px-4 file:border-none file:text-white file:bg-blue-600 file:rounded-lg file:cursor-pointer hover:file:bg-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          
            {/* Action Buttons */}
            <div className="flex flex-row justify-between items-center w-full border-t-2 border-[#545e79] pt-3">
              <div className="flex flex-row justify-start items-center">
                <button
                  onClick={sendAnnouncementend}
                  className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition duration-300"
                >
                  Send
                </button>
              </div>
          
              <div className="mr-4">
                <img
                  onClick={sendAnnouncementend}
                  className="w-8 h-8 cursor-pointer transition transform hover:scale-110"
                  src="../../OpenSymbol.svg"
                  alt="send"
                />
              </div>
            </div>
          </div>
          
          )}
        </div>

        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`rounded-lg shadow-md transition-all duration-300 mb-4 bg-white hover:bg-[#F2F4F8]
              } ${
                expandedId === announcement.id ? "ring-2 ring-[#545E79]" : ""
              }`}
          >
            <div
              className="p-6 cursor-pointer flex justify-between items-center"
              onClick={() => toggleExpand(announcement.id)}
            >
              <div>
                <h2 className="text-xl font-semibold">{announcement.title}</h2>
                <p className={"text-sm text-gray-500"}>{announcement.date}</p>
              </div>
              <div className="text-xl">
                {expandedId === announcement.id ? "up" : "down"}
              </div>
            </div>

            {expandedId === announcement.id && (
              <div className="px-6 pb-6 h-[8rem]">
                <p className={"text-gray-600"}>{announcement.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
