import React, { useState } from 'react';
import { Layout } from '../components/Layout';

const About: React.FC = () => {

  const [popup, setPopup] = useState<{title:string,link:string}|null>(null);

  const openSocial = (title:string, link:string) => {
    setPopup({title,link});
  };

  const proceedLink = () => {
    if(popup){
      window.open(popup.link, "_blank");
      setPopup(null);
    }
  };

  return (
    <Layout title="About Us" showBack>
      <div className="space-y-4 p-2">

        <h2 className="text-2xl font-bold">About Us – Zearn App</h2>

        <p>Zearn is a smart rewards and productivity platform built to help users earn, learn, and grow — all in one place.</p>

        <p>We created Zearn with one simple idea: <strong>👉 Your time should be valuable, and your effort should be rewarded.</strong></p>

        <p>With Zearn, users can complete simple daily activities, explore tasks, play games, watch content, and participate in app-based challenges to earn digital rewards — while enjoying a smooth, secure, and transparent experience.</p>


        <h3 className="font-bold">🌟 What Zearn offers</h3>

        <ul className="list-disc ml-5 space-y-1">
          <li>✅ Easy and secure login</li>
          <li>💰 Real-time balance and earnings tracking</li>
          <li>🎯 Daily tasks and special reward activities</li>
          <li>🎮 Games and interactive challenges</li>
          <li>📲 App-based missions and content watching tasks</li>
          <li>🏆 Fair reward system with clear rules</li>
          <li>👤 Personal profile and history tracking</li>
          <li>💸 Simple and verified withdrawal system</li>
        </ul>


        <h3 className="font-bold">🔒 Safety & Transparency</h3>

        <p>Zearn is built with a strong focus on:</p>

        <ul className="list-disc ml-5 space-y-1">
          <li>Secure authentication</li>
          <li>Fair reward calculation</li>
          <li>Activity validation to prevent misuse</li>
          <li>Clear task rules and earning limits</li>
        </ul>

        <p>Your progress, earnings, and activity records are safely stored and managed using modern cloud technology.</p>


        <h3 className="font-bold">🚀 Our mission</h3>

        <p>Our mission is to create a platform where learning, digital engagement, and rewards come together — in a simple and trustworthy way. We want Zearn to be more than just an earning app. We want it to be a place where users stay motivated, explore new digital experiences, and build better daily habits.</p>


        <h3 className="font-bold">💡 Why Zearn?</h3>

        <p>Because we believe: Small actions, done every day, can create real value. Zearn turns everyday digital activities into meaningful progress.</p>


        <p className="font-bold">Zearn — Earn smarter. Learn better. Grow every day. ✨</p>



        {/* SOCIAL MEDIA SECTION */}

        <h3 className="font-bold mt-6">🌐 Follow Zearn Community</h3>

        <p>Join our community to get updates, rewards, announcements and special events.</p>

        <div className="grid grid-cols-2 gap-3 mt-2">

          <button
            onClick={()=>openSocial("Instagram Follow","https://instagram.com")}
            className="bg-pink-500 text-white p-3 rounded-lg font-semibold">
            📸 Instagram
          </button>

          <button
            onClick={()=>openSocial("Facebook Follow","https://facebook.com")}
            className="bg-blue-600 text-white p-3 rounded-lg font-semibold">
            👍 Facebook
          </button>

          <button
            onClick={()=>openSocial("YouTube Subscribe","https://youtube.com")}
            className="bg-red-600 text-white p-3 rounded-lg font-semibold">
            ▶️ YouTube
          </button>

          <button
            onClick={()=>openSocial("Telegram Join","https://t.me")}
            className="bg-sky-500 text-white p-3 rounded-lg font-semibold">
            ✈️ Telegram
          </button>

        </div>



        {/* FAQ SECTION */}

        <h3 className="font-bold mt-6">❓ Frequently Asked Questions</h3>

        <div className="space-y-3">

          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="font-semibold">How do I earn rewards in Zearn?</p>
            <p className="text-sm">You can earn rewards by completing tasks, watching content, playing games, and participating in special events.</p>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="font-semibold">Is Zearn safe to use?</p>
            <p className="text-sm">Yes. Zearn uses secure authentication and activity verification systems to ensure a safe and fair experience.</p>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="font-semibold">How can I withdraw my earnings?</p>
            <p className="text-sm">Once you reach the minimum withdrawal balance, you can submit a withdrawal request through the withdrawal section.</p>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="font-semibold">Why was my task rejected?</p>
            <p className="text-sm">Tasks may be rejected if the instructions are not followed properly or if the submission does not meet the validation requirements.</p>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="font-semibold">How often are new tasks added?</p>
            <p className="text-sm">New tasks and activities are added regularly, so keep checking the app for new earning opportunities.</p>
          </div>

        </div>


        {/* POPUP */}

        {popup && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">

            <div className="bg-white rounded-xl p-6 text-center max-w-sm w-full space-y-4">

              <h3 className="text-lg font-bold">Support Zearn ❤️</h3>

              <p>Please {popup.title} to stay connected and receive updates.</p>

              <div className="flex gap-3 justify-center">

                <button
                  onClick={proceedLink}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg">
                  Continue
                </button>

                <button
                  onClick={()=>setPopup(null)}
                  className="bg-gray-300 px-4 py-2 rounded-lg">
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
