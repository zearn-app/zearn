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
  const [loading, setLoading] = useState(false);

  //////////////////////////// LOAD TASK ////////////////////////////

  useEffect(() => {
    if (!taskId) return;
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      const data = await Store.getTask(taskId!);

      if (!data) {
        alert("Task not found");
        navigate(-1);
        return;
      }

      setTask(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load task");
    }
  };

  //////////////////////////// SUBMIT ////////////////////////////

  const handleSubmit = async () => {

    if (!file) return alert("Please upload a ZIP file");
    if (!task) return alert("Task not loaded yet");
    if (!user?.uid) return alert("User not found");

    // ✅ file type validation
    if (!file.name.toLowerCase().endsWith(".zip")) {
      return alert("Only .zip files are allowed");
    }

    try {
      setLoading(true);

      await Store.completeTask(task, user.uid, file);

      alert("Task completed successfully 🎉");
      navigate(-1);

    } catch (e: any) {
      console.error(e);
      alert(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  //////////////////////////// UI ////////////////////////////

  if (!user?.uid) {
    return (
      <div className="flex justify-center mt-10 text-gray-500">
        User not ready...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Task Check
        </h2>

        {/* Upload Box */}
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

            {/* ✅ Show selected file */}
            {file && (
              <p className="text-green-600 mt-2 text-sm">
                Selected: {file.name}
              </p>
            )}

          </label>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md disabled:opacity-50"
        >
          {loading ? "Processing..." : "Submit Task 🚀"}
        </button>

      </div>

    </div>
  );
};

export default TaskCheck;
