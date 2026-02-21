import React, { useContext, useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { UserContext } from '../App';
import { Store } from '../services/store';
import { useNotification } from '../components/NotificationSystem';
import { WinnerEntry } from '../types';

const RandomWinner: React.FC = () => {
  const { user, refreshUser } = useContext(UserContext);
  const { notify } = useNotification();
  const [entryFee, setEntryFee] = useState(0);
  const [participants, setParticipants] = useState<WinnerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
     const init = async () => {
         const settings = await Store.getSettings();
         setEntryFee(settings.randomWinnerEntryFee);
         const entries = await Store.getWinnerEntries();
         setParticipants(entries);
         setIsLoading(false);
     };
     init();
  }, []);

  const handleEnter = async () => {
    if (!user) return;
    if (!window.confirm(`Enter jackpot for ₹${entryFee}? This will be deducted from your balance.`)) return;

    try {
      await Store.enterRandomWinner(user.uid, entryFee);
      notify("Entered Successfully! Good Luck!", 'success');
      refreshUser();
      // Refresh list
      const entries = await Store.getWinnerEntries();
      setParticipants(entries);
    } catch (e: any) {
      notify(e.message || "Entry failed", 'error');
    }
  };

  const hasEntered = user && participants.find(p => p.uid === user.uid);

  return (
    <Layout title="Lucky Winner" showBack>
      <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-8 text-white text-center mb-8 shadow-lg relative overflow-hidden">
        <h2 className="text-3xl font-black mb-2 tracking-tight">Monthly Jackpot</h2>
        <p className="opacity-90 font-medium mb-4">Entry Fee: ₹{entryFee}</p>
        
        {hasEntered ? (
            <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full inline-block font-bold border border-white/30">
                You are in! 🎟️
            </div>
        ) : (
             <button 
             onClick={handleEnter}
             className="bg-white text-pink-600 font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-gray-50 active:scale-95 transition-all"
           >
             Enter Now for ₹{entryFee}
           </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
         <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Participants ({participants.length})</h3>
            <span className="text-xs text-gray-500">This Month</span>
         </div>
         
         {isLoading ? (
             <div className="text-center py-4 text-gray-400">Loading...</div>
         ) : participants.length === 0 ? (
             <div className="text-center py-4 text-gray-400">No entries yet. Be the first!</div>
         ) : (
             <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                 {participants.map((p, idx) => (
                     <div key={idx} className="flex flex-col items-center">
                         <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs mb-1">
                             {p.avatarChar || p.name[0]}
                         </div>
                         <span className="text-[10px] text-gray-500 truncate w-full text-center">{p.name.split(' ')[0]}</span>
                     </div>
                 ))}
             </div>
         )}
      </div>
      
      <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed px-4">
          Winners are selected randomly by the system at the end of the month. The prize pool depends on total entries.
        </p>
    </Layout>
  );
};

export default RandomWinner;