import React, { useEffect, useState } from "react"
import { Layout } from "../components/Layout"
import { Store } from "../services/store"
import { X } from "lucide-react"

/* ---------------- TYPE ---------------- */

type Task = {
  id: string
  task_id: string
  task_name: string
  link: string
  is_special: boolean
  expectedzipfilename: string
  expectedinnerfilename: string
  amount?: number
  is_started: boolean
}

/* ---------------- COMPONENT ---------------- */

const AdminTasks: React.FC = () => {

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const [modal, setModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const [form, setForm] = useState({
    task_name: "",
    link: "",
    is_special: false,
    expectedzipfilename: "",
    expectedinnerfilename: "",
    amount: 0
  })

  /* ---------------- LOAD ---------------- */

  const loadTasks = async () => {
    setLoading(true)
    try {
      const t = await Store.getadminTasks()
      setTasks(t || [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTasks()
  }, [])

  /* ---------------- CREATE ---------------- */

  const openCreate = () => {
    setEditingTask(null)

    setForm({
      task_name: "",
      link: "",
      is_special: false,
      expectedzipfilename: "",
      expectedinnerfilename: "",
      amount: 0
    })

    setModal(true)
  }

  /* ---------------- EDIT ---------------- */

  const openEdit = (task: Task) => {

    setEditingTask(task)

    setForm({
      task_name: task.task_name || "",
      link: task.link || "",
      is_special: task.is_special || false,
      expectedzipfilename: task.expectedzipfilename+".zip" || "",
      expectedinnerfilename: task.expectedinnerfilename+".cxx" || "",
      amount: task.amount || 0
    })

    setModal(true)
  }

  /* ---------------- SAVE ---------------- */

  const saveTask = async (e: React.FormEvent) => {
    e.preventDefault()

    try {

      if (!form.task_name.trim()) {
        alert("Task name required")
        return
      }

      if (!form.link.trim()) {
        alert("Link required")
        return
      }

      if (!form.expectedzipfilename || !form.expectedinnerfilename) {
        alert("ZIP details required")
        return
      }

      if (form.is_special && form.amount <= 0) {
        alert("Amount required for special task")
        return
      }

      const payload: any = {
        task_name: form.task_name.trim(),
        link: form.link.trim(),
        is_special: form.is_special,
        expectedzipfilename: form.expectedzipfilename,
        expectedinnerfilename: form.expectedinnerfilename,
        is_started: false,
        started_by: "",
        started_at: null
      }

      if (form.is_special) {
        payload.amount = Number(form.amount)
      }

      if (editingTask) {
        await Store.updateTask(editingTask.id, payload)
      } else {
        await Store.createTask(payload)
      }

      setModal(false)
      setEditingTask(null)

      await loadTasks()

    } catch (err) {
      console.error(err)
      alert("Save failed")
    }
  }

  /* ---------------- DELETE ---------------- */

  const deleteTask = async (id: string) => {

    if (!window.confirm("Delete this task?")) return

    try {
      await Store.deleteTask(id)
      await loadTasks()
    } catch (e) {
      console.error(e)
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <Layout>

      <div className="flex justify-between items-center">
  <div>
    <h1 className="text-xl font-bold">Admin Tasks</h1>
    <div className="text-sm text-gray-500">
      Total Tasks: {tasks.length}
    </div>
  </div>

  <button
    onClick={openCreate}
    className="bg-blue-600 text-white px-4 py-2 rounded"
  >
    Create Task
  </button>

        {loading && <div>Loading...</div>}

        {!loading && tasks.map(t => (

          <div
            key={t.id}
            className="border bg-white p-3 rounded flex justify-between"
          >

            <div>
              <div className="font-bold">{t.task_name}</div>

              <div className="text-xs text-gray-500">
                {t.is_special ? "Special Task" : "Standard Task"}
              </div>

              <div className="text-xs text-blue-600 break-all">
                {t.link}
              </div>

              {t.is_special && (
                <div className="text-xs text-green-600">
                  Reward: ₹{t.amount}
                </div>
              )}
            </div>

            <div className="flex gap-2">

              <button
                onClick={() => openEdit(t)}
                className="bg-yellow-400 px-3 py-1 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => deleteTask(t.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

      {/* ---------------- MODAL ---------------- */}

      {modal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <form
            onSubmit={saveTask}
            className="bg-white p-5 rounded w-[95%] max-w-md space-y-3"
          >

            <div className="flex justify-between">
              <h3 className="font-bold">
                {editingTask ? "Edit Task" : "Create Task"}
              </h3>

              <button type="button" onClick={() => setModal(false)}>
                <X />
              </button>
            </div>

            <input
              placeholder="Task Name"
              value={form.task_name}
              onChange={e => setForm({ ...form, task_name: e.target.value })}
              className="border p-2 rounded w-full"
            />

            <input
              placeholder="Task Link"
              value={form.link}
              onChange={e => setForm({ ...form, link: e.target.value })}
              className="border p-2 rounded w-full"
            />

            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={form.is_special}
                onChange={e => setForm({ ...form, is_special: e.target.checked })}
              />
              Special Task
            </label>

            <input
              placeholder="ZIP File Name"
              value={form.expectedzipfilename}
              onChange={e => setForm({ ...form, expectedzipfilename: e.target.value })}
              className="border p-2 rounded w-full"
            />

            <input
              placeholder="Inner File Name"
              value={form.expectedinnerfilename}
              onChange={e => setForm({ ...form, expectedinnerfilename: e.target.value })}
              className="border p-2 rounded w-full"
            />

            {form.is_special && (
              <input
                type="number"
                placeholder="Special Reward Amount"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
                className="border p-2 rounded w-full"
              />
            )}

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              Save Task
            </button>

          </form>

        </div>

      )}

    </Layout>
  )
}

export default AdminTasks
