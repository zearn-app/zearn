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

const [search,setSearch] = useState("")
const [filter,setFilter] = useState("ALL")

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

const loadAll = async()=>{

const w = await Store.getWithdrawals()
const u = await Store.getAllUsers()
const t = await Store.getAllTasks()
const s = await Store.getSettings()

setWithdrawals(w)
setUsers(u)
setTasks(t)
setSettings(s)

}

//////////////////////////////
// Withdrawals
//////////////////////////////

const approveWithdrawal = async(id:string)=>{
await Store.adminUpdateWithdrawal(id,WithdrawalStatus.COMPLETED)
loadAll()
}

const rejectWithdrawal = async(id:string)=>{
await Store.adminUpdateWithdrawal(id,WithdrawalStatus.REJECTED)
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
loadAll()
}

const addCoins = async(uid:string)=>{

const amount = prompt("Enter coins to add")

if(!amount) return

await Store.adminAddCoins(uid,Number(amount))

loadAll()

}

const filteredUsers = users.filter(u=>
u.name.toLowerCase().includes(search.toLowerCase()) ||
u.email.toLowerCase().includes(search.toLowerCase())
)

//////////////////////////////
// Tasks
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

}else{

await Store.createTask(taskForm)

}

setTaskModal(false)

loadAll()

}

const deleteTask=async(id:string)=>{

if(!window.confirm("Delete task?")) return

await Store.deleteTask(id)

loadAll()

}

//////////////////////////////
// Settings
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

alert("Settings Updated")

}

//////////////////////////////
// Jackpot Winner
//////////////////////////////

const selectJackpotWinner=async()=>{

const monthKey = new Date().getMonth()

const lastWinner = await Store.getJackpotWinner(monthKey)

if(lastWinner){

alert("Winner already selected for this month")

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

}

//////////////////////////////////////////////////

return(

<Layout>

<div className="flex gap-2 mb-6">

{["withdrawals","users","tasks","settings","jackpot"].map(t=>(

<button
key={t}
onClick={()=>setTab(t)}
className={`px-4 py-2 rounded-lg font-bold ${tab===t?"bg-black text-white":"bg-gray-200"}`}
>
{t}
</button>

))}

</div>

{/* Withdrawals */}

{tab==="withdrawals" && (

<div>

<input
placeholder="Search user"
className="border p-2 rounded w-full mb-3"
value={search}
onChange={e=>setSearch(e.target.value)}
/>

<select
value={filter}
onChange={e=>setFilter(e.target.value)}
className="border p-2 rounded mb-4"
>

<option value="ALL">All</option>
<option value="PENDING">Pending</option>
<option value="COMPLETED">Completed</option>
<option value="REJECTED">Rejected</option>

</select>

{filteredWithdrawals.map(w=>{

const user = users.find(u=>u.uid===w.uid)

return(

<div key={w.id} className="border p-4 rounded mb-2 bg-white">

<div className="flex justify-between">

<div>
<b>{user?.name}</b>
<div className="text-xs">{user?.email}</div>
</div>

<div>₹{w.amount}</div>

</div>

<div className="flex gap-2 mt-3">

<button
onClick={()=>setSelectedWithdrawal(w)}
className="bg-gray-300 px-3 py-1 rounded"
>
View
</button>

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

</div>

</div>

)

})}

</div>

)}

{/* Users */}

{tab==="users" && (

<div>

<input
placeholder="Search user"
className="border p-2 rounded w-full mb-3"
value={search}
onChange={e=>setSearch(e.target.value)}
/>

{filteredUsers.map(u=>(

<div key={u.uid} className="border p-4 mb-2 rounded bg-white flex justify-between">

<div>

<b>{u.name}</b>
<div className="text-xs">{u.email}</div>
<div className="text-xs">Coins: {u.balance}</div>

</div>

<div className="flex gap-2">

<button
onClick={()=>setSelectedUser(u)}
className="bg-gray-300 px-3 py-1 rounded"
>
View
</button>

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

</div>

</div>

))}

</div>

)}

{/* Tasks */}

{tab==="tasks" && (

<div>

<button
onClick={openCreateTask}
className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
>
Create Task
</button>

{tasks.map(t=>(

<div key={t.id} className="border p-4 rounded mb-2 bg-white flex justify-between">

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

{/* Settings */}

{tab==="settings" && settings && (

<div className="space-y-3">

<input
type="number"
value={settings.minWithdrawal}
onChange={e=>updateSetting("minWithdrawal",Number(e.target.value))}
className="border p-2 rounded w-full"
/>

<input
type="number"
value={settings.dailyClaimLimit}
onChange={e=>updateSetting("dailyClaimLimit",Number(e.target.value))}
className="border p-2 rounded w-full"
/>

<input
type="text"
value={settings.adminPassword}
onChange={e=>updateSetting("adminPassword",e.target.value)}
className="border p-2 rounded w-full"
/>

<input
type="number"
value={settings.randomWinnerEntryFee}
onChange={e=>updateSetting("randomWinnerEntryFee",Number(e.target.value))}
className="border p-2 rounded w-full"
/>

<button
onClick={saveSettings}
className="bg-black text-white px-4 py-2 rounded"
>
Save Settings
</button>

</div>

)}

{/* Jackpot */}

{tab==="jackpot" && (

<div>

<button
onClick={selectJackpotWinner}
className="bg-purple-600 text-white px-6 py-3 rounded"
>
Select Monthly Winner
</button>

</div>

)}

{/* Withdrawal Modal */}

{selectedWithdrawal &&(

<div className="fixed inset-0 bg-black/50 flex items-center justify-center">

<div className="bg-white p-6 rounded w-[400px]">

<button onClick={()=>setSelectedWithdrawal(null)}>
<X/>
</button>

<div>Amount: {selectedWithdrawal.amount}</div>
<div>{selectedWithdrawal.details}</div>

</div>

</div>

)}

{/* User Modal */}

{selectedUser &&(

<div className="fixed inset-0 bg-black/50 flex items-center justify-center">

<div className="bg-white p-6 rounded w-[400px]">

<button onClick={()=>setSelectedUser(null)}>
<X/>
</button>

<div>Name: {selectedUser.name}</div>
<div>Email: {selectedUser.email}</div>
<div>Coins: {selectedUser.balance}</div>

</div>

</div>

)}

{/* Task Modal */}

{taskModal &&(

<div className="fixed inset-0 bg-black/50 flex items-center justify-center">

<div className="bg-white p-6 rounded w-[450px]">

<input
placeholder="Task ID"
value={taskForm.id}
onChange={e=>setTaskForm({...taskForm,id:e.target.value})}
/>

<input
placeholder="Title"
value={taskForm.title}
onChange={e=>setTaskForm({...taskForm,title:e.target.value})}
/>

<input
type="number"
placeholder="Reward"
value={taskForm.reward}
onChange={e=>setTaskForm({...taskForm,reward:Number(e.target.value)})}
/>

<input
placeholder="Zip Name"
value={taskForm.expectedZipName}
onChange={e=>setTaskForm({...taskForm,expectedZipName:e.target.value})}
/>

<input
placeholder="Password"
value={taskForm.password}
onChange={e=>setTaskForm({...taskForm,password:e.target.value})}
/>

<input
placeholder="Inner File"
value={taskForm.expectedInnerFileName}
onChange={e=>setTaskForm({...taskForm,expectedInnerFileName:e.target.value})}
/>

<button
onClick={saveTask}
className="bg-blue-600 text-white px-4 py-2 mt-3 rounded"
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
