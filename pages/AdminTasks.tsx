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
      const t = await Store.getTasks()
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
      link: task.link || "",
      is_special: task.is_special || false,
      expectedzipfilename: task.expectedzipfilename || "",
      expectedinnerfilename: task.expectedinnerfilename || "",
      amount: task.amount || 0
    })

    setModal(true)
  }

  /* ---------------- SAVE ---------------- */

  const saveTask = async (e: React.FormEvent) => {
    e.preventDefault()

    try {

      if (!form.link.trim()) {
        alert("Link required")
        return
      }

      if (!form.expectedzipfilename.trim()) {
        alert("ZIP filename required")
        return
      }

      if (!form.expectedinnerfilename.trim()) {
        alert("Inner filename required")
        return
      }

      if (form.is_special && form.amount <= 0) {
        alert("Amount required for special task")
        return
      }

      const payload: any = {
        link: form.link.trim(),
        is_special: form.is_special,
        expectedzipfilename: form.expectedzipfilename.trim(),
        expectedinnerfilename: form.expectedinnerfilename.trim(),
        is_started: false,
        started_by: "",
        started_at: null
      }

      /* Special extra field */
      if (form.is_special) {
        payload.amount = Number(form.amount)
      }

      /* Create → generate name */
      if (!editingTask) {
        payload.task_name = Store.generateRandomTaskName()
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

      <div className="p-4 space-y-4">

        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Tasks</h1>

          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create Task
          </button>
        </div>

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
