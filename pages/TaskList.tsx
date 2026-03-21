import React, { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Layout } from "../components/Layout"
import { Store, Task } from "../services/store"
import { getAuth } from "firebase/auth"

const TaskList = () => {

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | "process" | "completed">("all")

  const navigate = useNavigate()
  const auth = getAuth()
  const uid = auth.currentUser?.uid || ""

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const data = await Store.getTasks()
    setTasks(data)
    setLoading(false)
  }

  const filteredTasks = useMemo(() => {

    if (activeTab === "all") {
      return tasks.filter(t => !t.is_started)
    }

    if (activeTab === "process") {
      return tasks.filter(t => t.is_started && t.started_by === uid)
    }

    return [] // completed handled from history page

  }, [tasks, activeTab])

 const handleStartTask = async (task: Task) => {

  if (!task.link) {
    alert("Link is empty")
    return
  }

  try {

    await Store.startTask(task, uid)

    window.location.href = task.link

  } catch (e) {
    console.error(e)
    alert("Failed to start task")
  }
 }
  return (
    <Layout title="Tasks">

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">

        {["all", "process", "completed"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold ${
              activeTab === tab ? "bg-white shadow" : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}

      </div>

      {/* Loading */}
      {loading && <div className="text-center">Loading...</div>}

      {/* Tasks */}
      <div className="space-y-4">

        {filteredTasks.map(task => (

          <div
            key={task.id}
            onClick={() => {
              if (activeTab === "all") handleStartTask(task)
              if (activeTab === "process") navigate(`/task-check/${task.id}`)
            }}
            className="bg-white p-4 rounded-xl shadow cursor-pointer"
          >

            <h3 className="font-bold">{task.task_name}</h3>

          </div>

        ))}

      </div>

    </Layout>
  )
}

export default TaskList
