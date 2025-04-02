import { useEffect, useState } from "react";
import ClassBox from "./ClassBox";
// import Quiz from "./quiz";
import axios from "axios";

async function get_classes() {
  try {
    const response = await axios.get("http://localhost:8000/classes", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log(response);
  } catch (error) {
    console.error("Error fetching classes:", error);
  }
}
export default function HomePage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("http://localhost:8000/classes", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
