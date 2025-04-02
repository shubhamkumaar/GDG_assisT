import { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { AddStudent } from "../features/addStudent/addStudentSlice";

export default function AddingStudent() {
  const isAddStudentValue = useSelector(
    (state: RootState) => state.isAddStudent.isAddStudentValue
  );
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");

  function addStudentMail() {
    if (email) {
      console.log("Assignment created:", email);
      dispatch(AddStudent(!isAddStudentValue));
      //toast
    } else {
      //toast
    }
  }

  return (
    <div className="absolute top-[16rem] left-[54rem] w-[32rem] h-[32rem] flex items-center justify-center z-[69]">
      <div className="w-full max-w-md mx-4 shadow-xl border border-[#bac4df] rounded-xl bg-[#ced3df] transition-all duration-300 hover:shadow-2xl">
        <div className="p-8 space-y-6">
          <h2 className="text-3xl font-bold text-center leading-tight tracking-tight">
            Add Student
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium sr-only">
                Student Mail
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="email"
                className="w-full px-4 py-3 border-2 border-[#545E79] rounded-lg focus:ring-2 focus:ring-[#545E79] focus:outline-none transition-all duration-200"
              />
            </div>
            <div
              onClick={addStudentMail}
              className="w-full py-3 px-4 font-semibold rounded-lg bg-[#545E79] text-[#F2F4F8] text-center hover:scale-[1.02] transform transition-all duration-200 active:scale-95
                            cursor-pointer"
            >
              Add
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
