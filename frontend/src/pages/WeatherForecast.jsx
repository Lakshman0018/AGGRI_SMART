import React, { useState, useEffect } from 'react';

const API_KEY = '58d7eea3755a475e9fd45725250611';
const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';

export default function WeatherForecast() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLocationName, setCurrentLocationName] = useState('Delhi');
  const [radarLayer, setRadarLayer] = useState('precip');

  useEffect(() => {
    // Initial fetch on mount
    fetchWeather(currentLocationName);
    
    // Attempt geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(`${position.coords.latitude},${position.coords.longitude}`);
        },
        (err) => {
          console.log('Geolocation disabled or failed, defaulting to Delhi', err);
        }
      );
    }
  }, []);

  const fetchWeather = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${WEATHER_API_BASE_URL}/forecast.json?key=${API_KEY}&q=${query}&days=7&aqi=yes`
      );

      if (response.status === 401) {
        setError('Weather API key is invalid. Please contact support.');
        return;
      }

      if (response.status === 404) {
        setError('Location not found. Please verify spelling.');
        return;
      }

      if (!response.ok) {
        setError('Failed to retrieve weather data.');
        return;
      }

      const data = await response.json();
      setWeatherData(data);
      setCurrentLocationName(data.location.name);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Network error. Check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
    }
  };

  const getDayName = (dateString, index) => {
    if (index === 0) return 'Today';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Helper to get weather icon symbol
  const getWeatherIconName = (conditionText) => {
    const condition = conditionText ? conditionText.toLowerCase() : '';
    if (condition.includes('clear') || condition.includes('sunny')) {
      return 'sunny';
    } else if (condition.includes('partly cloudy')) {
      return 'partly_cloudy_day';
    } else if (condition.includes('cloud') || condition.includes('overcast') || condition.includes('mist') || condition.includes('fog')) {
      return 'cloudy';
    } else if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
      return 'rainy';
    } else if (condition.includes('thunder') || condition.includes('storm')) {
      return 'thunderstorm';
    } else if (condition.includes('snow') || condition.includes('sleet') || condition.includes('ice')) {
      return 'ac_unit';
    }
    return 'partly_cloudy_day';
  };

  // Helper to get operational insights
  const getOperationalInsights = (current) => {
    if (!current) return [];
    
    const insights = [];
    const temp = current.temp_c;
    const wind = current.wind_kph;
    const cond = current.condition.text.toLowerCase();

    // Spraying window
    if (wind > 15) {
      insights.push({
        title: 'Spraying Window',
        value: 'Poor (High Winds Expected)',
        icon: 'cancel',
        color: 'text-error bg-error/10'
      });
    } else if (cond.includes('rain') || cond.includes('thunder')) {
      insights.push({
        title: 'Spraying Window',
        value: 'Poor (Rain Expected)',
        icon: 'cancel',
        color: 'text-error bg-error/10'
      });
    } else {
      insights.push({
        title: 'Spraying Window',
        value: 'Optimal (Low Wind)',
        icon: 'check_circle',
        color: 'text-secondary bg-secondary/10'
      });
    }

    // Irrigation Need
    if (temp > 32) {
      insights.push({
        title: 'Irrigation Need',
        value: 'High (Heat Stress Risk)',
        icon: 'warning',
        color: 'text-tertiary-container bg-tertiary-container/10'
      });
    } else if (cond.includes('rain')) {
      insights.push({
        title: 'Irrigation Need',
        value: 'Minimal (Rainfall Active)',
        icon: 'check_circle',
        color: 'text-secondary bg-secondary/10'
      });
    } else {
      insights.push({
        title: 'Irrigation Need',
        value: 'Moderate (Standard Cycle)',
        icon: 'info',
        color: 'text-primary bg-primary/10'
      });
    }

    // Harvest Window
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunder')) {
      insights.push({
        title: 'Harvest Window',
        value: 'Delayed (Wet Crops)',
        icon: 'warning',
        color: 'text-tertiary-container bg-tertiary-container/10'
      });
    } else {
      insights.push({
        title: 'Harvest Window',
        value: 'Optimal (Next 3 Days)',
        icon: 'check_circle',
        color: 'text-secondary bg-secondary/10'
      });
    }

    return insights;
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Header & Search */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-surface-variant/30 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight mb-1">Weather Forecast</h2>
          <p className="text-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-base text-primary">location_on</span>
            {weatherData ? `${weatherData.location.name}, ${weatherData.location.region}, ${weatherData.location.country}` : currentLocationName}
          </p>
        </div>

        <form onSubmit={handleSearch} className="w-full md:w-auto flex gap-2">
          <div className="relative flex-grow md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search city/district..."
              className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white py-2 px-4 rounded-xl font-bold text-sm hover:bg-primary-container transition-all flex items-center gap-1 active:scale-95 duration-200"
          >
            Search
          </button>
        </form>
      </header>

      {/* Alert Warning Box (Dynamic based on Temperature) */}
      {weatherData && weatherData.current.temp_c > 32 && (
        <section className="bg-error-container border border-error/20 rounded-xl p-4 flex items-start gap-4 shadow-sm animate-fade-in">
          <div className="bg-error text-on-error p-1 rounded-full flex-shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-sm font-bold">warning</span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-on-error-container mb-0.5">High Heat Advisory</h3>
            <p className="text-xs text-on-error-container/90 leading-relaxed">
              Temperatures are expected to exceed {Math.round(weatherData.current.temp_c)}°F today. Recommend shifting manual field labor to early morning/evening hours and increasing water supply frequency to protect heat-sensitive crops.
            </p>
          </div>
        </section>
      )}

      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl flex gap-3 items-center text-sm">
          <span className="material-symbols-outlined">error</span>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex flex-col justify-center items-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-xs text-on-surface-variant font-bold">Fetching latest microclimate data...</p>
        </div>
      )}

      {weatherData && !loading && (
        <div className="space-y-6">
          {/* Main Dashboard Widget Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Current Conditions Widget */}
            <div className="lg:col-span-2 bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden relative min-h-[220px] flex flex-col justify-between p-6">
              
              {/* Top Details */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Current Conditions</p>
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[64px] text-primary select-none leading-none">
                      {getWeatherIconName(weatherData.current.condition.text)}
                    </span>
                    <div>
                      <h2 className="text-4xl font-black text-on-surface">{Math.round(weatherData.current.temp_c)}°C</h2>
                      <p className="text-sm font-bold text-on-surface-variant capitalize">{weatherData.current.condition.text}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-on-surface-variant">
                    H: {Math.round(weatherData.forecast.forecastday[0].day.maxtemp_c)}° L: {Math.round(weatherData.forecast.forecastday[0].day.mintemp_c)}°
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-1">Feels like {Math.round(weatherData.current.feelslike_c)}°C</p>
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-surface-variant/30">
                <div className="bg-surface-container-low p-3 rounded-xl flex flex-col gap-0.5 items-start shadow-sm border border-outline-variant/25">
                  <span className="material-symbols-outlined text-primary text-lg">humidity_percentage</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Humidity</span>
                  <span className="text-sm font-black text-on-surface">{weatherData.current.humidity}%</span>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl flex flex-col gap-0.5 items-start shadow-sm border border-outline-variant/25">
                  <span className="material-symbols-outlined text-primary text-lg">air</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Wind</span>
                  <span className="text-sm font-black text-on-surface">{Math.round(weatherData.current.wind_kph)} km/h</span>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl flex flex-col gap-0.5 items-start shadow-sm border border-outline-variant/25">
                  <span className="material-symbols-outlined text-primary text-lg">routine</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">UV Index</span>
                  <span className="text-sm font-black text-on-surface">{weatherData.current.uv}</span>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl flex flex-col gap-0.5 items-start shadow-sm border border-outline-variant/25">
                  <span className="material-symbols-outlined text-primary text-lg">water_drop</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Precipitation</span>
                  <span className="text-sm font-black text-on-surface">{weatherData.current.precip_mm} mm</span>
                </div>
              </div>
            </div>

            {/* Farming Insights Bento Box */}
            <div className="bg-primary text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 border-b border-white/20 pb-4 mb-4">
                <span className="material-symbols-outlined">psychiatry</span>
                <h3 className="font-bold text-lg">Operational Insights</h3>
              </div>
              
              <div className="flex flex-col gap-3 flex-grow justify-center">
                {getOperationalInsights(weatherData.current).map((insight, idx) => (
                  <div key={idx} className="bg-white/10 rounded-xl p-3 flex justify-between items-center border border-white/5">
                    <div>
                      <p className="text-[10px] uppercase opacity-75">{insight.title}</p>
                      <p className="text-xs font-bold text-white mt-0.5">{insight.value}</p>
                    </div>
                    <span className="material-symbols-outlined text-lg">{insight.icon}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-[10px] text-white/60 mt-4 text-center">Last updated: {weatherData.current.last_updated}</p>
            </div>
          </div>

          {/* 7-Day Forecast & Interactive Radar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Daily Forecast List */}
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-on-surface mb-4">Forecast Outlook</h3>
              <div className="flex flex-col divide-y divide-surface-variant/40">
                {weatherData.forecast.forecastday.map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <span className="font-bold text-sm text-on-surface w-16">{getDayName(day.date, idx)}</span>
                    <div className="flex items-center gap-1 text-primary-fixed-variant">
                      <span className="material-symbols-outlined text-lg">
                        {getWeatherIconName(day.day.condition.text)}
                      </span>
                      <span className="text-xs font-bold w-12 text-on-surface-variant">
                        {day.day.daily_chance_of_rain || 0}%
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-grow max-w-[200px] justify-end">
                      <span className="text-xs font-semibold text-on-surface-variant">{Math.round(day.day.mintemp_c)}°</span>
                      <div className="h-2 flex-grow bg-surface-container-high rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full absolute"
                          style={{
                            left: '20%',
                            right: '20%'
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-on-surface">{Math.round(day.day.maxtemp_c)}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Local Radar Map Widget */}
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-on-surface">Local Radar Map</h3>
                <div className="flex gap-1 bg-surface-container rounded-lg p-1 text-[10px] font-bold">
                  <button
                    onClick={() => setRadarLayer('precip')}
                    className={`px-3 py-1 rounded-md transition-all ${radarLayer === 'precip' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                  >Precip</button>
                  <button
                    onClick={() => setRadarLayer('temp')}
                    className={`px-3 py-1 rounded-md transition-all ${radarLayer === 'temp' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                  >Temp</button>
                </div>
              </div>

              {/* Map Placeholder with location info */}
              <div className="flex-grow bg-surface-container-high rounded-xl min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden border border-outline-variant/20">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-surface to-surface"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0wIDBoMjB2MjBIMHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIgnvZGUiIHN0cm9rZS1vcGFjaXR5PSIuMDUiLz4KPC9zdmc+')] opacity-40"></div>
                
                <div className="relative z-10 flex flex-col items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[44px] text-primary">map</span>
                  <p className="text-xs font-bold text-on-surface">Radar Layer: {radarLayer === 'precip' ? '🌧️ Precipitation' : '🌡️ Temperature'}</p>
                  {weatherData && (
                    <p className="text-[10px] text-on-surface-variant">
                      {weatherData.location.name} • Lat {weatherData.location.lat.toFixed(2)}°, Lon {weatherData.location.lon.toFixed(2)}°
                    </p>
                  )}
                  <button
                    onClick={() => {
                      if (weatherData) {
                        const lat = weatherData.location.lat;
                        const lon = weatherData.location.lon;
                        window.open(`https://www.windy.com/?${lat},${lon},10,i:${radarLayer === 'precip' ? 'rainAccumulation' : 'temp'}`, '_blank');
                      }
                    }}
                    className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold shadow-sm hover:bg-primary/90 transition-colors mt-2 active:scale-95 duration-200"
                  >
                    Expand Radar
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}