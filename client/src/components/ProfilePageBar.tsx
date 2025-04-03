import { useEffect } from "react";
import axios from "axios";
export default function ProfilePageBar() {
  useEffect(() => {
    const getProfile = async () => {
      const response = await axios.get("http://localhost:8000/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(response.data);
    };
    getProfile();
  }, []);
  return (
    <div className="flex flex-col items-center justify-start h-full ">
      <div className="w-[84rem] h-[16rem] mt-[3rem] bg-gray-200 rounded-lg ">
        <img
          className="w-full h-full object-cover rounded-lg"
          src="VITB-Background.jpeg"
          alt="VITB-Background"
        />
      </div>
      <div className="flex flex-row items-center justify-start w-[84rem] mt-[2rem]">
        <div className="flex flex-col items-start w-[34rem] h-[46rem] rounded-2xl ">
          <div className="flex flex-row items-center justify-start w-full h-[14rem] bg-[#AAB2C6] rounded-2xl mt-[rem]">
            <div>
              <img
                className="h-36 w-36 mx-8"
                src="LoaderBar.svg"
                alt="LoaderBar"
              />
            </div>
            <div className="flex flex-col ml-[4rem] mr-[.35rem]">
              <h2 className="font-bold text-xl text-[#f2f2f8]">
                Profile Information
              </h2>
              <p className="font-medium text-xl text-[#f2f2f8] ">
                Complete your profile for unlock all feactures
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-start w-full h-[26rem] bg-[#AAB2C6] rounded-2xl mt-[4rem]">
            <div className="flex flex-row items-center justify-center w-full h-[7rem] mt-[1rem] rounded-2xl">
              <div>
                <img
                  className="h-8 w-8 mx-8"
                  src="Appereances.svg"
                  alt="Appereances"
                />
              </div>
              <div className="flex flex-col">
                <h2 className="font-bold text-3xl text-[#f2f2f8]">
                  Appereances
                </h2>
                <p className="font-medium text-xl text-[#f2f2f8] ">
                  Dark and light mode, Font size
                </p>
              </div>
              <div>
                <img
                  className="h-6 w-6 ml-8"
                  src="ChangeProflie.svg"
                  alt="Appereances"
                />
              </div>
            </div>
            <div className="flex flex-row items-center justify-center w-full h-[7rem] mt-[1rem] rounded-2xl">
              <div>
                <img
                  className="h-8 w-8 mx-8"
                  src="Appereances.svg"
                  alt="Appereances"
                />
              </div>
              <div className="flex flex-col">
                <h2 className="font-bold text-3xl text-[#f2f2f8]">
                  Appereances
                </h2>
                <p className="font-medium text-xl text-[#f2f2f8] ">
                  Dark and light mode, Font size
                </p>
              </div>
              <div>
                <img
                  className="h-6 w-6 ml-8"
                  src="ChangeProflie.svg"
                  alt="Appereances"
                />
              </div>
            </div>
            <div className="flex flex-row items-center justify-center w-full h-[7rem] mt-[1rem] rounded-2xl">
              <div>
                <img
                  className="h-8 w-8 mx-8"
                  src="Appereances.svg"
                  alt="Appereances"
                />
              </div>
              <div className="flex flex-col">
                <h2 className="font-bold text-3xl text-[#f2f2f8]">
                  Appereances
                </h2>
                <p className="font-medium text-xl text-[#f2f2f8] ">
                  Dark and light mode, Font size
                </p>
              </div>
              <div>
                <img
                  className="h-6 w-6 ml-8"
                  src="ChangeProflie.svg"
                  alt="Appereances"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-[54rem] h-[45rem] bg-[#d8dde7] rounded-lg ml-[2rem]">
          {/* Profile Information come from Which change
                     from Profile Bar */}
        </div>
      </div>
    </div>
  );
}
