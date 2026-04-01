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
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await Store.getCollection("Incomplete task");
      setTasks(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load tasks ❌");
    }
  };

  const randomString = (length: number) => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  };

  const exists = (value: string, tempTasks: Task[]) => {
    return [...tasks, ...tempTasks].some(
      (t) =>
        t.expectedzipfilename === value ||
        t.expectedinnerfilename === value
    );
  };

  const createTasks = async () => {
    if (count <= 0) return alert("Invalid number ❌");

    setLoading(true);

    try {
      let tempTasks: Task[] = [];

      for (let i = 0; i < count; i++) {
        let zipName = "";
        let txtName = "";

        do {
          zipName = randomString(8) + ".zip";
        } while (exists(zipName, tempTasks));

        do {
          txtName = randomString(6) + ".txt";
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
        await Store.addToCollection("Incomplete task", newTask);
      }

      alert(`${count} tasks created 🚀`);
      loadTasks();
    } catch (err) {
      console.error(err);
      alert("Error creating tasks ❌");
    }

    setLoading(false);
  };

  const updateTask = async (id: string, field: string, value: any) => {
    await Store.updateInCollection("Incomplete task", id, {
      [field]: value
    });
    loadTasks();
  };

  // 🔥 SINGLE DOWNLOAD
  const downloadTask = async (task: Task) => {
    const zip = new JSZip();
    zip.file(task.expectedinnerfilename, "This is your task file");

    const blob = await zip.generateAsync({ type: "blob" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = task.expectedzipfilename;
    a.click();
  };

  // 🔥 MULTI DOWNLOAD (MAIN FEATURE)
  const downloadSelected = async () => {
    if (selected.length === 0) {
      alert("Select at least one task ❌");
      return;
    }

    const zip = new JSZip();

    selected.forEach((id) => {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        zip.file(
          task.expectedzipfilename,
          `Inner file: ${task.expectedinnerfilename}`
        );
      }
    });

    const blob = await zip.generateAsync({ type: "blob" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "all_tasks.zip";
    a.click();
  };

  // 🔥 SELECT TOGGLE
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === tasks.length) {
      setSelected([]);
    } else {
      setSelected(tasks.map((t) => t.id!));
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
      <h2 style={{ textAlign: "center" }}>📋 Incomplete Task Manager</h2>

      {/* CREATE */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          style={{ flex: 1, padding: 8 }}
        />

        <button onClick={createTasks} disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
      </div>

      {/* ACTIONS */}
      <div style={{ marginBottom: 15 }}>
        <button onClick={selectAll}>
          {selected.length === tasks.length ? "Unselect All" : "Select All"}
        </button>

        <button
          onClick={downloadSelected}
          style={{ marginLeft: 10 }}
        >
          ⬇ Download Selected
        </button>
      </div>

      {/* LIST */}
      {tasks.length === 0 && <p>No incomplete tasks</p>}

      {tasks.map((task) => (
        <div
          key={task.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 15,
            marginBottom: 10,
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={selected.includes(task.id!)}
              onChange={() => toggleSelect(task.id!)}
            />

            <h4 style={{ marginLeft: 10 }}>{task.task_name}</h4>
          </div>

          <input
            value={task.link}
            placeholder="Enter link"
            onChange={(e) =>
              updateTask(task.id!, "link", e.target.value)
            }
            style={{ width: "100%", marginTop: 8, padding: 6 }}
          />

          <p>📦 ZIP: {task.expectedzipfilename}</p>
          <p>📄 TXT: {task.expectedinnerfilename}</p>

          <button onClick={() => downloadTask(task)}>
            Download Single
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminTasks;
