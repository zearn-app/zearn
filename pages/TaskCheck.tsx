import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Store } from "../services/store";
import { UserContext } from "../App";
import { Task, TaskStatus } from "../types";

const TaskCheck: React.FC = () => {

const { taskId } = useParams<{ taskId: string }>();
const { user } = useContext(UserContext);

const [task,setTask] = useState<Task | null>(null);
const [status,setStatus] = useState<TaskStatus | null>(null);
const [loading,setLoading] = useState(true);

useEffect(()=>{

const load = async()=>{

try{

if(!user || !taskId){
setLoading(false);
return;
}

console.log("TaskId from URL:",taskId);

/* get user task */

const userTasks = await Store.getUserTasks(user.uid);

console.log("UserTasks:",userTasks);

const ut = userTasks.find(t=>t.taskId === taskId);

if(!ut){
console.log("UserTask not found");
setLoading(false);
return;
}

setStatus(ut.status);

/* get task from hidden_tasks */

const hiddenTask = await Store.getHiddenTask(taskId);

console.log("HiddenTask:",hiddenTask);

if(hiddenTask){
setTask(hiddenTask);
setLoading(false);
return;
}

/* fallback: search in tasks */

const std = await Store.getTasks(false);
const spc = await Store.getTasks(true);

const all = [...std,...spc];

const found = all.find(t=>t.id === taskId);

console.log("Task from tasks:",found);

if(found) setTask(found);

}catch(err){
console.error(err);
}

setLoading(false);

};

load();

},[user,taskId]);

/* ---------- UI ---------- */

if(loading){

return(
<Layout>
<div className="p-10 text-center">
Loading task...
</div>
</Layout>
)

}

if(!task){

return(
<Layout>
<div className="p-10 text-center text-red-500">
Task not found
</div>
</Layout>
)

}

return(

<Layout>

<div className="p-6">

<h2 className="text-xl font-bold mb-4">
Task Loaded Successfully
</h2>

<p><b>Task ID:</b> {task.id}</p>
<p><b>Title:</b> {task.title}</p>
<p><b>Status:</b> {status}</p>

</div>

</Layout>

)

}

export default TaskCheck