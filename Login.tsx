import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Store } from '../services/store';
import { auth, googleProvider } from '../services/firebase';
import {
  signInWithRedirect,
  getRedirectResult,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { UserContext } from '../App';
import { useNotification } from '../components/NotificationSystem';
import { Mail, User, Phone, Lock, X, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useContext(UserContext);
  const { notify } = useNotification();

  const [viewState, setViewState] = useState<
    'landing' | 'manual_email' | 'password' | 'register'
  >('landing');

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    dob: '',
    district: '',
    country: 'India'
  });

  /* ==============================
        GOOGLE LOGIN (FIXED)
  ============================== */

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result?.user) return;

        const gEmail = result.user.email || '';
        if (!gEmail) return;

        const exists = await Store.checkUserExists(gEmail);

        if (exists) {
          await Store.loginUser(exists);
          await refreshUser();
          navigate('/home');
          notify('Logged in with Google', 'success');
        } else {
          setEmail(gEmail);
          setFormData(prev => ({
            ...prev,
            name: result.user.displayName || '',
            mobile: result.user.phoneNumber
              ? result.user.phoneNumber.replace(/\D/g, '').slice(-10)
              : ''
          }));
          setViewState('register');
        }
      })
      .catch(() => {});
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      try {
        const res = await signInWithPopup(auth, googleProvider);
        await handleGoogleSuccess(res.user);
      } catch (popupError: any) {
        if (popupError.code === 'auth/popup-blocked') {
          await signInWithRedirect(auth, googleProvider);
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      notify(error.message || 'Google Sign-in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (gUser: any) => {
    const gEmail = gUser.email || '';
    if (!gEmail) return;

    const exists = await Store.checkUserExists(gEmail);

    if (exists) {
      await Store.loginUser(exists);
      await refreshUser();
      navigate('/home');
      notify('Logged in with Google', 'success');
    } else {
      setEmail(gEmail);
      setFormData(prev => ({
        ...prev,
        name: gUser.displayName || '',
        mobile: gUser.phoneNumber
          ? gUser.phoneNumber.replace(/\D/g, '').slice(-10)
          : ''
      }));
      setViewState('register');
    }
  };

  /* ==============================
        EMAIL CHECK
  ============================== */

  const handleEmailCheck = async () => {
    if (!email.includes('@')) {
      notify('Enter valid email', 'error');
      return;
    }

    setLoading(true);
    const existingUser = await Store.checkUserExists(email);

    if (existingUser) {
      setViewState('password');
    } else {
      setViewState('register');
    }

    setLoading(false);
  };

  /* ==============================
        PASSWORD LOGIN
  ============================== */

  const handlePasswordLogin = async () => {
    if (!password) {
      notify('Password required', 'error');
      return;
    }

    setLoading(true);

    try {
      const user = await Store.verifyUserPassword(email, password);

      if (!user) {
        notify('Invalid password', 'error');
        return;
      }

      await Store.loginUser(user);
      await refreshUser();
      navigate('/home');
    } catch {
      notify('Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
        REGISTER
  ============================== */

  const handleRegister = async () => {
    const errors: string[] = [];

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{6,}$/;

    if (!email) errors.push('Valid email');
    if (!formData.name) errors.push('Full name');
    if (!/^\d{10}$/.test(formData.mobile))
      errors.push('10-digit mobile');
    if (!passwordRegex.test(password))
      errors.push(
        'Password must contain letter, number & special character'
      );
    if (!formData.dob) errors.push('Date of birth');
    if (!formData.district) errors.push('District');

    if (errors.length) {
      notify(`Please provide: ${errors.join(', ')}`, 'error');
      return;
    }

    setLoading(true);

    try {
      const newUser = await Store.registerUser({
        email,
        password,
        ...formData
      });

      await Store.loginUser(newUser);
      await refreshUser();
      navigate('/home');
      notify('Registration Successful', 'success');
    } catch {
      notify('Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
        UI
  ============================== */

  return (
    <Layout>
      <div className="p-6 max-w-md mx-auto">

        {viewState === 'landing' && (
          <>
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white border p-3 rounded-lg mb-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Continue with Google'}
            </button>

            <button
              onClick={() => setViewState('manual_email')}
              className="text-blue-600"
            >
              Sign in with Email
            </button>
          </>
        )}

        {viewState === 'manual_email' && (
          <>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-3 rounded mb-3"
            />
            <button
              onClick={handleEmailCheck}
              className="w-full bg-blue-600 text-white p-3 rounded"
            >
              Next
            </button>
          </>
        )}

        {viewState === 'password' && (
          <>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded mb-3"
            />
            <button
              onClick={handlePasswordLogin}
              className="w-full bg-blue-600 text-white p-3 rounded"
            >
              Login
            </button>
          </>
        )}

        {viewState === 'register' && (
          <>
            <input
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border p-3 rounded mb-3"
            />

            <input
              placeholder="Mobile"
              value={formData.mobile}
              onChange={(e) =>
                setFormData({ ...formData, mobile: e.target.value })
              }
              className="w-full border p-3 rounded mb-3"
            />

            <input
              type="date"
              value={formData.dob}
              onChange={(e) =>
                setFormData({ ...formData, dob: e.target.value })
              }
              className="w-full border p-3 rounded mb-3"
            />

            <input
              placeholder="District"
              value={formData.district}
              onChange={(e) =>
                setFormData({ ...formData, district: e.target.value })
              }
              className="w-full border p-3 rounded mb-3"
            />

            <input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded mb-4"
            />

            <button
              onClick={handleRegister}
              className="w-full bg-green-600 text-white p-3 rounded"
            >
              Register
            </button>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Login;
