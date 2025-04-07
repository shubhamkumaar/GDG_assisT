import { useSelector } from "react-redux";
import { RootState } from "../store/store";

import HomePage from "./HomePage";
import JoinClass from "./JoinClass";
import FeedbackPage from "./FeedbackPage";
import ProfilePage from "./ProfilePage";
import TodoPage from "./TodoPage";
import ResultPage from "./ResultPage";
import CreateClass from "./CreateClass";

const API_URL = import.meta.env.VITE_API_URL;

export default function WorkingPage() {
  const pageValue = useSelector(
    (state: RootState) => state.workingPage.pageName
  );
  const isJoining = useSelector((state: RootState) => state.joinPage.isJoining);
  const isTeacher = useSelector((state: RootState) => state.auth.user?.is_teacher)

  return (
    <>
      <div className="bg-[#F2F4F8] w-full h-screen">
        {(() => {
          switch (pageValue) {
            case "Home":
              return <HomePage />;
            case "Result":
              return <ResultPage />;
            case "Todo":
              return <TodoPage />;
            case "Feedback":
              return <FeedbackPage />;
            case "Profile":
              return <ProfilePage />;
          }
        })()}

        {isJoining && !isTeacher && (
          <div className="">
            <JoinClass />
          </div>
        )}
        {isJoining && isTeacher && (
          <div className="">
            <CreateClass />
          </div>
        )}
      </div>
    </>
  );
}
