import React, { useEffect, useState } from "react";
import { Store, Task } from "../services/store";
import { getAuth } from "firebase/auth";

const TaskPage = () => {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tab, setTab] = useState("all");

  const uid = getAuth().currentUser?.uid;

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await Store.getTasks();
    setTasks(data);
  };

  const startTask = async (task: Task) => {
    if (!uid) return alert("User not ready yet");

    await Store.startTask(task, uid);
    window.open(task.link, "_blank");

    loadTasks();
  };

  // FILTERS
  const allTasks = tasks.filter(t => !t.is_started);
  const inProcess = tasks.filter(t => t.is_started && t.started_by === uid);

  return (
    <div>

      <h2>Tasks</h2>

      <button onClick={() => setTab("all")}>All Tasks</button>
      <button onClick={() => setTab("process")}>In Process</button>

      {tab === "all" && (
        <div>
          {allTasks.map(task => (
            <div key={task.task_id} onClick={() => startTask(task)}>
              <h4>{task.task_name}</h4>
              <p>
                Reward: {task.is_special ? task.reward_spe : "Standard"}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === "process" && (
        <div>
          {inProcess.map(task => (
            <div
              key={task.task_id}
              onClick={() =>
                window.location.href = `/taskcheck/${task.task_id}`
              }
            >
              <h4>{task.task_name}</h4>
              <p>Click to submit</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default TaskPage;
