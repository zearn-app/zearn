import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Layout } from "../components/Layout"
import { Store, Task, TaskStatus } from "../services/store"

const TaskCheck = () => {

  const { id } = useParams()
  const [task, setTask] = useState<Task | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.NONE)
  const [loading, setLoading] = useState(true)

  const uid = "USER_ID"

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const tasks = await Store.getTasks()
    const t = tasks.find(x => x.id === id)
    setTask(t || null)
    setLoading(false)
  }

  const handleCheck = async () => {

    if (!file || !task) return

    setStatus(TaskStatus.PROCESS)

    const result = await Store.verifyTask(file, task, uid)

    setStatus(result)
  }

  if (loading) {
    return <Layout>Loading...</Layout>
  }

  if (!task) {
    return <Layout>Task not found</Layout>
  }

  return (
    <Layout>

      <div className="text-center mb-6">
        <h2 className="font-bold">
          {task.is_special ? "Upload APK" : "Upload ZIP"}
        </h2>
      </div>

      {/* Upload */}
      <input
        type="file"
        accept={task.is_special ? ".apk" : ".zip"}
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      {/* Button */}
      <button
        onClick={handleCheck}
        className="w-full mt-4 bg-blue-600 text-white p-3 rounded"
      >
        Verify
      </button>

      {/* Status */}
      {status === TaskStatus.COMPLETED && (
        <div className="text-green-600 mt-4">Success ✅</div>
      )}

      {status === TaskStatus.FAILED && (
        <div className="text-red-600 mt-4">Failed ❌</div>
      )}

    </Layout>
  )
}

export default TaskCheck
