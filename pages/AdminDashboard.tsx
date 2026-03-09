import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Store } from "../services/store";
import {
  WithdrawalRequest,
  WithdrawalStatus,
  User,
  Task,
  AdminSettings
} from "../types";

import {
  Search,
  Ban,
  Check,
  X,
  Coins,
  Edit,
  Trash2,
  Plus,
  Eye,
  Settings,
  Trophy
} from "lucide-react";

const AdminDashboard: React.FC = () => {

  const [tab,setTab] = useState("withdrawals")

  const [withdrawals,setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [users,setUsers] = useState<User[]>([])
  const [tasks,setTasks] = useState<Task[]>([])
  const [settings,setSettings] = useState<AdminSettings | null>(null)

  const [search,setSearch] = useState("")
  const [statusFilter,setStatusFilter] = useState("ALL")

  const [selectedUser,setSelectedUser] = useState<User | null>(null)
  const [selectedWithdrawal,setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null)

  const [taskModal,setTaskModal] = useState(false)
  const [editingTask,setEditingTask] = useState<Task | null>(null)

  const [newTask,setNewTask] = useState<any>({
    id:"",
    title:"",
    reward:0,
    isSpecial:false,
    expectedZipName:"",
    password:"",
    expectedInnerFileName:""
  })

  useEffect(()=>{
    loadData()
  },[])

  const loadData = async()=>{
    const w = await Store.getWithdrawals()
    const u = await Store.getAllUsers()
    const t = await Store.getAllTasks()
    const s = await Store.getSettings()

    setWithdrawals(w)
    setUsers(u)
    setTasks(t)
    setSettings(s)
  }

  // -------------------------
  // Withdrawals
  // -------------------------

  const approveWithdrawal = async(id:string)=>{
    await Store.adminUpdateWithdrawal(id,WithdrawalStatus.COMPLETED)
    loadData()
  }

  const rejectWithdrawal = async(id:string)=>{
    await Store.adminUpdateWithdrawal(id,WithdrawalStatus.REJECTED)
    loadData()
  }

  const filteredWithdrawals = withdrawals.filter(w=>{

    const user = users.find(u=>u.uid === w.uid)

    const matchSearch =
      user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      user?.email?.toLowerCase().includes(search.toLowerCase())

    const matchStatus =
      statusFilter==="ALL" || w.status === statusFilter

    return matchSearch && matchStatus

  })

  // -------------------------
  // Users
  // -------------------------

  const banUser = async(user:User)=>{
    await Store.toggleUserBan(user.uid,user.isBanned)
    loadData()
  }

  const addCoins = async(uid:string)=>{
    const amount = prompt("Enter coins to add")

    if(!amount) return

    await Store.adminAddCoins(uid,Number(amount))
    loadData()
  }

  const filteredUsers = users.filter(u=>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  // -------------------------
  // Tasks
  // -------------------------

  const saveTask = async()=>{

    if(editingTask){
      await Store.updateTask(editingTask.id,newTask)
    }else{
      await Store.createTask(newTask)
    }

    setTaskModal(false)
    setEditingTask(null)
    loadData()
  }

  const deleteTask = async(id:string)=>{
    if(!window.confirm("Delete task?")) return

    await Store.deleteTask(id)
    loadData()
  }

  // -------------------------
  // Jackpot
  // -------------------------

  const selectJackpotWinner = ()=>{

    const eligible = users.filter(u=>u.balance > (settings?.randomWinnerEntryFee || 0))

    const winner = eligible[Math.floor(Math.random()*eligible.length)]

    alert("Winner: "+winner.name)
  }

  // -------------------------
  // UI
  // -------------------------

  return(
  <Layout>

  <div className="flex gap-2 mb-6">

    {["withdrawals","users","tasks","settings","jackpot"].map(t=>(
      <button
      key={t}
      onClick={()=>setTab(t)}
      className={`px-4 py-2 rounded-lg font-bold
      ${tab===t?"bg-black text-white":"bg-gray-100"}`}
      >
      {t}
      </button>
    ))}

  </div>

  {/* ---------------- Withdrawals ---------------- */}

  {tab==="withdrawals" && (

  <div>

  <div className="flex gap-2 mb-4">

    <input
    placeholder="Search user"
    value={search}
    onChange={(e)=>setSearch(e.target.value)}
    className="border p-2 rounded-lg flex-1"
    />

    <select
    value={statusFilter}
    onChange={(e)=>setStatusFilter(e.target.value)}
    className="border p-2 rounded-lg"
    >
      <option value="ALL">All</option>
      <option value="PENDING">Pending</option>
      <option value="COMPLETED">Completed</option>
      <option value="REJECTED">Rejected</option>
    </select>

  </div>

  {filteredWithdrawals.map(w=>{

    const user = users.find(u=>u.uid===w.uid)

    return(

    <div
    key={w.id}
    className="bg-white border p-4 rounded-xl mb-2"
    >

    <div className="flex justify-between">

      <div>
        <div className="font-bold">{user?.name}</div>
        <div className="text-xs">{user?.email}</div>
      </div>

      <div className="font-bold">
        ₹{w.amount}
      </div>

    </div>

    <div className="text-xs mt-2 break-all">
      {w.details}
    </div>

    <div className="flex gap-2 mt-3">

      <button
      onClick={()=>approveWithdrawal(w.id)}
      className="bg-green-600 text-white px-3 py-1 rounded"
      >
      Approve
      </button>

      <button
      onClick={()=>rejectWithdrawal(w.id)}
      className="bg-red-600 text-white px-3 py-1 rounded"
      >
      Reject
      </button>

      <button
      onClick={()=>setSelectedWithdrawal(w)}
      className="bg-gray-200 px-3 py-1 rounded"
      >
      View
      </button>

    </div>

    </div>

    )

  })}

  </div>

  )}

  {/* ---------------- Users ---------------- */}

  {tab==="users" && (

  <div>

  <input
  placeholder="Search user"
  value={search}
  onChange={(e)=>setSearch(e.target.value)}
  className="border p-2 rounded-lg mb-4 w-full"
  />

  {filteredUsers.map(u=>(

  <div
  key={u.uid}
  className="bg-white border p-4 rounded-xl mb-2 flex justify-between"
  >

  <div>

  <div className="font-bold">{u.name}</div>
  <div className="text-xs">{u.email}</div>
  <div className="text-xs">
  Coins: {u.balance}
  </div>

  </div>

  <div className="flex gap-2">

  <button
  onClick={()=>addCoins(u.uid)}
  className="bg-yellow-500 text-white px-3 py-1 rounded"
  >
  Add Coins
  </button>

  <button
  onClick={()=>banUser(u)}
  className="bg-red-500 text-white px-3 py-1 rounded"
  >
  {u.isBanned?"Unban":"Ban"}
  </button>

  <button
  onClick={()=>setSelectedUser(u)}
  className="bg-gray-200 px-3 py-1 rounded"
  >
  View
  </button>

  </div>

  </div>

  ))}

  </div>

  )}

  {/* ---------------- Tasks ---------------- */}

  {tab==="tasks" && (

  <div>

  <button
  onClick={()=>setTaskModal(true)}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4"
  >
  Create Task
  </button>

  {tasks.map(t=>(

  <div
  key={t.id}
  className="bg-white border p-4 rounded-xl mb-2 flex justify-between"
  >

  <div>

  <div className="font-bold">{t.title}</div>
  <div className="text-xs">
  Reward: {t.reward}
  </div>

  </div>

  <div className="flex gap-2">

  <button
  onClick={()=>{
    setEditingTask(t)
    setNewTask(t)
    setTaskModal(true)
  }}
  className="bg-yellow-400 px-3 py-1 rounded"
  >
  Edit
  </button>

  <button
  onClick={()=>deleteTask(t.id)}
  className="bg-red-500 text-white px-3 py-1 rounded"
  >
  Delete
  </button>

  </div>

  </div>

  ))}

  </div>

  )}

  {/* ---------------- Settings ---------------- */}

  {tab==="settings" && settings && (

  <div className="space-y-4">

  <div>
  <label>Minimum Withdrawal</label>
  <input
  type="number"
  value={settings.minWithdrawal}
  className="border p-2 rounded w-full"
  />
  </div>

  <div>
  <label>Daily Claim Amount</label>
  <input
  type="number"
  value={settings.dailyClaimLimit}
  className="border p-2 rounded w-full"
  />
  </div>

  <div>
  <label>Admin Password</label>
  <input
  type="text"
  value={settings.adminPassword}
  className="border p-2 rounded w-full"
  />
  </div>

  <div>
  <label>Jackpot Entry Amount</label>
  <input
  type="number"
  value={settings.randomWinnerEntryFee}
  className="border p-2 rounded w-full"
  />
  </div>

  <button className="bg-black text-white px-4 py-2 rounded">
  Save Settings
  </button>

  </div>

  )}

  {/* ---------------- Jackpot ---------------- */}

  {tab==="jackpot" && (

  <div className="text-center">

  <button
  onClick={selectJackpotWinner}
  className="bg-purple-600 text-white px-6 py-3 rounded-xl text-lg"
  >
  Select Jackpot Winner
  </button>

  </div>

  )}

  </Layout>
  )

}

export default AdminDashboard
