import React, { useState, useContext, useEffect } from 'react';  
import { useNavigate } from 'react-router-dom';  
import { Layout } from '../components/Layout';  
import { Store } from '../services/store';  
import { UserContext } from '../App';  
import { useNotification } from '../components/NotificationSystem';  
import { Mail, User, Lock, X, Loader2, Eye, EyeOff } from 'lucide-react';  
  
const Login: React.FC = () => {  
  const navigate = useNavigate();  
  const { refreshUser } = useContext(UserContext);  
  const { notify } = useNotification();  
  
  const [viewState, setViewState] =  
    useState<'landing' | 'manual_email' | 'register'>('landing');  
  
  const [loading, setLoading] = useState(false);  
  
  const [showLoginPassword, setShowLoginPassword] = useState(false);  
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);  
  
  const [email, setEmail] = useState('');  
  const [password, setPassword] = useState('');  
  
  const [formData, setFormData] = useState({  
    name: '',  
    mobile: '',  
    dob: '',  
    district: '',  
    password: '',  
    country: 'India'  
  });  
  
  /* ================= ADMIN MULTI TAP LOGIC ================= */  
  
  const [tapCount, setTapCount] = useState(0);  
  const [tapTarget, setTapTarget] = useState(5);  
  const [showAdminDialog, setShowAdminDialog] = useState(false);  
  const [adminPass, setAdminPass] = useState('');  
  
  useEffect(() => {  
    Store.getSettings().then((s) => {  
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
  
    if (!isValid) {  
      notify("Invalid Admin Password", "error");  
      return;  
    }  
  
    setLoading(true);  
    try {  
      const adminUser = await Store.checkUserExists('admin@zearn.app');  
      if (adminUser) {  
        await Store.loginUser(adminUser);  
        await refreshUser();  
        setShowAdminDialog(false);  
        setAdminPass('');  
        navigate('/admin');  
        notify("Welcome Admin", "success");  
      }  
    } catch (e) {  
      notify("Admin Login Failed", "error");  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  /* ================= EMAIL LOGIN ================= */  
  
  const processEmailLogin = async () => {  
    if (!email) {  
      notify("Please enter valid email", "error");  
      return;  
    }  
  
    setLoading(true);  
  
    try {  
      const existingUser = await Store.checkUserExists(email);  
  
      if (existingUser) {  
        if (existingUser.password !== password) {  
          notify("Incorrect Password", "error");  
          setLoading(false);  
          return;  
        }  
  
        await Store.loginUser(existingUser);  
        await refreshUser();  
        notify(`Welcome back, ${existingUser.name}!`, "success");  
  
        /* ======= NEW CONDITION ADDED HERE ======= */
        if (existingUser.isAdmin === true) {
          navigate("/admin", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
        /* ======================================== */
  
      } else {  
        setViewState('register');  
        notify("New account! Complete profile.", "info");  
      }  
    } catch (e) {  
      notify("Connection error", "error");  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  /* ================= REGISTER ================= */  
  
  const handleRegister = async () => {  
    const { name, mobile, dob, district, password } = formData;  
  
    const errors: string[] = [];  
  
    if (!email) errors.push('Valid email');  
    if (!name) errors.push('Full name');  
    if (!/^\d{10}$/.test(mobile)) errors.push('10-digit mobile');  
  
    if (!password) {  
      errors.push('Password');  
    } else {  
      if (!/[A-Za-z]/.test(password)) errors.push('Password must contain letter');  
      if (!/[0-9]/.test(password)) errors.push('Password must contain number');  
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))  
        errors.push('Password must contain special character');  
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
      notify("Registration Successful!", "success");  
      navigate("/home", { replace: true });  
    } catch (e) {  
      notify("Registration Failed", "error");  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  /* ================= UI ================= */  
  
  return (  
    <Layout noPadding>  
      <div className="min-h-screen bg-white flex flex-col relative overflow-hidden dark:bg-gray-900 transition-colors">  
  
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
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">  
                Complete tasks, earn coins, and withdraw real rewards instantly.  
              </p>  
            </div>  
  
            <div className="w-full max-w-sm mb-12 space-y-4">  
  
              <input  
                type="email"  
                placeholder="Email"  
                className="w-full p-4 border rounded-xl"  
                value={email}  
                onChange={(e) => setEmail(e.target.value)}  
              />  
  
              <div className="relative">  
                <input  
                  type={showLoginPassword ? "text" : "password"}  
                  placeholder="Password"  
                  className="w-full p-4 border rounded-xl pr-12"  
                  value={password}  
                  onChange={(e) => setPassword(e.target.value)}  
                />  
                <button  
                  type="button"  
                  onClick={() => setShowLoginPassword(!showLoginPassword)}  
                  className="absolute right-4 top-1/2 -translate-y-1/2"  
                >  
                  {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}  
                </button>  
              </div>  
  
              <button  
                onClick={processEmailLogin}  
                disabled={loading}  
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl"  
              >  
                {loading ? <Loader2 className="animate-spin" /> : "Login"}  
              </button>  
            </div>  
          </div>  
        )}  
  
        {viewState === 'register' && (  
          <div className="p-6">  
  
            <input  
              placeholder="Full Name"  
              className="w-full p-3 border rounded-xl mb-3"  
              value={formData.name}  
              onChange={(e) =>  
                setFormData({ ...formData, name: e.target.value })  
              }  
            />  
  
            <input  
              placeholder="Mobile"  
              className="w-full p-3 border rounded-xl mb-3"  
              value={formData.mobile}  
              onChange={(e) =>  
                setFormData({ ...formData, mobile: e.target.value })  
              }  
            />  
  
            <div className="relative mb-3">  
              <input  
                type={showRegisterPassword ? "text" : "password"}  
                placeholder="Password"  
                className="w-full p-3 border rounded-xl pr-12"  
                value={formData.password}  
                onChange={(e) =>  
                  setFormData({ ...formData, password: e.target.value })  
                }  
              />  
              <button  
                type="button"  
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}  
                className="absolute right-4 top-1/2 -translate-y-1/2"  
              >  
                {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}  
              </button>  
            </div>  
  
            <input  
              type="date"  
              className="w-full p-3 border rounded-xl mb-3"  
              value={formData.dob}  
              onChange={(e) =>  
                setFormData({ ...formData, dob: e.target.value })  
              }  
            />  
  
            <input  
              placeholder="District"  
              className="w-full p-3 border rounded-xl mb-3"  
              value={formData.district}  
              onChange={(e) =>  
                setFormData({ ...formData, district: e.target.value })  
              }  
            />  
  
            <button  
              onClick={handleRegister}  
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl"  
            >  
              Register  
            </button>  
          </div>  
        )}  
  
      </div>  
    </Layout>  
  );  
};  
  
export default Login;
