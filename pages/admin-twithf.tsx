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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  // ✅ LOAD TASKS
  const loadTasks = async () => {
    try {
      const data = await Store.getCollection("Incomplete task");
      setTasks(data || []);
    } catch (err) {
      console.error("Load error:", err);
      alert("Failed to load tasks ❌");
    }
  };

  // ✅ RANDOM STRING
  const randomString = (length: number) => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let res = "";
    for (let i = 0; i < length; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
    }
    return res;
  };

  // ✅ CHECK DUPLICATE (INCLUDING NEW ONES)
  const exists = (value: string, tempTasks: Task[]) => {
    return [...tasks, ...tempTasks].some(
      (t) =>
        t.expectedzipfilename === value ||
        t.expectedinnerfilename === value
    );
  };

  // ✅ CREATE TASKS (FIXED)
  const createTasks = async () => {
    if (count <= 0) {
      alert("Invalid number ❌");
      return;
    }

    setLoading(true);

    try {
      let tempTasks: Task[] = [];

      for (let i = 0; i < count; i++) {
        let zipName = "";
        let txtName = "";

        let attempts = 0;

        // prevent infinite loop
        do {
          zipName = randomString(8) + ".zip";
          attempts++;
          if (attempts > 20) break;
        } while (exists(zipName, tempTasks));

        attempts = 0;

        do {
          txtName = randomString(6) + ".txt";
          attempts++;
          if (attempts > 20) break;
        } while (exists(txtName, tempTasks));

        const newTask: Task = {
          task_id: crypto.randomUUID(),
          task_name: "ztask_" + randomString(8),
          expectedzipfilename: zipName,
          expectedinnerfilename: txtName,
          link: "",
          is_started: false,
          started_by: ""
        };

        tempTasks.push(newTask);

        // 🔥 SAVE TO FIREBASE
        await Store.addToCollection("Incomplete task", newTask);
      }

      alert(`${count} tasks created 🚀`);
      await loadTasks();
    } catch (err) {
      console.error(err);
      alert("Error creating tasks ❌");
    }

    setLoading(false);
  };

  // ✅ UPDATE TASK
  const updateTask = async (id: string, field: string, value: any) => {
    try {
      await Store.updateInCollection("Incomplete task", id, {
        [field]: value
      });
      loadTasks();
    } catch (err) {
      console.error(err);
      alert("Update failed ❌");
    }
  };

  // ✅ DOWNLOAD ZIP
  const downloadTask = async (task: Task) => {
    try {
      const zip = new JSZip();

      zip.file(task.expectedinnerfilename, "This is your task file");

      const blob = await zip.generateAsync({ type: "blob" });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = task.expectedzipfilename;
      a.click();
    } catch (err) {
      console.error(err);
      alert("Download failed ❌");
    }
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
          style={{ padding: 5, marginRight: 10 }}
        />

        <button
          onClick={createTasks}
          disabled={loading}
          style={{
            padding: "6px 12px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Creating..." : "Create Tasks"}
        </button>
      </div>

      {/* LIST */}
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
            style={{ marginBottom: 5 }}
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