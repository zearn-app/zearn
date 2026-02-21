import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Shield, ChevronRight, LogOut } from 'lucide-react';
import { Store } from '../services/store';
import { useContext } from 'react';
import { UserContext } from '../App';
import { useNotification } from '../components/NotificationSystem';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useContext(UserContext);
  const { notify } = useNotification();
  
  // Local state for UI toggles
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('zearn_notifications') !== 'false';
  });

  // Effect for Notifications
  useEffect(() => {
      localStorage.setItem('zearn_notifications', notifications.toString());
  }, [notifications]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
        await Store.logout();
        await refreshUser(); 
    }
  };

  const handleToggle = (type: 'notif') => {
      setNotifications(!notifications);
      notify(notifications ? "Notifications Disabled" : "Notifications Enabled", 'success');
  };

  const ToggleSwitch = ({ isOn }: { isOn: boolean }) => (
      <div className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${isOn ? 'bg-blue-600' : 'bg-gray-200'}`}>
        <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
  );

  const SettingItem = ({ icon, label, action, isToggle, toggleState }: any) => (
    <div 
        onClick={action}
        className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer active:scale-[0.99] transition hover:bg-gray-50"
    >
        <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-700">{icon}</div>
            <span className="font-bold text-gray-800">{label}</span>
        </div>
        {isToggle ? (
            <ToggleSwitch isOn={toggleState} />
        ) : (
            <ChevronRight className="text-gray-400" size={20} />
        )}
    </div>
  );

  return (
    <Layout title="Settings" showBack>
       <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase ml-2 mb-2 mt-2">General</p>
          <SettingItem 
            icon={<User size={20}/>} 
            label="My Profile" 
            action={() => navigate('/profile')} 
          />
          <SettingItem 
            icon={<User size={20}/>} 
            label="About Us"
            action={() => navigate('/about')}
          />
          <SettingItem 
            icon={<Bell size={20}/>} 
            label="Notifications" 
            isToggle 
            toggleState={notifications}
            action={() => handleToggle('notif')}
          />

          <p className="text-xs font-bold text-gray-400 uppercase ml-2 mb-2 mt-6">Support</p>
          <SettingItem 
            icon={<Shield size={20}/>} 
            label="Privacy Policy" 
            action={() => alert("Privacy Policy: User data is processed securely.")} 
          />
          
          <div className="pt-6">
            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-4 rounded-xl font-bold hover:bg-red-100 transition"
            >
                <LogOut size={20} />
                <span>Logout</span>
            </button>
          </div>
       </div>
    </Layout>
  );
};

export default Settings;