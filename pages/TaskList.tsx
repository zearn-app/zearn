import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Store } from '../services/store';
import { Task, UserTask, TaskStatus } from '../types';
import { UserContext } from '../App';
import { ChevronRight, CheckCircle, Download, Gem } from 'lucide-react';

const TaskList: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const isSpecial = type === 'special';
  const { user, refreshUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'all' | 'process' | 'completed'>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingTaskId, setStartingTaskId] = useState<string | null>(null);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      const [taskList, userTaskList] = await Promise.all([
        Store.getTasks(isSpecial),
        Store.getUserTasks(user.uid),
      ]);
      setTasks(taskList);
      setUserTasks(userTaskList);
      setLoading(false);
    };
    fetchData();
  }, [user, isSpecial]);

  /* ---------------- MAP OPTIMIZATION ---------------- */
  const userTaskMap = useMemo(() => {
    const map = new Map<string, UserTask>();
    userTasks.forEach(ut => map.set(ut.taskId, ut));
    return map;
  }, [userTasks]);

  /* ---------------- TASK NAME FRAUD LOGIC ---------------- */
  const mutateTaskName = (taskName: string) => {
    const numbers = taskName.match(/\d/g)?.map(Number) || [];
    const sum = numbers.reduce((a, b) => a + b, 0);
    const reversed = taskName.split('').reverse().join('');
    return `${reversed}_${sum}`;
  };

  /* ---------------- START TASK ---------------- */
  const handleStartTask = async (task: Task) => {
    if (!user || startingTaskId) return;

    setStartingTaskId(task.id);

    try {
      const mutatedName = mutateTaskName(task.title);

      const link = await Store.startTask(user.uid, {
        taskId: task.id,
        mutatedName,
        originalName: task.title,
      });

      refreshUser();

      if (link) {
        window.open(link, '_blank');
      }

      setActiveTab('process');
    } catch (err) {
      console.error(err);
    }

    setStartingTaskId(null);
  };

  /* ---------------- FILTER ---------------- */
  const filteredTasks = tasks.filter(task => {
    const entry = userTaskMap.get(task.id);

    if (activeTab === 'all') return !entry;
    if (activeTab === 'process')
      return entry && [TaskStatus.IN_PROCESS, TaskStatus.FAILED].includes(entry.status);
    if (activeTab === 'completed')
      return entry && entry.status === TaskStatus.COMPLETED;

    return false;
  });

  /* ---------------- UI ---------------- */
  return (
    <Layout title={isSpecial ? "Special Tasks" : "Standard Tasks"} showBack>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        {['all', 'process', 'completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all
            ${activeTab === tab
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500'}`}
          >
            {tab === 'all' && 'All Tasks'}
            {tab === 'process' && 'In Process'}
            {tab === 'completed' && 'Completed'}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-400">
          Loading tasks...
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          {filteredTasks.length === 0 && (
            <div className="text-center text-gray-400 py-10">
              No tasks here.
            </div>
          )}

          {filteredTasks.map(task => {
            const entry = userTaskMap.get(task.id);

            return (
              <div
                key={task.id}
                onClick={() => {
                  if (activeTab === 'all') handleStartTask(task);
                  else if (activeTab === 'process') navigate(`/task-check/${task.id}`);
                }}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between cursor-pointer active:scale-[0.99] transition"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-800 line-clamp-1">
                      {task.title}
                    </h3>
                    {entry?.status === TaskStatus.FAILED && (
                      <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 rounded">
                        Failed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                      ₹{task.reward}
                    </span>

                    {task.diamondReward > 0 && (
                      <span className="flex items-center text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">
                        <Gem size={10} className="mr-1" />
                        {task.diamondReward}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pl-4">
                  {activeTab === 'all' && (
                    <div className="bg-gray-900 text-white p-2 rounded-full">
                      <Download size={16} />
                    </div>
                  )}
                  {activeTab === 'process' && (
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                      <ChevronRight size={16} />
                    </div>
                  )}
                  {activeTab === 'completed' && (
                    <div className="bg-green-100 text-green-600 p-2 rounded-full">
                      <CheckCircle size={16} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default TaskList;
