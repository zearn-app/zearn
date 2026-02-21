import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Store } from './services/store';
import { auth } from './services/firebase';
import { getRedirectResult } from 'firebase/auth';
import { User } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationProvider } from './components/NotificationSystem';

// Pages
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
      console.log("Refreshing user...");
      const u = await Store.getCurrentUser();
      console.log("Current user:", u);
      setUser(u);
    } catch (e) {
      console.error("User fetch error", e);
    }
  };

  useEffect(() => {
    const init = async () => {
        try {
          console.log("Initializing app...");
          await Store.initializeAdmin();
          // Handle OAuth redirect results (Google Redirect fallback)
          try {
            const result = await getRedirectResult(auth);
            if (result && result.user) {
              const gEmail = result.user.email || '';
              const exists = await Store.checkUserExists(gEmail);
              if (exists) {
                await Store.loginUser(exists);
              }
            }
          } catch (e) {
            console.debug('No redirect result during init', e);
          }
          console.log("Admin initialized");
          await refreshUser();
        } catch (e) {
          console.error("Initialization error:", e);
        }
        setLoading(false);
    };
    init();
  }, []);

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
              
              <Route path="/admin" element={user?.isAdmin ? <AdminDashboard /> : <Navigate to="/home" />} />
            </Routes>
          </HashRouter>
        </UserContext.Provider>
      </NotificationProvider>
    </ErrorBoundary>
  );
};

export default App;