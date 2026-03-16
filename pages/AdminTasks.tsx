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
link:"",
amount:0,
isSpecial:false,
zipName:"",
zipPassword:"",
innerFileName:"",
packageName:""
})

////////////////////////////////////////////////////
//////////////// LOAD TASKS ////////////////////////
////////////////////////////////////////////////////

const loadTasks = async () => {

setLoading(true)

try{

const t = await Store.getAllTasks()
setTasks(t || [])

}catch(e){

console.error("Load tasks error:",e)

}

setLoading(false)

}

useEffect(()=>{
loadTasks()
},[])

////////////////////////////////////////////////////
//////////////// CREATE ////////////////////////////
////////////////////////////////////////////////////

const openCreate = () => {

setEditingTask(null)

setForm({
title:"",
link:"",
amount:0,
isSpecial:false,
zipName:"",
zipPassword:"",
innerFileName:"",
packageName:""
})

setModal(true)

}

////////////////////////////////////////////////////
//////////////// EDIT //////////////////////////////
////////////////////////////////////////////////////

const openEdit = (task:Task)=>{

setEditingTask(task)

setForm({

title:(task as any).title || "",
link:(task as any).link || "",
amount:(task as any).amount || 0,

isSpecial:(task as any).isSpecial || false,

zipName:(task as any).expectedZipName || "",
zipPassword:(task as any).password || "",
innerFileName:(task as any).expectedInnerFileName || "",

packageName:(task as any).packageName || ""

})

setModal(true)

}

////////////////////////////////////////////////////
//////////////// SAVE //////////////////////////////
////////////////////////////////////////////////////

const saveTask = async (e:React.FormEvent)=>{

e.preventDefault()

try{

if(!form.title.trim()){
alert("Title required")
return
}

if(!form.link.trim()){
alert("Download link required")
return
}

if(form.amount <= 0){
alert("Amount must be greater than 0")
return
}

const payload:any = {
title:form.title.trim(),
link:form.link.trim(),
amount:Number(form.amount),
isSpecial:form.isSpecial
}

if(form.isSpecial){

if(!form.packageName.trim()){
alert("Package name required")
return
}

payload.packageName = form.packageName.trim()

}else{

if(!form.zipName.trim() || !form.zipPassword.trim() || !form.innerFileName.trim()){
alert("ZIP details required")
return
}

payload.expectedZipName = form.zipName.trim()
payload.password = form.zipPassword.trim()
payload.expectedInnerFileName = form.innerFileName.trim()

}

if(editingTask){

await Store.editTask(editingTask.id,payload)

}else{

await Store.createTask(payload)

}

setModal(false)

await loadTasks()

}catch(err){

console.error("Save task error:",err)
alert("Task save failed")

}

}

////////////////////////////////////////////////////
//////////////// DELETE ////////////////////////////
////////////////////////////////////////////////////

const deleteTask = async(id:string)=>{

if(!window.confirm("Delete this task?")) return

try{

await Store.deleteTask(id)

await loadTasks()

}catch(e){

console.error("Delete error:",e)

}

}

////////////////////////////////////////////////////
//////////////// UI ////////////////////////////////
////////////////////////////////////////////////////

return(

<Layout>

<div className="p-4 space-y-4">

<div className="flex justify-between items-center">

<h1 className="text-xl font-bold">
Admin Tasks
</h1>

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

<div className="font-bold">
{t.title}
</div>

<div className="text-xs text-gray-500">
Amount: {(t as any).amount}
</div>

<div className="text-xs">
Type: {(t as any).isSpecial ? "Special Task":"Standard Task"}
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
placeholder="Download Link"
value={form.link}
onChange={e=>setForm({...form,link:e.target.value})}
className="border p-2 rounded w-full"
/>

<input
type="number"
placeholder="Amount"
value={form.amount}
onChange={e=>setForm({...form,amount:Number(e.target.value)})}
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

{!form.isSpecial && (

<>

<input
placeholder="ZIP File Name"
value={form.zipName}
onChange={e=>setForm({...form,zipName:e.target.value})}
className="border p-2 rounded w-full"
/>

<input
placeholder="ZIP Password"
value={form.zipPassword}
onChange={e=>setForm({...form,zipPassword:e.target.value})}
className="border p-2 rounded w-full"
/>

<input
placeholder="Inner File Name"
value={form.innerFileName}
onChange={e=>setForm({...form,innerFileName:e.target.value})}
className="border p-2 rounded w-full"
/>

</>

)}

{form.isSpecial && (

<input
placeholder="Package Name"
value={form.packageName}
onChange={e=>setForm({...form,packageName:e.target.value})}
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