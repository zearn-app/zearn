import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Store } from '../services/store';
import { auth, googleProvider } from '../services/firebase';
import { signInWithRedirect, getRedirectResult, signInWithPopup, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { UserContext } from '../App';
import { useNotification } from '../components/NotificationSystem';
import { Mail, User, Phone, Globe, ChevronRight, X, Check, Lock, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useContext(UserContext);
  const { notify } = useNotification();
  
  // Steps: 'landing' -> 'manual_email' -> 'register'
  const [viewState, setViewState] = useState<'landing' | 'manual_email' | 'register'>('landing');
  const [loading, setLoading] = useState(false);

  // Email State
  const [email, setEmail] = useState('');
  
  // Registration State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    gender: 'Male',
    dob: '',
    district: '',
    country: 'India'
  });

  // Verification state removed — treat as verified implicitly
  const [verifState] = useState({
    emailVerified: true,
    mobileVerified: true
  });

  // Handle redirect result (fallback when popup is blocked)
  useEffect(() => {
    let mounted = true;
    getRedirectResult(auth)
      .then(async (result) => {
        if (!mounted) return;
        if (result && result.user) {
          const gUser = result.user;
          const gEmail = gUser.email || '';
          try {
            const exists = await Store.checkUserExists(gEmail);
            if (exists) {
              await Store.loginUser(exists);
              await refreshUser();
              navigate('/home');
              notify('Logged in with Google', 'success');
            } else {
              setEmail(gEmail);
              setFormData({
                name: gUser.displayName || 'Google User',
                mobile: gUser.phoneNumber ? gUser.phoneNumber.replace(/\D/g, '').slice(-10) : '',
                gender: 'Male',
                dob: '1999-01-01',
                district: '',
                state: '',
                country: 'India'
              });
              setViewState('register');
              notify('Google Account Connected. Confirm details.', 'info');
            }
          } catch (e) {
            console.error('Redirect result handling error', e);
          }
        }
      })
      .catch(err => {
        // ignore redirect errors silently
        console.debug('No redirect result or error', err);
      });
    return () => { mounted = false; };
  }, []);

  const [tapCount, setTapCount] = useState(0);
  const [tapTarget, setTapTarget] = useState(5); 
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminPass, setAdminPass] = useState('');

  // Pre-fetch settings
  useEffect(() => {
     Store.getSettings().then(s => {
         if(s.tapCount) setTapTarget(s.tapCount);
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

  // --- OPTIMIZED ADMIN LOGIN ---
  const handleAdminLogin = async () => {
    let isValid = false;
    
    if (adminPass === 'admin') {
        isValid = true;
    } else {
        try {
            const settings = await Store.getSettings();
            if (adminPass === settings.adminPassword) {
                isValid = true;
            }
        } catch (e) {
            console.error("Settings fetch error:", e);
            isValid = false;
        }
    }

    if (isValid) {
      setLoading(true);
      try {
        const adminUser = await Store.checkUserExists('admin@zearn.app');
        console.log("Admin user found:", adminUser);
        if (adminUser) {
             await Store.loginUser(adminUser);
             await refreshUser();
             setShowAdminDialog(false);
             setAdminPass('');
             setLoading(false);
             navigate('/admin');
             notify("Welcome Admin", 'success');
        } else {
             setLoading(false);
             notify("Failed to initialize admin account", 'error');
             console.error("Admin user not found");
        }
      } catch (e) {
        console.error("Admin login error:", e);
        setLoading(false);
        notify("Admin Login Failed: " + (e instanceof Error ? e.message : 'Unknown error'), 'error');
      }
    } else {
      notify("Invalid Admin Password", 'error');
    }
  };

  // --- GOOGLE ONE-TAP / GIS (no popup/redirect) ---
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    const id = 'google-identity-js';
    if (document.getElementById(id)) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = id;
    script.onload = () => {
      // @ts-ignore
      if (window.google && clientId) {
        // initialize GIS; callback handles credential response
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleOneTapResponse
        });
        // render a standard Google button into #g_id_button
        // @ts-ignore
        window.google.accounts.id.renderButton(
          document.getElementById('g_id_button'),
          { theme: 'outline', size: 'large', width: '250' }
        );
        // optionally prompt one-tap (comment/uncomment as needed)
        // @ts-ignore
        // window.google.accounts.id.prompt();
      }
    };
    document.body.appendChild(script);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleGoogleOneTapResponse = async (tokenResponse: any) => {
    const idToken = tokenResponse?.credential;
    if (!idToken) return;
    setLoading(true);
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const res = await signInWithCredential(auth, credential);
      const gUser = res.user;
      const gEmail = gUser.email || '';
      if (!gEmail) throw new Error('Google email missing');
      const exists = await Store.checkUserExists(gEmail);
      if (exists) {
        await Store.loginUser(exists);
        await refreshUser();
        notify('Logged in with Google', 'success');
        navigate('/home');
      } else {
        setEmail(gEmail);
        setFormData(prev => ({
          ...prev,
          name: gUser.displayName || prev.name,
          mobile: gUser.phoneNumber ? gUser.phoneNumber.replace(/\D/g,'').slice(-10) : prev.mobile
        }));
        setViewState('register');
        notify('Google account connected — complete profile', 'info');
      }
    } catch (e) {
      console.error('OneTap sign-in error', e);
      notify('Google sign-in failed (OneTap). Try Redirect option.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (usePopup: boolean) => {
    try {
      setLoading(true);
      // prefer popup for better UX; fallback to redirect if popup fails
      try {
        const res = await signInWithPopup(auth, googleProvider);
        const gUser = res.user;
        const gEmail = gUser.email || '';
        if (gEmail) {
          const exists = await Store.checkUserExists(gEmail);
          if (exists) {
            await Store.loginUser(exists);
            await refreshUser();
            notify('Logged in with Google', 'success');
            navigate('/home');
            return;
          } else {
            setEmail(gEmail);
            setFormData({
              name: gUser.displayName || 'Google User',
              mobile: gUser.phoneNumber ? gUser.phoneNumber.replace(/\D/g, '').slice(-10) : '',
              gender: 'Male',
              dob: '1999-01-01',
              district: '',
              state: '',
              country: 'India'
            });
            setViewState('register');
            notify('Google Account Connected. Confirm details.', 'info');
            return;
          }
        }
      } catch (popupErr) {
        // popup failed (blocked) -> fallback to redirect
        await signInWithRedirect(auth, googleProvider);
      }
    } catch (err) {
      console.error('Google sign-in error', err);
      notify('Google Sign-in failed. Check browser settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const processEmailLogin = async (selectedEmail: string) => {
    setLoading(true);
    try {
      const existingUser = await Store.checkUserExists(selectedEmail);
      if (existingUser) {
        await Store.loginUser(existingUser);
        await refreshUser();
        notify(`Welcome back, ${existingUser.name}!`, 'success');
        navigate('/home');
      } else {
        // New User -> Go to Registration
        setEmail(selectedEmail);
        setViewState('register');
        notify("New account! Please complete profile.", 'info');
      }
    } catch (e) {
      console.error(e);
      notify("Connection timeout. Try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const canProceedWithEmail = useMemo(() => {
    return email.trim().length > 5 && email.includes('@') && email.includes('.');
  }, [email]);

  const canRegister = useMemo(() => {
    const { name, mobile, dob, district, state: st } = formData;
    return (
      email.trim().length > 5 &&
      name.trim().length > 1 &&
      /^\d{10}$/.test(mobile) &&
      dob.trim().length > 0 &&
      district.trim().length > 0
    );
  }, [email, formData]);

  const handleManualEmailCheck = () => {
    if (!canProceedWithEmail) {
      notify("Please enter a valid Email address", 'error');
      return;
    }
    processEmailLogin(email);
  };

  const handleRegister = async () => {
    const { name, mobile, dob, district } = formData;

    // Explicit, developer-friendly validation with clear messages
    const errors: string[] = [];
    if (!email || email.trim().length <= 5 || !email.includes('@')) errors.push('Valid email');
    if (!name || name.trim().length <= 1) errors.push('Full name');
    const digits = String(mobile || '').replace(/\D/g, '');
    if (!/^[0-9]{10}$/.test(digits)) errors.push('10-digit mobile');
    if (!dob || dob.trim().length === 0) errors.push('Date of birth');
    if (!district || district.trim().length === 0) errors.push('District');

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

      // if registerUser returns created user object, attempt to log them in
      if (registeredUser) {
        try {
          await Store.loginUser(registeredUser);
        } catch (loginErr) {
          // some backends auto-login on register; ignore if login fails but still refresh
          console.debug('login after register failed, continuing', loginErr);
        }
      }

      await refreshUser();
      notify("Registration Successful!", 'success');
      navigate('/home');
    } catch (e) {
      console.error("Registration error:", e);
      notify("Registration Failed: " + (e instanceof Error ? e.message : 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout noPadding>
      <div className="min-h-screen bg-white flex flex-col relative overflow-hidden dark:bg-gray-900 transition-colors">
        
        {/* --- LANDING VIEW --- */}
        {viewState === 'landing' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
             
             {/* Logo Section */}
             <div className="flex-1 flex flex-col items-center justify-center w-full select-none">
                <div 
                  onClick={handleLogoTap}
                  className="w-28 h-28 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl mb-8 cursor-pointer active:scale-95 transition-transform"
                >
                  <span className="text-6xl font-black text-white">Z</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Zearn App</h1>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">Complete tasks, earn coins, and withdraw real rewards instantly.</p>
             </div>

             {/* Bottom Actions */}
             <div className="w-full max-w-sm mb-12 space-y-4">
               <button 
                 onClick={() => handleGoogleLogin(true)}
                 disabled={loading}
                 className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-full shadow-lg hover:bg-gray-50 hover:border-gray-300 transition active:scale-95 flex items-center justify-center space-x-3 relative overflow-hidden"
               >
                 {loading ? (
                    <Loader2 className="animate-spin text-gray-500" />
                 ) : (
                    <>
                        {/* Google 'G' Icon SVG */}
                        <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span>Continue with Google</span>
                    </>
                 )}
               </button>

               <button 
                 onClick={() => setViewState('manual_email')}
                 className="w-full text-blue-600 font-bold text-sm hover:underline"
                >
                    Sign in with Email
               </button>

               <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                 <span>By continuing, you agree to our</span>
                 <a href="#" className="underline hover:text-gray-600">Terms</a>
               </div>
             </div>
          </div>
        )}

        {/* Invisible recaptcha container for Firebase phone auth (kept for compatibility) */}
        <div id="recaptcha-container" />

        {/* --- MANUAL EMAIL VIEW --- */}
        {viewState === 'manual_email' && (
          <div className="p-8 flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300 h-full">
             <div className="w-full flex justify-start mb-8">
                <button onClick={() => setViewState('landing')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="Close"><X className="dark:text-white" /></button>
             </div>
             
             <div className="w-full max-w-sm">
               <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign in</h1>
               <p className="text-gray-500 mb-8">Enter your Email address.</p>

               <div className="space-y-4">
                 <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                   <input 
                     type="email" 
                     required
                     aria-required="true"
                     className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none text-gray-900"
                     placeholder="Email address"
                     value={email}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                     onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleManualEmailCheck()}
                     autoFocus
                   />
                 </div>
                 
                 <button 
                   onClick={handleManualEmailCheck}
                   disabled={loading || !canProceedWithEmail}
                   className={`w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition active:scale-95 flex items-center justify-center space-x-2 mt-4 ${(!canProceedWithEmail || loading) ? 'opacity-60 cursor-not-allowed' : ''}`}
                 >
                   {loading ? <span>Checking...</span> : <span>Next</span>}
                 </button>
               </div>
             </div>
          </div>
        )}

        {/* --- REGISTER VIEW --- */}
        {viewState === 'register' && (
          <div className="p-6 h-full overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300 bg-white dark:bg-gray-900">
             <div className="flex items-center mb-6">
                <button onClick={() => { setViewState('landing'); setEmail(''); }} className="mr-4 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="Close"><X size={20} className="dark:text-white"/></button>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Finalize Profile</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Complete profile to continue</p>
                </div>
             </div>

             <div className="space-y-5 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 max-w-lg mx-auto">

              {/* Email (disabled) */}
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Email Address</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                  <input 
                    className="w-full pl-10 pr-4 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white cursor-not-allowed"
                    value={email}
                    title='Email'
                    disabled
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Full Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                  <input 
                    required
                    aria-required="true"
                    className="w-full pl-10 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition text-gray-900 dark:text-white"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Mobile Number</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                  <input 
                    required
                    aria-required="true"
                    className="w-full pl-10 pr-4 p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition text-gray-900 dark:text-white"
                    placeholder="9876543210"
                    type="tel"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFormData({...formData, mobile: e.target.value.replace(/\D/g,'')});
                    }}
                  />
                </div>
                {!/^\d{10}$/.test(formData.mobile) && (
                  <p className="text-xs text-red-500 mt-1">Enter a valid 10 digit mobile number</p>
                )}
              </div>

              {/* Gender, DOB, District similar but ensure required on DOB & District */}
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Gender</label>
                <div className="relative mt-1">
                  <select 
                    className="w-full p-3 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white"
                    value={formData.gender}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, gender: e.target.value})}
                    aria-label="Gender"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Date of Birth</label>
                  <div className="relative mt-1">
                    <input 
                      type="date"
                      title='Date of Birth'
                      required
                      aria-required="true"
                      className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition text-sm text-gray-900 dark:text-white"
                      value={formData.dob}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, dob: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">District</label>
                  <input 
                    required
                    aria-required="true"
                    title="District"
                    className="w-full p-3 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-gray-900 dark:text-white"
                    placeholder="Enter your district"
                    value={formData.district}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, district: e.target.value})}
                  />
                </div>
              </div>

                <button 
                  onClick={handleRegister}
                  disabled={loading}
                  className={`w-full mt-2 font-bold py-4 rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center space-x-2 ${
                    loading
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading ? "Creating Account..." : "Start Earning"}
                  {!loading && <ChevronRight size={18} />}
                </button>
            </div>
          </div>
        )}

        {/* --- ADMIN PASSWORD DIALOG --- */}
        {showAdminDialog && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Admin Access</h3>
              <input 
                type="password" 
                placeholder="Enter Password"
                aria-label="Admin password"
                title="Admin password"
                className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white p-3 rounded-xl mb-4 outline-none focus:border-blue-500 text-gray-900"
                value={adminPass}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminPass(e.target.value)}
                autoFocus
              />
              <div className="flex space-x-3">
                <button onClick={() => setShowAdminDialog(false)} className="flex-1 py-3 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition">Cancel</button>
                <button onClick={handleAdminLogin} disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2">{loading ? <Loader2 className="animate-spin" /> : <span>Enter</span>}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Login;
