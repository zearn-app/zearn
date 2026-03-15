import React, { useState, useEffect, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Store } from "../services/store";
import { Task, UserTask, TaskStatus } from "../types";
import { UserContext } from "../App";
import { ChevronRight, CheckCircle, Download, Gem } from "lucide-react";

const TaskList: React.FC = () => {

const { type } = useParams<{ type: string }>();
const isSpecial = type === "special";

const { user } = useContext(UserContext);
const navigate = useNavigate();

const [activeTab,setActiveTab] = useState<"all"|"process"|"completed">("all");

const [tasks,setTasks] = useState<Task[]>([]);
const [userTasks,setUserTasks] = useState<UserTask[]>([]);

const [loading,setLoading] = useState(true);
const [startingTaskId,setStartingTaskId] = useState<string | null>(null);

useEffect(()=>{
 fetchData()
},[user,isSpecial])

const fetchData = async()=>{

 if(!user) return

 setLoading(true)

 const [taskList,userTaskList] = await Promise.all([
   Store.getTasks(isSpecial),
   Store.getUserTasks(user.uid)
 ])

 setTasks(taskList)
 setUserTasks(userTaskList)

 setLoading(false)

}

/* ---------- FAST LOOKUP ---------- */

const userTaskMap = useMemo(()=>{
 const map = new Map<string,UserTask>()
 userTasks.forEach(t=>map.set(t.taskId,t))
 return map
},[userTasks])

/* ---------- START TASK ---------- */

const handleStartTask = async(task:Task)=>{

 if(!user) return
 if(startingTaskId) return

 try{

   setStartingTaskId(task.id)

   const link = await Store.startTask(user.uid,task.id)

   await fetchData()

   if(link){

     let url = link

     if(!link.startsWith("http")){
       url = "https://" + link
     }

     window.open(url,"_blank")

   }else{
     alert("Task link not available")
   }

   setActiveTab("process")

 }catch(e){
   console.error(e)
   alert("Error starting task")
 }

 setStartingTaskId(null)

}

/* ---------- FILTER TASKS ---------- */

const filteredTasks = tasks.filter(task=>{

 const entry = userTaskMap.get(task.id)

 if(activeTab==="all") return !entry

 if(activeTab==="process")
   return entry && entry.status===TaskStatus.IN_PROCESS

 if(activeTab==="completed")
   return entry && entry.status===TaskStatus.COMPLETED

 return false

})

/* ---------- FIND USERTASK ---------- */

const getUserTask = (taskId:string)=>{
 return userTasks.find(t=>t.taskId===taskId)
}

/* ---------- UI ---------- */

return (

<Layout title={isSpecial ? "Special Tasks" : "Standard Tasks"} showBack>

{/* Tabs */}

<div className="flex bg-gray-100 p-1 rounded-xl mb-6">

<button
onClick={()=>setActiveTab("all")}
className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
activeTab==="all"
? "bg-white shadow text-black"
: "text-gray-500"
}`}
>
All Tasks
</button>

<button
onClick={()=>setActiveTab("process")}
className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
activeTab==="process"
? "bg-white shadow text-black"
: "text-gray-500"
}`}
>
In Process
</button>

<button
onClick={()=>setActiveTab("completed")}
className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
activeTab==="completed"
? "bg-white shadow text-black"
: "text-gray-500"
}`}
>
Completed
</button>

</div>

{/* Loading */}

{loading && (
<div className="text-center py-10 text-gray-400">
Loading tasks...
</div>
)}

{/* Task List */}

{!loading && (

<div className="space-y-4">

{filteredTasks.length===0 && (

<div className="text-center text-gray-400 py-10">
No tasks here
</div>

)}

{filteredTasks.map(task=>{

const entry = userTaskMap.get(task.id)

return (

<div
key={task.id}
onClick={()=>{

 if(activeTab==="all"){
   handleStartTask(task)
 }
else if(activeTab==="process"){
  navigate(`/taskcheck/${task.id}`)
}

}}
className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between cursor-pointer active:scale-[0.98] transition"
>

<div className="flex-1">

<h3 className="font-bold text-gray-800 line-clamp-1">
{task.title}
</h3>

<div className="flex items-center space-x-3 mt-2">

<span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
₹{task.reward}
</span>

{task.diamondReward>0 && (
<span className="flex items-center text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">
<Gem size={10} className="mr-1"/>
{task.diamondReward}
</span>
)}

</div>

</div>

<div className="pl-4">

{activeTab==="all" && (
<div className="bg-gray-900 text-white p-2 rounded-full">
<Download size={16}/>
</div>
)}

{activeTab==="process" && (
<div className="bg-blue-100 text-blue-600 p-2 rounded-full">
<ChevronRight size={16}/>
</div>
)}

{activeTab==="completed" && (
<div className="bg-green-100 text-green-600 p-2 rounded-full">
<CheckCircle size={16}/>
</div>
)}

</div>

</div>

)

})}

</div>

)}

</Layout>

)

}

export default TaskList
