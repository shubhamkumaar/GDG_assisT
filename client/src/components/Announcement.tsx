import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { getClassroomType } from "../features//classroomPage/classroomPageSlice";
import axios from "axios";

export default function Announcement() {
  const [expandedId, setExpandedId] = useState(null);
  const [canAnnouncement, setCanAnnouncement] = useState(false);
  const [announcement, setAnnouncement] = useState("");

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

  const [file, setFile] = useState<File | null>(null);
  
  async function sendAnnouncementend() {

    console.log(announcement);
    const formData = new FormData();
    formData.append("class_id", "QX3zH9");
    formData.append("subject", "Class Cancel");
    formData.append("message", "Koi class mat aana");

    if (file) {
      formData.append("file", file);
    }
    try {
      const response = await axios.post(
        "http://localhost:8000/class/announcements",
        formData,
        {
          headers: {  
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
            <div className="flex flex-col justify-start items-start w-full h-[22rem] mb-2">
              <div className="text-start w-full h-[16rem] pl-4 rounded-lg border-none outline-none ">
                <input
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  type="text"
                  placeholder="Do announcement"
                  className="w-full h-full text-start pl-4 rounded-lg border-none outline-none"
                />
              </div>

              <div className="flex flex-row justify-between items-center w-full h-[8rem] border-t-2 border-[#545e79]">
                <div className="flex flex-row justify-start items-center">
                  <img
                    onClick={sendAnnouncementend}
                    className="w-8 h-8 ml-4 cursor-pointer"
                    src="../../OpenSymbol.svg"
                    alt="send"
                  />
                  <img
                    onClick={sendAnnouncementend}
                    className="w-8 h-8 ml-2 cursor-pointer"
                    src="../../OpenSymbol.svg"
                    alt="send"
                  />
                  <img
                    onClick={sendAnnouncementend}
                    className="w-8 h-8 ml-2 cursor-pointer"
                    src="../../OpenSymbol.svg"
                    alt="send"
                  />
                </div>

                <div className="mr-[2rem]">
                  <img
                    onClick={sendAnnouncementend}
                    className="w-8 h-8 mt-2 cursor-pointer "
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
