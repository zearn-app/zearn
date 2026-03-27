import React, { useContext } from 'react';
import { Layout } from '../components/Layout';
import { UserContext } from '../App';
import { Store } from '../services/store';
import { LogOut, Gem } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, refreshUser } = useContext(UserContext);

  if (!user) return null;

  const navigate = useNavigate();

  const handleLogout = async () => {
    await Store.logout();
    refreshUser();
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  // ✅ SAFE DATA MAPPING (supports Firestore + Store)
  const balance = user.balance ?? 0;

  const level = user.level ?? user.rank ?? 1;

  const lifetimeEarnings =
    user.lifetimeEarnings ??
    user.lifetime_earnings ??
    0;

  const lifetimeDiamonds =
    user.lifetimeDiamondEarnings ??
    user.lifetime_diamonds ??
    user.lifetime_gold ?? // fallback (your DB uses this)
    0;

  const referralCode =
    user.referralCode ??
    user.referral_code ??
    "N/A";

  return (
    <Layout title="Profile" showBack>
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 flex items-center space-x-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
          {user.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {user.name || "User"}
          </h2>
          <p className="text-gray-500 text-sm">
            {user.email || "No Email"}
          </p>
        </div>
        <div className="ml-auto">
          <button
            onClick={handleEditProfile}
            className="text-sm text-blue-600 font-bold bg-blue-50 px-3 py-2 rounded-md"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Account Overview */}
      <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide ml-1">
        Account Overview
      </h3>

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
          <span className="text-gray-600 font-medium">
            Current Balance
          </span>
          <span className="font-bold text-gray-900">
            {balance} Coins
          </span>
        </div>

        <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
          <span className="text-gray-600 font-medium">
            Account Level
          </span>
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
            Lvl {level}
          </span>
        </div>

        <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
          <span className="text-gray-600 font-medium">
            Lifetime Earnings
          </span>
          <span className="font-bold text-green-600">
            {lifetimeEarnings} Coins
          </span>
        </div>

        <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
          <span className="text-gray-600 font-medium flex items-center">
            <Gem size={14} className="mr-1 text-cyan-500" />
            Lifetime Gold
          </span>
          <span className="font-bold text-cyan-600">
            {lifetimeDiamonds}
          </span>
        </div>
      </div>

      {/* Referral */}
      <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide ml-1">
        Referral
      </h3>

      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg mb-6">
        <p className="text-purple-100 text-sm mb-1">
          Your Referral Code
        </p>
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-mono font-bold tracking-wider">
            {referralCode}
          </h2>
          <button
            onClick={() => {
              navigator.clipboard.writeText(referralCode);
              alert("Copied!");
            }}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-xs font-bold transition backdrop-blur-sm"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-4 text-red-500 font-bold bg-white rounded-xl border border-red-100 hover:bg-red-50 transition flex items-center justify-center space-x-2 shadow-sm"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>

      <p className="text-center text-xs text-gray-400 mt-6">
        Version 1.1.0 • Zearn App
      </p>
    </Layout>
  );
};

export default Profile;
