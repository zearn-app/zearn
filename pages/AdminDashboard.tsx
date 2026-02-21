
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Store } from '../services/store';
import { WithdrawalRequest, WithdrawalStatus, AdminSettings, User, Task, UserTask, TaskStatus, WithdrawalMethod } from '../types';
import { useNotification } from '../components/NotificationSystem';
import { Trash2, Plus, Eye, X, User as UserIcon, Phone, MapPin, Mail, Calendar, CreditCard, Smartphone, Building2, Copy, Check, Settings as SettingsIcon, Shield, Coins, Loader2, Edit, BarChart2, Ban, Unlock } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { notify } = useNotification();
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'users' | 'tasks' | 'settings'>('withdrawals');
  
  // Data State
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskStats, setTaskStats] = useState<Record<string, { completed: number, failed: number }>>({});
  const [settings, setSettings] = useState<AdminSettings>({
      tapCount: 5, adminPassword: 'admin', dailyClaimLimit: 10, minWithdrawal: 50, randomWinnerEntryFee: 20
  });

  // Loading States
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Task Creation/Edit State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({ isSpecial: false });

  // User Progress View State
  const [selectedUserForProgress, setSelectedUserForProgress] = useState<User | null>(null);
  const [userProgressTasks, setUserProgressTasks] = useState<(UserTask & { title: string, reward: number })[]>([]);

  // Payment State
  const [paymentModalReq, setPaymentModalReq] = useState<{req: WithdrawalRequest, user: User} | null>(null);

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const refreshData = async () => {
    try {
        const [r, u, t, s, ts] = await Promise.all([
            Store.getWithdrawals(),
            Store.getAllUsers(),
            Store.getAllTasks(true), // Force refresh tasks
            Store.getSettings(),
            Store.getTaskStats()
        ]);
        setRequests(r);
        setUsers(u);
        setTasks(t);
        setSettings(s);
        setTaskStats(ts);
    } catch(e) {
        console.error("Data refresh failed", e);
    }
  };

  // --- Withdrawal Logic ---
  const handleUpdateStatus = async (id: string, status: WithdrawalStatus) => {
    if (status === WithdrawalStatus.REJECTED) {
        if (!window.confirm("Are you sure you want to REJECT this request? Balance will be refunded.")) return;
    }
    await Store.adminUpdateWithdrawal(id, status);
    notify(`Request updated`, 'info');
    refreshData();
  };

  const initiatePayment = (req: WithdrawalRequest) => {
      const user = users.find(u => u.uid === req.uid);
      if(!user) return;
      setPaymentModalReq({ req, user });
  };

  const handlePaymentAction = async (appName: string) => {
      if(!paymentModalReq) return;
      if (!window.confirm("Confirm marking this request as PAID?")) return;
      
      const { user, req } = paymentModalReq;
      
      const copyText = req.details; 

      navigator.clipboard.writeText(copyText).then(() => {
           notify(`Copied Details`, 'success');
      });
      
      await Store.adminUpdateWithdrawal(req.id, WithdrawalStatus.PAID_BY_ADMIN);
      
      setPaymentModalReq(null);
      refreshData();
      notify(`Marked as Paid`, 'success');
  };

  const getRequestUser = (uid: string) => users.find(u => u.uid === uid);

  // --- Settings Logic ---
  const handleSaveSettings = async () => {
    if (!window.confirm("Are you sure you want to save these settings?")) return;
    
    setIsSavingSettings(true);
    try {
        await Store.updateSettings(settings);
        notify("Configuration Saved Successfully", 'success');
        await refreshData();
    } catch (e: any) {
        console.error(e);
        notify("Failed to save settings: " + (e.message || "Unknown error"), 'error');
    } finally {
        setIsSavingSettings(false);
    }
  };

  const handleChangeSetting = (key: keyof AdminSettings, val: string | number) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  // --- Task Logic ---
  const handleDeleteTask = async (id: string) => {
    if(window.confirm("Are you sure you want to DELETE this task?")) {
      await Store.deleteTask(id);
      notify("Task deleted", 'info');
      // small delay to allow Firestore to propagate
      setTimeout(refreshData, 500); 
    }
  };

  const openEditTask = (task: Task) => {
      setEditingTask(task);
      setNewTask({ ...task });
      setShowTaskModal(true);
  };

  const openCreateTask = () => {
      setEditingTask(null);
      setNewTask({ isSpecial: false, title: '', description: '', link: '', reward: 0, diamondReward: 0, password: '', packageName: '' });
      setShowTaskModal(true);
  };

  const handleSaveTask = async () => {
    // Basic validation in component before sending to Store
    if(!newTask.title) return notify("Title required", 'error');
    if(!newTask.link) return notify("Link required", 'error');
    if(newTask.reward === undefined || newTask.reward < 0) return notify("Valid Reward required", 'error');

    if (!window.confirm(editingTask ? "Update this task?" : "Create this task?")) return;

    setIsCreatingTask(true);

    try {
        if (editingTask) {
             await Store.updateTask(editingTask.id, newTask);
             notify(`Task "${newTask.title}" updated`, 'success');
        } else {
             await Store.createTask(newTask);
             notify(`Task "${newTask.title}" created`, 'success');
        }
        
        await refreshData();
        setShowTaskModal(false);
        setNewTask({});
    } catch (error: any) {
        console.error(error);
        notify(error.message || "Failed to save task.", 'error');
    } finally {
        setIsCreatingTask(false);
    }
  };

  // --- User Logic ---
  const handleViewProgress = async (user: User) => {
    const progress = await Store.getUserTasks(user.uid);
    const allTasks = await Store.getAllTasks();
    
    const detailed = progress.map(p => {
        const t = allTasks.find(at => at.id === p.taskId);
        return {
            ...p,
            title: t ? t.title : 'Unknown Task',
            reward: t ? t.reward : 0
        };
    });

    setUserProgressTasks(detailed);
    setSelectedUserForProgress(user);
  };

  const toggleBan = async (user: User) => {
      if (!window.confirm(`Are you sure you want to ${user.isBanned ? 'UNBAN' : 'BAN'} ${user.name}?`)) return;
      await Store.toggleUserBan(user.uid, !!user.isBanned);
      notify(`User ${user.isBanned ? 'Unbanned' : 'Banned'}`, 'success');
      refreshData();
  };

  return (
    <Layout>
      {/* Tab Nav */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
        {['withdrawals', 'users', 'tasks', 'settings'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)} 
            className={`flex-1 min-w-[100px] py-2.5 rounded-lg font-bold text-sm capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- WITHDRAWALS TAB --- */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {requests.length === 0 && <p className="text-center text-gray-400 py-10 bg-white rounded-xl">No pending requests.</p>}
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
             <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                 <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {requests.map(req => {
                    const reqUser = getRequestUser(req.uid);
                    return (
                        <tr key={req.id}>
                            <td className="p-4">
                                <div className="font-bold">{reqUser?.name || 'Unknown'}</div>
                                <div className="text-xs text-gray-400">{reqUser?.email}</div>
                            </td>
                            <td className="p-4 font-mono font-bold text-blue-600">{req.amount}</td>
                            <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{req.method}</span></td>
                            <td className="p-4 text-xs font-mono max-w-xs truncate" title={req.details}>{req.details}</td>
                            <td className="p-4">
                               <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                                   req.status === WithdrawalStatus.PENDING ? 'bg-yellow-50 text-yellow-600' : 
                                   req.status === WithdrawalStatus.COMPLETED ? 'bg-green-50 text-green-600' : 
                                   req.status === WithdrawalStatus.PAID_BY_ADMIN ? 'bg-blue-50 text-blue-600' :
                                   'bg-red-50 text-red-600'
                                }`}>
                                 {req.status.replace(/_/g, ' ')}
                               </span>
                            </td>
                            <td className="p-4">
                                {req.status === WithdrawalStatus.PENDING && (
                                     <div className="flex space-x-2">
                                        <button onClick={() => initiatePayment(req)} className="bg-gray-900 text-white p-2 rounded-lg hover:bg-black" title="Process Payment"><CreditCard size={14}/></button>
                                        <button onClick={() => handleUpdateStatus(req.id, WithdrawalStatus.REJECTED)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100" title="Reject"><X size={14}/></button>
                                     </div>
                                )}
                            </td>
                        </tr>
                    );
                 })}
               </tbody>
             </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-3">
             {requests.map(req => {
                const reqUser = getRequestUser(req.uid);
                return (
                  <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex items-start space-x-3">
                         <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mt-1 font-bold">
                            {reqUser?.name?.[0] || 'U'}
                         </div>
                         <div>
                           <h4 className="font-bold text-gray-900 text-sm">{reqUser?.name || 'Unknown User'}</h4>
                           <p className="text-xs text-blue-600 font-medium">{req.amount} Coins</p>
                         </div>
                       </div>
                       <div className="text-right">
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded block mb-1 ${
                                   req.status === WithdrawalStatus.PENDING ? 'bg-yellow-50 text-yellow-600' : 
                                   req.status === WithdrawalStatus.COMPLETED ? 'bg-green-50 text-green-600' : 
                                   req.status === WithdrawalStatus.PAID_BY_ADMIN ? 'bg-blue-50 text-blue-600' :
                                   'bg-red-50 text-red-600'
                                }`}>
                                 {req.status.replace(/_/g, ' ')}
                           </span>
                       </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-700 mb-3 font-mono break-all border border-gray-100">
                        {req.details}
                    </div>
                    {req.status === WithdrawalStatus.PENDING && (
                         <div className="flex space-x-2">
                            <button onClick={() => handleUpdateStatus(req.id, WithdrawalStatus.REJECTED)} className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-lg font-bold text-xs hover:bg-red-100 transition">Reject</button>
                            <button onClick={() => initiatePayment(req)} className="flex-[2] bg-gray-900 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-black transition flex items-center justify-center shadow-lg shadow-blue-100"><CreditCard size={12} className="mr-1"/> Process Payment</button>
                         </div>
                    )}
                  </div>
                );
             })}
          </div>
        </div>
      )}

      {/* --- USERS TAB --- */}
      {activeTab === 'users' && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm font-medium mb-2 border border-blue-100 flex justify-between items-center">
            <span>Total Registered Users</span>
            <span className="font-bold text-xl">{users.length}</span>
          </div>
          {users.map(u => (
            <div key={u.uid} className={`bg-white p-4 rounded-xl shadow-sm border ${u.isBanned ? 'border-red-200 bg-red-50' : 'border-gray-100'} flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${u.isBanned ? 'bg-red-200 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                  {u.name[0]?.toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm flex items-center">
                      {u.name}
                      {u.isBanned && <span className="ml-2 bg-red-600 text-white text-[10px] px-1.5 rounded uppercase">Banned</span>}
                  </h4>
                  <div className="flex space-x-2 text-xs text-gray-500">
                      <span>{u.balance} Coins</span>
                      <span>•</span>
                      <span>{u.diamonds} Diamonds</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                 <button 
                    onClick={() => toggleBan(u)}
                    className={`p-2 rounded-lg transition ${u.isBanned ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600'}`}
                    title={u.isBanned ? "Unban User" : "Ban User"}
                 >
                    {u.isBanned ? <Unlock size={14}/> : <Ban size={14}/>}
                 </button>
                 <button 
                    onClick={() => handleViewProgress(u)}
                    className="text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded-lg font-bold hover:bg-blue-100 transition flex items-center space-x-1"
                 >
                    <Eye size={14} /> <span>View</span>
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- TASKS TAB --- */}
      {activeTab === 'tasks' && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <button 
            onClick={openCreateTask}
            className="w-full py-3 mb-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md hover:bg-black transition"
          >
             <Plus size={18} /> <span>Assign New Task</span>
          </button>
          
          <div className="space-y-3">
            {tasks.map(t => {
                const stats = taskStats[t.id] || { completed: 0, failed: 0 };
                return (
                  <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                     <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-bold text-gray-800 text-sm">{t.title}</h4>
                                {t.isSpecial && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded">Special</span>}
                            </div>
                            <p className="text-xs text-gray-500 mb-1 line-clamp-1">{t.description}</p>
                            <div className="flex space-x-2">
                                <div className="text-xs font-mono text-green-600 bg-green-50 inline-block px-1.5 py-0.5 rounded border border-green-100">₹ {t.reward}</div>
                                {t.diamondReward > 0 && <div className="text-xs font-mono text-cyan-600 bg-cyan-50 inline-block px-1.5 py-0.5 rounded border border-cyan-100">💎 {t.diamondReward}</div>}
                            </div>
                        </div>
                        <div className="flex space-x-1">
                            <button onClick={() => openEditTask(t)} className="text-gray-400 hover:text-blue-600 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition" title="Edit Task"><Edit size={16}/></button>
                            <button onClick={() => handleDeleteTask(t.id)} className="text-gray-400 hover:text-red-600 p-2 bg-gray-50 rounded-lg hover:bg-red-50 transition" title="Delete Task"><Trash2 size={16}/></button>
                        </div>
                     </div>
                     <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                           <BarChart2 size={12} className="text-gray-400"/>
                           <span>Stats:</span>
                        </div>
                        <div className="flex space-x-3 font-bold">
                            <span className="text-green-600">{stats.completed} Done</span>
                            <span className="text-red-400">{stats.failed} Failed</span>
                        </div>
                     </div>
                  </div>
                );
            })}
          </div>
        </div>
      )}

      {/* --- SETTINGS TAB (REDESIGNED) --- */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          {/* Economy Section */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex items-center mb-4 text-gray-800">
                 <div className="bg-green-100 p-2 rounded-lg mr-3 text-green-600"><Coins size={20} /></div>
                 <h3 className="font-bold">App Economy</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Daily Bonus (Coins)</label>
                    <input 
                    type="number" 
                    placeholder="Daily Bonus (Coins)"
                    value={settings.dailyClaimLimit}
                    onChange={(e) => handleChangeSetting('dailyClaimLimit', Number(e.target.value) || 0)}
                    className="w-full bg-white border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-green-200 outline-none font-bold text-gray-800"
                    />
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Min Withdrawal (₹)</label>
                    <input 
                    type="number" 
                    placeholder='50'
                    value={settings.minWithdrawal}
                    onChange={(e) => handleChangeSetting('minWithdrawal', Number(e.target.value) || 0)}
                    className="w-full bg-white border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-green-200 outline-none font-bold text-gray-800"
                    />
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Jackpot Entry Fee (₹)</label>
                    <input 
                    type="number" 
                    placeholder='Amount'
                    value={settings.randomWinnerEntryFee}
                    onChange={(e) => handleChangeSetting('randomWinnerEntryFee', Number(e.target.value) || 0)}
                    className="w-full bg-white border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-green-200 outline-none font-bold text-gray-800"
                    />
                </div>
             </div>
          </div>

          {/* Security Section */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex items-center mb-4 text-gray-800">
                 <div className="bg-red-100 p-2 rounded-lg mr-3 text-red-600"><Shield size={20} /></div>
                 <h3 className="font-bold">Security & Access</h3>
             </div>
             
             <div className="space-y-4">
                 <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Admin Dashboard Password</label>
                    <input 
                      type="text" 
                      placeholder='Enter password'
                      value={settings.adminPassword}
                      onChange={(e) => handleChangeSetting('adminPassword', e.target.value)}
                      className="w-full bg-white border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-red-200 outline-none font-mono text-gray-800 tracking-wide"
                    />
                 </div>
                 <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Login Tap Secret (Taps on 'Z')</label>
                    <input 
                    type="number" 
                     placeholder='Number of taps'
                    value={settings.tapCount}
                    onChange={(e) => handleChangeSetting('tapCount', Number(e.target.value) || 0)}
                    className="w-full bg-white border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-red-200 outline-none font-bold text-gray-800"
                    />
                 </div>
             </div>
          </div>

          <button 
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className={`w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 ${isSavingSettings ? 'opacity-75 cursor-wait' : 'hover:bg-black active:scale-95'}`}
          >
            {isSavingSettings ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
            <span>{isSavingSettings ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Pay Modal */}
      {paymentModalReq && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Process Payment</h3>
                  <button onClick={() => setPaymentModalReq(null)} title="Close"><X className="text-gray-400 hover:text-gray-600"/></button>
               </div>
               
               <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                  <p className="text-xs text-blue-500 font-bold uppercase mb-2">Payment Details</p>
                  <div className="text-sm font-mono bg-white p-3 rounded-lg border border-blue-200 text-gray-800 break-all leading-relaxed shadow-sm">
                      {paymentModalReq.req.details}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-blue-200/50">
                      <span className="font-bold text-gray-600">Amount to Pay</span>
                      <span className="font-bold text-blue-700 text-2xl">₹{paymentModalReq.req.amount}</span>
                  </div>
               </div>

               <div className="space-y-3">
                   <p className="text-xs text-center text-gray-400">Action will mark request as 'Paid by Admin'</p>
                   <button onClick={() => handlePaymentAction('Manual')} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-black transition shadow-lg">
                       <Check size={18} />
                       <span>Copy Details & Mark Paid</span>
                   </button>
               </div>
            </div>
         </div>
      )}
      
      {/* Create/Edit Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold">{editingTask ? "Edit Task" : "Assign New Task"}</h3>
                 <button onClick={() => setShowTaskModal(false)} title="Close"><X className="text-gray-400 hover:text-gray-600"/></button>
              </div>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                 <input className="w-full border p-3 rounded-xl" placeholder="Task Title" value={newTask.title || ''} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                 <textarea className="w-full border p-3 rounded-xl" placeholder="Description" value={newTask.description || ''} onChange={e => setNewTask({...newTask, description: e.target.value})} />
                 <div className="grid grid-cols-2 gap-3">
                    <input 
                        className="w-full border p-3 rounded-xl" 
                        type="number" 
                        placeholder="Reward ₹" 
                        value={newTask.reward || ''} 
                        onChange={e => setNewTask({...newTask, reward: parseFloat(e.target.value)})} 
                    />
                    <input 
                        className="w-full border p-3 rounded-xl" 
                        type="number" 
                        placeholder="Reward 💎" 
                        value={newTask.diamondReward || ''} 
                        onChange={e => setNewTask({...newTask, diamondReward: parseFloat(e.target.value)})} 
                    />
                 </div>
                 <input className="w-full border p-3 rounded-xl" placeholder="Link URL" value={newTask.link || ''} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                 
                 <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <input type="checkbox" checked={newTask.isSpecial} placeholder="Is Special Task?" onChange={e => setNewTask({...newTask, isSpecial: e.target.checked})} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"/>
                    <label className="font-bold text-sm text-gray-700">Is Special Task?</label>
                 </div>

                 {!newTask.isSpecial ? (
                    <input className="w-full border p-3 rounded-xl font-mono text-sm" placeholder="ZIP Password (verification)" value={newTask.password || ''} onChange={e => setNewTask({...newTask, password: e.target.value})} />
                 ) : (
                    <input className="w-full border p-3 rounded-xl font-mono text-sm" placeholder="Package Name (e.g. com.game.app)" value={newTask.packageName || ''} onChange={e => setNewTask({...newTask, packageName: e.target.value})} />
                 )}
                 
                 <button 
                    onClick={handleSaveTask} 
                    disabled={isCreatingTask}
                    className={`w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex justify-center items-center space-x-2 ${isCreatingTask ? 'opacity-70 cursor-wait' : ''}`}
                 >
                    {isCreatingTask && <Loader2 className="animate-spin" size={18} />}
                    <span>{isCreatingTask ? 'Saving...' : (editingTask ? 'Update Task' : 'Create Task')}</span>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* User Details & Progress Modal */}
      {selectedUserForProgress && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
               <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">User Profile</h3>
                    <p className="text-xs text-gray-500">View details and task status</p>
                  </div>
                  <button onClick={() => setSelectedUserForProgress(null)} className="p-1 hover:bg-gray-100 rounded-full" title="Close"><X className="text-gray-400 hover:text-gray-600"/></button>
               </div>
               
               <div className="flex-1 overflow-y-auto">
                  {/* User Personal Details */}
                  <div className="bg-blue-50 p-4 rounded-xl mb-6 space-y-2 border border-blue-100">
                     <div className="flex items-center space-x-3 text-sm">
                        <UserIcon size={16} className="text-blue-500" />
                        <span className="font-bold text-gray-700">{selectedUserForProgress.name}</span>
                        {selectedUserForProgress.isBanned && <span className="text-xs bg-red-600 text-white px-2 rounded font-bold uppercase">Banned</span>}
                     </div>
                     <div className="flex items-center space-x-3 text-sm">
                        <Mail size={16} className="text-blue-500" />
                        <span className="text-gray-600">{selectedUserForProgress.email}</span>
                     </div>
                     <div className="flex items-center space-x-3 text-sm">
                        <Phone size={16} className="text-blue-500" />
                        <span className="text-gray-600">{selectedUserForProgress.mobile || 'N/A'}</span>
                     </div>
                     <div className="flex items-center space-x-3 text-sm">
                        <MapPin size={16} className="text-blue-500" />
                        <span className="text-gray-600">
                           {[selectedUserForProgress.district, selectedUserForProgress.state, selectedUserForProgress.country].filter(Boolean).join(', ')}
                        </span>
                     </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <Calendar size={16} className="text-blue-500" />
                        <span className="text-gray-600">DOB: {selectedUserForProgress.dob || 'N/A'}</span>
                     </div>
                  </div>

                  <h4 className="font-bold text-gray-800 text-sm mb-3">Task History</h4>
                  <div className="space-y-2">
                     {userProgressTasks.length === 0 && <p className="text-center text-gray-400 py-4 text-sm bg-gray-50 rounded-lg">No tasks started yet.</p>}
                     {userProgressTasks.map((t, idx) => (
                         <div key={idx} className="bg-white p-3 rounded-lg flex justify-between items-center border border-gray-200">
                            <div>
                               <p className="font-bold text-sm text-gray-800">{t.title}</p>
                               <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-gray-500">{new Date(t.startedAt).toLocaleDateString()}</span>
                                  <span className="text-xs bg-gray-100 border border-gray-200 px-1.5 rounded text-gray-600">+{t.reward}</span>
                               </div>
                            </div>
                            <div>
                               {t.status === TaskStatus.COMPLETED ? (
                                   <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">Completed</span>
                               ) : t.status === TaskStatus.FAILED ? (
                                   <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded">Failed</span>
                               ) : (
                                   <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded">Pending</span>
                               )}
                            </div>
                         </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      )}

    </Layout>
  );
};

export default AdminDashboard;
