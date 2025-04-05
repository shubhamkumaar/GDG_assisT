import {
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import "./App.css";
// import SideBar from './components/SideBar'
import { useSelector } from "react-redux";
import AssignmentFeedback from "./components/AssignmentFeedback";
import AssignmentPage from "./components/AssignmentPage";
import ClassRoomPage from "./components/ClassRoomPage";
import LoginPage from "./components/Login";
import SignUpPage from "./components/SignUp";
import WorkingPage from "./components/WorkingPage";
import Layout from "./Layout";
import { RootState } from "./store/store";
import ResultReview from "./components/ResultReview";
function App() {
  const ProtectedRoute = () => {
    const token = useSelector((state: RootState) => state.auth.token);
    return token ? <Outlet /> : <Navigate to="/login" replace />;
  };

  const PublicRoute = () => {
    const token = useSelector((state: RootState) => state.auth.token);
    return token ? <Navigate to="/" replace /> : <Outlet />;
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        {/* Root: Redirect to Dashboard or Login */}
        {/* <Route path="/" element={<Layout />}/> */}
        {/* <Route path="/" element={<Navigate to="/home" />} /> */}

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<WorkingPage />} />
            <Route path="classroom" element={<ClassRoomPage />} />
            <Route path="classroom/assignment" element={<AssignmentPage />} />
            <Route
              path="classroom/assignment/result-feedback"
              element={<AssignmentFeedback />}
            />
            <Route
              path="classroom/assignment/result-review"
              element={<ResultReview />}
            />
            <Route path="working" element={<WorkingPage />} />
          </Route>
        </Route>

        {/* Catch-all: Redirect unknown routes to `/` */}
        <Route path="*" element={<Navigate to="/" />} />
      </>
    )
  );
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
