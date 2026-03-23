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

  useEffect(() => {
    if (!user?.uid) return;

    loadTasks();
  }, [type, user]);

  const loadTasks = async () => {
    const data = await Store.getTasks(type === "special");
    setTasks(data);
  };

  if (!user?.uid) return <div>User not ready yet...</div>;

  // 🔹 FILTERS
  const allTasks = tasks.filter(t => !t.is_started);
  const inProcess = tasks.filter(
    t => t.is_started && t.started_by === user.uid
  );

  const completed = []; // optional future

  // 🔹 CLICK ALL TASK
  const handleStart = async (task: any) => {
    await Store.startTask(task.id, user.uid);
    window.open(task.link, "_blank");
    loadTasks();
  };

  return (
    <div className="p-4">

      {/* Tabs */}
      <div className="flex gap-3 mb-4">
        <button onClick={() => setTab("all")}>All</button>
        <button onClick={() => setTab("process")}>In Process</button>
        <button onClick={() => setTab("done")}>Completed</button>
      </div>

      {/* ALL TASKS */}
      {tab === "all" &&
        allTasks.map(task => (
          <div key={task.id} onClick={() => handleStart(task)}>
            <h3>{task.task_name}</h3>
            <p>{task.is_special ? "💎 Special" : "🪙 Standard"}</p>
          </div>
        ))}

      {/* IN PROCESS */}
      {tab === "process" &&
        inProcess.map(task => (
          <div
            key={task.id}
            onClick={() => navigate(`/task-check/${task.id}`)}
          >
            <h3>{task.task_name}</h3>
          </div>
        ))}

      {/* COMPLETED */}
      {tab === "done" && <div>No completed yet</div>}
    </div>
  );
};

export default TaskList;
