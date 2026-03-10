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

const [taskModal,setTaskModal] = useState(false)
const [editingTask,setEditingTask] = useState<Task | null>(null)

const [taskForm,setTaskForm] = useState({
id:"",
title:"",
reward:0,
isSpecial:false,
link:"",
expectedZipName:"",
password:"",
expectedInnerFileName:"",
expectedapkName:"",
Package:""
})

////////////////////////////////////////////////////
useEffect(()=>{
loadAll()
},[])
////////////////////////////////////////////////////

const loadAll = async()=>{

const w = await Store.getWithdrawals()
const u = await Store.getAllUsers()
const t = await Store.getAllTasks()
const s = await Store.getSettings()

let j:any[] = []
j = await Store.getWinnerEntries()

setWithdrawals(w)
setUsers(u)
setTasks(t)
setSettings(s)
setJackpotHistory(j)

}

////////////////////////////////////////////////////
//////////////// WITHDRAW STATS ////////////////////
////////////////////////////////////////////////////

const pendingWithdrawals = withdrawals.filter(w=>w.status==="PENDING")
const pendingAmount = pendingWithdrawals.reduce((a,b)=>a+b.amount,0)

////////////////////////////////////////////////////
//////////////// FILTER WITHDRAW ///////////////////
////////////////////////////////////////////////////

