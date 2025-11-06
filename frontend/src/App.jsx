    import React, { Suspense, lazy, useEffect } from 'react';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import { Provider } from 'react-redux';
    import { ThemeProvider } from '@mui/material/styles';
    import CssBaseline from '@mui/material/CssBaseline';
    import { SnackbarProvider } from 'notistack';
    import { Toaster } from 'react-hot-toast';
    import { CartProvider } from './context/CartContext.jsx';
    import { AuthProvider } from './context/AuthContext.jsx';
    import ErrorBoundary from './components/ErrorBoundary.jsx';
    import { NotificationProvider } from './components/NotificationSystem.jsx';
    import muiTheme from './theme/muiTheme.js';
    import { LinearProgress, Box } from '@mui/material';
    import { store } from './store/store';
    import socketService from './services/socket';

    // Components
    import Navbar from './components/Navbar.jsx';
    import AddressBar from './components/AddressBar.jsx';
    import Footer from './components/Footer.jsx';
    import ProtectedRoute from './components/ProtectedRoute.jsx';

    // Lazy load pages for better performance
    const Home = lazy(() => import('./pages/Home.jsx'));
    const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
    const BuyVegetables = lazy(() => import('./pages/BuyVegetables.jsx'));
    const PlantDetection = lazy(() => import('./pages/PlantDetection.jsx'));
    const FertilizerInfo = lazy(() => import('./pages/FertilizerInfo.jsx'));
    const WeatherForecast = lazy(() => import('./pages/WeatherForecast.jsx'));
    const SeasonalCrop = lazy(() => import('./pages/SeasonalCrop.jsx'));
    const SoilHealth = lazy(() => import('./pages/SoilHealth.jsx'));
    const PestAlerts = lazy(() => import('./pages/PestAlerts.jsx'));
    const Irrigation = lazy(() => import('./pages/Irrigation.jsx'));
    const GovernmentSchemes = lazy(() => import('./pages/GovernmentSchemes.jsx'));
    const CropTrends = lazy(() => import('./pages/CropTrends.jsx'));
    const Login = lazy(() => import('./pages/Login.jsx'));
    const Signup = lazy(() => import('./pages/Signup.jsx'));
    const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions.jsx'));
    const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
    const Payment = lazy(() => import('./pages/Payment.jsx'));
    const ProductListing = lazy(() => import('./pages/ProductListing.jsx'));
    const FarmerDashboard = lazy(() => import('./pages/FarmerDashboard.jsx'));
    const PlantDiseaseScanner = lazy(() => import('./pages/PlantDiseaseScanner.jsx'));
    const WeatherDashboard = lazy(() => import('./pages/WeatherDashboard.jsx'));
    const SoilAnalysis = lazy(() => import('./pages/SoilAnalysis.jsx'));
    const PriceTrends = lazy(() => import('./pages/PriceTrends.jsx'));
    const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));

    // Loading fallback component
    const LoadingFallback = () => (
        <Box sx={{ width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
            <LinearProgress color="primary" />
        </Box>
    );

    function App() {
        // Initialize Socket.io connection when user is authenticated
        useEffect(() => {
            const token = localStorage.getItem('token');
            if (token) {
                socketService.connect();
            }
            
            return () => {
                socketService.disconnect();
            };
        }, []);

        return (
            <Provider store={store}>
                <ErrorBoundary>
                    <ThemeProvider theme={muiTheme}>
                        <CssBaseline />
                        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                            <Router>
                                <NotificationProvider>
                                    <AuthProvider>
                                        <CartProvider>
                                <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
                                    <Navbar />
                                    <AddressBar />
                                    <main className="container mx-auto px-4 py-8" style={{ marginTop: '140px' }}>
                                        <Suspense fallback={<LoadingFallback />}>
                                            <Routes>
                                                {/* Public Routes */}
                                                <Route path="/" element={<Home />} />
                                                <Route path="/login" element={<Login />} />
                                                <Route path="/signup" element={<Signup />} />
                                                <Route path="/terms" element={<TermsAndConditions />} />
                                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                                
                                                {/* Semi-Protected Routes (optional auth) */}
                                                <Route path="/buy" element={<BuyVegetables />} />
                                                <Route path="/products" element={<ProductListing />} />
                                                <Route path="/fertilizer-info" element={<FertilizerInfo />} />
                                                <Route path="/government-schemes" element={<GovernmentSchemes />} />
                                                
                                                {/* Protected Routes (require auth) */}
                                                <Route path="/dashboard" element={
                                                    <ProtectedRoute>
                                                        <Dashboard />
                                                    </ProtectedRoute>
                                                } />
                                                <Route path="/farmer-dashboard" element={
                                                    <ProtectedRoute>
                                                        <FarmerDashboard />
                                                    </ProtectedRoute>
                                                } />
                                                <Route path="/plant-detection" element={
                                                    <ProtectedRoute>
                                                        <PlantDetection />
                                                    </ProtectedRoute>
                                                } />
                                                <Route path="/weather-forecast" element={
                                                    <ProtectedRoute>
                                                        <WeatherForecast />
                                                    </ProtectedRoute>
                                                } />
                                                <Route path="/seasonal-crop" element={
                                                    <ProtectedRoute>
                                                        <SeasonalCrop />
                                                    </ProtectedRoute>
                                                } />
                                                <Route path="/soil-health" element={
                                                    <ProtectedRoute>
                                                        <SoilHealth />
                                                    </ProtectedRoute>
                                                } />
                                                <Route path="/soil-analysis" element={
                                                    <ProtectedRoute>
                                                        <SoilAnalysis />
                                                    </ProtectedRoute>
                                                } />
                                                <Route path="/plant-disease-scanner" element={
                                                    <ProtectedRoute>
                                                        <PlantDiseaseScanner />
                                                    </ProtectedRoute>
                                                } />
                                                <Route path="/weather-dashboard" element={
                                                    <ProtectedRoute>
                                                        <WeatherDashboard />
                                                    </ProtectedRoute>
                                                } />
                                                <Route path="/pest-alerts" element={
                                                    <ProtectedRoute>
                                                        <PestAlerts />
                                                    </ProtectedRoute>
                                                } />
                                                <Route path="/irrigation" element={
                                                    <ProtectedRoute>
                                                        <Irrigation />
                                                    </ProtectedRoute>
                                                } />
                                                <Route path="/crop-trends" element={
                                                    <ProtectedRoute>
                                                        <CropTrends />
                                                    </ProtectedRoute>
                                                } />
                                                <Route path="/price-trends" element={
                                                    <ProtectedRoute>
                                                        <PriceTrends />
                                                    </ProtectedRoute>
                                                } />
                                                <Route path="/admin-dashboard" element={
                                                    <ProtectedRoute>
                                                        <AdminDashboard />
                                                    </ProtectedRoute>
                                                } />
                                                <Route path="/payment" element={
                                                    <ProtectedRoute>
                                                        <Payment />
                                                    </ProtectedRoute>
                                                } />
                                            </Routes>
                                        </Suspense>
                                    </main>
                                    <Footer />
                                </div>
                                        </CartProvider>
                                    </AuthProvider>
                                </NotificationProvider>
                            </Router>
                            <Toaster 
                                position="top-right"
                                toastOptions={{
                                    duration: 4000,
                                    style: {
                                        background: '#363636',
                                        color: '#fff',
                                    },
                                }}
                            />
                        </SnackbarProvider>
                    </ThemeProvider>
                </ErrorBoundary>
            </Provider>
        );
    }

    export default App;
