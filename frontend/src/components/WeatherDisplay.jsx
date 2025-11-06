import React from 'react';
import { Sun, Cloud, CloudRain, CloudDrizzle, CloudSnow, Wind, Droplets, Eye } from 'lucide-react';

const WeatherDisplay = ({ data }) => {
  // Safety checks for WeatherAPI.com format
  if (!data || !data.current || !data.location) {
    return (
      <div className="text-white text-center py-8">
        <p>Invalid weather data received.</p>
      </div>
    );
  }

  // Get current weather (WeatherAPI.com format)
  const current = data.current;
  const cityName = data.location.name || 'Unknown City';
  const country = data.location.country || '';

  // Get daily forecasts (WeatherAPI.com format)
  const getDailyForecasts = () => {
    // Check if forecast data exists
    if (data.forecast && data.forecast.forecastday) {
      // Return next 5 days (excluding today)
      return data.forecast.forecastday.slice(1, 6);
    }
    // If no forecast data, return empty array
    return [];
  };

  const dailyForecasts = getDailyForecasts();

  // Get weather icon based on condition (WeatherAPI.com format)
  const getWeatherIcon = (conditionText) => {
    const size = 48;
    const className = "w-12 h-12 text-yellow-400";
    const condition = conditionText ? conditionText.toLowerCase() : '';
    
    if (condition.includes('clear') || condition.includes('sunny')) {
      return <Sun size={size} className={className} />;
    } else if (condition.includes('cloud')) {
      return <Cloud size={size} className={className} />;
    } else if (condition.includes('rain')) {
      return <CloudRain size={size} className={className} />;
    } else if (condition.includes('drizzle')) {
      return <CloudDrizzle size={size} className={className} />;
    } else if (condition.includes('snow')) {
      return <CloudSnow size={size} className={className} />;
    } else {
      return <Cloud size={size} className={className} />;
    }
  };

  // Get day name from date string (WeatherAPI.com format)
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };

  // Get weather description (WeatherAPI.com format)
  const getWeatherDescription = (condition) => {
    if (!condition) return 'Clear';
    return condition.text || condition || 'Clear';
  };

  // Get weather main condition (WeatherAPI.com format)
  const getWeatherMain = (condition) => {
    if (!condition) return 'clear';
    const text = condition.text || condition || '';
    return text.toLowerCase();
  };

  return (
    <div className="space-y-6">
      {/* Main Card - Today's Weather */}
      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 border border-white/30 shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            {cityName}, {country}
          </h2>
          <p className="text-white/80 text-lg capitalize">
            {getWeatherDescription(current.condition)}
          </p>
        </div>

        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="flex items-center justify-center">
            {getWeatherIcon(current.condition?.text)}
          </div>
          <div className="text-center">
            <div className="text-7xl font-bold text-white mb-2">
              {Math.round(current.temp_c)}°
            </div>
            <div className="text-white/80 text-lg">
              Feels like {Math.round(current.feelslike_c)}°
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <Droplets className="w-6 h-6 text-blue-300 mx-auto mb-2" />
            <div className="text-white/80 text-sm mb-1">Humidity</div>
            <div className="text-white text-xl font-semibold">{current.humidity}%</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <Wind className="w-6 h-6 text-gray-300 mx-auto mb-2" />
            <div className="text-white/80 text-sm mb-1">Wind Speed</div>
            <div className="text-white text-xl font-semibold">{Math.round(current.wind_kph)} km/h</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <Eye className="w-6 h-6 text-purple-300 mx-auto mb-2" />
            <div className="text-white/80 text-sm mb-1">Visibility</div>
            <div className="text-white text-xl font-semibold">{current.vis_km} km</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <Cloud className="w-6 h-6 text-white/70 mx-auto mb-2" />
            <div className="text-white/80 text-sm mb-1">Pressure</div>
            <div className="text-white text-xl font-semibold">{current.pressure_mb} mb</div>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast Grid */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-4 text-center">5-Day Forecast</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {dailyForecasts.map((day, index) => (
            <div
              key={index}
              className="bg-white/15 backdrop-blur-md rounded-xl p-4 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <div className="text-white/90 font-semibold mb-2 text-sm">
                {getDayName(day.date)}
              </div>
              <div className="flex justify-center mb-3">
                {getWeatherIcon(day.day?.condition?.text)}
              </div>
              <div className="text-white text-xl font-bold mb-1">
                {Math.round(day.day?.avgtemp_c)}°
              </div>
              <div className="text-white/70 text-xs capitalize">
                {getWeatherDescription(day.day?.condition)}
              </div>
              <div className="flex justify-center gap-2 mt-2 text-white/60 text-xs">
                <span>↑ {Math.round(day.day?.maxtemp_c)}°</span>
                <span>↓ {Math.round(day.day?.mintemp_c)}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;
