import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Store } from '../services/store';
import { Trophy, Medal } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<{name: string, balance: number}[]>([]);

  useEffect(() => {
    Store.getLeaderboard().then(data => setUsers(data));
  }, []);

  return (
    <Layout title="Top Earners" showBack>
      <div className="bg-gradient-to-b from-yellow-50 to-white pt-4 pb-2 px-4 mb-4 rounded-b-3xl -mt-4 border-b border-gray-100">
         <div className="flex justify-center mb-6 pt-4 space-x-4 items-end">
            {/* 2nd Place */}
            {users[1] && (
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center text-2xl mb-2">
                        🥈
                    </div>
                    <span className="font-bold text-xs text-gray-700 mb-1">{users[1].name}</span>
                    <span className="font-bold text-blue-600 text-xs">{users[1].balance}</span>
                </div>
            )}
            
            {/* 1st Place */}
            {users[0] && (
                <div className="flex flex-col items-center -mt-6">
                    <Trophy className="text-yellow-500 mb-2" size={32} />
                    <div className="w-20 h-20 rounded-full bg-yellow-100 border-4 border-white shadow-xl flex items-center justify-center text-4xl mb-2 ring-4 ring-yellow-50 relative">
                        🥇
                        <div className="absolute -bottom-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">#1</div>
                    </div>
                    <span className="font-bold text-sm text-gray-900 mb-1">{users[0].name}</span>
                    <span className="font-bold text-blue-600">{users[0].balance}</span>
                </div>
            )}

            {/* 3rd Place */}
            {users[2] && (
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-orange-100 border-4 border-white shadow-md flex items-center justify-center text-2xl mb-2">
                        🥉
                    </div>
                    <span className="font-bold text-xs text-gray-700 mb-1">{users[2].name}</span>
                    <span className="font-bold text-blue-600 text-xs">{users[2].balance}</span>
                </div>
            )}
         </div>
      </div>

      <div className="space-y-3 px-1">
        {users.slice(3).map((u, index) => (
          <div key={index + 3} className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <span className="w-8 text-center font-bold text-gray-400 text-sm mr-2">{index + 4}</span>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 mr-3 text-sm">
              {u.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 text-sm">{u.name}</h4>
            </div>
            <div className="font-mono font-bold text-blue-600 text-sm">
              {u.balance}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Leaderboard;