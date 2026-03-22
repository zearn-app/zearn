import React, { useEffect, useState, useContext } from "react";
import { Store } from "../services/store";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";

export const TaskPage: React.FC = () => {

  const [tasks, setTasks] = useState<any[]>([]);
  const [tab, setTab] = useState("all");
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await Store.getAllTasks();
    setTasks(data);
  };

  const handleStart = async (task: any) => {
    const updated = await Store.startTask(task.task_id, user.uid);

    if (!updated.link) {
      alert("Link is empty");
      return;
    }

    window.open(updated.link, "_blank");
    loadTasks();
  };

  const openTaskCheck = (task: any) => {
    navigate(`/task-check/${task.task_id}`);
  };

  const filteredTasks = tasks.filter(t => {
    if (tab === "all") return !t.is_started;
    if (tab === "process") return t.is_started && t.started_by === user.uid;
    if (tab === "completed") return false; // handled via history if needed
  });

  return (
    <div>

      <h2>Tasks</h2>

      <div>
        <button onClick={() => setTab("all")}>All Tasks</button>
        <button onClick={() => setTab("process")}>In Process</button>
        <button onClick={() => setTab("completed")}>Completed</button>
      </div>

      {filteredTasks.map(task => (
        <div key={task.task_id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>

          <h4>{task.task_name}</h4>

          <p>
            Reward: {task.is_special ? task.rewards_spe : "Standard Amount"}
          </p>

          {tab === "all" && (
            <button onClick={() => handleStart(task)}>Start Task</button>
          )}

          {tab === "process" && (
            <button onClick={() => openTaskCheck(task)}>Verify Task</button>
          )}

        </div>
      ))}

    </div>
  );
};
