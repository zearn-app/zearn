import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Store } from '../services/store';
import { Task, UserTask, TaskStatus } from '../types';
import { UserContext } from '../App';
import { ChevronRight, Clock, CheckCircle, Download, Gem } from 'lucide-react';

const TaskList: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const isSpecial = type === 'special';
  const { user, refreshUser } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'all' | 'process' | 'completed'>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setTasks(await Store.getTasks(isSpecial));
        setUserTasks(await Store.getUserTasks(user.uid));
      }
    };
    fetchData();
  }, [user, isSpecial, activeTab]); // Refresh when tab changes

  // Logic: User clicks "All Task" -> Moves to Process silently -> Redirects
  const handleStartTask = async (task: Task) => {
    if(!user) return;
    const link = await Store.startTask(user.uid, task.id);
    refreshUser(); // Updates userTasks state
    if (link) {
        window.open(link, '_blank');
    }
    // Automatically switch to 'process' tab to show the user where it went
    setActiveTab('process');
  };

  const getUserTaskEntry = (taskId: string) => userTasks.find(ut => ut.taskId === taskId);

  // Filter Logic
  const filteredTasks = tasks.filter(task => {
    const entry = getUserTaskEntry(task.id);
    
    if (activeTab === 'all') {
        // Show only if NOT started yet
        return !entry;
    }
    if (activeTab === 'process') {
        return entry && (entry.status === TaskStatus.IN_PROCESS || entry.status === TaskStatus.FAILED);
    }
    if (activeTab === 'completed') {
        return entry && entry.status === TaskStatus.COMPLETED;
    }
    return false;
  });

  return (
    <Layout title={isSpecial ? "Special Tasks" : "Standard Tasks"} showBack>
      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`} onClick={() => setActiveTab('all')}>All Tasks</button>
        <button className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'process' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`} onClick={() => setActiveTab('process')}>In Process</button>
        <button className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'completed' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`} onClick={() => setActiveTab('completed')}>Completed</button>
      </div>

      <div className="space-y-4">
        {filteredTasks.length === 0 && <div className="text-center text-gray-400 py-10">No tasks here.</div>}

        {filteredTasks.map(task => {
          const entry = getUserTaskEntry(task.id);
          
          return (
            <div 
              key={task.id} 
              onClick={() => {
                  if (activeTab === 'all') handleStartTask(task);
                  else if (activeTab === 'process') navigate(`/task-check/${task.id}`);
              }}
              className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:scale-[0.99] transition`}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-bold text-gray-800 line-clamp-1">{task.title}</h3>
                    {entry?.status === TaskStatus.FAILED && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 rounded">Failed</span>}
                </div>
                
                {/* Rewards */}
                <div className="flex items-center space-x-3 mt-1">
                   <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">₹{task.reward}</span>
                   {task.diamondReward > 0 && (
                       <span className="flex items-center text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">
                           <Gem size={10} className="mr-1"/> {task.diamondReward}
                       </span>
                   )}
                </div>
              </div>

              <div className="pl-4">
                 {activeTab === 'all' && <div className="bg-gray-900 text-white p-2 rounded-full"><Download size={16}/></div>}
                 {activeTab === 'process' && <div className="bg-blue-100 text-blue-600 p-2 rounded-full"><ChevronRight size={16}/></div>}
                 {activeTab === 'completed' && <div className="bg-green-100 text-green-600 p-2 rounded-full"><CheckCircle size={16}/></div>}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
};

export default TaskList;