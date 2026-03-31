import { useEffect } from "react"; import { useNavigate } from "react-router-dom";

export default function LandingPage() { const navigate = useNavigate();

useEffect(() => { const stars = document.querySelector(".stars"); for (let i = 0; i < 80; i++) { const star = document.createElement("div"); star.className = "star"; star.style.top = Math.random() * 100 + "%"; star.style.left = Math.random() * 100 + "%"; star.style.animationDuration = 2 + Math.random() * 3 + "s"; stars.appendChild(star); } }, []);

return ( <div className="container"> <div className="stars"></div>

<div className="content">
    <h1 className="title">Earnify</h1>
    <p className="subtitle">Start earning smarter, faster, better</p>

    <button
      className="login-btn"
      onClick={() => navigate("/login")}
    >
      Login
    </button>
  </div>

  <style>{`
    .container {
      height: 100vh;
      width: 100%;
      background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Poppins', sans-serif;
    }

    .content {
      text-align: center;
      color: white;
      animation: fadeIn 2s ease-in-out;
    }

    .title {
      font-size: 4rem;
      letter-spacing: 3px;
      animation: float 3s ease-in-out infinite;
    }

    .subtitle {
      margin-top: 10px;
      font-size: 1.2rem;
      opacity: 0.8;
      animation: fadeInUp 2s ease;
    }

    .login-btn {
      margin-top: 30px;
      padding: 12px 30px;
      font-size: 1.2rem;
      border: none;
      border-radius: 30px;
      background: linear-gradient(45deg, #ff6a00, #ee0979);
      color: white;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .login-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 0 20px rgba(255, 105, 180, 0.7);
    }

    .stars {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      overflow: hidden;
    }

    .star {
      position: absolute;
      width: 2px;
      height: 2px;
      background: white;
      border-radius: 50%;
      animation: twinkle infinite ease-in-out;
    }

    @keyframes twinkle {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 1; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `}</style>
</div>

); }