const filteredWithdrawals = withdrawals.filter(w=>{

const user = users.find(u=>u.uid===w.uid)

const matchSearch =
(user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
(user?.email || "").toLowerCase().includes(search.toLowerCase())

const matchStatus =
filter==="ALL" || w.status===filter as WithdrawalStatus
const matchType =
withdrawType==="ALL" || (w as any).type===withdrawType
return matchSearch && matchStatus && matchType

})

////////////////////////////////////////////////////
//////////////// FILTER USERS //////////////////////
////////////////////////////////////////////////////

const filteredUsers = users.filter(u=>{

const matchSearch =
(u.name || "").toLowerCase().includes(search.toLowerCase()) ||
(u.email || "").toLowerCase().includes(search.toLowerCase())

const matchCoins =
coinFilter==="ALL" ||
(coinFilter==="LOW" && u.balance < 500) ||
(coinFilter==="MEDIUM" && u.balance >=500 && u.balance <2000) ||
(coinFilter==="HIGH" && u.balance >=2000)

const matchRank =
rankFilter==="ALL" || u.rank===rankFilter

const matchPlace =
placeFilter==="" ||
(u.district || "").toLowerCase().includes(placeFilter.toLowerCase())
return matchSearch && matchCoins && matchRank && matchPlace

})

////////////////////////////////////////////////////
//////////////// WITHDRAW ACTION ///////////////////
////////////////////////////////////////////////////

const approveWithdrawal = async(id:string)=>{
await Store.adminUpdateWithdrawal(id,WithdrawalStatus.COMPLETED)
await loadAll()
}

const rejectWithdrawal = async(id:string)=>{
await Store.adminUpdateWithdrawal(id,WithdrawalStatus.REJECTED)
await loadAll()
}

////////////////////////////////////////////////////
//////////////// USER ACTION ///////////////////////
////////////////////////////////////////////////////

const banUser = async(user:User)=>{
await Store.toggleUserBan(user.uid,user.isBanned)
await loadAll()
}

const addCoins = async(uid:string)=>{

const amount = prompt("Enter coins")

if(!amount) return

await (Store as any).adminAddCoins(uid,Number(amount))

await loadAll()

}

////////////////////////////////////////////////////
//////////////// TASK //////////////////////////////
////////////////////////////////////////////////////

const openCreateTask = ()=>{

setEditingTask(null)

setTaskForm({
id:"",
title:"",
reward:0,
isSpecial:false,
link:"",
expectedZipName:"",
password:"",
expectedInnerFileName:"",
expectedapkName:"",
Package:""
})

setTaskModal(true)

}

const openEditTask = (task:Task)=>{

setEditingTask(task)

setTaskForm({
id:task.id || "",
title:task.title || "",
reward:task.reward || 0,
isSpecial:task.isSpecial || false,
link:(task as any).link || "",

expectedZipName:(task as any).expectedZipName || "",
password:(task as any).password || "",
expectedInnerFileName:(task as any).expectedInnerFileName || "",

expectedapkName:(task as any).expectedapkName || "",
Package:(task as any).Package || ""
})

setTaskModal(true)

}

////////////////////////////////////////////////////

const saveTask = async(e:React.FormEvent)=>{

e.preventDefault()

if(!taskForm.title){
alert("Title required")
return
}

try{

let payload:any = {
id:taskForm.id,
title:taskForm.title,
reward:taskForm.reward,
isSpecial:taskForm.isSpecial,
link:taskForm.link
}

if(taskForm.isSpecial){

payload.expectedapkName = taskForm.expectedapkName
payload.Package = taskForm.Package

}else{

payload.expectedZipName = taskForm.expectedZipName
payload.password = taskForm.password
payload.expectedInnerFileName = taskForm.expectedInnerFileName

}

if(editingTask){

await Store.updateTask(editingTask.id,payload)

}else{

await Store.createTask(payload)

}

setTaskModal(false)

await loadAll()

}catch(err){

console.error(err)

alert("Failed to save task")

}

}

////////////////////////////////////////////////////

const deleteTask = async(id:string)=>{

if(!window.confirm("Delete task?")) return

await Store.deleteTask(id)

await loadAll()

}

////////////////////////////////////////////////////
//////////////// SETTINGS //////////////////////////
////////////////////////////////////////////////////

const updateSetting=(key:string,value:any)=>{
if(!settings) return
setSettings({...settings,[key]:value})
}

const saveSettings=async()=>{
if(!settings) return
await Store.updateSettings(settings)
alert("Settings Updated")
}

////////////////////////////////////////////////////
//////////////// JACKPOT ///////////////////////////
////////////////////////////////////////////////////
const selectJackpotWinner = async()=>{

if(!settings) return

const fee = settings.randomWinnerEntryFee

const eligible = users.filter(u=>!u.isBanned)

if(eligible.length===0){
alert("No eligible users")
return
}

const winner = eligible[Math.floor(Math.random()*eligible.length)]

try{

await Store.enterRandomWinner(winner.uid,fee)

alert("Winner entry created for "+winner.name)

}catch(err:any){

alert(err.message)

}

await loadAll()

}


////////////////////////////////////////////////////
//////////////// UI ////////////////////////////////
////////////////////////////////////////////////////

return(

<Layout>

<div className="p-3 space-y-4">

{/* Tabs */}

<div className="flex gap-2 overflow-x-auto">

{["withdrawals","users","tasks","settings","jackpot"].map(t=>(

<button
key={t}
onClick={()=>setTab(t)}
className={`px-4 py-2 rounded font-bold ${
tab===t ? "bg-black text-white":"bg-gray-200"
}`}
>
{t}
</button>

))}

</div>

{/* TASKS TAB */}

{tab==="tasks" &&(

<div className="space-y-3">

<div className="flex justify-between">

<h2 className="font-bold text-lg">Tasks</h2>

<button
onClick={openCreateTask}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Create Task
</button>

</div>

{tasks.map(t=>(

<div
key={t.id}
className="border bg-white p-3 rounded flex justify-between items-center"
>

<div>

<b>{t.title}</b>

<div className="text-xs text-gray-500">
Reward: {t.reward}
</div>

<div className="text-xs">
Type: {t.isSpecial ? "Special APK Task" : "Normal ZIP Task"}
</div>

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

</div>

{/* TASK MODAL */}

{taskModal &&(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center">

<form
onSubmit={saveTask}
className="bg-white p-5 rounded w-[95%] max-w-md space-y-3"
>

<div className="flex justify-between">

<h3 className="font-bold">
{editingTask ? "Edit Task" : "Create Task"}
</h3>

<button
type="button"
onClick={()=>setTaskModal(false)}
>
<X/>
</button>

</div>

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
placeholder="Download Link"
value={taskForm.link}
onChange={e=>setTaskForm({...taskForm,link:e.target.value})}
className="border p-2 rounded w-full"
/>

<div className="flex gap-2">

<button
type="button"
onClick={()=>setTaskForm({...taskForm,isSpecial:false})}
className={`px-3 py-1 rounded ${
!taskForm.isSpecial ? "bg-blue-600 text-white":"bg-gray-200"
}`}
>
Normal
</button>

<button
type="button"
onClick={()=>setTaskForm({...taskForm,isSpecial:true})}
className={`px-3 py-1 rounded ${
taskForm.isSpecial ? "bg-blue-600 text-white":"bg-gray-200"
}`}
>
Special
</button>

</div>

{!taskForm.isSpecial &&(

<>

<input
placeholder="Expected ZIP Name"
value={taskForm.expectedZipName}
onChange={e=>setTaskForm({...taskForm,expectedZipName:e.target.value})}
className="border p-2 rounded w-full"
/>

<input
placeholder="ZIP Password"
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

</>

)}

{taskForm.isSpecial &&(

<>

<input
placeholder="Expected APK Name"
value={taskForm.expectedapkName}
onChange={e=>setTaskForm({...taskForm,expectedapkName:e.target.value})}
className="border p-2 rounded w-full"
/>

<input
placeholder="Package Name"
value={taskForm.Package}
onChange={e=>setTaskForm({...taskForm,Package:e.target.value})}
className="border p-2 rounded w-full"
/>

</>

)}

<button
type="submit"
className="bg-blue-600 text-white px-4 py-2 rounded w-full"
>
Save Task
</button>

</form>

{tab==="withdrawals" &&(

<div className="space-y-3">

<h2 className="font-bold text-lg">Withdrawals</h2>

<div className="bg-yellow-100 p-3 rounded">
Pending Requests: {pendingWithdrawals.length} | Amount: ₹{pendingAmount}
</div>

{filteredWithdrawals.map(w=>{

const user = users.find(u=>u.uid===w.uid)

return(

<div key={w.id} className="border p-3 rounded bg-white flex justify-between">

<div>
<b>{user?.name}</b>
<div className="text-xs">{user?.email}</div>
<div className="text-sm">₹{w.amount}</div>
<div className="text-xs">Status: {w.status}</div>
</div>

<div className="flex gap-2">

{w.status==="PENDING" &&(
<>
<button
onClick={()=>approveWithdrawal(w.id)}
className="bg-green-500 text-white px-3 py-1 rounded"
>
Approve
</button>

<button
onClick={()=>rejectWithdrawal(w.id)}
className="bg-red-500 text-white px-3 py-1 rounded"
>
Reject
</button>
</>
)}

</div>

</div>

)

})}

</div>

)}

{tab==="users" &&(

<div className="space-y-3">

<h2 className="font-bold text-lg">Users</h2>

{filteredUsers.map(u=>(

<div key={u.uid} className="border bg-white p-3 rounded flex justify-between">

<div>
<b>{u.name}</b>
<div className="text-xs">{u.email}</div>
<div className="text-xs">Coins: {u.balance}</div>
</div>

<div className="flex gap-2">

<button
onClick={()=>addCoins(u.uid)}
className="bg-blue-500 text-white px-3 py-1 rounded"
>
Add Coins
</button>

<button
onClick={()=>banUser(u)}
className={`px-3 py-1 rounded ${
u.isBanned ? "bg-green-500 text-white":"bg-red-500 text-white"
}`}
>
{u.isBanned ? "Unban":"Ban"}
</button>

</div>

</div>

))}

</div>

)}


{tab==="settings" && settings &&(

<div className="space-y-3">

<h2 className="font-bold text-lg">Settings</h2>

<input
value={settings.randomWinnerEntryFee}
onChange={e=>updateSetting("randomWinnerEntryFee",Number(e.target.value))}
className="border p-2 rounded w-full"
placeholder="Random Winner Entry Fee"
/>

<input
value={settings.withdrawMin}
onChange={e=>updateSetting("withdrawMin",Number(e.target.value))}
className="border p-2 rounded w-full"
placeholder="Min Withdraw"
/>

<button
onClick={saveSettings}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Save Settings
</button>

</div>

)}

{tab==="jackpot" &&(

<div className="space-y-3">

<h2 className="font-bold text-lg">Jackpot</h2>

<button
onClick={selectJackpotWinner}
className="bg-purple-600 text-white px-4 py-2 rounded"
>
Select Monthly Winner
</button>

<div className="space-y-2">

{jackpotHistory.map((j,i)=>(

<div key={i} className="border p-3 rounded bg-white">

Winner UID: {j.uid}

</div>

))}

</div>

</div>

)}


</div>

)}

</Layout>

)

}

export default AdminDashboard
