import React, { useContext } from 'react';
import { Layout } from '../components/Layout';
import { UserContext } from '../App';
import { Store } from '../services/store';
import { User, LogOut, ChevronRight, Settings, Gem } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, refreshUser } = useContext(UserContext);

  if (!user) return null;

  const handleLogout = async () => {
    await Store.logout();
    refreshUser(); 
    // App.tsx handles the routing logic: 
    // when user becomes null, the protected route renders <Navigate to="/login" />
  };

  return (
    <Layout title="Profile" showBack>
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 flex items-center space-x-4">
         <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
         </div>
         <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
         </div>
      </div>

      <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide ml-1">Account Overview</h3>
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
          <span className="text-gray-600 font-medium">Current Balance</span>
          <span className="font-bold text-gray-900">{user.balance} Coins</span>
        </div>
        <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
          <span className="text-gray-600 font-medium">Account Level</span>
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Lvl {user.level}</span>
        </div>
        <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
          <span className="text-gray-600 font-medium">Lifetime Earnings</span>
          <span className="font-bold text-green-600">{user.lifetimeEarnings} Coins</span>
        </div>
        <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
          <span className="text-gray-600 font-medium flex items-center"><Gem size={14} className="mr-1 text-cyan-500"/> Lifetime Diamonds</span>
          <span className="font-bold text-cyan-600">{user.lifetimeDiamondEarnings}</span>
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide ml-1">Referral</h3>
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg mb-6">
        <p className="text-purple-100 text-sm mb-1">Your Referral Code</p>
        <div className="flex justify-between items-end">
           <h2 className="text-3xl font-mono font-bold tracking-wider">{user.referralCode}</h2>
           <button 
             onClick={() => { navigator.clipboard.writeText(user.referralCode); alert("Copied!"); }}
             className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-xs font-bold transition backdrop-blur-sm"
           >
             Copy
           </button>
        </div>
      </div>
      
      <button 
        onClick={handleLogout}
        className="w-full py-4 text-red-500 font-bold bg-white rounded-xl border border-red-100 hover:bg-red-50 transition flex items-center justify-center space-x-2 shadow-sm"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>

      <p className="text-center text-xs text-gray-400 mt-6">Version 1.1.0 • Zearn App</p>
    </Layout>
  );
};

export default Profile;