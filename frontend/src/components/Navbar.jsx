import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Badge, Avatar, Menu, MenuItem, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box, Typography } from '@mui/material';
import { ShoppingCart, Person, Menu as MenuIcon, Close, ExitToApp, Dashboard, AccountCircle } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartModal from './CartModal';
import logo from '../assets/logo.png';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/buy', label: 'Buy Vegetables', icon: '🛒' },
    { path: '/plant-detection', label: 'Plant Disease Detection', icon: '🌱' },
    { path: '/fertilizer-info', label: 'Fertilizer Info', icon: '🧪' },
    { path: '/weather-forecast', label: 'Weather', icon: '☀️' },
    { path: '/seasonal-crop', label: 'Seasonal Crop', icon: '🌾' },
    { path: '/soil-health', label: 'Soil Health', icon: '🌍' },
    { path: '/pest-alerts', label: 'Pest Alerts', icon: '🪱' },
    { path: '/irrigation', label: 'Irrigation', icon: '💧' },
    { path: '/government-schemes', label: 'Schemes', icon: '🏛️' },
    { path: '/crop-trends', label: 'Crop Trends', icon: '📈' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/');
  };

  const handleResetDemoData = () => {
    if (window.confirm('Are you sure you want to reset all demo data? This will restore all default products, orders, and reports.')) {
      import('../services/localStorage').then((module) => {
        module.initializeDatabase(true);
        handleUserMenuClose();
        window.location.reload();
      });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'navbar-modern shadow-2xl' : 'navbar-modern'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src={logo} 
                  alt="AgriSmart Logo" 
                  className="w-10 h-10 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-farm-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-bold text-white group-hover:text-farm-green-300 transition-colors duration-300">
                  AgriSmart
                </span>
                <span className="text-xs text-farm-green-200 font-medium">Smart Farming</span>
              </div>
            </Link>
            {localStorage.getItem('agrismart_demo_mode') === 'true' && (
              <div className="flex items-center gap-1">
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  DEMO MODE
                </span>
                <button
                  onClick={() => {
                    if (window.confirm('Reset all mock database collections to default?')) {
                      import('../services/localStorage').then((module) => {
                        module.initializeDatabase(true);
                        window.location.reload();
                      });
                    }
                  }}
                  title="Reset Demo Data"
                  className="p-1 text-gray-400 hover:text-white transition cursor-pointer text-xs"
                >
                  🔄
                </button>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link flex items-center space-x-2 ${
                  isActive(item.path) ? 'nav-link-active' : ''
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="hidden xl:block">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons & User Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            <IconButton 
              onClick={() => setIsCartOpen(true)}
              className="text-white hover:text-farm-green-300 transition-colors"
            >
              <Badge badgeContent={getCartCount()} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>
            
            {isAuthenticated() ? (
              <>
                <IconButton
                  onClick={handleUserMenuOpen}
                  className="text-white hover:text-farm-green-300 transition-colors"
                >
                  <Avatar 
                    sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                  PaperProps={{
                    elevation: 4,
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                      '& .MuiMenuItem-root': {
                        px: 2,
                        py: 1,
                      },
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" color="text.secondary">Welcome,</Typography>
                    <Typography variant="subtitle1" fontWeight="600">{user?.name || 'User'}</Typography>
                    <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
                    <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
                    <ListItemText>My Profile</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => { navigate('/orders'); handleUserMenuClose(); }}>
                    <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
                    <ListItemText>My Orders</ListItemText>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleResetDemoData}>
                    <ListItemIcon style={{ fontSize: '1.2rem' }}>🔄</ListItemIcon>
                    <ListItemText>Reset Demo Data</ListItemText>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon><ExitToApp fontSize="small" /></ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline text-sm px-4 py-2">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary text-sm px-4 py-2">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-farm-green-700/30">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-farm-green-900/95 backdrop-blur-sm">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`nav-link flex items-center space-x-3 px-3 py-2 rounded-lg ${
                    isActive(item.path) ? 'nav-link-active' : ''
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="pt-4 border-t border-farm-green-700/30 space-y-2">
                <button
                  onClick={() => { setIsCartOpen(true); setIsMenuOpen(false); }}
                  className="btn-outline w-full text-sm px-4 py-2 flex items-center justify-center gap-2"
                >
                  <ShoppingCart fontSize="small" />
                  Cart ({getCartCount()})
                </button>
                {isAuthenticated() ? (
                  <>
                    <div className="px-3 py-2 text-white">
                      <Typography variant="subtitle2" className="text-farm-green-200">Logged in as:</Typography>
                      <Typography variant="subtitle1" fontWeight="600">{user?.name || 'User'}</Typography>
                    </div>
                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="btn-primary w-full text-sm px-4 py-2 flex items-center justify-center gap-2"
                    >
                      <ExitToApp fontSize="small" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      onClick={() => setIsMenuOpen(false)}
                      className="btn-outline w-full text-sm px-4 py-2 block text-center"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      onClick={() => setIsMenuOpen(false)}
                      className="btn-primary w-full text-sm px-4 py-2 block text-center"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <CartModal />
    </nav>
  );
}

export default Navbar;
