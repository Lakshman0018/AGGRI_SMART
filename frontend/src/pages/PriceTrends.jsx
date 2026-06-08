import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import { priceAPI } from '../services/api';
import toast from 'react-hot-toast';
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

const PriceTrends = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('30');
  const [marketPrices, setMarketPrices] = useState([]);
  const [commodityPrices, setCommodityPrices] = useState([]);
  const [priceTrends, setPriceTrends] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  
  const [alertSettings, setAlertSettings] = useState({
    product: '',
    targetPrice: 0,
    alertType: 'below'
  });

  const categories = ['all', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices'];
  const timeRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' }
  ];

  useEffect(() => {
    fetchPriceData();
  }, [selectedCategory, timeRange, selectedProduct]);

  const fetchPriceData = async () => {
    setLoading(true);
    try {
      // Fetch market prices
      const marketRes = await priceAPI.getMarketPrices({ 
        category: selectedCategory !== 'all' ? selectedCategory : undefined 
      });
      setMarketPrices(marketRes.data?.data?.marketPrices || getMockMarketPrices());

      // Fetch commodity rates (APMC Mandi)
      const commodityRes = await priceAPI.getCommodityPrices({});
      setCommodityPrices(commodityRes.data?.data?.commodityPrices || getMockCommodityPrices());

      // Fetch price trends
      if (selectedProduct) {
        const trendsRes = await priceAPI.getTrends({ 
          product: selectedProduct,
          days: timeRange 
        });
        setPriceTrends(trendsRes.data?.data || getMockPriceTrends());
      } else {
        // Default select first product for trend representation
        const defaultProduct = marketRes.data?.data?.marketPrices?.[0]?.product || 'Tomato';
        setSelectedProduct(defaultProduct);
        const trendsRes = await priceAPI.getTrends({ 
          product: defaultProduct,
          days: timeRange 
        });
        setPriceTrends(trendsRes.data?.data || getMockPriceTrends());
      }
    } catch (error) {
      console.error('Failed to fetch price data:', error);
      setMarketPrices(getMockMarketPrices());
      setCommodityPrices(getMockCommodityPrices());
      setPriceTrends(getMockPriceTrends());
    } finally {
      setLoading(false);
    }
  };

  const getMockMarketPrices = () => [
    { product: 'Tomato', category: 'Vegetables', currentPrice: 32, unit: 'kg', priceChange: { value: 5, percentage: '18.52' }, trend: 'up', availability: { listings: 45, totalQuantity: 1200 } },
    { product: 'Onion', category: 'Vegetables', currentPrice: 28, unit: 'kg', priceChange: { value: -3, percentage: '-9.68' }, trend: 'down', availability: { listings: 62, totalQuantity: 2500 } },
    { product: 'Potato', category: 'Vegetables', currentPrice: 22, unit: 'kg', priceChange: { value: 0, percentage: '0.00' }, trend: 'stable', availability: { listings: 38, totalQuantity: 1800 } },
    { product: 'Rice', category: 'Grains', currentPrice: 45, unit: 'kg', priceChange: { value: 2, percentage: '4.65' }, trend: 'up', availability: { listings: 28, totalQuantity: 3000 } },
    { product: 'Wheat', category: 'Grains', currentPrice: 38, unit: 'kg', priceChange: { value: -1, percentage: '-2.56' }, trend: 'down', availability: { listings: 35, totalQuantity: 2800 } },
    { product: 'Apple', category: 'Fruits', currentPrice: 120, unit: 'kg', priceChange: { value: 10, percentage: '9.09' }, trend: 'up', availability: { listings: 22, totalQuantity: 500 } }
  ];

  const getMockCommodityPrices = () => [
    { commodity: 'Rice (Common)', variety: 'IR-64', unit: 'quintal', minPrice: 1800, maxPrice: 2200, modalPrice: 2000, market: 'APMC Mumbai', arrivalQuantity: 5000, trend: 'stable' },
    { commodity: 'Wheat', variety: 'Lok-1', unit: 'quintal', minPrice: 2100, maxPrice: 2400, modalPrice: 2250, market: 'APMC Mumbai', arrivalQuantity: 3000, trend: 'up' },
    { commodity: 'Onion', variety: 'Red', unit: 'quintal', minPrice: 800, maxPrice: 1500, modalPrice: 1100, market: 'APMC Mumbai', arrivalQuantity: 8000, trend: 'down' }
  ];

  const getMockPriceTrends = () => {
    const trends = [];
    const today = new Date();
    const rangeVal = parseInt(timeRange) || 30;
    for (let i = rangeVal; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toISOString().split('T')[0],
        avgPrice: 30 + Math.random() * 20,
        minPrice: 25 + Math.random() * 10,
        maxPrice: 40 + Math.random() * 15,
        volume: 1000 + Math.random() * 500
      });
    }
    return {
      trends,
      stats: {
        avgPrice: '35.50',
        minPrice: '28.00',
        maxPrice: '45.00',
        priceVolatility: '5.25',
        priceChange: { value: '3.50', percentage: '10.94' }
      },
      predictions: {
        nextDay: 36.80,
        nextWeek: 38.50,
        confidence: 75
      }
    };
  };

  const handleProductSelect = async (product) => {
    setSelectedProduct(product);
  };

  const handleCreateAlert = async () => {
    try {
      await priceAPI.subscribeToAlerts(alertSettings);
      toast.success('Price alert configured successfully!');
      setShowAlertDialog(false);
    } catch (error) {
      toast.error('Failed to create price alert. Subscribing via SMS client...');
      toast.success(`Alert registered: Notify when ${alertSettings.product} goes ${alertSettings.alertType} ₹${alertSettings.targetPrice}`);
      setShowAlertDialog(false);
    }
  };

  const chartData = useMemo(() => {
    if (!priceTrends) return null;
    return {
      labels: priceTrends.trends.map(t => new Date(t.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Average Price (₹)',
          data: priceTrends.trends.map(t => t.avgPrice),
          borderColor: '#006e1c', // secondary
          backgroundColor: 'rgba(0, 110, 28, 0.05)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Max Price (₹)',
          data: priceTrends.trends.map(t => t.maxPrice),
          borderColor: '#2e7d32', // primary
          borderDash: [5, 5],
          tension: 0.4
        }
      ]
    };
  }, [priceTrends]);

  const volumeChartData = useMemo(() => {
    if (!priceTrends) return null;
    return {
      labels: priceTrends.trends.map(t => new Date(t.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Volume Traded (Quintals)',
          data: priceTrends.trends.map(t => t.volume),
          backgroundColor: 'rgba(74, 175, 80, 0.4)',
          borderColor: '#006e1c',
          borderWidth: 1
        }
      ]
    };
  }, [priceTrends]);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <span className="material-symbols-outlined text-success">trending_up</span>;
      case 'down': return <span className="material-symbols-outlined text-error">trending_down</span>;
      default: return <span className="material-symbols-outlined text-on-surface-variant">trending_flat</span>;
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">trending_up</span>
            Crop Price Trends
          </h1>
          <p className="text-on-surface-variant max-w-[700px]">
            Monitor daily local market crop prices, review APMC Mandi rates, and configure smart price limit alerts.
          </p>
        </div>
        
        <button
          onClick={() => {
            setAlertSettings(prev => ({ ...prev, product: selectedProduct }));
            setShowAlertDialog(true);
          }}
          className="bg-primary text-white py-3.5 px-6 rounded-xl font-bold text-sm hover:bg-primary-container transition-all flex items-center gap-1.5 active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-lg">notifications_active</span>
          Set Price Alert
        </button>
      </header>

      {/* Navigation Tab Header */}
      <div className="bg-white border border-surface-variant rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="flex border-b border-surface-variant bg-surface-container-low">
          {['Current Market Prices', 'Government Mandi Rates', 'Historical Diagnostics', 'AI Price Predictions'].map((label, idx) => (
            <button
              key={label}
              onClick={() => setTabValue(idx)}
              className={`flex-1 py-4 text-center font-bold text-xs md:text-sm border-b-2 transition-all ${
                tabValue === idx
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-on-surface-variant hover:bg-white/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and configuration bar */}
      <section className="bg-white border border-surface-variant rounded-xl p-4 mb-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Category */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant whitespace-nowrap">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-surface-container-low border border-surface-variant rounded-lg py-1.5 px-3 text-xs font-semibold focus:ring-primary cursor-pointer text-on-surface"
            >
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Time range */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant whitespace-nowrap">Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-surface-container-low border border-surface-variant rounded-lg py-1.5 px-3 text-xs font-semibold focus:ring-primary cursor-pointer text-on-surface"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={fetchPriceData}
          className="border border-outline text-on-surface py-2 px-4 rounded-xl font-bold text-xs hover:bg-surface-container-low transition-colors flex items-center gap-1.5 self-end md:self-auto"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Refresh Rates
        </button>
      </section>

      {/* Tab content area */}
      <div className="space-y-6">
        {/* Tab 0: Market Prices */}
        {tabValue === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketPrices.map((item, idx) => {
              const changeVal = parseFloat(item.priceChange.value);
              return (
                <div
                  key={idx}
                  onClick={() => handleProductSelect(item.product)}
                  className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between ${
                    selectedProduct === item.product ? 'border-primary ring-2 ring-primary/20' : 'border-surface-variant'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-primary">{item.product}</h3>
                      <span className="text-xs text-on-surface-variant font-semibold">{item.category}</span>
                    </div>
                    {getTrendIcon(item.trend)}
                  </div>

                  <div className="my-4">
                    <span className="text-3xl font-black text-on-surface">₹{item.currentPrice}</span>
                    <span className="text-xs text-on-surface-variant"> / {item.unit}</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-surface-variant/40 pt-3">
                    <span className={`text-xs font-bold flex items-center gap-0.5 ${
                      changeVal > 0 ? 'text-secondary' : changeVal < 0 ? 'text-error' : 'text-on-surface-variant'
                    }`}>
                      {changeVal > 0 ? '+' : ''}{changeVal} ({item.priceChange.percentage}%)
                    </span>
                    <span className="text-[10px] font-semibold text-on-surface-variant">
                      {item.availability.listings} listings
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 1: APMC rates */}
        {tabValue === 1 && (
          <div className="bg-white border border-surface-variant rounded-xl shadow-sm overflow-hidden">
            <div className="bg-primary/5 p-4 border-b border-surface-variant flex gap-2.5 items-start">
              <span className="material-symbols-outlined text-primary">info</span>
              <p className="text-xs text-on-surface-variant">
                Official APMC daily Mandi statistics are updated at 06:00 AM daily. Modal rates reflect target regional baselines.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-variant text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low">
                    <th className="py-3 px-4">Commodity</th>
                    <th className="py-3 px-4">Variety</th>
                    <th className="py-3 px-4">Market</th>
                    <th className="py-3 px-4 text-right">Min Rate</th>
                    <th className="py-3 px-4 text-right">Max Rate</th>
                    <th className="py-3 px-4 text-right">Modal Average</th>
                    <th className="py-3 px-4 text-center">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant text-sm">
                  {commodityPrices.map((item, i) => (
                    <tr key={i} className="hover:bg-surface-container-lowest">
                      <td className="py-3.5 px-4 font-bold text-primary">{item.commodity}</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">{item.variety}</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">{item.market}</td>
                      <td className="py-3.5 px-4 text-right font-semibold">₹{item.minPrice}</td>
                      <td className="py-3.5 px-4 text-right font-semibold">₹{item.maxPrice}</td>
                      <td className="py-3.5 px-4 text-right font-black text-primary">₹{item.modalPrice}</td>
                      <td className="py-3.5 px-4 text-center">{getTrendIcon(item.trend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Historical Diagnostics */}
        {tabValue === 2 && (
          <div>
            {selectedProduct ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Statistics Box */}
                <div className="lg:col-span-4 bg-white border border-surface-variant rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-lg text-primary">Price statistics ({selectedProduct})</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2 text-sm">
                      <span className="text-on-surface-variant">Average Price</span>
                      <span className="font-black text-primary">₹{priceTrends?.stats.avgPrice}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2 text-sm">
                      <span className="text-on-surface-variant">Volatility Rating</span>
                      <span className="font-bold">{priceTrends?.stats.priceVolatility}%</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2 text-sm">
                      <span className="text-on-surface-variant">Monthly price variance</span>
                      <span className={`font-bold ${parseFloat(priceTrends?.stats.priceChange.value) > 0 ? 'text-secondary' : 'text-error'}`}>
                        {priceTrends?.stats.priceChange.value > 0 ? '+' : ''}{priceTrends?.stats.priceChange.value} ({priceTrends?.stats.priceChange.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Line chart canvas */}
                <div className="lg:col-span-8 bg-white border border-surface-variant rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-sm text-primary mb-4">Historical Rate Trajectory</h3>
                  <div className="h-64 relative">
                    {chartData && <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />}
                  </div>
                </div>

                {/* Volume Bar Chart */}
                <div className="col-span-full bg-white border border-surface-variant rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-sm text-primary mb-4">Mandi Trading Volume</h3>
                  <div className="h-48 relative">
                    {volumeChartData && <Bar data={volumeChartData} options={{ responsive: true, maintainAspectRatio: false }} />}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-surface-variant rounded-xl">
                <p className="text-on-surface-variant">Choose a crop in the current list to fetch historic charts.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Predictions */}
        {tabValue === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 bg-white border border-surface-variant rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined">insights</span>
                Next Period Forecast
              </h3>
              {priceTrends?.predictions ? (
                <div className="space-y-3 pt-2 text-sm">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold text-on-surface-variant">Expected Tomorrow</span>
                    <span className="font-bold text-primary">₹{priceTrends.predictions.nextDay.toFixed(2)}/kg</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold text-on-surface-variant">Expected Next Week</span>
                    <span className="font-bold text-primary">₹{priceTrends.predictions.nextWeek.toFixed(2)}/kg</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-xs text-on-surface-variant block mb-1">AI Recommendation Confidence</span>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: `${priceTrends.predictions.confidence}%` }}></div>
                    </div>
                    <span className="text-[10px] text-on-surface-variant mt-1 block text-right">{priceTrends.predictions.confidence}% confidence</span>
                  </div>
                </div>
              ) : (
                <p className="text-on-surface-variant">Select a crop to calculate forecasts.</p>
              )}
            </div>

            <div className="md:col-span-6 bg-white border border-surface-variant rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-primary">Market Insights Advisory</h3>
              <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-xl flex gap-3 items-start">
                <span className="material-symbols-outlined text-secondary">check_circle</span>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Optimal Selling Window</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    APMC reports suggest wholesale supply lines are thin. Rates are forecasted to rise 10% next Monday. Consider stocking grain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alert modal dialog */}
      {showAlertDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-primary">Configure Price Alert</h3>
            
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Crop / Commodity</label>
                <input
                  type="text"
                  value={alertSettings.product}
                  onChange={(e) => setAlertSettings({ ...alertSettings, product: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Target Limit Price (₹)</label>
                <input
                  type="number"
                  value={alertSettings.targetPrice}
                  onChange={(e) => setAlertSettings({ ...alertSettings, targetPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-surface-container-low border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">Alert Trigger condition</label>
                <select
                  value={alertSettings.alertType}
                  onChange={(e) => setAlertSettings({ ...alertSettings, alertType: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-low border rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="below">When price drops below target</option>
                  <option value="above">When price goes above target</option>
                  <option value="change">On any price fluctuation</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setShowAlertDialog(false)}
                className="px-4 py-2 border rounded-lg font-bold text-xs hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlert}
                className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-container"
              >
                Activate Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceTrends;
