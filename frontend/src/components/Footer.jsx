import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  TextField,
  Button,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Send as SendIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';

function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const footerLinks = {
    'Features': [
      { name: 'Plant Disease Detection', path: '/plant-detection' },
      { name: 'Fertilizer Info', path: '/fertilizer-info' },
      { name: 'Weather Forecast', path: '/weather-forecast' },
      { name: 'Soil Health', path: '/soil-health' },
    ],
    'Resources': [
      { name: 'Seasonal Crops', path: '/seasonal-crop' },
      { name: 'Pest Alerts', path: '/pest-alerts' },
      { name: 'Irrigation Guide', path: '/irrigation' },
      { name: 'Government Schemes', path: '/government-schemes' },
    ],
    'Support': [
      { name: 'Help Center', path: '#' },
      { name: 'Contact Us', path: '#' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
    ]
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert('Thank you for subscribing!');
      setEmail('');
    }
  };

  return (
    <footer className="footer-modern mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-farm-green-400 rounded-full flex items-center justify-center">
                <span className="text-xl">🌱</span>
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white">AgriSmart</h3>
                <p className="text-farm-green-200 text-sm">Smart Farming Solutions</p>
              </div>
            </div>
            <p className="text-farm-green-100 text-sm leading-relaxed mb-4">
              Empowering farmers with AI-driven technology, real-time insights, and smart agricultural solutions for sustainable farming.
            </p>
            <div className="flex space-x-4">
              <IconButton
                sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                aria-label="Facebook"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                aria-label="Twitter"
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </IconButton>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-farm-green-200 hover:text-farm-green-300 transition-colors duration-300 text-sm hover:translate-x-1 transform inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-farm-green-700/30 pt-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-white font-semibold mb-2">Stay Updated</h4>
            <p className="text-farm-green-200 text-sm mb-4">
              Get the latest farming tips and market updates delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern flex-1 text-sm"
              />
              <button type="submit" className="btn-primary text-sm px-6 py-3 whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-farm-green-700/30 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-farm-green-200 text-sm">
              © {currentYear} AgriSmart. All rights reserved. | Built for Smart Farmers 🌱
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-farm-green-200">Made with ❤️ for farmers</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-farm-green-400 rounded-full animate-pulse"></div>
                <span className="text-farm-green-200">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
