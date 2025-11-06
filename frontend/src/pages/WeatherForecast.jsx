import React, { useState } from 'react';
import WeatherDisplay from '../components/WeatherDisplay';

const API_KEY = '58d7eea3755a475e9fd45725250611';
const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';

export default function WeatherForecast() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      // Fetch forecast data (includes current + 3-day forecast)
      const response = await fetch(
        `${WEATHER_API_BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=5&aqi=yes`
      );

      if (response.status === 401) {
        setError('API key is invalid or missing. Please check your key.');
        setLoading(false);
        return;
      }

      if (response.status === 404) {
        setError('City not found. Please check the spelling.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError('Failed to fetch weather data. Please try again.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-green-100 via-blue-50 to-green-200"
      style={{
        backgroundImage: 'url(/images/farm-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-4xl">
        {/* Glassmorphism Card */}
        <div 
          className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
          style={{
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
          }}
        >
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name..."
                className="flex-1 px-6 py-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-lg"
                style={{
                  backdropFilter: 'blur(10px)'
                }}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Loading...' : 'Get Weather'}
              </button>
            </div>
          </form>

          {/* Loading Spinner */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
            </div>
          )}

          {/* Error Popup */}
          {error && (
            <div className="error-popup bg-red-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-xl mb-6 border border-red-400/50">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Weather Display */}
          {weatherData && !loading && (
            <WeatherDisplay data={weatherData} />
          )}
        </div>
      </div>
    </div>
  );
}