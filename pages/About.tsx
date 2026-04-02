import React, { useState } from "react";
import { Layout } from "../components/Layout";

const About: React.FC = () => {
  const [popup, setPopup] = useState<{ title: string; link: string } | null>(null);

  const openSocial = (title: string, link: string) => {
    setPopup({ title, link });
  };

  const proceedLink = () => {
    if (popup) {
      window.open(popup.link, "_blank");
      setPopup(null);
    }
  };

  return (
    <Layout title="About Us" showBack>
      <div className="relative p-3 space-y-5 overflow-hidden">

        {/* BACKGROUND GLOW BLOBS */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-500 opacity-30 blur-3xl rounded-full"></div>
        <div className="absolute top-40 -right-20 w-72 h-72 bg-pink-500 opacity-30 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-blue-500 opacity-30 blur-3xl rounded-full"></div>

        {/* HERO GLASS */}
        <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 text-white rounded-2xl p-5 shadow-xl bg-gradient-to-r from-purple-600/60 via-pink-500/60 to-blue-500/60">
          <h2 className="text-3xl font-bold tracking-wide">Zearn ✨</h2>
          <p className="mt-2 text-sm opacity-90">
            Earn smarter. Learn better. Grow every day.
          </p>
        </div>

        {/* GLASS CARD STYLE */}
        {/** reusable class idea */}
        {/** bg-white/60 + backdrop-blur-lg gives glass effect */}

        {/* ABOUT */}
        <div className="backdrop-blur-lg bg-white/60 border border-white/30 rounded-2xl p-4 shadow-lg hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-gray-800">About Zearn</h3>

          <p className="text-gray-600 text-sm mt-2">
            Zearn is a smart rewards platform designed to help users earn while exploring digital activities.
          </p>

          <p className="text-gray-800 font-semibold mt-2">
            👉 Your time should be valuable, and your effort should be rewarded.
          </p>

          <p className="text-gray-600 text-sm mt-2">
            Complete tasks, play games, watch content, and participate in challenges.
          </p>
        </div>

        {/* FEATURES */}
        <div className="backdrop-blur-lg bg-white/60 border border-white/30 rounded-2xl p-4 shadow-lg">
          <h3 className="font-bold text-lg mb-3">🌟 Features</h3>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              "Secure Login",
              "Real-time Earnings",
              "Daily Tasks",
              "Games & Challenges",
              "App Missions",
              "Fair Rewards",
              "Profile Tracking",
              "Easy Withdrawals",
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-md p-2 rounded-xl text-center font-medium shadow hover:scale-105 hover:shadow-md transition"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* SAFETY */}
        <div className="backdrop-blur-lg bg-white/60 border border-white/30 rounded-2xl p-4 shadow-lg">
          <h3 className="font-bold text-lg">🔒 Safety</h3>
          <p className="text-sm text-gray-600 mt-1">
            Secure authentication, fair rewards, and strict validation ensure a trusted platform.
          </p>
        </div>

        {/* MISSION */}
        <div className="backdrop-blur-lg bg-white/60 border border-white/30 rounded-2xl p-4 shadow-lg">
          <h3 className="font-bold text-lg">🚀 Mission</h3>
          <p className="text-sm text-gray-600 mt-1">
            To combine learning, earning, and digital engagement into one powerful platform.
          </p>
        </div>

        {/* SOCIAL */}
        <div className="backdrop-blur-lg bg-white/60 border border-white/30 rounded-2xl p-4 shadow-lg">
          <h3 className="font-bold text-lg mb-3">🌐 Join Community</h3>

          <div className="grid grid-cols-2 gap-3">

            <button
              onClick={() =>
                openSocial(
                  "Follow on Instagram",
                  "https://www.instagram.com/_zearn_?igsh=cWh0bjh0M3Fta2Nm"
                )
              }
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-xl font-semibold shadow-lg hover:scale-105 active:scale-95 transition"
            >
              📸 Instagram
            </button>

            <button
              onClick={() =>
                openSocial(
                  "Subscribe on YouTube",
                  "https://youtube.com/@zearn3?si=toMBzdl2m7jQsFG5"
                )
              }
              className="bg-red-500 text-white p-3 rounded-xl font-semibold shadow-lg hover:scale-105 active:scale-95 transition"
            >
              ▶️ YouTube
            </button>

            <button
              onClick={() =>
                openSocial(
                  "Join Telegram",
                  "https://t.me/+x4cvR_UYUvA1NmJl"
                )
              }
              className="bg-sky-500 text-white p-3 rounded-xl font-semibold shadow-lg hover:scale-105 active:scale-95 transition"
            >
              ✈️ Telegram
            </button>

            <button
              onClick={() =>
                openSocial(
                  "Follow on Facebook",
                  "https://facebook.com"
                )
              }
              className="bg-blue-600 text-white p-3 rounded-xl font-semibold shadow-lg hover:scale-105 active:scale-95 transition"
            >
              👍 Facebook
            </button>

          </div>
        </div>

        {/* FAQ */}
        <div className="backdrop-blur-lg bg-white/60 border border-white/30 rounded-2xl p-4 shadow-lg space-y-3">
          <h3 className="font-bold text-lg">❓ FAQ</h3>

          {[
            {
              q: "How do I earn?",
              a: "Complete tasks, play games, and participate in events.",
            },
            {
              q: "Is Zearn safe?",
              a: "Yes, secure authentication and fair systems are used.",
            },
            {
              q: "Withdraw process?",
              a: "Submit request after reaching minimum balance.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/70 backdrop-blur-md p-3 rounded-xl shadow hover:shadow-md transition"
            >
              <p className="font-semibold text-sm">{item.q}</p>
              <p className="text-xs text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>

        {/* POPUP */}
        {popup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">

            <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 text-center space-y-4 shadow-2xl animate-[scaleIn_0.3s_ease]">

              <h3 className="text-lg font-bold text-purple-600">
                Support Zearn ❤️
              </h3>

              <p className="text-sm text-gray-700">
                Please {popup.title} to stay updated.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={proceedLink}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition"
                >
                  Continue
                </button>

                <button
                  onClick={() => setPopup(null)}
                  className="bg-gray-300 px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition"
                >
                  Cancel
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </Layout>
  );
};

export default About;
