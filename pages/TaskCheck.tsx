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

  if (!user?.uid) return <div className="flex justify-center mt-10 text-gray-500">User not ready...</div>;

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Task Check
        </h2>

        {/* File Upload Box */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition">
          <input
            type="file"
            accept=".zip"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="fileUpload"
          />

          <label htmlFor="fileUpload" className="cursor-pointer">
            <p className="text-gray-600">
              {file ? file.name : "Click to upload ZIP file"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Only .zip files allowed
            </p>
          </label>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md"
        >
          Submit Task 🚀
        </button>

      </div>

    </div>
  );
};

export default TaskCheck;
