import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Store } from '../services/store';
import { WithdrawalRequest, WithdrawalStatus, AdminSettings, User, Task, UserTask, TaskStatus } from '../types';
import { useNotification } from '../components/NotificationSystem';
import { Trash2, Eye, X, User as UserIcon, Phone, MapPin, Mail, Calendar, CreditCard, Copy, Check, Shield, Coins, Loader2, Edit, BarChart2, Ban, Unlock } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { notify } = useNotification();
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'users' | 'tasks' | 'settings'>('withdrawals');

  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskStats, setTaskStats] = useState<Record<string, { completed: number, failed: number }>>({});
  const [settings, setSettings] = useState<AdminSettings>({
      tapCount: 5,
      adminPassword: 'admin',
      dailyClaimLimit: 10,
      minWithdrawal: 50,
      randomWinnerEntryFee: 20
  });

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({});

  const [selectedUserForProgress, setSelectedUserForProgress] = useState<User | null>(null);
  const [userProgressTasks, setUserProgressTasks] = useState<(UserTask & { title: string, reward: number })[]>([]);

  const [paymentModalReq, setPaymentModalReq] = useState<{req: WithdrawalRequest, user: User} | null>(null);

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const refreshData = async () => {
    const [r, u, t, s, ts] = await Promise.all([
        Store.getWithdrawals(),
        Store.getAllUsers(),
        Store.getAllTasks(true),
        Store.getSettings(),
        Store.getTaskStats()
    ]);
    setRequests(r);
    setUsers(u);
    setTasks(t);
    setSettings(s);
    setTaskStats(ts);
  };

  /* ---------------- WITHDRAWALS ---------------- */

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

  const handlePaymentAction = async () => {
      if(!paymentModalReq) return;
      if (!window.confirm("Confirm marking this request as PAID?")) return;

      navigator.clipboard.writeText(paymentModalReq.req.details);
      await Store.adminUpdateWithdrawal(paymentModalReq.req.id, WithdrawalStatus.PAID_BY_ADMIN);

      setPaymentModalReq(null);
      refreshData();
      notify(`Marked as Paid`, 'success');
  };

  const getRequestUser = (uid: string) => users.find(u => u.uid === uid);

  /* ---------------- SETTINGS ---------------- */

  const handleSaveSettings = async () => {
    if (!window.confirm("Are you sure you want to save these settings?")) return;
    setIsSavingSettings(true);
    await Store.updateSettings(settings);
    notify("Configuration Saved Successfully", 'success');
    await refreshData();
    setIsSavingSettings(false);
  };

  const handleChangeSetting = (key: keyof AdminSettings, val: string | number) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  /* ---------------- TASKS ---------------- */

  const handleDeleteTask = async (id: string) => {
    if(window.confirm("Are you sure you want to DELETE this task?")) {
      await Store.deleteTask(id);
      notify("Task deleted", 'info');
      refreshData();
    }
  };

  const openEditTask = (task: Task) => {
      setEditingTask(task);
      setNewTask({ ...task });
      setShowTaskModal(true);
  };

  const handleSaveTask = async () => {
    if(!editingTask) return;

    if (!window.confirm("Update this task?")) return;

    await Store.updateTask(editingTask.id, {
        ...editingTask,
        ...newTask
    });

    notify(`Task updated`, 'success');
    refreshData();
    setShowTaskModal(false);
  };

  /* ---------------- USERS ---------------- */

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

      {/* TAB NAV */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
        {['withdrawals', 'users', 'tasks', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 min-w-[100px] py-2.5 rounded-lg font-bold text-sm capitalize transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-3">
            {tasks.map(t => {
              const stats = taskStats[t.id] || { completed: 0, failed: 0 };
              return (
                <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-bold text-gray-800 text-sm">{t.title}</h4>
                        {t.isSpecial && (
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded">
                            Special
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-1 line-clamp-1">{t.description}</p>
                      <div className="flex space-x-2">
                        <div className="text-xs font-mono text-green-600 bg-green-50 inline-block px-1.5 py-0.5 rounded border border-green-100">
                          ₹ {t.reward}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button onClick={() => openEditTask(t)} className="text-gray-400 hover:text-blue-600 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition">
                        <Edit size={16}/>
                      </button>
                      <button onClick={() => handleDeleteTask(t.id)} className="text-gray-400 hover:text-red-600 p-2 bg-gray-50 rounded-lg hover:bg-red-50 transition">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                    <span>Stats:</span>
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

    </Layout>
  );
};

export default AdminDashboard;
