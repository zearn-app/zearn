import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  method: string;
  status: "pending" | "approved" | "rejected";
}

interface User {
  id: string;
  name: string;
  email: string;
  coins: number;
  banned: boolean;
}

interface Task {
  id: string;
  title: string;
  reward: number;
  isSpecial: boolean;
  expectedZipName: string;
  password: string;
  expectedInnerFileName: string;
}

const AdminDashboard: React.FC = () => {

  const [section, setSection] = useState("withdrawals");

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawSearch, setWithdrawSearch] = useState("");
  const [withdrawFilter, setWithdrawFilter] = useState("all");

  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<string | null>(null);

  const [taskForm, setTaskForm] = useState<Task>({
    id: "",
    title: "",
    reward: 0,
    isSpecial: false,
    expectedZipName: "",
    password: "",
    expectedInnerFileName: ""
  });

  const [settings, setSettings] = useState({
    minWithdrawal: 100,
    dailyClaim: 5,
    jackpotEntry: 10,
    adminPassword: ""
  });

  const [jackpotWinner, setJackpotWinner] = useState("");

  useEffect(() => {

    setWithdrawals([
      { id: "w1", userId: "user01", amount: 200, method: "UPI", status: "pending" },
      { id: "w2", userId: "user02", amount: 400, method: "Bank", status: "pending" }
    ]);

    setUsers([
      { id: "user01", name: "John", email: "john@test.com", coins: 120, banned: false },
      { id: "user02", name: "Alex", email: "alex@test.com", coins: 300, banned: false }
    ]);

    setTasks([
      {
        id: "task001",
        title: "Download Proof File",
        reward: 10,
        isSpecial: false,
        expectedZipName: "taskproof.zip",
        password: "1234",
        expectedInnerFileName: "proof.txt"
      }
    ]);

  }, []);

  const approveWithdrawal = (id: string) => {

    setWithdrawals(withdrawals.map(w =>
      w.id === id ? { ...w, status: "approved" } : w
    ));

  };

  const rejectWithdrawal = (id: string) => {

    setWithdrawals(withdrawals.map(w =>
      w.id === id ? { ...w, status: "rejected" } : w
    ));

  };

  const banUser = (id: string) => {

    setUsers(users.map(u =>
      u.id === id ? { ...u, banned: true } : u
    ));

  };

  const addCoins = (id: string, coins: number) => {

    setUsers(users.map(u =>
      u.id === id ? { ...u, coins: u.coins + coins } : u
    ));

  };

  const createTask = () => {

    if (!taskForm.id) return;

    setTasks([...tasks, taskForm]);

    setTaskForm({
      id: "",
      title: "",
      reward: 0,
      isSpecial: false,
      expectedZipName: "",
      password: "",
      expectedInnerFileName: ""
    });

  };

  const deleteTask = (id: string) => {

    setTasks(tasks.filter(t => t.id !== id));

  };

  const startEditTask = (task: Task) => {

    setEditingTask(task.id);
    setTaskForm(task);

  };

  const saveTaskEdit = () => {

    setTasks(tasks.map(t =>
      t.id === editingTask ? taskForm : t
    ));

    setEditingTask(null);

  };

  const filteredWithdrawals = withdrawals.filter(w => {

    const matchSearch = w.userId.toLowerCase().includes(withdrawSearch.toLowerCase());
    const matchFilter = withdrawFilter === "all" || w.status === withdrawFilter;

    return matchSearch && matchFilter;

  });

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const selectJackpotWinner = () => {

    if (!jackpotWinner) return;

    alert("Jackpot Winner: " + jackpotWinner);

  };

  return (

    <Layout title="Admin Dashboard">

      <div className="p-4 space-y-4">

        <div className="flex gap-2 flex-wrap">

          <button onClick={() => setSection("withdrawals")}>Withdrawals</button>
          <button onClick={() => setSection("users")}>Users</button>
          <button onClick={() => setSection("tasks")}>Tasks</button>
          <button onClick={() => setSection("settings")}>Admin Settings</button>

        </div>

        {section === "withdrawals" && (

          <div>

            <h2 className="text-xl font-bold">Withdrawal Requests</h2>

            <input
              placeholder="Search User ID"
              value={withdrawSearch}
              onChange={(e) => setWithdrawSearch(e.target.value)}
            />

            <select
              value={withdrawFilter}
              onChange={(e) => setWithdrawFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {filteredWithdrawals.map(w => (

              <div key={w.id} className="border p-3 mt-2">

                <p>User: {w.userId}</p>
                <p>Amount: ₹{w.amount}</p>
                <p>Method: {w.method}</p>
                <p>Status: {w.status}</p>

                {w.status === "pending" && (

                  <div className="flex gap-2 mt-2">

                    <button onClick={() => approveWithdrawal(w.id)}>
                      Approve
                    </button>

                    <button onClick={() => rejectWithdrawal(w.id)}>
                      Reject
                    </button>

                  </div>

                )}

              </div>

            ))}

          </div>

        )}

        {section === "users" && (

          <div>

            <h2 className="text-xl font-bold">Users</h2>

            <input
              placeholder="Search user"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />

            {filteredUsers.map(u => (

              <div key={u.id} className="border p-3 mt-2">

                <p>Name: {u.name}</p>
                <p>Email: {u.email}</p>
                <p>Coins: {u.coins}</p>
                <p>Status: {u.banned ? "Banned" : "Active"}</p>

                <div className="flex gap-2 mt-2">

                  <button onClick={() => banUser(u.id)}>
                    Ban User
                  </button>

                  <button onClick={() => addCoins(u.id, 50)}>
                    Add 50 Coins
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

        {section === "tasks" && (

          <div>

            <h2 className="text-xl font-bold">Task Manager</h2>

            <div className="border p-3">

              <input
                placeholder="Task ID"
                value={taskForm.id}
                onChange={(e) => setTaskForm({ ...taskForm, id: e.target.value })}
              />

              <input
                placeholder="Title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />

              <input
                type="number"
                placeholder="Reward"
                value={taskForm.reward}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, reward: Number(e.target.value) })
                }
              />

              <input
                placeholder="Zip Name"
                value={taskForm.expectedZipName}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, expectedZipName: e.target.value })
                }
              />

              <input
                placeholder="Zip Password"
                value={taskForm.password}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, password: e.target.value })
                }
              />

              <input
                placeholder="Inner File Name"
                value={taskForm.expectedInnerFileName}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    expectedInnerFileName: e.target.value
                  })
                }
              />

              {editingTask ? (

                <button onClick={saveTaskEdit}>
                  Save Edit
                </button>

              ) : (

                <button onClick={createTask}>
                  Create Task
                </button>

              )}

            </div>

            {tasks.map(t => (

              <div key={t.id} className="border p-3 mt-2">

                <p>{t.title}</p>
                <p>Reward: {t.reward}</p>

                <div className="flex gap-2">

                  <button onClick={() => startEditTask(t)}>
                    Edit
                  </button>

                  <button onClick={() => deleteTask(t.id)}>
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

        {section === "settings" && (

          <div>

            <h2 className="text-xl font-bold">Admin Settings</h2>

            <input
              type="number"
              placeholder="Minimum Withdrawal"
              value={settings.minWithdrawal}
              onChange={(e) =>
                setSettings({ ...settings, minWithdrawal: Number(e.target.value) })
              }
            />

            <input
              type="number"
              placeholder="Daily Claim"
              value={settings.dailyClaim}
              onChange={(e) =>
                setSettings({ ...settings, dailyClaim: Number(e.target.value) })
              }
            />

            <input
              type="number"
              placeholder="Jackpot Entry"
              value={settings.jackpotEntry}
              onChange={(e) =>
                setSettings({ ...settings, jackpotEntry: Number(e.target.value) })
              }
            />

            <input
              type="password"
              placeholder="Update Admin Password"
              value={settings.adminPassword}
              onChange={(e) =>
                setSettings({ ...settings, adminPassword: e.target.value })
              }
            />

            <h3 className="mt-4 font-bold">Jackpot Winner Selector</h3>

            <input
              placeholder="Winner User ID"
              value={jackpotWinner}
              onChange={(e) => setJackpotWinner(e.target.value)}
            />

            <button onClick={selectJackpotWinner}>
              Select Winner
            </button>

          </div>

        )}

      </div>

    </Layout>

  );

};

export default AdminDashboard;
