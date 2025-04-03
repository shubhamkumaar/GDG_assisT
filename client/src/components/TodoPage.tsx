import { useEffect, useState } from "react";
import axios from "axios";

interface Assignment {
  assignment_id: number;
  assignment_name: string;
  assignment_description: string;
  class_id: string;
  class_name: string;
  due_date: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TodoPage() {
  const [assignmentArr, setAssignment] = useState<Assignment[] | null>([]);

  useEffect(() => {
    try {
      const getTodo = async () => {
        const response = await axios.get("http://localhost:8000/todo", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log(response.data);
        setAssignment(response.data);
      };
      getTodo();
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#f2f4f8] py-10">
      <h1 className="text-3xl font-bold text-[#545e79] mb-6">Assignments</h1>

      <div className="w-full max-w-3xl space-y-6">
        {assignmentArr &&
          assignmentArr.map((assignment) => (
            <div
              key={assignment.assignment_id}
              className="p-6 rounded-lg shadow-lg bg-[#ced3df] border-l-4 border-[#545e79]"
            >
              <h2 className="text-xl font-semibold text-[#545e79]">
                {assignment.assignment_name}
              </h2>
              <p className="text-[#8591ad] mt-2">
                {assignment.assignment_description}
              </p>

              <div className="mt-4 text-md text-[#8591ad] flex justify-between">
                <span>📖 Class: {assignment.class_name}</span>
                <span>📅 Due: {formatDate(assignment.due_date)}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
