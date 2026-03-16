import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Store } from "../services/store";
import { UserContext } from "../App";
import { Task, TaskStatus } from "../types";
import { Check, AlertCircle, FileArchive, Smartphone, Info } from "lucide-react";
import { useNotification } from "../components/NotificationSystem";

import { ZipReader, BlobReader, TextWriter } from "@zip.js/zip.js";

const TaskCheck: React.FC = () => {

const { taskId } = useParams<{ taskId: string }>();
const { user, refreshUser } = useContext(UserContext);
const navigate = useNavigate();
const { notify } = useNotification();

const [task,setTask] = useState<Task | null>(null);
const [status,setStatus] = useState<TaskStatus>(TaskStatus.IN_PROCESS);
const [fileSelected,setFileSelected] = useState<File | null>(null);
const [isVerifying,setIsVerifying] = useState(false);
const [timeLeft,setTimeLeft] = useState(0);
const [loading,setLoading] = useState(true);


/* ---------------- LOAD TASK ---------------- */

useEffect(()=>{

const loadTask = async()=>{

if(!user || !taskId) return

setLoading(true)

try{

const userTasks = await Store.getUserTasks(user.uid)

const ut = userTasks.find(t=>t.taskId===taskId)

if(!ut){
notify("Task not found","error")
navigate("/tasks/standard")
return
}

setStatus(ut.status)

/* load hidden task */

let taskData = await Store.getHiddenTask(taskId)

/* fallback */

if(!taskData){

const std = await Store.getTasks(false)
const spc = await Store.getTasks(true)

const all=[...std,...spc]

taskData = all.find(t=>t.id===taskId) || null
}

if(!taskData){
notify("Task data missing","error")
navigate("/tasks/standard")
return
}

setTask(taskData)

}catch(err){

console.error(err)
notify("Failed to load task","error")

}

setLoading(false)

}

loadTask()

},[user,taskId])



/* ---------------- TIMER ---------------- */

useEffect(()=>{

if(timeLeft>0){

const timer=setTimeout(()=>setTimeLeft(timeLeft-1),1000)

return ()=>clearTimeout(timer)

}

},[timeLeft])



/* ---------------- FILE SELECT ---------------- */

const handleFileChange=(e:React.ChangeEvent<HTMLInputElement>)=>{

if(!e.target.files) return

const file=e.target.files[0]

if(task?.isSpecial){

if(!file.name.toLowerCase().endsWith(".apk")){
notify("Only .apk allowed","error")
return
}

}else{

if(!file.name.toLowerCase().endsWith(".zip")){
notify("Only .zip allowed","error")
return
}

}

setFileSelected(file)
setTimeLeft(5)

}



/* ---------------- VERIFY ---------------- */

const handleCheck = async()=>{

if(!user || !task || !fileSelected){
notify("Upload required file","error")
return
}

setIsVerifying(true)

try{

await new Promise(r=>setTimeout(r,1500))


/* ZIP VALIDATION */

if(!task.isSpecial){

/* check zip filename */

if(!fileSelected.name.toLowerCase().includes(task.expectedZipName.toLowerCase())){
throw new Error("Zip name invalid")
}

const reader=new ZipReader(
new BlobReader(fileSelected),
{password:task.password || undefined}
)

const entries=await reader.getEntries()

if(!entries || entries.length===0){
throw new Error("Zip empty")
}

/* check inner file */

const inner=entries.find(e=>
e.filename.toLowerCase().includes(
task.expectedInnerFileName.toLowerCase()
)
)

if(!inner){
await reader.close()
throw new Error("Required file missing")
}

await inner.getData(new TextWriter())

await reader.close()

}


/* COMPLETE TASK */

const result = await Store.verifyTaskComplete(
user.uid,
task
)

if(!result.success) throw new Error(result.message)

notify("Verification successful!","success")

refreshUser()

navigate("/tasks/"+(task.isSpecial ? "special":"standard"))

}catch(err){

console.error(err)

setStatus(TaskStatus.FAILED)

await Store.verifyTaskFail(
user.uid,
taskId as string
)

notify("Verification failed","error")

}

setIsVerifying(false)

}



/* ---------------- UI ---------------- */

if(loading){

return(
<Layout>
<div className="text-center py-20 text-gray-400">
Loading task...
</div>
</Layout>
)

}

if(!task){

return(
<Layout>
<div className="text-center py-20 text-red-500">
Task not found
</div>
</Layout>
)

}



/* ---------------- PAGE ---------------- */

return(

<Layout>

<div className="bg-gray-900 text-white p-6 rounded-2xl text-center mb-6">

<h2 className="text-xl font-bold">

{task.isSpecial ? "Upload APK File" : "Upload ZIP File"}

</h2>

</div>

<div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 flex">

<Info size={20} className="text-blue-500 mr-2"/>

<p className="text-xs text-blue-800">
Upload file downloaded from task link.
</p>

</div>


{status===TaskStatus.COMPLETED && (

<div className="text-center bg-green-50 border border-green-200 p-10 rounded-xl">

<Check size={60} className="mx-auto text-green-600 mb-3"/>

<h3 className="font-bold text-green-700">
Task Completed
</h3>

</div>

)}


{status!==TaskStatus.COMPLETED && status!==TaskStatus.FAILED && (

<>

<div className="border-2 border-dashed p-10 rounded-xl text-center relative">

<input
type="file"
accept={task.isSpecial ? ".apk" : ".zip"}
className="absolute inset-0 opacity-0 cursor-pointer"
onChange={handleFileChange}
/>

<div className="flex flex-col items-center">

{task.isSpecial
? <Smartphone size={32}/>
: <FileArchive size={32}/>
}

<p className="mt-3 text-sm font-bold">
{fileSelected ? fileSelected.name : "Tap to upload file"}
</p>

</div>

</div>


{fileSelected && (

<div className="flex justify-between mt-4 bg-white border p-3 rounded-lg">

<span className="text-sm font-bold">File Ready</span>

{timeLeft>0
? <span className="text-orange-500">Analyzing {timeLeft}s</span>
: <span className="text-green-600">Ready</span>
}

</div>

)}


<button
onClick={handleCheck}
disabled={isVerifying || !fileSelected || timeLeft>0}
className="w-full mt-6 bg-blue-600 text-white font-bold py-4 rounded-xl"
>

{isVerifying ? "Verifying..." : "Check & Verify"}

</button>

</>

)}


{status===TaskStatus.FAILED && (

<div className="text-center bg-red-50 border border-red-200 p-6 rounded-xl">

<AlertCircle className="mx-auto text-red-500 mb-2"/>

<p className="text-red-600 text-sm">
Verification failed.
</p>

</div>

)}


/* DEBUG */

<div className="mt-10 p-4 bg-black text-green-400 text-xs rounded-xl overflow-auto">
<pre>{JSON.stringify(task,null,2)}</pre>
</div>

</Layout>

)

}

export default TaskCheck