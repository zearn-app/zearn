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

  // ------------------------------
  // EMAIL + PASSWORD LOGIN FLOW
  // ------------------------------

  const processEmailLogin = async () => {
    if (!email) {
      notify("Please enter a valid Email", 'error');
      return;
    }

    if (!password) {
      notify("Please enter password", 'error');
      return;
    }

    setLoading(true);
    try {
      const existingUser = await Store.checkUserExists(email);

      if (existingUser) {
        if (existingUser.password === password) {
          await Store.loginUser(existingUser);
          await refreshUser();
          notify(`Welcome back, ${existingUser.name}!`, 'success');
          navigate('/home');
        } else {
          notify("Incorrect password", 'error');
        }
      } else {
        // New user → Go to register
        setViewState('register');
        notify("New account! Please complete profile.", 'info');
      }
    } catch (e) {
      console.error(e);
      notify("Login failed. Try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // REGISTER FLOW
  // ------------------------------

  const handleRegister = async () => {
    const { name, mobile, dob, district, password } = formData;

    const errors: string[] = [];

    if (!email) errors.push('Valid email');
    if (!name) errors.push('Full name');
    if (!/^\d{10}$/.test(mobile)) errors.push('10-digit mobile');
    if (!password || !/(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}/.test(password)) {
      errors.push('Password must contain letter, number and special character');
    }
    if (!dob) errors.push('Date of birth');
    if (!district) errors.push('District');

    if (errors.length > 0) {
      notify(`Please provide: ${errors.join(', ')}`, 'error');
      return;
    }

    setLoading(true);
    try {
      const registeredUser = await Store.registerUser({
        email,
        ...formData
      });

      await Store.loginUser(registeredUser);
      await refreshUser();
      notify("Registration Successful!", 'success');
      navigate('/home');
    } catch (e) {
      console.error(e);
      notify("Registration Failed", 'error');
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // UI
  // ------------------------------

  return (
    <Layout noPadding>
      <div className="min-h-screen bg-white flex flex-col relative overflow-hidden dark:bg-gray-900 transition-colors">

        {/* LANDING */}
        {viewState === 'landing' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">

            <div className="flex-1 flex flex-col items-center justify-center w-full select-none">
              <div className="w-28 h-28 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl mb-8">
                <span className="text-6xl font-black text-white">Z</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Zearn App</h1>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">
                Complete tasks, earn coins, and withdraw real rewards instantly.
              </p>
            </div>

            <div className="w-full max-w-sm mb-12 space-y-4">

              {/* Google button removed */}

              <button
                onClick={() => setViewState('manual_email')}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-full shadow-lg hover:bg-blue-700 transition active:scale-95"
              >
                Sign in with Email
              </button>
            </div>
          </div>
        )}

        {/* EMAIL LOGIN */}
        {viewState === 'manual_email' && (
          <div className="p-8 flex flex-col items-center h-full">

            <div className="w-full max-w-sm space-y-4">

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                onClick={processEmailLogin}
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Login"}
              </button>
            </div>
          </div>
        )}

        {/* REGISTER */}
        {viewState === 'register' && (
          <div className="p-6 h-full overflow-y-auto bg-white dark:bg-gray-900">

            <div className="space-y-5 max-w-lg mx-auto">

              {/* Name */}
              <input
                placeholder="Full Name"
                className="w-full p-3 border rounded-xl"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              {/* Mobile */}
              <input
                placeholder="Mobile"
                className="w-full p-3 border rounded-xl"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />

              {/* Password */}
              <input
                type="password"
                placeholder="Create Password"
                className="w-full p-3 border rounded-xl"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />

              {/* DOB */}
              <input
                type="date"
                className="w-full p-3 border rounded-xl"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />

              {/* District */}
              <input
                placeholder="District"
                className="w-full p-3 border rounded-xl"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              />

              <button
                onClick={handleRegister}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl"
              >
                Register
              </button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Login;
