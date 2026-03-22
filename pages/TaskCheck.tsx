import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import JSZip from "jszip";
import { Store, Task } from "../services/store";
import { getAuth } from "firebase/auth";

const TaskCheck = () => {

  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const uid = getAuth().currentUser?.uid;

  useEffect(() => {
    loadTask();
  }, []);

  const loadTask = async () => {
    const tasks = await Store.getTasks();
    const t = tasks.find(x => x.task_id === id);
    if (t) setTask(t);
  };

  const handleSubmit = async () => {
    if (!file || !task || !uid) return;

    // CHECK ZIP NAME
    if (file.name !== task.expectedzipfilename) {
      alert("Wrong ZIP name");
      return;
    }

    const zip = await JSZip.loadAsync(file);

    let found = false;

    Object.keys(zip.files).forEach(name => {
      if (name.includes(task.expectedinnerfilename)) {
        found = true;
      }
    });

    if (!found) {
      alert("Inner file not found");
      return;
    }

    // SUCCESS
    await Store.completeTask(task, uid);

    alert("Task Completed Successfully 🎉");
    window.location.href = "/";
  };

  return (
    <div>

      <h2>Task Check</h2>

      <input
        type="file"
        accept=".zip"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={handleSubmit}>Submit</button>

    </div>
  );
};

export default TaskCheck;
