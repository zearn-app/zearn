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

//////////////////////////////
// Users
//////////////////////////////

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
// Jackpot
//////////////////////////////

const selectJackpotWinner=async()=>{

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

<div className="p-4 space-y-4">

{/* Tabs */}

<div className="flex gap-2 overflow-x-auto">

{["withdrawals","users","tasks","settings","jackpot"].map(t=>(

<button
key={t}
type="button"
onClick={()=>setTab(t)}
className={`px-4 py-2 rounded-lg ${
tab===t ? "bg-black text-white":"bg-gray-200"
}`}
>

{t}

</button>

))}

</div>

{/* WITHDRAWALS */}

{tab==="withdrawals" && (

<div className="space-y-3">

{withdrawals.map(w=>{

const user = users.find(u=>u.uid===w.uid)

return(

<div
key={w.id}
className="border rounded-lg p-3 bg-white"
>

<div
onClick={()=>setSelectedWithdrawal(w)}
className="cursor-pointer"
>

<b>{user?.name}</b>

<div className="text-xs">{user?.email}</div>

<div className="font-bold">₹{w.amount}</div>

<div className="text-xs">{w.status}</div>

</div>

{w.status==="PENDING" &&(

<div className="flex gap-2 mt-2">

<button
type="button"
onClick={()=>approveWithdrawal(w.id)}
className="bg-green-600 text-white px-3 py-1 rounded"
>

Approve

</button>

<button
type="button"
onClick={()=>rejectWithdrawal(w.id)}
className="bg-red-500 text-white px-3 py-1 rounded"
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

{/* USERS */}

{tab==="users" &&(

<div className="space-y-3">

{users.map(u=>(

<div
key={u.uid}
className="border p-3 rounded-lg bg-white flex justify-between"
>

<div onClick={()=>setSelectedUser(u)} className="cursor-pointer">

<b>{u.name}</b>

<div className="text-xs">{u.email}</div>

<div className="text-xs">Coins {u.balance}</div>

</div>

<div className="flex gap-2">

<button
type="button"
onClick={()=>addCoins(u.uid)}
className="bg-yellow-500 text-white px-3 py-1 rounded"
>

Add

</button>

<button
type="button"
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

{/* TASKS */}

{tab==="tasks" &&(

<div className="space-y-3">

<button
type="button"
onClick={openCreateTask}
className="bg-blue-600 text-white px-4 py-2 rounded"
>

Create Task

</button>

{tasks.map(t=>(

<div key={t.id} className="border p-3 rounded-lg bg-white flex justify-between">

<div>

<b>{t.title}</b>

<div className="text-xs">Reward {t.reward}</div>

</div>

<div className="flex gap-2">

<button
type="button"
onClick={()=>openEditTask(t)}
className="bg-yellow-400 px-3 py-1 rounded"
>

Edit

</button>

<button
type="button"
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

{/* SETTINGS */}

{tab==="settings" && settings &&(

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
type="button"
onClick={saveSettings}
className="bg-black text-white px-4 py-2 rounded"
>

Save Settings

</button>

</div>

)}

{/* JACKPOT */}

{tab==="jackpot" &&(

<div>

<button
type="button"
onClick={selectJackpotWinner}
className="bg-purple-600 text-white px-6 py-3 rounded"
>

Select Monthly Winner

</button>

</div>

)}

</div>

{/* USER MODAL */}

{selectedUser &&(

<div className="fixed inset-0 bg-black/50 flex items-center justify-center">

<div className="bg-white p-6 rounded-lg w-[90%] max-w-md">

<button onClick={()=>setSelectedUser(null)}>

<X/>

</button>

<div className="space-y-2">

<div>Name: {selectedUser.name}</div>
<div>Email: {selectedUser.email}</div>
<div>Coins: {selectedUser.balance}</div>

</div>

</div>

</div>

)}

{/* WITHDRAWAL MODAL */}

{selectedWithdrawal &&(

<div className="fixed inset-0 bg-black/50 flex items-center justify-center">

<div className="bg-white p-6 rounded-lg w-[90%] max-w-md">

<button onClick={()=>setSelectedWithdrawal(null)}>

<X/>

</button>

<div>Amount: ₹{selectedWithdrawal.amount}</div>
<div>Type: {selectedWithdrawal.type}</div>
<div>Status: {selectedWithdrawal.status}</div>

</div>

</div>

)}

</Layout>

)

}

export default AdminDashboard
