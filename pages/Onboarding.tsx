import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [coins, setCoins] = useState(0);
  const [money, setMoney] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  /* ================= AUTO REDIRECT ================= */
 
  /* ================= COUNTER ================= */
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
    <div className="relative min-h-screen bg-[#0b0f1a] overflow-hidden flex flex-col justify-center items-center text-white">

      {/* ================= BACKGROUND GLOW ================= */}
      <div className="absolute w-[400px] h-[400px] bg-blue-500 opacity-20 blur-[120px] top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-purple-500 opacity-20 blur-[120px] bottom-[-100px] right-[-100px]" />

      {/* ================= FLOATING MONEY ================= */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <span
            key={i}
            className="absolute text-green-400 opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 20}px`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          >
            💸
          </span>
        ))}
      </div>

      {/* ================= MAIN CARD ================= */}
      <div className="z-10 text-center px-6 transform perspective-1000">

        <div className="glass-card p-8 rounded-3xl shadow-2xl">

          {/* TITLE */}
          <h1 className="text-4xl font-extrabold mb-4 gradient-text">
            Earn Money Online
          </h1>

          <p className="text-gray-300 mb-8">
            Complete tasks & withdraw real cash instantly
          </p>

          {/* COUNTERS */}
          <div className="flex justify-center gap-6 mb-10">
            <div className="card-3d">
              <p className="text-2xl font-bold">₹{money}</p>
              <p className="text-sm text-gray-400">Earned</p>
            </div>

            <div className="card-3d">
              <p className="text-2xl font-bold">{coins}</p>
              <p className="text-sm text-gray-400">Coins</p>
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={() => setShowPopup(true)}
            className="btn-3d px-8 py-4 rounded-2xl font-bold"
          >
            Get Started 🚀
          </button>
        </div>
      </div>

      {/* ================= LOGIN POPUP ================= */}
      {showPopup && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
          <div className="glass-card p-6 rounded-2xl w-80 animate-popup">

            <h2 className="text-lg font-semibold mb-4">Continue</h2>

            <button
              onClick={() => navigate("/login")}
              className="btn-3d w-full py-3 rounded-xl font-bold"
            >
              Go to Login →
            </button>

            <button
              onClick={() => setShowPopup(false)}
              className="w-full mt-3 text-sm text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ================= STYLES ================= */}
      <style>
        {`
        /* FLOATING */
        @keyframes float {
          0% { transform: translateY(100vh) rotate(0deg); }
          100% { transform: translateY(-10vh) rotate(360deg); }
        }

        .animate-float {
          animation: float linear infinite;
        }

        /* GLASS */
        .glass-card {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.15);
        }

        /* GRADIENT TEXT */
        .gradient-text {
          background: linear-gradient(90deg, #4facfe, #00f2fe);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* 3D CARD */
        .card-3d {
          background: rgba(255,255,255,0.1);
          padding: 16px;
          border-radius: 16px;
          transition: 0.3s;
          transform-style: preserve-3d;
        }

        .card-3d:hover {
          transform: rotateX(10deg) rotateY(-10deg) scale(1.05);
        }

        /* BUTTON */
        .btn-3d {
          background: linear-gradient(135deg, #4facfe, #6a11cb);
          box-shadow: 0 10px 25px rgba(0,0,0,0.4);
          transition: all 0.2s ease;
        }

        .btn-3d:hover {
          transform: translateY(-3px) scale(1.05);
        }

        .btn-3d:active {
          transform: scale(0.95);
        }

        /* POPUP */
        @keyframes popup {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-popup {
          animation: popup 0.3s ease-out;
        }
        `}
      </style>
    </div>
  );
};

export default Onboarding;
