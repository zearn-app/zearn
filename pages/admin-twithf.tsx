import React, { useEffect, useState } from "react";
import { Store } from "../services/store";
import JSZip from "jszip";

interface Task {
  id?: string;
  task_id: string;
  task_name: string;
  expectedzipfilename: string;
  expectedinnerfilename: string;
  link: string;
  is_started: boolean;
  started_by: string;
}

const AdminTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [count, setCount] = useState(1);

  useEffect(() => {
    loadTasks();
  }, []);

  // 🔥 LOAD ONLY "Incomplete task"
  const loadTasks = async () => {
    const data = await Store.getCollection("Incomplete task"); // ✅ FIX
    setTasks(data);
  };

  // 🔥 RANDOM STRING
  const randomString = (length: number) => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let res = "";
    for (let i = 0; i < length; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
    }
    return res;
  };

  // 🔥 CHECK DUPLICATE
  const exists = (value: string) => {
    return tasks.some(
      (t) =>
        t.expectedzipfilename === value ||
        t.expectedinnerfilename === value
    );
  };

  // 🔥 CREATE TASKS INTO "Incomplete task"
  const createTasks = async () => {
    if (count <= 0) {
      alert("Invalid number ❌");
      return;
    }

    for (let i = 0; i < count; i++) {
      let zipName = "";
      let txtName = "";

      do {
        zipName = randomString(8) + ".zip";
      } while (exists(zipName));

      do {
        txtName = randomString(6) + ".txt";
      } while (exists(txtName));

      const newTask: Task = {
        task_id: crypto.randomUUID(),
        task_name: "ztask_" + randomString(8),
        expectedzipfilename: zipName,
        expectedinnerfilename: txtName,
        link: "",
        is_started: false,
        started_by: ""
      };

      // ✅ SAVE INTO "Incomplete task"
      await Store.addToCollection("Incomplete task", newTask);
    }

    alert(`${count} tasks created 🚀`);
    loadTasks();
  };

  // 🔥 UPDATE TASK
  const updateTask = async (id: string, field: string, value: any) => {
    await Store.updateInCollection("Incomplete task", id, {
      [field]: value
    });
    loadTasks();
  };

  // 🔥 DOWNLOAD ZIP
  const downloadTask = async (task: Task) => {
    const zip = new JSZip();

    zip.file(task.expectedinnerfilename, "This is your task file");

    const blob = await zip.generateAsync({ type: "blob" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = task.expectedzipfilename;
    a.click();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Incomplete Task Manager 🚀</h2>

      {/* CREATE */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        />
        <button onClick={createTasks}>Create Tasks</button>
      </div>

      {/* LIST ONLY INCOMPLETE */}
      {tasks.length === 0 && <p>No incomplete tasks</p>}

      {tasks.map((task) => (
        <div
          key={task.id}
          style={{
            border: "1px solid #ccc",
            marginBottom: 10,
            padding: 10
          }}
        >
          <p><b>Task Name:</b> {task.task_name}</p>

          <input
            value={task.link}
            placeholder="Enter link"
            onChange={(e) =>
              updateTask(task.id!, "link", e.target.value)
            }
          />

          <p>ZIP: {task.expectedzipfilename}</p>
          <p>TXT: {task.expectedinnerfilename}</p>

          <button onClick={() => downloadTask(task)}>
            Download ZIP
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminTasks;