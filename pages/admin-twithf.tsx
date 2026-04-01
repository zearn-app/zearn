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
  const [editedLinks, setEditedLinks] = useState<{ [key: string]: string }>({});
  const [moving, setMoving] = useState(false);

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

  const handleLinkChange = (id: string, value: string) => {
    setEditedLinks((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const updateTask = async (id: string) => {
    const newLink = editedLinks[id];
    if (!newLink) return alert("Enter link first ❌");

    await Store.updateInCollection("Incomplete task", id, {
      link: newLink
    });

    alert("Updated ✅");

    setEditedLinks((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    loadTasks();
  };

  // 🔥 MOVE COMPLETED TASKS (SAFE MOVE)
  const moveCompletedTasks = async () => {
    setMoving(true);

    try {
      const completed = tasks.filter((t) => t.link && t.link.trim() !== "");

      if (completed.length === 0) {
        alert("No completed tasks ❌");
        setMoving(false);
        return;
      }

      for (let task of completed) {
        const { id, ...taskData } = task; // ✅ remove old id

        // ✅ Add to "tasks"
        await Store.addToCollection("tasks", taskData);

        // ✅ Remove from "Incomplete task" (only reference removal)
        await Store.deleteFromCollection("Incomplete task", id!);
      }

      alert(`${completed.length} tasks moved 🚀`);
      loadTasks();
    } catch (err) {
      console.error(err);
      alert("Move failed ❌");
    }

    setMoving(false);
  };

  const downloadTask = async (task: Task) => {
    const zip = new JSZip();
    zip.file(task.expectedinnerfilename, "This is your task file");

    const blob = await zip.generateAsync({ type: "blob" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = task.expectedzipfilename;
    a.click();
  };

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

      <div style={{ marginBottom: 15 }}>
        <button onClick={selectAll}>
          {selected.length === tasks.length ? "Unselect All" : "Select All"}
        </button>

        <button onClick={downloadSelected} style={{ marginLeft: 10 }}>
          ⬇ Download Selected
        </button>

        <button
          onClick={moveCompletedTasks}
          disabled={moving}
          style={{ marginLeft: 10, background: "#4CAF50", color: "#fff" }}
        >
          {moving ? "Moving..." : "Move Completed"}
        </button>
      </div>

      {tasks.length === 0 && <p>No incomplete tasks</p>}

      {tasks.map((task) => (
        <div
          key={task.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 15,
            marginBottom: 10
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

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <input
              value={editedLinks[task.id!] ?? task.link}
              placeholder="Enter link"
              onChange={(e) =>
                handleLinkChange(task.id!, e.target.value)
              }
              style={{ flex: 1, padding: 6 }}
            />

            <button onClick={() => updateTask(task.id!)}>
              Update
            </button>
          </div>

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
