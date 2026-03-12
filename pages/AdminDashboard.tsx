import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout'; // Assuming Layout is a shared layout component
import { Store } from '../services/store'; // Replace with your store/service file
import { User, Task, WithdrawalRequest, AdminSettings } from '../types'; // Your types

// Icon imports (assuming you're using something like Lucide)
import { Bell, User, Shield, ChevronRight, LogOut } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  // State to manage which tab is active
  const [tab, setTab] = useState<string>('withdrawals');
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);

  // Fetch users, tasks, withdrawals, and settings data on load
  useEffect(() => {
    // Fetch data from your API or Firebase (replace with your actual logic)
    const fetchData = async () => {
      try {
        const fetchedUsers = await Store.getAllUsers(); // Replace with actual fetch logic
        const fetchedTasks = await Store.getAllTasks(); // Replace with actual fetch logic
        const fetchedWithdrawals = await Store.getAllWithdrawals(); // Replace with actual fetch logic
        const fetchedSettings = await Store.getAdminSettings(); // Replace with actual fetch logic

        setUsers(fetchedUsers);
        setTasks(fetchedTasks);
        setWithdrawals(fetchedWithdrawals);
        setSettings(fetchedSettings);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchData();
  }, []);

  // Render different tab content based on the active tab
  const renderTabContent = () => {
    switch (tab) {
      case 'withdrawals':
        return <WithdrawalsTab withdrawals={withdrawals} />;
      case 'users':
        return <UsersTab users={users} />;
      case 'tasks':
        return <TasksTab tasks={tasks} />;
      case 'settings':
        return <SettingsTab settings={settings} />;
      case 'jackpot':
        return <JackpotTab />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="admin-dashboard">
        {/* Tab buttons */}
        <div className="tabs flex gap-4">
          {['withdrawals', 'users', 'tasks', 'settings', 'jackpot'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded font-bold ${
                tab === t ? 'bg-black text-white' : 'bg-gray-200'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="tab-content mt-4">
          {renderTabContent()}
        </div>
      </div>
    </Layout>
  );
};

// Users Tab component
const UsersTab: React.FC<{ users: User[] }> = ({ users }) => (
  <div className="users-tab">
    <h2 className="font-bold text-lg mb-4">User Management</h2>
    <table className="table-auto w-full">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.uid}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.status}</td>
            <td>
              {/* Implement action buttons like Ban/Unban, View Details */}
              <button className="text-blue-500">View</button>
              <button className="text-red-500">Ban</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Tasks Tab component
const TasksTab: React.FC<{ tasks: Task[] }> = ({ tasks }) => (
  <div className="tasks-tab">
    <h2 className="font-bold text-lg mb-4">Task Management</h2>
    <ul>
      {tasks.map((task) => (
        <li key={task.id} className="mb-2">
          <span>{task.name}</span> - <span>{task.status}</span>
          {/* Add more actions like "Edit" or "Delete" */}
        </li>
      ))}
    </ul>
  </div>
);

// Withdrawals Tab component
const WithdrawalsTab: React.FC<{ withdrawals: WithdrawalRequest[] }> = ({
  withdrawals,
}) => (
  <div className="withdrawals-tab">
    <h2 className="font-bold text-lg mb-4">Withdrawal Requests</h2>
    <table className="table-auto w-full">
      <thead>
        <tr>
          <th>User</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {withdrawals.map((request) => (
          <tr key={request.id}>
            <td>{request.userName}</td>
            <td>{request.amount}</td>
            <td>{request.status}</td>
            <td>
              {/* Actions to approve or reject withdrawal */}
              <button className="text-green-500">Approve</button>
              <button className="text-red-500">Reject</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Settings Tab component
const SettingsTab: React.FC<{ settings: AdminSettings | null }> = ({ settings }) => (
  <div className="settings-tab">
    <h2 className="font-bold text-lg mb-4">Admin Settings</h2>
    <div>
      {/* Display settings data and provide input fields for updating */}
      {settings ? (
        <div>
          <p>Current Admin Email: {settings.adminEmail}</p>
          {/* More settings fields here */}
        </div>
      ) : (
        <p>Loading settings...</p>
      )}
    </div>
  </div>
);

// Jackpot Tab component (Add your own logic here)
const JackpotTab = () => (
  <div className="jackpot-tab">
    <h2 className="font-bold text-lg mb-4">Jackpot</h2>
    {/* Jackpot logic and UI here */}
  </div>
);

export default AdminDashboard;