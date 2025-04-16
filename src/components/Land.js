import { useNavigate } from 'react-router-dom';
import React from 'react';

export const Land = () => {
  const navigate = useNavigate();

  const GoToAuth = () => {
    navigate('/auth');
  };

  const features = [
    {
      title: "Real-Time Messaging",
      desc: "Messages appear instantly using Firebase’s real-time sync—no refresh needed."
    },
    {
      title: "Create Public or Private Groups",
      desc: "Users can choose to make open discussion groups or secure private channels."
    },
    {
      title: "User-Friendly Interface",
      desc: "Clean layout and intuitive design ensure easy navigation and engagement."
    },
    {
      title: "Scalable Architecture",
      desc: "Firebase handles scalable message traffic with reliable performance."
    },
    {
      title: "Mobile Responsive",
      desc: "Built with responsive design principles—fully functional on phones, tablets, and desktops."
    },
    {
      title: "Prototype Custom-Built for a Client",
      desc: "Tailored for professional use, with client-requested features like group visibility control."
    }
  ];

  return (
    <div className="landing-container">
      <div className="hero-section">
        <h1 className="hero-title">Smochat</h1>
        <p className="hero-subtitle">
          A real-time, modern group chat app built with <strong>React.js</strong> and <strong>Firebase</strong> — designed for seamless communication.
        </p>
        <p className="hero-note">
          Custom-built for a client project with public and private chat group capabilities.
        </p>
      </div>
      <div className="about-section">
        <h2>💬 What is Smochat?</h2>
        <p>
          <strong>Smochat</strong> is a real-time chat platform where users can create or join chat groups, stay connected, and exchange messages instantly. Groups can be public for open communities or private for secure communication.
        </p>
        <ul>
          <li>Instant messaging with Firebase Realtime Database</li>
          <li>Group creation & management</li>
          <li>Public and private access modes</li>
          <li>Client-friendly design with responsive layout</li>
        </ul>
      </div>
      <div className="tech-section">
        <h2>🧪 Tech Stack</h2>
        <div className="tech-cards">
          <div className="tech-card">
            <h3>⚛️ React.js</h3>
            <p>
              The frontend is built using React, providing a fast and interactive user experience with reusable components and responsive design.
            </p>
          </div>
          <div className="tech-card">
            <h3>🔥 Firebase</h3>
            <p>
              Firebase powers real-time data sync, group creation, and instant messaging using Realtime Database and Firebase Auth (for optional login flows).
            </p>
          </div>
        </div>
      </div>
      <div className="features-section">
        <h2>🚀 Key Features</h2>
        <div className="features-grid">
          {features.map((item, idx) => (
            <div key={idx} className="feature-card">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="cta-section">
        <h2>🌐 Try Smochat Live</h2>
        <p>
          Jump into a group, send messages, and experience real-time chatting firsthand.
        </p>
        <button className="cta-button" onClick={GoToAuth}>
          Launch Chat App
        </button>
      </div>
      <div className="footer">
        <p>© {new Date().getFullYear()} Smochat • Developed with React & Firebase by Abdullah Younas <a href='https://github.com/Abdullah-Younas'>GIT</a></p>
      </div>
    </div>
  );
};

export default Land;
