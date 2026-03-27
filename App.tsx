import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Store } from './services/store';
import { auth } from './services/firebase';
import { getRedirectResult } from 'firebase/auth';
import { User } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationProvider } from './components/NotificationSystem';

// Pages
import HistoryPage from './pages/History';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Home from './pages/Home';
import TaskList from './pages/TaskList';
import TaskCheck from './pages/TaskCheck';
import Withdrawal from './pages/Withdrawal';
import Leaderboard from './pages/Leaderboard';
import RandomWinner from './pages/RandomWinner';
import Profile from './pages/Profile';
import Settings from './pages/Settings'; // New
import EditProfile from './pages/EditProfile';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import AdminTasks from './pages/AdminTasks';
import AdminWithdrawals from './pages/AdminWithdrawals';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';

// Context
export const UserContext = React.createContext<{
  user: User | null;
  refreshUser: () => void;
}>({
  user: null,
  refreshUser: () => {}
});

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
  try {
    const u = await Store.getCurrentUser();

    if (!u) {
      console.warn("No user in Store");
    }

    setUser(u);
  } catch (e) {
    console.error("User fetch error", e);
  }
};
useEffect(() => {
  const cachedUser = localStorage.getItem("user");

  if (cachedUser) {
    console.log("Loaded user from cache");
    setUser(JSON.parse(cachedUser));
  }
}, []);
  useEffect(() => {
  const init = async () => {
    try {
      console.log("Initializing app...");
      await Store.initializeAdmin();

      // ✅ Handle redirect (keep this)
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const email = result.user.email || '';
          const exists = await Store.checkUserExists(email);
          if (exists) {
            await Store.loginUser(exists);
          }
        }
      } catch (e) {
        console.debug("No redirect result", e);
      }

      // 🔥 MAIN FIX: wait for Firebase auth restore
      await new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
  const email = firebaseUser.email || '';

  console.log("Firebase user found:", email);

  // 🔥 Always fetch fresh user from DB
  const userData = await Store.getUserByEmail(email);

  if (userData) {
    await Store.setCurrentUser(userData); // ✅ IMPORTANT
    setUser(userData); // 🔥 directly update state
  }
        }
          unsubscribe();
          resolve(true);
        });
      });

      // ✅ Now fetch user AFTER auth is ready
      await refreshUser();

    } catch (e) {
      console.error("Initialization error:", e);
    }

    setLoading(false);
  };

  init();
}, []);

  useEffect(() => {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
}, [user]);

  
  if (loading) return <div className="flex h-screen items-center justify-center bg-blue-50 font-bold text-blue-600">Loading Zearn...</div>;

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <UserContext.Provider value={{ user, refreshUser }}>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route path="/home" element={user ? <Home /> : <Navigate to="/login" />} />
             
              <Route path="/tasks/:type" element={user ? <TaskList /> : <Navigate to="/login" />} />
              <Route path="/task-check/:taskId" element={user ? <TaskCheck /> : <Navigate to="/login" />} />
             
              <Route path="/withdrawal" element={user ? <Withdrawal /> : <Navigate to="/login" />} />
              
              <Route path="/leaderboard" element={user ? <Leaderboard /> : <Navigate to="/login" />} />
             
              <Route path="/winner" element={user ? <RandomWinner /> : <Navigate to="/login" />} />
             
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
              <Route path="/profile/edit" element={user ? <EditProfile /> : <Navigate to="/login" />} />
              <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
              <Route path="/about" element={<About />} />
              <Route path="/history" element={user ? <HistoryPage /> : <Navigate to="/login" />} />
              
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin-tasks" element={<AdminTasks />} />
              <Route path="/admin-withdrawals" element={<AdminWithdrawals />} />
              <Route path="/admin-users" element={<AdminUsers />} />
              <Route path="/admin-settings" element={<AdminSettings />} />

              
          </Routes>
          </HashRouter>
        </UserContext.Provider>
      </NotificationProvider>
    </ErrorBoundary>
  );
};

export default App;
