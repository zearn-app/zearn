import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
// import { UserContext } from "../App"; // Adjust as per your context setup

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  // const { user } = useContext(UserContext);

  const [coins, setCoins] = useState(0);
  const [money, setMoney] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    let c = 0;
    let m = 0;
    const interval = setInterval(() => {
      if (c < 5000) c += 50;
      if (m < 2500) m += 25;
      setCoins(c);
      setMoney(m);
      if (c >= 5000 && m >= 2500) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#05070a] overflow-hidden flex flex-col justify-center items-center text-white font-sans selection:bg-cyan-500/30">
      
      {/* ================= DYNAMIC MESH BACKGROUND ================= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="mesh-gradient opacity-40"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* ================= FLOATING PARTICLES ================= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${15 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            <div className="h-2 w-2 bg-cyan-400 rounded-full blur-[2px]"></div>
          </div>
        ))}
      </div>

      {/* ================= MAIN 3D CONTAINER ================= */}
      <div className="z-10 text-center px-6 perspective-2000">
        <div className="glass-card-3d p-10 rounded-[40px] border border-white/10 relative group transition-all duration-500 hover:border-cyan-500/50">
          
          {/* Subtle Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[40px] pointer-events-none" />

          <h1 className="text-5xl font-black mb-2 tracking-tight">
            Earn <span className="text-3d-gradient">Real Cash</span>
          </h1>
          <p className="text-blue-200/60 font-medium mb-10 tracking-wide uppercase text-xs">
            The world's first decentralized reward system
          </p>

          {/* COUNTERS WITH ISOMETRIC TILT */}
          <div className="flex flex-col sm:flex-row justify-center gap-8 mb-12">
            <div className="stat-card-3d group">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white">₹{money.toLocaleString()}</span>
                <span className="text-[10px] uppercase tracking-[2px] text-cyan-400 font-bold">Total Earned</span>
              </div>
            </div>

            <div className="stat-card-3d group">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white">{coins.toLocaleString()}</span>
                <span className="text-[10px] uppercase tracking-[2px] text-purple-400 font-bold">Gold Coins</span>
              </div>
            </div>
          </div>

          {/* MASSIVE 3D BUTTON */}
          <button
            onClick={() => setShowPopup(true)}
            className="group relative px-12 py-5 bg-white text-black font-black text-lg rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(79,172,254,0.4)] overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              START EARNING <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-white group-hover:hidden" />
          </button>
        </div>
      </div>

      {/* ================= MODAL WITH OVERLAY ================= */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#05070a]/90 backdrop-blur-md transition-all animate-fade-in"
            onClick={() => setShowPopup(false)} 
          />
          <div className="bg-[#11141d] border border-white/10 p-8 rounded-[32px] w-full max-w-sm z-10 shadow-2xl animate-modal-in">
            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm mb-6">Connect your account to claim your ₹{money} daily bonus.</p>

            <button
              onClick={() => navigate("/login")}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all mb-3 shadow-lg shadow-cyan-500/20"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => setShowPopup(false)}
              className="w-full py-3 text-sm font-medium text-gray-500 hover:text-white transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

      <style>{`
        .perspective-2000 { perspective: 2000px; }

        /* MESH BACKGROUND */
        .mesh-gradient {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(at 0% 0%, hsla(210,100%,10%,1) 0, transparent 50%), 
            radial-gradient(at 100% 0%, hsla(255,100%,10%,1) 0, transparent 50%), 
            radial-gradient(at 100% 100%, hsla(210,100%,10%,1) 0, transparent 50%), 
            radial-gradient(at 0% 100%, hsla(255,100%,10%,1) 0, transparent 50%);
        }

        /* 3D MAIN CARD */
        .glass-card-3d {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(25px);
          transform: rotateX(5deg);
          box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.5), 
                      inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }

        /* 3D STAT CARDS */
        .stat-card-3d {
          background: rgba(255, 255, 255, 0.05);
          padding: 24px 40px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transform: rotateY(15deg);
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: -10px 10px 20px rgba(0,0,0,0.3);
        }

        .stat-card-3d:hover {
          transform: rotateY(0deg) rotateX(0deg) scale(1.1) translateY(-10px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        /* TEXT GRADIENT */
        .text-3d-gradient {
          background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 5px 15px rgba(79,172,254,0.4));
        }

        /* ANIMATIONS */
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, -20px) rotate(180deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }

        .animate-float {
          animation: float linear infinite;
        }

        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.9) translateY(20px); filter: blur(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        .animate-modal-in { animation: modal-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease forwards; }
      `}</style>
    </div>
  );
};

export default Onboarding;
