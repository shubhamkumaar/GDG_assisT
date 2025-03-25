import { useState } from "react";

export default function TodoPage() {
  const [expandedTodoId, setExpandedTodoId] = useState(null);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDescription, setNewTodoDescription] = useState("");
  const [todoList, setTodoList] = useState([
    {
      id: 1,
      title: "Todo 1",
      completed: false,
      discribe: "This is a description of the todo,This is a description of the todo, This is a description of the todo, This is a description of the todo,This is a description of the todo ",
    },
    {
      id: 2,
      title: "Todo 2",
      completed: true,
      discribe: "This is a description of the todo",
    },
    {
      id: 3,
      title: "Todo 3",
      completed: false,
      discribe: "This is a description of the todo",
    },
    {
      id: 4,
      title: "Todo 4",
      completed: true,
      discribe: "This is a description of the todo",
    }
  ]);

  const handleTodoClick = (id) => {
    setExpandedTodoId(expandedTodoId === id ? null : id);
  };

  const handleAddTodo = () => {
    if (newTodoTitle.trim() === "") return;

    const newTodo = {
      id: new Date().getTime(), 
      title: newTodoTitle,
      discribe: newTodoDescription,
      completed: false,
    };

    setTodoList([newTodo, ...todoList]); 
    setNewTodoTitle("");
    setNewTodoDescription(""); 
  };

  const handleRemoveTodo = (id) => {
    setTodoList(todoList.filter((todo) => todo.id !== id)); 
  };

  return (
    <div className="flex flex-col justify-around items-center h-full w-full">
      <h1 className="text-4xl text-center mb-6 font-bold text-[#444d64]">Todo List</h1>

      <div className="h-[11rem] w-[52rem] bg-[#f2f4f8] p-4 rounded-lg shadow-md flex flex-col space-y-2">
        <input
          type="text"
          placeholder="Enter todo title"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          className="w-full p-2 rounded-lg border border-[#545e79]focus:outline-none focus:border-[#444d64]"
        />
        <input
          type="text"
          placeholder="Enter todo description (optional)"
          value={newTodoDescription}
          onChange={(e) => setNewTodoDescription(e.target.value)}
          className="w-full p-2 rounded-lg border border-[#545e79] focus:outline-none focus:border-[#444d64]"
        />
        <button
          onClick={handleAddTodo}
          className="w-full p-2 bg-[#545e79] text-white rounded-lg hover:bg-[#444d64] transition-colors duration-200"
        >
          Add Todo
        </button>
      </div>

      <div className="h-[40rem] w-[52rem] bg-[#f2f4f8] p-6 rounded-lg shadow-lg overflow-y-auto hide-scrollbar">
        {todoList.map((todo) => (
          <div
            key={todo.id}
            className={`flex justify-between items-start w-full bg-white p-4 mb-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 ${todo.completed ? "border-green-400" : "border-red-400"} transform transition-all duration-200 cursor-pointer`}
            onClick={() => handleTodoClick(todo.id)} >
            <div className="flex items-start w-4/5 space-x-4">
              <div className={`h-10 w-10 ${todo.completed ? "bg-green-100" : "bg-fuchsia-100"} flex items-center justify-center rounded-full hover:${todo.completed ? "bg-green-200" : "bg-red-200"} transition-colors duration-200 flex-shrink-0`}>
                <span
                  className={`${todo.completed ? "text-green-600" : "text-red-600"} font-semibold`}>
                  {todo.completed ? "C" : "I"}
                </span>
              </div>

              <div className="flex flex-col flex-1 space-y-1">
                <div
                  className={`text-lg font-semibold ${ todo.completed
                      ? "text-green-800 line-through"
                      : "text-red-800"
                  } hover:${todo.completed 
                    ? "text-green-900" 
                    : "text-red-900"} transition-colors duration-200`}>
                  {todo.title}
                </div>
                {expandedTodoId === todo.id && (
                  <div className="text-sm text-[#444d64] hover:text-[#3a4256] transition-colors duration-200 whitespace-normal break-words">
                    {todo.discribe}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTodo(todo.id);
                }}
                className="h-10 w-10 bg-fuchsia-100 text-red-600 flex items-center justify-center rounded-lg hover:bg-fuchsia-200 hover:text-red-700 hover:scale-110 transform transition-all duration-200" >
                X
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}