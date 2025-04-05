import { Outlet } from "react-router-dom";
import SideBar from "./components/SideBar";
import { Toaster } from "react-hot-toast";

function Layout() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex flex-row">
        <SideBar />
        <Outlet />
      </div>
    </>
  );
}

export default Layout;
