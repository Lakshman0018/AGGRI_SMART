import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Paper, Typography, Box, Button, Card, CardContent, CardMedia, Chip, Fade, Grow, Zoom, Avatar, Stack } from '@mui/material';
import { ArrowForward, TrendingUp, People, CheckCircle, Speed } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import HeroSection from '../components/HeroSection.jsx';
import CustomCard from '../components/Card.jsx';

function Home() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const heroStats = [
    { label: 'Active Farmers', value: '10,000+', icon: '👨‍🌾' },
    { label: 'Crops Analyzed', value: '50,000+', icon: '🌾' },
    { label: 'Diseases Detected', value: '5,000+', icon: '🔍' },
    { label: 'Success Rate', value: '95%', icon: '📈' },
  ];

  const cards = [
    { 
      title: "Plant Disease Detection", 
      description: "Detect crop diseases instantly using AI-powered image analysis.", 
      buttonText: "Start Detection", 
      route: "/plant-detection", 
      image: "/images/plant.png",
      icon: "🌱",
      badge: "Popular"
    },
    { 
      title: "Fertilizer Info", 
      description: "Get personalized fertilizer recommendations for optimal crop growth.", 
      buttonText: "Explore", 
      route: "/fertilizer-info", 
      image: "/images/fertilizer.png",
      icon: "🧪",
      badge: "New"
    },
    { 
      title: "Weather Forecast", 
      description: "Plan your farming activities with accurate weather predictions.", 
      buttonText: "View", 
      route: "/weather-forecast", 
      image: "/images/weather.png",
      icon: "☀️"
    },
    { 
      title: "Seasonal Crops", 
      description: "Discover the best crops to grow based on current season and climate.", 
      buttonText: "Learn", 
      route: "/seasonal-crop", 
      image: "/images/season.png",
      icon: "🌾",
      badge: "Recommended"
    },
    { 
      title: "Soil Health", 
      description: "Analyze soil composition and get detailed fertility reports.", 
      buttonText: "Analyze", 
      route: "/soil-health", 
      image: "/images/soil.png",
      icon: "🌍"
    },
    { 
      title: "Pest Alerts", 
      description: "Get early warnings and prevention tips for pest infestations.", 
      buttonText: "View", 
      route: "/pest-alerts", 
      image: "/images/pest.png",
      icon: "🪱"
    },
    { 
      title: "Irrigation Guide", 
      description: "Smart irrigation scheduling for efficient water management.", 
      buttonText: "Guide", 
      route: "/irrigation", 
      image: "/images/irrigation.png",
      icon: "💧"
    },
    { 
      title: "Government Schemes", 
      description: "Stay updated with latest farming subsidies and government schemes.", 
      buttonText: "View", 
      route: "/government-schemes", 
      image: "/images/schemes.png",
      icon: "🏛️"
    },
    { 
      title: "Crop Trends", 
      description: "Track market prices and demand trends for better decision making.", 
      buttonText: "Check", 
      route: "/crop-trends", 
      image: "/images/trends.png",
      icon: "📈"
    },
  ];

  const cropTips = [
    "💡 Water your plants early in the morning for better absorption",
    "🌱 Rotate crops annually to maintain soil health",
    "🐛 Check for pests regularly, especially under leaves",
    "🌿 Use organic compost to improve soil fertility naturally",
    "📊 Monitor soil pH levels for optimal crop growth"
  ];

  return (
    <div className="min-h-screen">
      {/* 🌾 Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className={`text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 text-shadow-lg">
              Welcome to <span className="text-farm-green-300">AgriSmart</span> 🌿
            </h1>
            <p className="text-xl md:text-2xl text-farm-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              {user ? `Hello ${user.name}, ready to revolutionize your farming?` : 'Empowering farmers with AI-driven technology, real-time insights, and smart agricultural solutions for sustainable farming.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/plant-detection')}
                className="btn-primary text-lg px-8 py-4 hover:scale-105 transform transition-all duration-300"
              >
                Get Started Now
              </button>
              <button 
                onClick={() => navigate('/crop-trends')}
                className="btn-outline text-lg px-8 py-4 hover:scale-105 transform transition-all duration-300"
              >
                View Market Trends
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 text-4xl animate-float">🌱</div>
        <div className="absolute top-32 right-20 text-3xl animate-float" style={{animationDelay: '2s'}}>🌾</div>
        <div className="absolute bottom-20 left-20 text-3xl animate-float" style={{animationDelay: '4s'}}>🚜</div>
        <div className="absolute bottom-32 right-10 text-4xl animate-float" style={{animationDelay: '1s'}}>💧</div>
      </section>

      {/* 📊 Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {heroStats.map((stat, index) => (
              <div 
                key={index}
                className={`text-center transition-all duration-700 delay-${index * 100} ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-display font-bold text-farm-green-700 mb-1">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🌱 Features Grid */}
      <section className="py-20 bg-farm-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-6">
              Smart Farming <span className="text-gradient">Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our comprehensive suite of AI-powered tools designed to revolutionize your farming experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {cards.map((card, index) => (
              <div 
                key={index}
                className={`h-full transition-all duration-700 delay-${index * 100} ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <CustomCard {...card} gradient={index % 3 === 0} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 💡 Crop Tips Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-800 mb-4">
              Daily Farming <span className="text-gradient">Tips</span>
            </h2>
            <p className="text-lg text-gray-600">Expert advice to improve your farming practices</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cropTips.map((tip, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-farm-green-50 to-farm-green-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-farm-green-200"
              >
                <p className="text-gray-700 font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 CTA Section */}
      <section className="py-20 bg-hero-gradient">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-xl text-farm-green-100 mb-8">
            Join thousands of farmers who are already using AgriSmart to increase their yields and profits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/plant-detection')}
              className="btn-secondary text-lg px-8 py-4 hover:scale-105 transform transition-all duration-300"
            >
              Start Free Analysis
            </button>
            <button 
              onClick={() => navigate('/government-schemes')}
              className="btn-outline text-lg px-8 py-4 hover:scale-105 transform transition-all duration-300"
            >
              Explore Schemes
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
