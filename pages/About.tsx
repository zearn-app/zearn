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
      <div className="p-3 space-y-5">

        {/* HERO */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white rounded-2xl p-5 shadow-lg">
          <h2 className="text-3xl font-bold">Zearn ✨</h2>
          <p className="mt-2 text-sm opacity-90">
            Earn smarter. Learn better. Grow every day.
          </p>
        </div>

        {/* ABOUT */}
        <div className="bg-white rounded-2xl p-4 shadow-md space-y-3">
          <h3 className="text-xl font-bold text-gray-800">About Zearn</h3>

          <p className="text-gray-600 text-sm">
            Zearn is a smart rewards platform designed to help users earn while exploring digital activities.
          </p>

          <p className="text-gray-700 font-semibold">
            👉 Your time should be valuable, and your effort should be rewarded.
          </p>

          <p className="text-gray-600 text-sm">
            Complete tasks, play games, watch content, and participate in challenges — all while earning rewards in a smooth and secure experience.
          </p>
        </div>

        {/* FEATURES */}
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h3 className="font-bold text-lg mb-2">🌟 Features</h3>

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
                className="bg-gradient-to-r from-purple-100 to-pink-100 p-2 rounded-lg text-center font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* SAFETY */}
        <div className="bg-white rounded-2xl p-4 shadow-md space-y-2">
          <h3 className="font-bold text-lg">🔒 Safety</h3>
          <p className="text-sm text-gray-600">
            Secure authentication, fair rewards, and strict validation ensure a trusted platform.
          </p>
        </div>

        {/* MISSION */}
        <div className="bg-white rounded-2xl p-4 shadow-md space-y-2">
          <h3 className="font-bold text-lg">🚀 Mission</h3>
          <p className="text-sm text-gray-600">
            To combine learning, earning, and digital engagement into one powerful platform.
          </p>
        </div>

        {/* SOCIAL */}
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h3 className="font-bold text-lg mb-2">🌐 Join Community</h3>

          <div className="grid grid-cols-2 gap-3">

            <button
              onClick={() =>
                openSocial(
                  "Follow on Instagram",
                  "https://www.instagram.com/_zearn_?igsh=cWh0bjh0M3Fta2Nm"
                )
              }
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-xl font-semibold shadow hover:scale-105 transition"
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
              className="bg-red-500 text-white p-3 rounded-xl font-semibold shadow hover:scale-105 transition"
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
              className="bg-sky-500 text-white p-3 rounded-xl font-semibold shadow hover:scale-105 transition"
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
              className="bg-blue-600 text-white p-3 rounded-xl font-semibold shadow hover:scale-105 transition"
            >
              👍 Facebook
            </button>

          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-4 shadow-md space-y-3">
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
            <div key={i} className="bg-gray-100 p-3 rounded-lg">
              <p className="font-semibold text-sm">{item.q}</p>
              <p className="text-xs text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>

        {/* POPUP */}
        {popup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">

            <div className="bg-white rounded-2xl p-6 text-center space-y-4 shadow-xl animate-fadeIn">

              <h3 className="text-lg font-bold text-purple-600">
                Support Zearn ❤️
              </h3>

              <p className="text-sm text-gray-600">
                Please {popup.title} to stay updated.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={proceedLink}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition"
                >
                  Continue
                </button>

                <button
                  onClick={() => setPopup(null)}
                  className="bg-gray-300 px-4 py-2 rounded-lg hover:scale-105 transition"
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
