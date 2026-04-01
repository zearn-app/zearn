import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  const [coins, setCoins] = useState(0);
  const [money, setMoney] = useState(0);
  const [users, setUsers] = useState(0);
  const [transactions, setTransactions] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  // Mouse spotlight
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

        {/* 💰 FLOATING COINS */}
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

          <p className="text-xs text-gray-500 mt-6">
            🔒 Secure • ⚡ Instant Rewards • 💸 Real Withdrawals
          </p>
        </div>
      </div>

      {/* MODAL */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in" onClick={() => setShowPopup(false)} />

          <div className="bg-[#0f1117] border border-white/10 p-10 rounded-[40px] w-full max-w-md z-10 shadow-3xl animate-modal-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>

            <div className="h-16 w-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20">
              <div className="h-3 w-3 bg-cyan-400 rounded-full animate-ping"></div>
            </div>

            <h2 className="text-3xl font-bold mb-3 tracking-tight">Ready to claim?</h2>

            <p className="text-gray-400 leading-relaxed mb-8">
              Your bonus of <span className="text-white font-bold">₹{money}</span> is ready.
              Join <span className="text-cyan-400 font-bold">1L+ users</span> already earning.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => navigate("/login")}
                className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-2xl transition-all shadow-lg shadow-cyan-500/20"
              >
                Connect Dashboard
              </button>

              <button
                onClick={() => setShowPopup(false)}
                className="w-full py-2 text-sm font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
              >
                Dismiss
              </button>
            </div>
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
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          100% {
            transform: translateY(120vh) rotate(360deg);
            opacity: 0;
          }
        }

        .perspective-2000 { perspective: 2000px; }

        .mesh-gradient {
          position: absolute;
          width: 100%; height: 100%;
          background-image:
            radial-gradient(at 0% 0%, #0a1628 0, transparent 50%),
            radial-gradient(at 100% 100%, #1a0b2e 0, transparent 50%);
        }

        .spotlight-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .spotlight-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.06), transparent 40%);
          border-radius: inherit;
        }

        .stat-box {
          background: rgba(255, 255, 255, 0.03);
          padding: 2rem;
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.4s ease;
        }

        .stat-box:hover {
          transform: translateY(-5px);
        }

        .text-3d-gradient {
          background: linear-gradient(to right, #22d3ee, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .shimmer-btn::after {
          content: "";
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }

        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .animate-modal-in { animation: modal-in 0.5s ease forwards; }
        .animate-fade-in { animation: fadeIn 0.4s ease forwards; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .tabular-nums { font-variant-numeric: tabular-nums; }
      `}</style>
    </div>
  );
};

export default Onboarding;
