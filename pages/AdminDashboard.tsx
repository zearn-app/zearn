import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Store } from "../services/store";
import {
User,
Task,
WithdrawalRequest,
WithdrawalStatus,
AdminSettings
} from "../types";

import { X } from "lucide-react";

import {
Bar,
Line,
Pie
} from "react-chartjs-2";

import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
PointElement,
LineElement,
ArcElement,
Tooltip,
Legend
} from "chart.js";

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
PointElement,
LineElement,
ArcElement,
Tooltip,
Legend
);

const AdminDashboard: React.FC = () => {

const [tab,setTab] = useState("withdrawals")

const [withdrawals,setWithdrawals] = useState<WithdrawalRequest[]>([])
const [users,setUsers] = useState<User[]>([])
const [tasks,setTasks] = useState<Task[]>([])
const [settings,setSettings] = useState<AdminSettings | null>(null)

const [search,setSearch] = useState("")
const [filter,setFilter] = useState("ALL")

const [coinFilter,setCoinFilter] = useState("")
const [rankFilter,setRankFilter] = useState("")
const [placeFilter,setPlaceFilter] = useState("")

const [selectedUser,setSelectedUser] = useState<User|null>(null)
const [selectedWithdrawal,setSelectedWithdrawal] = useState<WithdrawalRequest|null>(null)

const [taskModal,setTaskModal] = useState(false)
const [editingTask,setEditingTask] = useState<Task|null>(null)

const [logs,setLogs] = useState<string[]>([])
const [jackpotHistory,setJackpotHistory] = useState<any[]>([])

const [taskForm,setTaskForm] = useState<any>({
id:"",
title:"",
reward:0,
isSpecial:false,
expectedZipName:"",
password:"",
expectedInnerFileName:""
})

useEffect(()=>{
loadAll()
},[])

const loadAll = async()=>{

const w = await Store.getWithdrawals()
const u = await Store.getAllUsers()
const t = await Store.getAllTasks()
const s = await Store.getSettings()
const j = await Store.getJackpotHistory()

setWithdrawals(w)
setUsers(u)
setTasks(t)
setSettings(s)
setJackpotHistory(j)

}

//////////////////////////////
// LOG SYSTEM
//////////////////////////////

const logAction=(text:string)=>{

const newLogs=[`${new Date().toLocaleString()} - ${text}`,...logs]

setLogs(newLogs.slice(0,100))

}

//////////////////////////////
// Withdrawals
//////////////////////////////

const approveWithdrawal = async(id:string)=>{

await Store.adminUpdateWithdrawal(id,WithdrawalStatus.COMPLETED)

logAction("Withdrawal approved "+id)

loadAll()

}

const rejectWithdrawal = async(id:string)=>{

await Store.adminUpdateWithdrawal(id,WithdrawalStatus.REJECTED)

logAction("Withdrawal rejected "+id)

loadAll()

}

const filteredWithdrawals = withdrawals.filter(w=>{

const user = users.find(u=>u.uid===w.uid)

const matchSearch =
user?.name?.toLowerCase().includes(search.toLowerCase()) ||
user?.email?.toLowerCase().includes(search.toLowerCase())

const matchFilter =
filter==="ALL" || w.status===filter

return matchSearch && matchFilter

})

//////////////////////////////
// Users
//////////////////////////////

const banUser = async(user:User)=>{

await Store.toggleUserBan(user.uid,user.isBanned)

logAction("User ban toggle "+user.name)

loadAll()

}

const addCoins = async(uid:string)=>{

const amount = prompt("Enter coins")

if(!amount) return

await Store.adminAddCoins(uid,Number(amount))

logAction("Coins added "+amount+" to "+uid)

loadAll()

}

const filteredUsers = users.filter(u=>{

const matchSearch =
u.name.toLowerCase().includes(search.toLowerCase())

const matchCoins =
!coinFilter || u.balance >= Number(coinFilter)

const matchRank =
!rankFilter || u.rank === rankFilter

const matchPlace =
!placeFilter || u.place === placeFilter

return matchSearch && matchCoins && matchRank && matchPlace

})

//////////////////////////////
// TASKS
//////////////////////////////

const openCreateTask=()=>{
setEditingTask(null)

setTaskForm({
id:"",
title:"",
reward:0,
isSpecial:false,
expectedZipName:"",
password:"",
expectedInnerFileName:""
})

setTaskModal(true)

}

const openEditTask=(task:Task)=>{

setEditingTask(task)

setTaskForm(task)

setTaskModal(true)

}

const saveTask=async()=>{

if(!taskForm.title) return alert("Title required")

if(editingTask){

await Store.updateTask(editingTask.id,taskForm)

logAction("Task updated "+editingTask.title)

}else{

await Store.createTask(taskForm)

logAction("Task created "+taskForm.title)

}

setTaskModal(false)

loadAll()

}

const deleteTask=async(id:string)=>{

if(!window.confirm("Delete task?")) return

await Store.deleteTask(id)

logAction("Task deleted "+id)

loadAll()

}

//////////////////////////////
// SETTINGS
//////////////////////////////

const updateSetting=(key:string,value:any)=>{

if(!settings) return

setSettings({
...settings,
[key]:value
})

}

const saveSettings=async()=>{

if(!settings) return

await Store.updateSettings(settings)

logAction("Settings updated")

alert("Settings Updated")

}

//////////////////////////////
// JACKPOT
//////////////////////////////

const selectJackpotWinner=async()=>{

const monthKey = new Date().getMonth()

const lastWinner = await Store.getJackpotWinner(monthKey)

if(lastWinner){

alert("Already selected")

return

}

const eligible = users.filter(u=>!u.isBanned)

const winner = eligible[Math.floor(Math.random()*eligible.length)]

await Store.saveJackpotWinner(monthKey,winner.uid)

logAction("Jackpot winner "+winner.name)

alert("Winner "+winner.name)

loadAll()

}

//////////////////////////////
// ANALYTICS
//////////////////////////////

const withdrawalChart={

labels:["Pending","Completed","Rejected"],

datasets:[{

label:"Withdrawals",

data:[
withdrawals.filter(w=>w.status==="PENDING").length,
withdrawals.filter(w=>w.status==="COMPLETED").length,
withdrawals.filter(w=>w.status==="REJECTED").length
]

}]

}

const userGrowthChart={

labels:users.map(u=>u.createdAt?.slice(0,10) || ""),

datasets:[{

label:"Users",

data:users.map((_,i)=>i+1)

}]

}

const taskChart={

labels:tasks.map(t=>t.title),

datasets:[{

label:"Task rewards",

data:tasks.map(t=>t.reward)

}]

}

//////////////////////////////////////////////////

return(

<Layout>

<div className="grid grid-cols-5 gap-2 mb-4">

{["withdrawals","users","tasks","settings","jackpot"].map(t=>(

<button
key={t}
onClick={()=>setTab(t)}
className={`p-2 rounded font-bold ${tab===t?"bg-black text-white":"bg-gray-200"}`}
>
{t}
</button>

))}

</div>

{/* WITHDRAWAL TAB */}

{tab==="withdrawals" &&(

<div className="space-y-4">

<div className="bg-white p-4 rounded shadow">

<h2 className="font-bold mb-2">Withdrawal Analytics</h2>

<Pie data={withdrawalChart}/>

</div>

<input
placeholder="Search"
value={search}
onChange={e=>setSearch(e.target.value)}
className="border p-2 rounded w-full"
/>

{filteredWithdrawals.map(w=>{

const user=users.find(u=>u.uid===w.uid)

return(

<div key={w.id} className="bg-white p-3 rounded shadow flex justify-between">

<div>

<b>{user?.name}</b>

<div className="text-xs">{user?.email}</div>

<div>₹{w.amount}</div>

</div>

<div className="flex gap-2">

<button onClick={()=>approveWithdrawal(w.id)} className="bg-green-600 text-white px-2 rounded">
Approve
</button>

<button onClick={()=>rejectWithdrawal(w.id)} className="bg-red-600 text-white px-2 rounded">
Reject
</button>

</div>

</div>

)

})}

</div>

)}

{/* USERS */}

{tab==="users" &&(

<div>

<div className="grid grid-cols-2 gap-2 mb-3">

<input placeholder="Search"
value={search}
onChange={e=>setSearch(e.target.value)}
className="border p-2 rounded"/>

<input placeholder="Min Coins"
value={coinFilter}
onChange={e=>setCoinFilter(e.target.value)}
className="border p-2 rounded"/>

<select
value={rankFilter}
onChange={e=>setRankFilter(e.target.value)}
className="border p-2 rounded"
>

<option value="">All Rank</option>
<option value="gold">Gold</option>
<option value="diamond">Diamond</option>

</select>

<input placeholder="Place"
value={placeFilter}
onChange={e=>setPlaceFilter(e.target.value)}
className="border p-2 rounded"/>

</div>

<div className="bg-white p-4 rounded mb-4">

<h2>User Growth</h2>

<Line data={userGrowthChart}/>

</div>

{filteredUsers.map(u=>(

<div key={u.uid} className="bg-white p-3 rounded shadow flex justify-between">

<div>

<b>{u.name}</b>

<div className="text-xs">{u.email}</div>

Coins: {u.balance}

</div>

<div className="flex gap-2">

<button onClick={()=>addCoins(u.uid)} className="bg-yellow-500 px-2 rounded text-white">
Coins
</button>

<button onClick={()=>banUser(u)} className="bg-red-600 text-white px-2 rounded">
{u.isBanned?"Unban":"Ban"}
</button>

</div>

</div>

))}

</div>

)}

{/* TASKS */}

{tab==="tasks" &&(

<div>

<div className="bg-white p-4 rounded mb-4">

<h2>Task Stats</h2>

<Bar data={taskChart}/>

</div>

<button
onClick={openCreateTask}
className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
>
Create Task
</button>

{tasks.map(t=>(

<div key={t.id} className="bg-white p-3 rounded shadow flex justify-between">

<div>

<b>{t.title}</b>

<div>Reward: {t.reward}</div>

</div>

<div className="flex gap-2">

<button onClick={()=>openEditTask(t)} className="bg-yellow-400 px-2 rounded">
Edit
</button>

<button onClick={()=>deleteTask(t.id)} className="bg-red-600 text-white px-2 rounded">
Delete
</button>

</div>

</div>

))}

</div>

)}

{/* JACKPOT */}

{tab==="jackpot" &&(

<div className="space-y-4">

<button
onClick={selectJackpotWinner}
className="bg-purple-600 text-white px-6 py-3 rounded"
>
Select Monthly Winner
</button>

<div className="bg-white p-4 rounded">

<h2 className="font-bold mb-2">Jackpot History</h2>

{jackpotHistory.map((j,i)=>(

<div key={i} className="border-b py-2">

Month: {j.month} | Winner: {j.userName}

</div>

))}

</div>

</div>

)}

{/* ADMIN LOGS */}

<div className="bg-white p-4 mt-6 rounded">

<h2 className="font-bold mb-2">Admin Action Logs</h2>

<div className="max-h-40 overflow-y-auto text-xs">

{logs.map((l,i)=>(

<div key={i}>{l}</div>

))}

</div>

</div>

</Layout>

)

}

export default AdminDashboard
