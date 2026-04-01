import React, { useEffect, useState } from "react";  
import { useNavigate } from "react-router-dom";  
  
const Onboarding: React.FC = () => {  
  const navigate = useNavigate();  
  
  const [coins, setCoins] = useState(0);  
  const [money, setMoney] = useState(0);  
  const [users, setUsers] = useState(0);  
  const [transactions, setTransactions] = useState(0);  
  const [showPopup, setShowPopup] = useState(false);  
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {  
    const card = e.currentTarget;  
    const rect = card.getBoundingClientRect();  
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);  
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);  
  };  
  
  useEffect(() => {  
    let c = 0, m = 0, u = 0, t = 0;  
  
    const interval = setInterval(() => {  
      if (c < 5000) c += 50;  
      if (m < 2500) m += 25;  
      if (u < 100000) u += 2000;  
      if (t < 50000) t += 1000;  
  
      setCoins(c);  
      setMoney(m);  
      setUsers(u);  
      setTransactions(t);  
  
      if (c >= 5000 && m >= 2500 && u >= 100000 && t >= 50000) {  
        clearInterval(interval);  
      }  
    }, 25);  
  
    return () => clearInterval(interval);  
  }, []);  
  
  return (  
    <div className="relative min-h-screen bg-[#020408] overflow-hidden flex flex-col justify-center items-center text-white font-sans selection:bg-cyan-500/30">  
  
      {/* BACKGROUND */}  
      <div className="absolute inset-0 overflow-hidden pointer-events-none">  
        {[...Array(25)].map((_, i) => (  
          <div  
            key={i}  
            className="coin"  
            style={{  
              left: `${Math.random() * 100}%`,  
              animationDelay: `${Math.random() * 10}s`,  
              animationDuration: `${6 + Math.random() * 6}s`  
            }}  
          >  
            💰  
          </div>  
        ))}  
  
        <div className="mesh-gradient opacity-30"></div>  
  
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse"></div>  
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }}></div>  
      </div>  
  
      {/* MAIN */}  
      <div className="z-10 text-center px-6 perspective-2000">  
        <div  
          onMouseMove={handleMouseMove}  
          className="spotlight-card p-12 rounded-[48px] border border-white/10 relative group transition-all duration-700"  
        >  
  
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">  
            <span className="text-[10px] font-bold tracking-[3px] text-cyan-400 uppercase">  
              Trusted Platform 🚀  
            </span>  
          </div>  
  
          <h1 className="text-6xl font-black mb-4 tracking-tighter leading-none">  
            Earn <span className="text-3d-gradient">Digital money </span>  
          </h1>  
  
          <p className="text-gray-400 font-medium mb-10 max-w-md mx-auto leading-relaxed">  
            Join thousands of users already earning daily rewards. Safe, fast, and growing every day.  
          </p>  
  
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">  
            <div className="stat-box">  
              <span className="text-sm text-gray-500">Happy Users</span>  
              <span className="text-3xl font-black">{users.toLocaleString()}+</span>  
            </div>  
  
            <div className="stat-box">  
              <span className="text-sm text-gray-500">Weekly Transactions</span>  
              <span className="text-3xl font-black">{transactions.toLocaleString()}+</span>  
            </div>  
          </div>  
  
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">  
            <div className="stat-box">  
              <span className="text-sm font-medium text-gray-500 mb-1">Total Earnings</span>  
              <span className="text-4xl font-black tabular-nums">₹{money.toLocaleString()}</span>  
            </div>  
  
            <div className="stat-box">  
              <span className="text-sm font-medium text-gray-500 mb-1">Available Coins</span>  
              <span className="text-4xl font-black tabular-nums">{coins.toLocaleString()}</span>  
            </div>  
          </div>  
  
          <button  
            onClick={() => setShowPopup(true)}  
            className="group relative px-14 py-6 bg-white text-black font-black text-xl rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-2xl overflow-hidden shimmer-btn"  
          >  
            <span className="relative z-10 flex items-center gap-3">  
              GET STARTED NOW  
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">  
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />  
              </svg>  
            </span>  
          </button>  

          {/* 🔥 SOCIAL MEDIA BUTTONS */}
          <div className="flex justify-center gap-4 mt-8 flex-wrap">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn">📸 Instagram</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-btn">▶️ YouTube</a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="social-btn">📢 Telegram</a>
          </div>
  
          <p className="text-xs text-gray-500 mt-6">  
            🔒 Secure • ⚡ Instant Rewards • 💸 Real Withdrawals  
          </p>  
        </div>  
      </div>  
  
      {/* MODAL (unchanged) */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in" onClick={() => setShowPopup(false)} />
          <div className="bg-[#0f1117] border border-white/10 p-10 rounded-[40px] w-full max-w-md z-10 shadow-3xl animate-modal-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
            <h2 className="text-3xl font-bold mb-3 tracking-tight">Ready to claim?</h2>
            <button onClick={() => navigate("/login")} className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl">
              Connect Dashboard
            </button>
          </div>
        </div>
      )}

      <style>{`
        .coin {
          position: absolute;
          top: -10%;
          font-size: 22px;
          opacity: 0.8;
          animation: floatCoin linear infinite;
        }

        @keyframes floatCoin {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(120vh) rotate(360deg); opacity: 0; }
        }

        .social-btn {
          padding: 10px 18px;
          border-radius: 14px;
          font-weight: bold;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .social-btn:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
