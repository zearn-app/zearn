import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Clock, AlertTriangle } from "lucide-react";

const Leaderboard: React.FC = () => {
  const TOTAL_SECONDS = 2 * 60 * 60; // 2 hours

  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Layout title="Top Earners" showBack>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        
        {/* Glass Card */}
        <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-6 text-center">
          
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full shadow-inner">
              <AlertTriangle className="text-yellow-300" size={32} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-2">
            Leaderboard Under Maintenance
          </h2>

          {/* Subtitle */}
          <p className="text-sm text-gray-200 mb-6">
            We’re updating the leaderboard.<br />
            Please try again later.
          </p>

          {/* Countdown Glass Box */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-gray-200 mb-2">
              <Clock size={18} />
              <span className="text-sm">Available in</span>
            </div>

            <div className="text-2xl font-mono font-bold text-blue-200 tracking-widest">
              {formatTime(secondsLeft)}
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition backdrop-blur-md border border-white/20"
          >
            Try Again
          </button>
        </div>
      </div>

      {/* Background Glow */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-black via-gray-900 to-black opacity-95"></div>
    </Layout>
  );
};

export default Leaderboard;
