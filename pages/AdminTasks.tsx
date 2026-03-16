import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Store } from "../services/store";
import { Task } from "../types";
import { X } from "lucide-react";

const AdminTasks: React.FC = () => {

const [tasks,setTasks] = useState<Task[]>([])
const [loading,setLoading] = useState(true)

const [modal,setModal] = useState(false)
const [editingTask,setEditingTask] = useState<Task | null>(null)

const [form,setForm] = useState({
title:"",
description:"",
link:"",
reward:0,
diamondReward:0,
password:"",
expectedZipName:"",
expectedInnerFileName:"",
isSpecial:false
})

////////////////////////////////////////////////////
//////////////// LOAD TASKS ////////////////////////
////////////////////////////////////////////////////

const loadTasks = async () => {

setLoading(true)

try{

const t = await Store.getAllTasks()

setTasks(t)

}catch(e){

console.error(e)

}

setLoading(false)

}

useEffect(()=>{

loadTasks()

},[])

////////////////////////////////////////////////////
//////////////// CREATE TASK ///////////////////////
////////////////////////////////////////////////////

const openCreate = ()=>{

setEditingTask(null)

setForm({
title:"",
description:"",
link:"",
reward:0,
diamondReward:0,
password:"",
expectedZipName:"",
expectedInnerFileName:"",
isSpecial:false
})

setModal(true)

}

////////////////////////////////////////////////////
//////////////// EDIT TASK /////////////////////////
////////////////////////////////////////////////////

const openEdit = (task:Task)=>{

setEditingTask(task)

setForm({

title:task.title || "",
description:(task as any).description || "",
link:task.link || "",
reward:task.reward || 0,
diamondReward:(task as any).diamondReward || 0,
password:(task as any).password || "",
expectedZipName:(task as any).expectedZipName || "",
expectedInnerFileName:(task as any).expectedInnerFileName || "",
isSpecial:(task as any).isSpecial || false

})

setModal(true)

}

////////////////////////////////////////////////////
//////////////// SAVE TASK /////////////////////////
////////////////////////////////////////////////////

const saveTask = async (e:React.FormEvent)=>{

e.preventDefault()

try{

if(editingTask){

await Store.editTask(editingTask.id,form)

}else{

await Store.createTask(form)

}

setModal(false)

await loadTasks()

}catch(err){

console.error(err)

alert("Task save failed")

}

}

////////////////////////////////////////////////////
//////////////// DELETE TASK ///////////////////////
////////////////////////////////////////////////////

const deleteTask = async(id:string)=>{

if(!window.confirm("Delete this task?")) return

try{

await Store.deleteTask(id)

await loadTasks()

}catch(e){

console.error(e)

}

}

////////////////////////////////////////////////////
//////////////// UI ////////////////////////////////
////////////////////////////////////////////////////

return(

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

{/* TASK LIST */}

{loading && <div>Loading tasks...</div>}

{!loading && tasks.map(t=>(
  
<div
key={t.id}
className="border bg-white p-3 rounded flex justify-between items-center"
>

<div>

<div className="font-bold">{t.title}</div>

<div className="text-xs text-gray-500">
Reward: {t.reward}
</div>

<div className="text-xs">
Type: {t.isSpecial ? "Special Task":"Normal Task"}
</div>

</div>

<div className="flex gap-2">

<button
onClick={()=>openEdit(t)}
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

{/* MODAL */}

{modal &&(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center">

<form
onSubmit={saveTask}
className="bg-white p-5 rounded w-[95%] max-w-md space-y-3"
>

<div className="flex justify-between">

<h3 className="font-bold">
{editingTask ? "Edit Task":"Create Task"}
</h3>

<button
type="button"
onClick={()=>setModal(false)}
>
<X/>
</button>

</div>

<input
placeholder="Title"
value={form.title}
onChange={e=>setForm({...form,title:e.target.value})}
className="border p-2 rounded w-full"
/>

<input
placeholder="Description"
value={form.description}
onChange={e=>setForm({...form,description:e.target.value})}
className="border p-2 rounded w-full"
/>

<input
placeholder="Download Link"
value={form.link}
onChange={e=>setForm({...form,link:e.target.value})}
className="border p-2 rounded w-full"
/>

<input
type="number"
placeholder="Reward"
value={form.reward}
onChange={e=>setForm({...form,reward:Number(e.target.value)})}
className="border p-2 rounded w-full"
/>

<input
type="number"
placeholder="Diamond Reward"
value={form.diamondReward}
onChange={e=>setForm({...form,diamondReward:Number(e.target.value)})}
className="border p-2 rounded w-full"
/>

<input
placeholder="ZIP Name"
value={form.expectedZipName}
onChange={e=>setForm({...form,expectedZipName:e.target.value})}
className="border p-2 rounded w-full"
/>

<input
placeholder="ZIP Password"
value={form.password}
onChange={e=>setForm({...form,password:e.target.value})}
className="border p-2 rounded w-full"
/>

<input
placeholder="Inner File Name"
value={form.expectedInnerFileName}
onChange={e=>setForm({...form,expectedInnerFileName:e.target.value})}
className="border p-2 rounded w-full"
/>

<label className="flex gap-2 items-center">

<input
type="checkbox"
checked={form.isSpecial}
onChange={e=>setForm({...form,isSpecial:e.target.checked})}
/>

Special Task

</label>

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