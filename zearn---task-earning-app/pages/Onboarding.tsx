import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ChevronRight, Star, ShieldCheck, Zap } from 'lucide-react';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const steps = [
    { 
      title: "Earn Everyday", 
      desc: "Turn your free time into real cash. Complete simple tasks and get rewarded instantly.",
      icon: <Star size={48} className="text-yellow-400" />,
      bg: "bg-gray-900" 
    },
    { 
      title: "Secure & Fast", 
      desc: "Your data is safe, and withdrawals are processed at lightning speed via UPI or Bank.",
      icon: <ShieldCheck size={48} className="text-blue-400" />,
      bg: "bg-gray-800"
    },
    { 
      title: "Limitless Growth", 
      desc: "Level up, unlock diamonds, and access premium tasks for higher earnings.",
      icon: <Zap size={48} className="text-purple-400" />,
      bg: "bg-gray-900"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/login');
    }
  };

  return (
    <Layout noPadding>
      <div className={`h-screen flex flex-col relative text-white transition-colors duration-700 ${steps[step].bg}`}>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-20 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 z-10">
           <div className="mb-8 p-6 bg-white/10 rounded-3xl backdrop-blur-lg border border-white/10 shadow-2xl animate-[float_3s_ease-in-out_infinite]">
              {steps[step].icon}
           </div>
           
           <h1 className="text-4xl font-black text-center mb-4 tracking-tight leading-tight">
             {steps[step].title}
           </h1>
           <p className="text-gray-400 text-center text-lg leading-relaxed max-w-xs">
             {steps[step].desc}
           </p>
        </div>

        {/* Bottom Navigation */}
        <div className="p-8 z-10">
           <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                 {steps.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-white' : 'w-2 bg-gray-600'}`} />
                 ))}
              </div>

              <button 
                onClick={handleNext}
                className="group flex items-center bg-white text-gray-900 px-6 py-4 rounded-2xl font-bold shadow-lg shadow-white/10 active:scale-95 transition-all"
              >
                <span>{step === steps.length - 1 ? "Get Started" : "Next"}</span>
                <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default Onboarding;
