import React from 'react';
import { Layout } from '../components/Layout';

const About: React.FC = () => {
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

      </div>
    </Layout>
  );
};

export default About;
