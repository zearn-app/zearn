import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Store } from "../services/store";
import { UserContext } from "../App";

const TaskList: React.FC = () => {

  const { type } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [tasks, setTasks] = useState<any[]>([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);


useEffect(() => {
  if (!user?.uid) return;

  loadTasks();
  loadCompleted();

  const handleFocus = () => {
    loadTasks();
    loadCompleted();
  };

  window.addEventListener("focus", handleFocus);

  return () => {
    window.removeEventListener("focus", handleFocus);
  };
}, [type, user]);
  
  
  const loadTasks = async () => {
  setLoading(true);

  const data = await Store.getTasks(type === "special");

  // Optional: force new array reference (prevents stale UI)
  setTasks([...data]);

  setLoading(false);
};

  

  if (!user?.uid) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading user...
      </div>
    );
  }

  // Filters
  const allTasks = tasks
  .filter(t => !t.is_started)
  .sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
  
  const inProcess = tasks.filter(
    t => t.is_started && t.started_by === user.uid
  );

  const handleStart = async (task: any) => {
    await Store.startTask(task.id, user.uid);
    if (task.link) window.open(task.link, "_blank");
    loadTasks();
  };

  const renderTaskCard = (task: any, isProcess = false) => (
    <div
      key={task.id}
      onClick={() => {
  if (isProcess && task.id) {
    navigate(`/task-check/${task.id}`);
  } else if (!isProcess) {
    handleStart(task);
  }
}}
      className="bg-white rounded-2xl shadow-md p-4 mb-4 cursor-pointer 
                 hover:shadow-xl transition-all duration-300 border"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          {task.task_name}
        </h3>

        <span
          className={`text-xs px-2 py-1 rounded-full ${
            task.is_special
              ? "bg-purple-100 text-purple-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {task.is_special ? "💎 Special" : "🪙 Standard"}
        </span>
      </div>

      <div className="mt-2 text-sm text-gray-500">
       {task.is_completed
           ? "Task is completed"
           : isProcess
           ? "Continue your task →"
           : "Tap to start task"}
       </div>
    </div>
  );

  return (
    <div className="p-4 max-w-xl mx-auto">



      
           <div className="flex items-center gap-3 mb-4">
  <button
    onClick={() => navigate("/login")}
    className="text-gray-700 text-xl font-bold px-2"
  >
    ←
  </button>

  <h1 className="text-2xl font-bold text-gray-800">
    Tasks
  </h1>
</div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
        {["all", "process", "done"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              tab === t
                ? "bg-white shadow text-blue-600"
                : "text-gray-500"
            }`}
          >
            {t === "all" && "All"}
            {t === "process" && "In Process"}
            {t === "done" && "Completed"}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-gray-400">
          Loading tasks...
        </div>
      )}

      {/* All Tasks */}
      {!loading && tab === "all" && (
        <>
          {allTasks.length === 0 ? (
            <div className="text-center text-gray-400">
              No tasks available
            </div>
          ) : (
            allTasks.map(task => renderTaskCard(task))
          )}
        </>
      )}

      {/* In Process */}
      {!loading && tab === "process" && (
        <>
          {inProcess.length === 0 ? (
            <div className="text-center text-gray-400">
              No tasks in progress
            </div>
          ) : (
            inProcess.map(task => renderTaskCard(task, true))
          )}
        </>
      )}

      {/* Completed */}
{!loading && tab === "done" && (
  <>
    {completedTasks.length === 0 ? (
      <div className="text-center text-gray-400">
        No completed tasks yet 🚀
      </div>
    ) : (
      completedTasks.map(task => renderTaskCard(task, false))
    )}
  </>
)}
    </div>
  );
};

export default TaskList;
