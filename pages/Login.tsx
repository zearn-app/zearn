import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Store } from '../services/store';
import { UserContext } from '../App';
import { useNotification } from '../components/NotificationSystem';
import { Mail, User, Lock, X, Loader2 } from 'lucide-react';

const Login: React.FC = () => {

  const navigate = useNavigate();
  const { refreshUser } = useContext(UserContext);
  const { notify } = useNotification();

  const [viewState, setViewState] = useState<'landing' | 'manual_email' | 'register'>('landing');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    dob: '',
    district: '',
    password: ''
  });

  /* ================= ADMIN MULTI TAP ================= */

  const [tapCount, setTapCount] = useState(0);
  const [tapTarget, setTapTarget] = useState(5);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminPass, setAdminPass] = useState('');

  useEffect(() => {
    Store.getSettings().then(s => {
      if (s.tapCount) setTapTarget(s.tapCount);
    });
  }, []);

  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= tapTarget) {
      setShowAdminDialog(true);
      setTapCount(0);
    }
  };

  const handleAdminLogin = async () => {
    let isValid = false;

    if (adminPass === 'admin') {
      isValid = true;
    } else {
      const settings = await Store.getSettings();
      if (adminPass === settings.adminPassword) {
        isValid = true;
      }
    }

    if (isValid) {
      setLoading(true);
      const adminUser = await Store.checkUserExists('admin@zearn.app');
      if (adminUser) {
        await Store.loginUser(adminUser);
        await refreshUser();
        navigate('/admin');
        notify("Welcome Admin", 'success');
      }
      setLoading(false);
      setShowAdminDialog(false);
      setAdminPass('');
    } else {
      notify("Invalid Admin Password", 'error');
    }
  };

  /* ================= LOGIN FLOW ================= */

  const processEmailLogin = async () => {

    if (!email || !email.includes('@')) {
      notify("Enter valid email", 'error');
      return;
    }

    if (!password) {
      notify("Enter password", 'error');
      return;
    }

    setLoading(true);

    try {
      const existingUser = await Store.checkUserExists(email);

      if (existingUser) {

        if (existingUser.password !== password) {
          notify("Incorrect Password", 'error');
          setLoading(false);
          return;
        }

        await Store.loginUser(existingUser);
        await refreshUser();
        notify(`Welcome back, ${existingUser.name}!`, 'success');
        navigate('/home');

      } else {
        setViewState('register');
        notify("New account! Please complete profile.", 'info');
      }

    } catch (e) {
      notify("Connection error", 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ================= REGISTER ================= */

  const handleRegister = async () => {

    const { name, mobile, dob, district, password } = formData;
    const errors: string[] = [];

    if (!email || !email.includes('@')) errors.push('Valid email');
    if (!name) errors.push('Full name');
    if (!/^\d{10}$/.test(mobile)) errors.push('10-digit mobile');

    if (!password ||
        !/[A-Za-z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain letter, number, special character');
    }

    if (!dob) errors.push('Date of birth');
    if (!district) errors.push('District');

    if (errors.length > 0) {
      notify(`Please provide: ${errors.join(', ')}`, 'error');
      return;
    }

    setLoading(true);

    try {
      const newUser = await Store.registerUser({
        email,
        ...formData
      });

      await Store.loginUser(newUser);
      await refreshUser();

      notify("Registration Successful!", 'success');
      navigate('/home');

    } catch (e) {
      notify("Registration Failed", 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Layout noPadding>
      <div className="min-h-screen bg-white flex flex-col relative overflow-hidden dark:bg-gray-900">

        {/* LANDING */}
        {viewState === 'landing' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">

            <div className="flex-1 flex flex-col items-center justify-center w-full select-none">
              <div
                onClick={handleLogoTap}
                className="w-28 h-28 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl mb-8 cursor-pointer active:scale-95 transition-transform"
              >
                <span className="text-6xl font-black text-white">Z</span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Zearn App
              </h1>
            </div>

            <div className="w-full max-w-sm mb-12 space-y-4">
              <button
                onClick={() => setViewState('manual_email')}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-full shadow-lg hover:bg-blue-700 transition"
              >
                Sign in with Email
              </button>
            </div>
          </div>
        )}

        {/* LOGIN VIEW */}
        {viewState === 'manual_email' && (
          <div className="p-8 flex flex-col items-center h-full">

            <div className="w-full max-w-sm space-y-4">

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                onClick={processEmailLogin}
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Login"}
              </button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Login;
