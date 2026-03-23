import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Store } from "../services/store";
import { UserContext } from "../App";

const TaskCheck: React.FC = () => {

  const { taskId } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [task, setTask] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!taskId) return;

    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    const data = await Store.getTask(taskId!);
    setTask(data);
  };

  if (!user?.uid) return <div>User not ready...</div>;

  const handleSubmit = async () => {
    if (!file) return alert("Upload file");

    try {
      await Store.completeTask(task, user.uid, file);
      alert("Task Success 🎉");
      navigate(-1);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="p-4">

      <h2>Task Check</h2>

      <input
        type="file"
        accept=".zip"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={handleSubmit}>
        Submit
      </button>

    </div>
  );
};

export default TaskCheck;
