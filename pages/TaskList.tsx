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
const [selectedTask, setSelectedTask] = useState<Task | null>(null)
const [taskLink, setTaskLink] = useState<string | null>(null)
const [showModal, setShowModal] = useState(false)
useEffect(()=>{
 fetchData()
},[user,isSpecial])

const fetchData = async()=>{

 if(!user){
   setLoading(false)
   return
 }

 setLoading(true)

 try{

 const [taskList,userTaskList] = await Promise.all([
   Store.getTasks(isSpecial),
   Store.getUserTasks(user.uid)
 ])

 setTasks(taskList)
 setUserTasks(userTaskList)

 }catch(e){
   console.error(e)
 }

 setLoading(false)

}

/* FAST MAP */

const userTaskMap = useMemo(()=>{
 const map = new Map<string,UserTask>()
 userTasks.forEach(t=>map.set(t.taskId,t))
 return map
},[userTasks])

/* START TASK */

const handleStartTask = async (task: Task) => {
  if (!user) return;
  if (startingTaskId) return;

  const existing = userTaskMap.get(task.id);
  if (existing) {
    setActiveTab("process");
    return;
  }

  setStartingTaskId(task.id);

  try {
    const link = await Store.startTask(user.uid, task);

    await fetchData();

    // ✅ store data for modal
    setSelectedTask(task);
    setTaskLink(link || null);
    setShowModal(true);

    setActiveTab("process");

  } catch (e) {
    console.error(e);
    alert("Error starting task");
  } finally {
    setStartingTaskId(null);
  }
};

/* FILTER */

const filteredTasks = tasks.filter(task=>{

 const entry = userTaskMap.get(task.id)

 if(activeTab==="all")
   return !entry

 if(activeTab==="process")
   return entry && entry.status===TaskStatus.IN_PROCESS

 if(activeTab==="completed")
   return entry && entry.status===TaskStatus.COMPLETED

 return false

})

/* UI */

return (

<Layout title={isSpecial ? "Special Tasks" : "Standard Tasks"} showBack>

{showModal && selectedTask && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white p-6 rounded-2xl w-[90%] max-w-sm">

      <h2 className="text-lg font-bold mb-4 text-center">
        Task Details
      </h2>

      <div className="space-y-3 text-sm">

        <div>
          <span className="font-bold">Task ID:</span>
          <p className="text-gray-600 break-all">{selectedTask.id}</p>
        </div>

        <div>
          <span className="font-bold">Reward:</span>
          <p className="text-green-600 font-bold">
            ₹{selectedTask.reward}
          </p>
        </div>

        <div>
          <span className="font-bold">Link:</span>
          <p className="text-blue-600 break-all">
            {taskLink ? taskLink : "Link is empty"}
          </p>
        </div>

      </div>

      <button
        onClick={() => setShowModal(false)}
        className="w-full mt-5 bg-black text-white py-2 rounded-lg"
      >
        Close
      </button>

    </div>

  </div>
)}

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

{loading && (
<div className="text-center py-10 text-gray-400">
Loading tasks...
</div>
)}

{!loading && (

<div className="space-y-4">

{filteredTasks.length===0 && (
<div className="text-center text-gray-400 py-10">
Empty, There is no task
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
  navigate(`/task-check/${task.id}`)
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
