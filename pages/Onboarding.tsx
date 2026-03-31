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
  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user]);

  /* ================= COUNTER ANIMATION ================= */
  useEffect(() => {
    let c = 0;
    let m = 0;

    const interval = setInterval(() => {
      if (c < 5000) c += 50;
      if (m < 2500) m += 25;

      setCoins(c);
      setMoney(m);

      if (c >= 5000 && m >= 2500) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-center items-center text-white">

      {/* ================= FLOATING MONEY ================= */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            className="absolute text-green-400 opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 20}px`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          >
            $
          </span>
        ))}
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="z-10 text-center px-6">

        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
          Earn Money Online 💸
        </h1>

        <p className="text-gray-300 mb-8">
          Complete simple tasks & withdraw real cash instantly
        </p>

        {/* ================= COUNTERS ================= */}
        <div className="flex justify-center gap-6 mb-10">
          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl">
            <p className="text-2xl font-bold">₹{money}</p>
            <p className="text-sm text-gray-400">Earned</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl">
            <p className="text-2xl font-bold">{coins}</p>
            <p className="text-sm text-gray-400">Coins</p>
          </div>
        </div>

        {/* ================= LOGIN BUTTON ================= */}
        <button
          onClick={() => setShowPopup(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition"
        >
          Get Started
        </button>
      </div>

      {/* ================= GLASS LOGIN PREVIEW ================= */}
      {showPopup && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl w-80 shadow-2xl animate-fadeIn">

            <h2 className="text-xl font-bold mb-4 text-center">
              Login Preview 🔐
            </h2>

            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 mb-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 mb-4 rounded-lg bg-white/20 placeholder-gray-300 outline-none"
            />

            <button
              onClick={() => navigate("/login")}
              className="w-full bg-blue-600 py-3 rounded-xl font-bold"
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
        @keyframes float {
          0% { transform: translateY(100vh) rotate(0deg); }
          100% { transform: translateY(-10vh) rotate(360deg); }
        }

        .animate-float {
          animation-name: float;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        `}
      </style>
    </div>
  );
};

export default Onboarding;