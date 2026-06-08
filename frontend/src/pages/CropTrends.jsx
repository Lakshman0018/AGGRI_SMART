import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function CropTrends() {
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [timeRange, setTimeRange] = useState('6months');

  const crops = [
    { name: 'Rice', value: 'rice', icon: '🌾', color: '#2e7d32' },
    { name: 'Wheat', value: 'wheat', icon: '🌾', color: '#45300d' },
    { name: 'Tomato', value: 'tomato', icon: '🍅', color: '#ba1a1a' },
    { name: 'Potato', value: 'potato', icon: '🥔', color: '#16a34a' },
    { name: 'Onion', value: 'onion', icon: '🧅', color: '#5e4622' },
    { name: 'Corn', value: 'corn', icon: '🌽', color: '#d6b587' },
  ];

  const timeRanges = [
    { label: '1 Month', value: '1month' },
    { label: '3 Months', value: '3months' },
    { label: '6 Months', value: '6months' },
    { label: '1 Year', value: '1year' },
  ];

  // Mock data for demonstration
  const generateMockData = (crop, range) => {
    const months = range === '1month' ? 1 : range === '3months' ? 3 : range === '6months' ? 6 : 12;
    const labels = [];
    const prices = [];
    const volumes = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      
      const basePrice = crop === 'rice' ? 45 : crop === 'wheat' ? 35 : crop === 'tomato' ? 60 : 
                      crop === 'potato' ? 25 : crop === 'onion' ? 40 : 30;
      const variation = (Math.random() - 0.5) * 15;
      prices.push(Math.max(10, basePrice + variation));
      volumes.push(Math.floor(Math.random() * 1000) + 500);
    }
    
    return { labels, prices, volumes };
  };

  const currentData = generateMockData(selectedCrop, timeRange);
  const selectedCropInfo = crops.find(c => c.value === selectedCrop);

  const priceChartData = {
    labels: currentData.labels,
    datasets: [
      {
        label: 'Price (₹/kg)',
        data: currentData.prices,
        borderColor: selectedCropInfo?.color || '#2e7d32',
        backgroundColor: `${selectedCropInfo?.color || '#2e7d32'}20`,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const volumeChartData = {
    labels: currentData.labels,
    datasets: [
      {
        label: 'Trading Volume (tons)',
        data: currentData.volumes,
        backgroundColor: selectedCropInfo?.color || '#2e7d32',
        borderColor: selectedCropInfo?.color || '#2e7d32',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#eeeeee' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const marketInsights = [
    {
      title: 'Price Trend',
      value: currentData.prices[currentData.prices.length - 1] > currentData.prices[0] ? 'Rising' : 'Falling',
      change: ((currentData.prices[currentData.prices.length - 1] - currentData.prices[0]) / currentData.prices[0] * 100).toFixed(1),
      icon: currentData.prices[currentData.prices.length - 1] > currentData.prices[0] ? 'trending_up' : 'trending_down',
      color: currentData.prices[currentData.prices.length - 1] > currentData.prices[0] ? 'text-secondary' : 'text-error'
    },
    {
      title: 'Current Price',
      value: `₹${currentData.prices[currentData.prices.length - 1].toFixed(2)}/kg`,
      change: '',
      icon: 'attach_money',
      color: 'text-primary'
    },
    {
      title: 'Avg Volume',
      value: `${Math.round(currentData.volumes.reduce((a, b) => a + b, 0) / currentData.volumes.length)} tons`,
      change: '',
      icon: 'bar_chart',
      color: 'text-info'
    },
    {
      title: 'Price Range',
      value: `₹${Math.min(...currentData.prices).toFixed(0)} - ₹${Math.max(...currentData.prices).toFixed(0)}`,
      change: '',
      icon: 'show_chart',
      color: 'text-tertiary'
    }
  ];

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">trending_up</span>
          Crop Recommendation Dashboard
        </h1>
        <p className="text-on-surface-variant max-w-[700px]">
          Track market price trends, historic volumes, and AI-predicted profitable crop adjustments.
        </p>
      </header>

      {/* Controls Container */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Select Crop */}
        <div className="lg:col-span-8 bg-white border border-surface-variant rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm text-primary mb-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-base">eco</span>
            Select Commodity
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {crops.map((crop) => (
              <button
                key={crop.value}
                onClick={() => setSelectedCrop(crop.value)}
                className={`p-3 rounded-xl border font-bold text-sm transition-all flex flex-col items-center justify-center gap-1.5 ${
                  selectedCrop === crop.value
                    ? 'border-primary bg-primary-container text-white'
                    : 'border-surface-variant bg-white hover:bg-surface-container-low text-on-surface'
                }`}
              >
                <span className="text-2xl">{crop.icon}</span>
                <span>{crop.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time range */}
        <div className="lg:col-span-4 bg-white border border-surface-variant rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm text-primary mb-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-base">calendar_today</span>
            Time Interval
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`py-3.5 rounded-xl border font-bold text-xs transition-all ${
                  timeRange === range.value
                    ? 'border-primary bg-primary-container text-white'
                    : 'border-surface-variant bg-white hover:bg-surface-container-low text-on-surface'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Cards Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {marketInsights.map((insight, idx) => (
          <div key={idx} className="bg-white border border-surface-variant rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-on-surface-variant block mb-1">{insight.title}</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-2xl font-black ${insight.color}`}>{insight.value}</span>
                {insight.change && (
                  <span className={`text-xs font-bold ${insight.color}`}>
                    ({insight.change > 0 ? '+' : ''}{insight.change}%)
                  </span>
                )}
              </div>
            </div>
            <div className={`w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center ${insight.color}`}>
              <span className="material-symbols-outlined">{insight.icon}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Chart Canvas area */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Line Chart */}
        <div className="bg-white border border-surface-variant rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-primary mb-4 text-center">Price Trend Trajectory</h3>
          <div className="h-64 relative">
            <Line data={priceChartData} options={chartOptions} />
          </div>
        </div>
        {/* Bar Chart */}
        <div className="bg-white border border-surface-variant rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-primary mb-4 text-center">Volume Traded</h3>
          <div className="h-64 relative">
            <Bar data={volumeChartData} options={chartOptions} />
          </div>
        </div>
      </section>

      {/* Bottom Insights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-2">
          <span className="material-symbols-outlined text-primary text-2xl">insights</span>
          <h4 className="font-bold text-base text-primary">Price Projection</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            AI-driven regression predicts {selectedCropInfo?.name} prices will {currentData.prices[currentData.prices.length - 1] > currentData.prices[0] ? 'grow by 8%' : 'decrease slightly'} in the upcoming weeks due to regional supply constraints.
          </p>
        </div>

        <div className="bg-secondary-container/10 border border-secondary-container/30 rounded-xl p-5 space-y-2">
          <span className="material-symbols-outlined text-secondary text-2xl">schedule</span>
          <h4 className="font-bold text-base text-secondary">Optimal Sales Timing</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Market rates are optimal on Tuesday and Wednesday mornings at APMC hubs. Selling mid-week maximizes margins by up to 4%.
          </p>
        </div>

        <div className="bg-error-container/10 border border-error-container rounded-xl p-5 space-y-2">
          <span className="material-symbols-outlined text-error text-2xl">warning</span>
          <h4 className="font-bold text-base text-error">Market Volatility Risk</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Risk rating is moderate due to monsoon arrival uncertainty. Keep close track of daily moisture readings to protect grain weight.
          </p>
        </div>
      </section>
    </div>
  );
}

export default CropTrends;
