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

const AdminDashboard: React.FC = () => {

const [tab,setTab] = useState("withdrawals")

const [withdrawals,setWithdrawals] = useState<WithdrawalRequest[]>([])
const [users,setUsers] = useState<User[]>([])
const [tasks,setTasks] = useState<Task[]>([])
const [settings,setSettings] = useState<AdminSettings | null>(null)

const [jackpotHistory,setJackpotHistory] = useState<any[]>([])

const [search,setSearch] = useState("")
const [filter,setFilter] = useState("ALL")
const [withdrawType,setWithdrawType] = useState("ALL")

const [coinFilter,setCoinFilter] = useState("ALL")
const [rankFilter,setRankFilter] = useState("ALL")
const [placeFilter,setPlaceFilter] = useState("")

const [selectedUser,setSelectedUser] = useState<User|null>(null)
const [selectedWithdrawal,setSelectedWithdrawal] = useState<WithdrawalRequest|null>(null)

const [taskModal,setTaskModal] = useState(false)
const [editingTask,setEditingTask] = useState<Task|null>(null)

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

//////////////////////////////////////////////////

const loadAll = async()=>{

const w = await Store.getWithdrawals()
const u = await Store.getAllUsers()
const t = await Store.getAllTasks()
const s = await Store.getSettings()

let j:any[] = []

if(Store.getAllJackpotWinners){
j = await Store.getAllJackpotWinners()
}

setWithdrawals(w)
setUsers(u)
setTasks(t)
setSettings(s)
setJackpotHistory(j)

}

//////////////////////////////////////////////////
// Withdrawal Stats
//////////////////////////////////////////////////

const pendingWithdrawals = withdrawals.filter(w=>w.status==="PENDING")

const pendingAmount = pendingWithdrawals.reduce((a,b)=>a+b.amount,0)

//////////////////////////////////////////////////
// Withdraw Filters
//////////////////////////////////////////////////

const filteredWithdrawals = withdrawals.filter(w=>{

const user = users.find(u=>u.uid===w.uid)

const matchSearch =
user?.name?.toLowerCase().includes(search.toLowerCase()) ||
user?.email?.toLowerCase().includes(search.toLowerCase())

const matchStatus =
filter==="ALL" || w.status===filter

const matchType =
withdrawType==="ALL" || w.type===withdrawType

return matchSearch && matchStatus && matchType

})

//////////////////////////////////////////////////
// User Filters
//////////////////////////////////////////////////

const filteredUsers = users.filter(u=>{

const matchSearch =
u.name.toLowerCase().includes(search.toLowerCase()) ||
u.email.toLowerCase().includes(search.toLowerCase())

const matchCoins =
coinFilter==="ALL" ||
(coinFilter==="LOW" && u.balance < 500) ||
(coinFilter==="MEDIUM" && u.balance >=500 && u.balance <2000) ||
(coinFilter==="HIGH" && u.balance >=2000)

const matchRank =
rankFilter==="ALL" || u.rank===rankFilter

const matchPlace =
placeFilter==="" || u.place?.toLowerCase().includes(placeFilter.toLowerCase())

return matchSearch && matchCoins && matchRank && matchPlace

})

//////////////////////////////////////////////////
// Withdraw Actions
//////////////////////////////////////////////////

const approveWithdrawal = async(id:string)=>{
await Store.adminUpdateWithdrawal(id,WithdrawalStatus.COMPLETED)
loadAll()
}

const rejectWithdrawal = async(id:string)=>{
await Store.adminUpdateWithdrawal(id,WithdrawalStatus.REJECTED)
loadAll()
}

//////////////////////////////////////////////////
// User Actions
//////////////////////////////////////////////////

const banUser = async(user:User)=>{
await Store.toggleUserBan(user.uid,user.isBanned)
loadAll()
}

const addCoins = async(uid:string)=>{
const amount = prompt("Enter coins")
if(!amount) return
await Store.adminAddCoins(uid,Number(amount))
loadAll()
}

//////////////////////////////////////////////////
// Tasks
//////////////////////////////////////////////////

const openCreateTask = ()=>{
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

const openEditTask = (task:Task)=>{
setEditingTask(task)
setTaskForm(task)
setTaskModal(true)
}

const saveTask = async()=>{

if(!taskForm.title){
alert("Title required")
return
}

if(editingTask){

await Store.updateTask(editingTask.id,taskForm)

}else{

await Store.createTask(taskForm)

}

setTaskModal(false)

loadAll()

}

const deleteTask = async(id:string)=>{

if(!window.confirm("Delete task?")) return

await Store.deleteTask(id)

loadAll()

}

//////////////////////////////////////////////////
// Settings
//////////////////////////////////////////////////

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

alert("Settings Updated")

}

//////////////////////////////////////////////////
// Jackpot
//////////////////////////////////////////////////

const selectJackpotWinner = async()=>{

const monthKey = new Date().getMonth()

const lastWinner = await Store.getJackpotWinner(monthKey)

if(lastWinner){
alert("Winner already selected")
return
}

const eligible = users.filter(u=>!u.isBanned)

if(eligible.length===0){
alert("No eligible users")
return
}

const winner = eligible[Math.floor(Math.random()*eligible.length)]

await Store.saveJackpotWinner(monthKey,winner.uid)

alert("Winner: "+winner.name)

loadAll()

}

//////////////////////////////////////////////////

return(

<Layout>

<div className="p-3 space-y-4">

{/* Tabs */}

<div className="flex overflow-x-auto gap-2">

{["withdrawals","users","tasks","settings","jackpot"].map(t=>(

<button
key={t}
onClick={()=>setTab(t)}
className={`px-4 py-2 rounded-lg text-sm font-bold ${
tab===t ? "bg-black text-white":"bg-gray-200"
}`}
>

{t}

</button>

))}

</div>

//////////////////////////////////////////////////
{/* WITHDRAWALS */}
//////////////////////////////////////////////////

{tab==="withdrawals" &&(

<div className="space-y-3">

<div className="bg-yellow-100 p-3 rounded text-sm">
Pending Requests: {pendingWithdrawals.length} <br/>
Pending Amount: ₹{pendingAmount}
</div>

<input
placeholder="Search user"
value={search}
onChange={e=>setSearch(e.target.value)}
className="border p-2 rounded w-full"
/>

<div className="flex gap-2">

<select
value={filter}
onChange={e=>setFilter(e.target.value)}
className="border p-2 rounded w-full"
>

<option value="ALL">Status</option>
<option value="PENDING">Pending</option>
<option value="COMPLETED">Completed</option>
<option value="REJECTED">Rejected</option>

</select>

<select
value={withdrawType}
onChange={e=>setWithdrawType(e.target.value)}
className="border p-2 rounded w-full"
>

<option value="ALL">Type</option>
<option value="UPI">UPI</option>
<option value="BANK">Bank</option>

</select>

</div>

{filteredWithdrawals.map(w=>{

const user = users.find(u=>u.uid===w.uid)

return(

<div
key={w.id}
className="border bg-white rounded p-3 space-y-1"
onClick={()=>setSelectedWithdrawal(w)}
>

<b>{user?.name}</b>

<div className="text-xs">{user?.email}</div>

<div className="text-sm font-bold">₹{w.amount}</div>

<div className="text-xs">{w.status}</div>

{w.status==="PENDING" &&(

<div className="flex gap-2 pt-2">

<button
onClick={(e)=>{e.stopPropagation();approveWithdrawal(w.id)}}
className="bg-green-600 text-white px-3 py-1 rounded"
>
Approve
</button>

<button
onClick={(e)=>{e.stopPropagation();rejectWithdrawal(w.id)}}
className="bg-red-600 text-white px-3 py-1 rounded"
>
Reject
</button>

</div>

)}

</div>

)

})}

</div>

)}

//////////////////////////////////////////////////
{/* USERS */}
//////////////////////////////////////////////////

{tab==="users" &&(

<div className="space-y-3">

<input
placeholder="Search name/email"
value={search}
onChange={e=>setSearch(e.target.value)}
className="border p-2 rounded w-full"
/>

<select
value={coinFilter}
onChange={e=>setCoinFilter(e.target.value)}
className="border p-2 rounded w-full"
>
<option value="ALL">Coins</option>
<option value="LOW">0-500</option>
<option value="MEDIUM">500-2000</option>
<option value="HIGH">2000+</option>
</select>

<select
value={rankFilter}
onChange={e=>setRankFilter(e.target.value)}
className="border p-2 rounded w-full"
>
<option value="ALL">Rank</option>
<option value="gold">Gold</option>
<option value="diamond">Diamond</option>
</select>

<input
placeholder="Place"
value={placeFilter}
onChange={e=>setPlaceFilter(e.target.value)}
className="border p-2 rounded w-full"
/>

{filteredUsers.map(u=>(

<div
key={u.uid}
className="border bg-white rounded p-3 flex justify-between"
onClick={()=>setSelectedUser(u)}
>

<div>

<b>{u.name}</b>

<div className="text-xs">{u.email}</div>

<div className="text-xs">Coins: {u.balance}</div>

</div>

<div className="flex gap-2">

<button
onClick={(e)=>{e.stopPropagation();addCoins(u.uid)}}
className="bg-yellow-500 text-white px-3 py-1 rounded"
>
Add
</button>

<button
onClick={(e)=>{e.stopPropagation();banUser(u)}}
className="bg-red-500 text-white px-3 py-1 rounded"
>
{u.isBanned?"Unban":"Ban"}
</button>

</div>

</div>

))}

</div>

)}

//////////////////////////////////////////////////
{/* TASKS */}
//////////////////////////////////////////////////

{tab==="tasks" &&(

<div className="space-y-3">

<button
onClick={openCreateTask}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Create Task
</button>

{tasks.map(t=>(

<div key={t.id} className="border bg-white rounded p-3 flex justify-between">

<div>

<b>{t.title}</b>

<div className="text-xs">Reward: {t.reward}</div>

</div>

<div className="flex gap-2">

<button
onClick={()=>openEditTask(t)}
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

//////////////////////////////////////////////////
{/* JACKPOT */}
//////////////////////////////////////////////////

{tab==="jackpot" &&(

<div className="space-y-4">

<button
onClick={selectJackpotWinner}
className="bg-purple-600 text-white px-6 py-3 rounded"
>
Select Monthly Winner
</button>

{jackpotHistory.map((j,i)=>{

const user = users.find(u=>u.uid===j.uid)

return(

<div key={i} className="border bg-white p-3 rounded">

<b>{user?.name}</b>

<div className="text-xs">Month: {j.month}</div>

</div>

)

})}

</div>

)}

</div>

//////////////////////////////////////////////////
{/* TASK MODAL */}
//////////////////////////////////////////////////

{taskModal &&(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center">

<div className="bg-white p-6 rounded-xl w-[90%] space-y-2">

<button onClick={()=>setTaskModal(false)}><X/></button>

<input
placeholder="Task ID"
value={taskForm.id}
onChange={e=>setTaskForm({...taskForm,id:e.target.value})}
className="border p-2 rounded w-full"
/>

<input
placeholder="Title"
value={taskForm.title}
onChange={e=>setTaskForm({...taskForm,title:e.target.value})}
className="border p-2 rounded w-full"
/>

<input
type="number"
placeholder="Reward"
value={taskForm.reward}
onChange={e=>setTaskForm({...taskForm,reward:Number(e.target.value)})}
className="border p-2 rounded w-full"
/>

<input
placeholder="Zip Name"
value={taskForm.expectedZipName}
onChange={e=>setTaskForm({...taskForm,expectedZipName:e.target.value})}
className="border p-2 rounded w-full"
/>

<input
placeholder="Password"
value={taskForm.password}
onChange={e=>setTaskForm({...taskForm,password:e.target.value})}
className="border p-2 rounded w-full"
/>

<input
placeholder="Inner File Name"
value={taskForm.expectedInnerFileName}
onChange={e=>setTaskForm({...taskForm,expectedInnerFileName:e.target.value})}
className="border p-2 rounded w-full"
/>

<button
onClick={saveTask}
className="bg-blue-600 text-white px-4 py-2 rounded w-full"
>
Save Task
</button>

</div>

</div>

)}

</Layout>

)

}

export default AdminDashboard
