import { useEffect, useState } from "react";
import ClassBox from "./ClassBox";
// import Quiz from "./quiz";
import axios from "axios";
import { getToken } from "../utils/jwt";

export default function HomePage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const token = getToken();
  // const [error, setError] = useState(null);
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("http://localhost:8000/classes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        setClasses(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, []);
  return (
    // <h1>hello</h1>
    //   <Quiz />
    <div className="flex flex-row flex-wrap items-Start justify-start overflow-y-auto h-full pb-12">
      <ClassBox />
      <ClassBox />
      <ClassBox />
      <ClassBox />
      <ClassBox />
      <ClassBox />
      <ClassBox />
      <ClassBox />
      <ClassBox />
      <ClassBox />
      <ClassBox />
      <ClassBox />
      <ClassBox />
      <ClassBox />
      <ClassBox />
      <ClassBox />
    </div>
  );
}
