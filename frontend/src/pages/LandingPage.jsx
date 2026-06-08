// File: src/pages/LandingPage.jsx
// Tailwind CSS version – clean, animated, and professional AgriSmart layout

import React from "react";
import farmBg from "../assets/farm-bg.jpg"; // 🌾 Real farm photo background

export default function LandingPage() {
  const features = [
    { title: "Plant Disease Detection", desc: "Detect crop diseases instantly using AI.", icon: "🌱" },
    { title: "Fertilizer Info", desc: "Get the right fertilizers for your crops.", icon: "🧪" },
    { title: "Weather Forecast", desc: "Check weather to plan your farming smartly.", icon: "☀️" },
    { title: "Seasonal Crop", desc: "Find the best seasonal crops to grow.", icon: "🌾" },
    { title: "Soil Health", desc: "Analyze soil nutrients and fertility levels.", icon: "🌍" },
    { title: "Pest Alerts", desc: "Get early warnings for pest infestations.", icon: "🪱" },
    { title: "Irrigation", desc: "Smart irrigation guidance for your crops.", icon: "💧" },
    { title: "Government Schemes", desc: "Explore the latest subsidies and schemes.", icon: "🏛️" },
    { title: "Crop Trends", desc: "Know market demand and crop prices.", icon: "📈" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      {/* 🌾 Hero Section */}
      <div
        className="relative h-[70vh] flex flex-col items-center justify-center text-center bg-cover bg-center"
        style={{ backgroundImage: `url(${farmBg})` }}
      >
        <div className="absolute inset-0 bg-green-900/50"></div> {/* Tailwind opacity overlay */}
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Welcome to <span className="text-lime-300">AgriSmart</span> 🌿
          </h1>
          <p className="text-lg text-gray-100 max-w-2xl mx-auto">
            Empowering farmers with AI, technology, and innovation.
          </p>
          <button className="mt-6 bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition transform hover:scale-105">
            Get Started
          </button>
        </div>
      </div>

      {/* 🌱 Features Section */}
      <section className="py-16 px-6 bg-gray-50">
        <h2 className="text-3xl font-semibold text-green-800 mb-10 text-center">
          Our Smart Farming Features 🌾
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {features.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center transition transform hover:-translate-y-2 duration-300"
            >
              {/* Tailwind used for animation, hover, grid, and rounded card UI */}
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-green-700">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
              <button className="mt-4 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition">
                Explore
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 🌍 Footer */}
      <footer className="bg-green-900 text-gray-200 py-6 text-center">
        <p>© 2025 <span className="font-semibold text-lime-400">AgriSmart</span> | Built for Smart Farmers 🌿</p>
      </footer>
    </div>
  );
}
