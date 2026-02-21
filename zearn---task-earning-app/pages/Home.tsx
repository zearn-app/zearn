import React, { useContext, useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Gift, Trophy, Wallet, Zap, Shuffle, Gem, Settings, Users, Copy } from 'lucide-react';
import { Store } from '../services/store';
import { useNotification } from '../components/NotificationSystem';

const Home: React.FC = () => {
  const { user, refreshUser } = useContext(UserContext);
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [claimedToday, setClaimedToday] = useState(false);

  useEffect(() => {
    if (user) {
        Store.checkDailyClaimStatus(user.uid).then(status => setClaimedToday(status));
    }
  }, [user]);

  const handleDailyClaim = async () => {
    if (!user) return;
    if (claimedToday) {
        notify("Already claimed today! Come back tomorrow.", 'info');
        return;
    }
    try {
      const result = await Store.claimDaily(user.uid);
      if (result.success) {
        notify(result.message, 'success');
        refreshUser();
        setClaimedToday(true);
      } else {
        notify(result.message, 'error');
      }
    } catch (e) {
      notify("Failed to process daily claim", 'error');
    }
  };

  const menuItems = [
    { 
        label: claimedToday ? 'Claimed' : 'Daily Bonus', 
        icon: <CheckCircle className={claimedToday ? "text-gray-400" : "text-green-500"} />, 
        action: handleDailyClaim,
        disabled: claimedToday 
    },
    { label: 'Standard Tasks', icon: <Zap className="text-yellow-500" />, action: () => navigate('/tasks/standard') },
    { label: 'Special Tasks', icon: <Gift className="text-purple-500" />, action: () => navigate('/tasks/special') },
    { label: 'Withdraw', icon: <Wallet className="text-blue-500" />, action: () => navigate('/withdrawal') },
    { label: 'Leaderboard', icon: <Trophy className="text-orange-500" />, action: () => navigate('/leaderboard') },
    { label: 'Lucky Winner', icon: <Shuffle className="text-pink-500" />, action: () => navigate('/winner') },
  ];

  const getDayCount = () => {
      if(!user) return 1;
      const start = new Date(user.createdAt).getTime();
      const now = Date.now();
      const diff = now - start;
      return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const copyReferral = () => {
      if(user?.referralCode) {
          navigator.clipboard.writeText(user.referralCode);
          notify("Referral Code Copied!", 'success');
      }
  };

  return (
    <Layout>
      {/* Header Override for Settings Icon */}
      <div className="absolute top-4 right-4 z-20">
         <button 
            type="button"
            aria-label="Settings"
            onClick={() => navigate('/settings')}
            className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-blue-600 transition"
         >
            <Settings size={24} />
         </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl mb-6 relative overflow-hidden max-w-3xl mx-auto border border-gray-800 mt-2">
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Balance</p>
                <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold">₹</span>
                    <h1 className="text-5xl font-black tracking-tighter">{user?.balance}</h1>
                </div>
                
                <div className="mt-4 inline-flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
                    <Gem size={14} className="text-cyan-400" />
                    <span className="text-sm font-bold text-cyan-100">{user?.diamonds} Diamonds</span>
                </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-4 py-2 rounded-xl shadow-lg border border-blue-500/30">
                 <span className="block text-[10px] text-blue-200 uppercase font-bold text-center">Current Streak</span>
                 <span className="block text-xl font-bold text-center">Day {getDayCount()}</span>
            </div>
        </div>
        
        {/* Background Decorations */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Referral Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 mb-6 text-white flex justify-between items-center shadow-md relative overflow-hidden">
          <div className="z-10">
              <h3 className="font-bold text-lg">Refer & Earn ₹50</h3>
              <p className="text-indigo-100 text-xs mb-2">Invite friends with your code</p>
              <button onClick={copyReferral} className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center shadow-sm active:scale-95 transition">
                  <Copy size={12} className="mr-1"/> {user?.referralCode || '...'}
              </button>
          </div>
          <div className="z-10 bg-white/20 p-3 rounded-full">
              <Users size={24} className="text-white"/>
          </div>
          <div className="absolute -left-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {menuItems.map((item, idx) => (
          <Card 
            key={idx} 
            onClick={item.action} 
            className={`flex flex-col items-center justify-center h-32 transition-all border-none shadow-sm ${item.disabled ? 'opacity-70 bg-gray-100' : 'bg-white hover:bg-blue-50 hover:scale-[1.02]'}`}
          >
            <div className={`p-3 rounded-2xl mb-2 ${item.disabled ? 'bg-gray-200' : 'bg-gray-50'}`}>
              {React.cloneElement(item.icon as React.ReactElement<any>, { size: 28 })}
            </div>
            <span className={`font-bold text-sm ${item.disabled ? 'text-gray-400' : 'text-gray-800'}`}>{item.label}</span>
          </Card>
        ))}
      </div>

    </Layout>
  );
};

export default Home;
