import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import JSZip from "jszip";
import { Store } from "../services/store";
import { UserContext } from "../App";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export const TaskCheck: React.FC = () => {

  const { id } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [task, setTask] = useState<any>(null);

  useEffect(() => {
    loadTask();
  }, []);

  const loadTask = async () => {
    const snap = await getDoc(doc(db, "tasks", id!));
    if (snap.exists()) setTask(snap.data());
  };

  const handleFile = async (file: File) => {

    // ✅ Check ZIP Name
    if (file.name !== task.expectedzipfilename) {
      alert("Wrong ZIP filename");
      return;
    }

    const zip = await JSZip.loadAsync(file);

    const files = Object.keys(zip.files);

    // ✅ Check Inner File
    if (!files.includes(task.expectedinnerfilename)) {
      alert("Inner file not found");
      return;
    }

    // ✅ Success → Reward
    await Store.completeTask(user.uid, task, task.is_special);

    alert("Task Completed Successfully!");
    navigate("/tasks");
  };

  return (
    <div>

      <h3>Task Verification</h3>

      {task && (
        <>
          <p>{task.task_name}</p>

          <input
            type="file"
            accept=".zip"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
        </>
      )}

    </div>
  );
};
