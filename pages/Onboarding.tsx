import React from "react"; import { useNavigate } from "react-router-dom";

const EntrancePage = () => { const navigate = useNavigate();

return ( <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden relative">

{/* Animated Background Circles */}
  <div className="absolute w-[500px] h-[500px] bg-blue-500 rounded-full blur-3xl opacity-30 animate-pulse top-[-100px] left-[-100px]"></div>
  <div className="absolute w-[400px] h-[400px] bg-indigo-500 rounded-full blur-3xl opacity-30 animate-ping bottom-[-100px] right-[-100px]"></div>

  {/* Floating Coins */}
  {[...Array(10)].map((_, i) => (
    <div
      key={i}
      className="absolute text-yellow-400 text-xl animate-bounce"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDuration: `${2 + Math.random() * 3}s`,
      }}
    >
      💰
    </div>
  ))}

  {/* Main Content */}
  <div className="text-center z-10 px-6">

    {/* Logo */}
    <div className="w-32 h-32 mx-auto mb-6 rounded-3xl overflow-hidden shadow-2xl animate-[fadeIn_1.5s_ease-in-out]">
      <img
        src="/logo.png"
        alt="logo"
        className="w-full h-full object-contain"
      />
    </div>

    {/* Title */}
    <h1 className="text-4xl font-extrabold text-white mb-4 animate-[slideUp_1s_ease]">
      Zearning
    </h1>

    {/* Subtitle */}
    <p className="text-gray-300 mb-8 animate-[fadeIn_2s_ease]">
      Earn money by completing simple tasks anytime, anywhere.
    </p>

    {/* Button */}
    <button
      onClick={() => navigate("/")}
      className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg hover:scale-110 transition-transform duration-300 animate-[fadeIn_2.5s_ease]"
    >
      Enter App 🚀
    </button>
  </div>

  {/* Custom Animations */}
  <style>
    {`
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(50px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}
  </style>

</div>

); };

export default Onboarding;