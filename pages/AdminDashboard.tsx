import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Store } from "../services/store";
import {
  WithdrawalRequest,
  WithdrawalStatus,
  User,
  Task,
  AdminSettings
} from "../types";

import {
  Eye,
  Trash2,
  Edit,
  Plus,
  Ban,
  Unlock,
  Coins,
  Settings,
  User as UserIcon
} from "lucide-react";

import { useNotification } from "../components/NotificationSystem";

const AdminDashboard: React.FC = () => {

  const { notify } = useNotification();

  const [tab,setTab] = useState<"withdrawals"|"users"|"tasks"|"settings">("withdrawals");

  const [withdrawals,setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [users,setUsers] = useState<User[]>([]);
  const [tasks,setTasks] = useState<Task[]>([]);
  const [settings,setSettings] = useState<AdminSettings>();

  const [search,setSearch] = useState("");

  const [selectedUser,setSelectedUser] = useState<User|null>(null);
  const [selectedWithdrawal,setSelectedWithdrawal] = useState<WithdrawalRequest|null>(null);

  const [editingTask,setEditingTask] = useState<Task|null>(null);

  const [newTask,setNewTask] = useState<any>({
    id:"",
    title:"",
    reward:0,
    isSpecial:false,
    expectedZipName:"",
    password:"",
    expectedInnerFileName:""
  });

  useEffect(()=>{
    loadData();
  },[tab]);

  const loadData = async ()=>{
    try{

      const [w,u,t,s] = await Promise.all([
        Store.getWithdrawals(),
        Store.getAllUsers(),
        Store.getAllTasks(true),
        Store.getSettings()
      ]);

      setWithdrawals(w);
      setUsers(u);
      setTasks(t);
      setSettings(s);

    }catch(e){
      console.error(e);
    }
  };

  // --------------------------
  // WITHDRAWAL ACTIONS
  // --------------------------

  const approveWithdrawal = async(id:string)=>{
    if(!window.confirm("Approve this withdrawal?")) return;

    await Store.adminUpdateWithdrawal(id,WithdrawalStatus.PAID_BY_ADMIN);
    notify("Withdrawal approved","success");

    loadData();
  };

  const rejectWithdrawal = async(id:string)=>{
    if(!window.confirm("Reject this withdrawal? Coins will be refunded")) return;

    await Store.adminUpdateWithdrawal(id,WithdrawalStatus.REJECTED);
    notify("Withdrawal rejected","info");

    loadData();
  };

  // --------------------------
  // USER ACTIONS
  // --------------------------

  const toggleBan = async(user:User)=>{

    if(!window.confirm(`${user.isBanned ? "Unban" : "Ban"} this user?`)) return;

    await Store.toggleUserBan(user.uid,user.isBanned);
    notify("User status updated","success");

    loadData();
  };

  const addCoins = async(user:User)=>{
    const coins = prompt("Enter coins to add");

    if(!coins) return;

    await Store.addCoinsToUser(user.uid,Number(coins));

    notify("Coins added successfully","success");

    loadData();
  };

  // --------------------------
  // TASK ACTIONS
  // --------------------------

  const createTask = async()=>{

    if(!newTask.title) return alert("Task title required");

    await Store.createTask(newTask);

    notify("Task created","success");

    setNewTask({
      id:"",
      title:"",
      reward:0,
      isSpecial:false,
      expectedZipName:"",
      password:"",
      expectedInnerFileName:""
    });

    loadData();
  };

  const deleteTask = async(id:string)=>{

    if(!window.confirm("Delete this task?")) return;

    await Store.deleteTask(id);

    notify("Task deleted","info");

    loadData();
  };

  const saveTaskEdit = async()=>{

    if(!editingTask) return;

    await Store.updateTask(editingTask.id,editingTask);

    notify("Task updated","success");

    setEditingTask(null);

    loadData();
  };

  // --------------------------
  // SETTINGS
  // --------------------------

  const saveSettings = async()=>{

    if(!settings) return;

    if(!window.confirm("Save admin settings?")) return;

    await Store.updateSettings(settings);

    notify("Settings updated","success");
  };

  // --------------------------
  // UI
  // --------------------------

  return(
  <Layout>

  <div className="p-6">

  {/* TABS */}

  <div className="flex gap-3 mb-6">

  <button onClick={()=>setTab("withdrawals")} className="btn">Withdrawals</button>
  <button onClick={()=>setTab("users")} className="btn">Users</button>
  <button onClick={()=>setTab("tasks")} className="btn">Tasks</button>
  <button onClick={()=>setTab("settings")} className="btn">Settings</button>

  </div>

  {/* SEARCH */}

  {(tab==="users" || tab==="withdrawals") && (

  <input
  placeholder="Search..."
  className="input mb-4"
  onChange={(e)=>setSearch(e.target.value)}
  />

  )}

  {/* WITHDRAWALS */}

  {tab==="withdrawals" && (

  <div>

  {withdrawals
  .filter(w=>w.id.includes(search))
  .map(w=>(

  <div key={w.id} className="card">

  <div className="flex justify-between">

  <div>

  <p>ID : {w.id}</p>
  <p>Amount : {w.amount}</p>
  <p>Status : {w.status}</p>

  </div>

  <div className="flex gap-2">

  <button onClick={()=>setSelectedWithdrawal(w)}>
  <Eye/>
  </button>

  <button onClick={()=>approveWithdrawal(w.id)}>
  Approve
  </button>

  <button onClick={()=>rejectWithdrawal(w.id)}>
  Reject
  </button>

  </div>

  </div>

  </div>

  ))}

  </div>

  )}

  {/* USERS */}

  {tab==="users" && (

  <div>

  {users
  .filter(u=>u.name.toLowerCase().includes(search.toLowerCase()))
  .map(user=>(

  <div key={user.uid} className="card flex justify-between">

  <div>

  <p>{user.name}</p>
  <p>{user.phone}</p>

  </div>

  <div className="flex gap-2">

  <button onClick={()=>setSelectedUser(user)}>
  <UserIcon/>
  </button>

  <button onClick={()=>addCoins(user)}>
  <Coins/>
  </button>

  <button onClick={()=>toggleBan(user)}>
  {user.isBanned ? <Unlock/> : <Ban/>}
  </button>

  </div>

  </div>

  ))}

  </div>

  )}

  {/* TASKS */}

  {tab==="tasks" && (

  <div>

  {/* CREATE TASK */}

  <div className="card mb-6">

  <h3>Create New Task</h3>

  <input placeholder="Task ID"
  onChange={(e)=>setNewTask({...newTask,id:e.target.value})}/>

  <input placeholder="Title"
  onChange={(e)=>setNewTask({...newTask,title:e.target.value})}/>

  <input placeholder="Reward"
  type="number"
  onChange={(e)=>setNewTask({...newTask,reward:Number(e.target.value)})}/>

  <input placeholder="Zip Name"
  onChange={(e)=>setNewTask({...newTask,expectedZipName:e.target.value})}/>

  <input placeholder="Password"
  onChange={(e)=>setNewTask({...newTask,password:e.target.value})}/>

  <input placeholder="Inner File Name"
  onChange={(e)=>setNewTask({...newTask,expectedInnerFileName:e.target.value})}/>

  <button onClick={createTask}>
  <Plus/> Create Task
  </button>

  </div>

  {/* TASK LIST */}

  {tasks.map(task=>(

  <div key={task.id} className="card flex justify-between">

  <div>

  <p>{task.title}</p>
  <p>Reward : {task.reward}</p>

  </div>

  <div className="flex gap-2">

  <button onClick={()=>setEditingTask(task)}>
  <Edit/>
  </button>

  <button onClick={()=>deleteTask(task.id)}>
  <Trash2/>
  </button>

  </div>

  </div>

  ))}

  </div>

  )}

  {/* SETTINGS */}

  {tab==="settings" && settings && (

  <div className="card">

  <h3>Admin Settings</h3>

  <label>Minimum Withdrawal</label>
  <input
  value={settings.minWithdrawal}
  onChange={(e)=>setSettings({...settings,minWithdrawal:Number(e.target.value)})}
  />

  <label>Daily Claim Reward</label>
  <input
  value={settings.dailyClaimLimit}
  onChange={(e)=>setSettings({...settings,dailyClaimLimit:Number(e.target.value)})}
  />

  <label>Jackpot Entry Amount</label>
  <input
  value={settings.randomWinnerEntryFee}
  onChange={(e)=>setSettings({...settings,randomWinnerEntryFee:Number(e.target.value)})}
  />

  <label>Admin Password</label>
  <input
  value={settings.adminPassword}
  onChange={(e)=>setSettings({...settings,adminPassword:e.target.value})}
  />

  <button onClick={saveSettings}>
  <Settings/> Save Settings
  </button>

  </div>

  )}

  </div>

  </Layout>
  );
};

export default AdminDashboard;
