import React, { useEffect, useState, useContext } from 'react';
import { Layout } from '../components/Layout';
import { UserContext } from '../App';
import { db } from '../services/firebase';
import {
  collection,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface HistoryItem {
  id: string;
  amount: number;
  date: any;
  profit: boolean;
  task_name: string;
  type: string;
}

const History: React.FC = () => {
  const { user } = useContext(UserContext);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const q = collection(db, 'users', user.uid, 'history');      
      

        const snapshot = await getDocs(q);

        const list: HistoryItem[] = snapshot.docs.map(doc => ({
          id: doc.id,
          amount: doc.data().amount || 0,
          date: doc.data().date,
          profit: doc.data().profit ?? true,
          task_name: doc.data().task_name || 'Task',
          type: doc.data().type || 'standard'
        }));

        setHistory(list);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const formatDate = (date: any) => {
    try {
      if (!date) return 'N/A';

      // Firestore timestamp support
      const d = date.toDate ? date.toDate() : new Date(date);

      return d.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Layout title="History" showBack>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
        <p className="text-sm text-gray-500">
          All your earnings and activities
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-gray-500 py-10">
          Loading history...
        </div>
      )}

      {/* Empty */}
      {!loading && history.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          No history found
        </div>
      )}

      {/* History List */}
      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition"
          >
            {/* Left */}
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {item.task_name}
              </h3>
              <p className="text-xs text-gray-500">
                {formatDate(item.date)}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {item.type}
              </p>
            </div>

            {/* Right */}
            <div className="text-right">
              <p
                className={`font-bold ${
                  item.profit ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {item.profit ? '+' : '-'}
                {item.amount} Coins
              </p>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default History;
