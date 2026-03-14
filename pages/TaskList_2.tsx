import React, { useEffect, useState, useContext } from "react";
import { Layout } from "../components/Layout";
import { Store } from "../services/store";
import { Task, UserTask, TaskStatus } from "../types";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, List } from "lucide-react";

const TaskList: React.FC = () => {

const { user } = useContext(UserContext);
const navigate = useNavigate();

const [tab,setTab] = useState<"all" | "inprocess" | "completed">("all");

const [tasks,setTasks] = useState<Task[]>([]);
const [userTasks,setUserTasks] = useState<UserTask[]>([]);

const [loading,setLoading] = useState(true);


// load tasks
useEffect(()=>{

load()

},[])


const load = async()=>{

if(!user) return

setLoading(true)

const allTasks = await Store.getTasks(false)
const startedTasks = await Store.getUserTasks(user.uid)

setTasks(allTasks)
setUserTasks(startedTasks)

setLoading(false)

}


// start task
const startTask = async(task:Task)=>{

if(!user) return

const link = await Store.startTask(user.uid,task.id)

await load()
  alert("Task link: " + (link ? link : "EMPTY"))
    alert(link ? `Opening link:\n${link}` : "Task link is EMPTY")

if(link){

window.open(link,"_blank")

}

}


// redirect to check page
const openTaskCheck = (taskId:string)=>{

navigate(`/taskcheck/${taskId}`)

}


// filter tasks
const startedTaskIds = userTasks.map(t=>t.taskId)

const allTaskList = tasks.filter(t=>!startedTaskIds.includes(t.id))

const inProcessTasks = userTasks.filter(t=>t.status === TaskStatus.IN_PROCESS)

const completedTasks = userTasks.filter(t=>t.status === TaskStatus.COMPLETED)



return (

<Layout>

<div className="max-w-4xl mx-auto p-4">

<h1 className="text-2xl font-bold mb-4">
Tasks
</h1>


{/* Tabs */}

<div className="flex gap-2 mb-6">

<button
onClick={()=>setTab("all")}
className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
tab==="all" ? "bg-blue-600 text-white" : "bg-gray-200"
}`}
>
<List size={16}/> All Tasks
</button>

<button
onClick={()=>setTab("inprocess")}
className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
tab==="inprocess" ? "bg-orange-500 text-white" : "bg-gray-200"
}`}
>
<Clock size={16}/> In Process
</button>

<button
onClick={()=>setTab("completed")}
className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
tab==="completed" ? "bg-green-600 text-white" : "bg-gray-200"
}`}
>
<CheckCircle size={16}/> Completed
</button>

</div>


{/* TASK LIST */}

<div className="grid gap-4">

{loading && <p>Loading tasks...</p>}


{/* ALL TASKS */}

{tab==="all" && allTaskList.map(task=>(

<div
key={task.id}
onClick={()=>startTask(task)}
className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 cursor-pointer border"
>

<h2 className="font-semibold text-lg">
{task.title}
</h2>

<p className="text-sm text-gray-500 mt-1">
Click to start task
</p>

</div>

))}



{/* IN PROCESS */}

{tab==="inprocess" && inProcessTasks.map(userTask=>(

<div
key={userTask.id}
onClick={()=>openTaskCheck(userTask.id)}
className="bg-orange-50 rounded-xl shadow hover:shadow-lg transition p-4 cursor-pointer border border-orange-200"
>

<h2 className="font-semibold text-lg">
Task ID : {userTask.taskId}
</h2>

<p className="text-sm text-gray-600 mt-1">
Task started. Click to verify.
</p>

</div>

))}



{/* COMPLETED */}

{tab==="completed" && completedTasks.map(userTask=>(

<div
key={userTask.id}
className="bg-green-50 rounded-xl shadow p-4 border border-green-200"
>

<h2 className="font-semibold text-lg">
Task ID : {userTask.taskId}
</h2>

<p className="text-sm text-green-700 mt-1">
Completed successfully
</p>

</div>

))}


{/* empty messages */}

{tab==="all" && allTaskList.length===0 && !loading && (
<p className="text-gray-500">No tasks available</p>
)}

{tab==="inprocess" && inProcessTasks.length===0 && (
<p className="text-gray-500">No tasks in process</p>
)}

{tab==="completed" && completedTasks.length===0 && (
<p className="text-gray-500">No completed tasks</p>
)}


</div>

</div>

</Layout>

)

}

export default TaskList
