import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { productAPI, orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalViews: 0,
    outOfStock: 0,
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const productsRes = await productAPI.getMyProducts({ status: 'all' });
      if (productsRes.data?.data) {
        setProducts(productsRes.data.data.products || []);
        setStats(prev => ({ ...prev, ...productsRes.data.data.stats }));
      }

      // Fetch orders
      const ordersRes = await orderAPI.getSellerOrders({ limit: 5 });
      if (ordersRes.data?.data) {
        setOrders(ordersRes.data.data.orders || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  // Chart configs using Design System Colors
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: '#006e1c', // secondary
        backgroundColor: 'rgba(0, 110, 28, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const productCategoryData = {
    labels: ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Others'],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          '#2e7d32', // primary
          '#16a34a', // secondary
          '#45300d', // tertiary
          '#dcfce7', // primary-container
          '#bbf7d0', // secondary-container
        ],
      },
    ],
  };

  const orderStatusData = {
    labels: ['Pending', 'Processing', 'Shipped', 'Delivered'],
    datasets: [
      {
        label: 'Orders',
        data: [5, 8, 12, 20],
        backgroundColor: ['#5e4622', '#2f5233', '#a9d1a8', '#006e1c'],
      },
    ],
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.deleteProduct(id);
        toast.success('Product deleted successfully');
        fetchDashboardData();
      } catch (error) {
        console.error('Failed to delete product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6">
      {/* Welcome Banner */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
          Welcome back, {user?.name || 'Farmer'}! 👋
        </h1>
        <p className="text-lg text-on-surface-variant">
          Here is your farm's overview and metrics for today.
        </p>
      </header>

      {/* Quick Actions Panel */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => navigate('/products/new')}
          className="flex items-center justify-center gap-2 bg-primary text-white py-3.5 px-4 rounded-xl font-semibold shadow-md hover:bg-primary-container transition-all active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined">add</span>
          Add Product
        </button>
        <button
          onClick={() => navigate('/plant-disease-scanner')}
          className="flex items-center justify-center gap-2 bg-white text-primary border border-outline-variant py-3.5 px-4 rounded-xl font-semibold hover:bg-surface-container-low transition-all active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined">scanner</span>
          Disease Scan
        </button>
        <button
          onClick={() => navigate('/soil-analysis')}
          className="flex items-center justify-center gap-2 bg-white text-primary border border-outline-variant py-3.5 px-4 rounded-xl font-semibold hover:bg-surface-container-low transition-all active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined">water_drop</span>
          Soil Test
        </button>
        <button
          onClick={() => navigate('/weather-dashboard')}
          className="flex items-center justify-center gap-2 bg-white text-primary border border-outline-variant py-3.5 px-4 rounded-xl font-semibold hover:bg-surface-container-low transition-all active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined">partly_cloudy_day</span>
          Weather
        </button>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-surface-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-on-surface-variant block mb-1">Total Products</span>
            <span className="text-3xl font-bold text-on-surface">{stats.totalProducts}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
        </div>

        <div className="bg-white border border-surface-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-on-surface-variant block mb-1">Active Orders</span>
            <span className="text-3xl font-bold text-on-surface">{stats.totalOrders}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">shopping_bag</span>
          </div>
        </div>

        <div className="bg-white border border-surface-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-on-surface-variant block mb-1">Total Revenue</span>
            <span className="text-3xl font-bold text-on-surface">₹{stats.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-tertiary-fixed/30 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined">attach_money</span>
          </div>
        </div>

        <div className="bg-white border border-surface-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-on-surface-variant block mb-1">Out of Stock</span>
            <span className="text-3xl font-bold text-on-surface">{stats.outOfStock || 0}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-error-container/30 flex items-center justify-center text-error">
            <span className="material-symbols-outlined">warning</span>
          </div>
        </div>
      </section>

      {/* Bento Grid layout matching Stitch mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Weather Widget (Col 1-4) */}
        <section className="col-span-1 lg:col-span-4 bg-white rounded-xl p-6 shadow-sm border border-surface-variant flex flex-col justify-between relative overflow-hidden min-h-[260px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/20 rounded-bl-full -z-10"></div>
          <div className="flex items-center gap-2 text-primary mb-4">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>partly_cloudy_day</span>
            <h2 className="text-xl font-bold">Weather</h2>
          </div>
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-5xl font-extrabold text-on-surface block">24°C</span>
              <span className="text-sm text-on-surface-variant">Partly Cloudy, Bangalore</span>
            </div>
            <div className="text-right">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>water_drop</span>
              <span className="block text-xs font-semibold text-secondary">30% Rain</span>
            </div>
          </div>
          <div className="pt-4 border-t border-surface-variant grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="block text-on-surface-variant mb-0.5">Wind</span>
              <span className="font-bold">12 km/h</span>
            </div>
            <div>
              <span className="block text-on-surface-variant mb-0.5">Humidity</span>
              <span className="font-bold">65%</span>
            </div>
            <div>
              <span className="block text-on-surface-variant mb-0.5">UV Index</span>
              <span className="font-bold">Moderate</span>
            </div>
          </div>
        </section>

        {/* Disease Alerts (Col 5-8) */}
        <section className="col-span-1 lg:col-span-4 bg-error-container/10 rounded-xl p-6 shadow-sm border border-error-container flex flex-col justify-between min-h-[260px]">
          <div className="flex justify-between items-center text-error mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <h2 className="text-xl font-bold">Outbreak Alerts</h2>
            </div>
            <span className="bg-error text-white text-xs font-bold px-2 py-0.5 rounded-full">2 Active</span>
          </div>
          <div className="flex-grow space-y-3">
            <div className="bg-white p-3 rounded-lg border border-error/20 flex gap-3 items-start shadow-sm">
              <span className="material-symbols-outlined text-error mt-0.5" style={{ fontSize: '20px' }}>pest_control</span>
              <div>
                <h3 className="font-semibold text-sm text-on-surface">Aphid Infestation Risk</h3>
                <p className="text-xs text-on-surface-variant mt-1">High probability detected in nearby tomato fields. Inspect underside of leaves.</p>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-outline-variant/50 flex gap-3 items-start shadow-sm">
              <span className="material-symbols-outlined text-tertiary mt-0.5" style={{ fontSize: '20px' }}>water_damage</span>
              <div>
                <h3 className="font-semibold text-sm text-on-surface">Late Blight Warning</h3>
                <p className="text-xs text-on-surface-variant mt-1">Conditions favorable for blight in potato crops due to recent humidity.</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/pest-alerts')}
            className="mt-4 text-error font-bold hover:underline text-sm flex items-center gap-1 self-start"
          >
            View Treatment Guides <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </section>

        {/* Upcoming Irrigation (Col 9-12) */}
        <section className="col-span-1 lg:col-span-4 bg-primary-container/10 rounded-xl p-6 shadow-sm border border-primary-container/30 flex flex-col justify-between min-h-[260px]">
          <div className="flex items-center gap-2 text-primary mb-4">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>sprinkler</span>
            <h2 className="text-xl font-bold">Smart Irrigation</h2>
          </div>
          <div className="flex-grow flex flex-col justify-center items-center text-center my-2">
            <div className="w-12 h-12 bg-primary-container text-white rounded-full flex items-center justify-center mb-3">
              <span className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>water</span>
            </div>
            <h3 className="font-bold text-base text-on-surface">Field A - Wheat</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Scheduled in 4 hours</p>
            <div className="mt-3 w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full w-3/4"></div>
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant mt-1.5 self-end">Soil Moisture: 45%</span>
          </div>
          <button
            onClick={() => navigate('/irrigation')}
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-container transition-colors mt-auto text-sm"
          >
            Manage Irrigation
          </button>
        </section>
      </div>

      {/* Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Revenue Line Chart */}
        <div className="col-span-1 lg:col-span-8 bg-white border border-surface-variant rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">trending_up</span>
              Revenue Overview
            </h2>
            <span className="text-sm font-semibold text-secondary bg-secondary-container/20 px-2.5 py-1 rounded-full">
              +12% this week
            </span>
          </div>
          <div className="h-64 relative">
            <Line
              data={revenueChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    grid: { color: '#f3f3f3' },
                  },
                  x: {
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Product Categories Doughnut */}
        <div className="col-span-1 lg:col-span-4 bg-white border border-surface-variant rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">donut_large</span>
            Product Breakdown
          </h2>
          <div className="h-56 relative flex justify-center items-center">
            <Doughnut
              data={productCategoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, font: { size: 10 } },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs list for Products, Orders, and Notifications */}
      <div className="bg-white border border-surface-variant rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="flex border-b border-surface-variant bg-surface-container-low">
          <button
            onClick={() => setTabValue(0)}
            className={`flex-1 py-4 px-6 font-bold text-sm text-center border-b-2 transition-all ${
              tabValue === 0
                ? 'border-primary text-primary bg-white'
                : 'border-transparent text-on-surface-variant hover:bg-white/50'
            }`}
          >
            My Products ({products.length})
          </button>
          <button
            onClick={() => setTabValue(1)}
            className={`flex-1 py-4 px-6 font-bold text-sm text-center border-b-2 transition-all ${
              tabValue === 1
                ? 'border-primary text-primary bg-white'
                : 'border-transparent text-on-surface-variant hover:bg-white/50'
            }`}
          >
            Recent Orders ({orders.length})
          </button>
          <button
            onClick={() => setTabValue(2)}
            className={`flex-1 py-4 px-6 font-bold text-sm text-center border-b-2 transition-all ${
              tabValue === 2
                ? 'border-primary text-primary bg-white'
                : 'border-transparent text-on-surface-variant hover:bg-white/50'
            }`}
          >
            System Health & alerts
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-6">
          {tabValue === 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-on-surface">Manage Products</h3>
                <button
                  onClick={() => navigate('/products')}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  View Store Front
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant">
                  No products listed yet. Create one above!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-surface-variant text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                        <th className="pb-3">Product</th>
                        <th className="pb-3">Price</th>
                        <th className="pb-3">Stock Status</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-variant text-sm">
                      {products.slice(0, 5).map((product) => (
                        <tr key={product._id} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="py-4 flex items-center gap-3">
                            <img
                              src={product.images?.[0] || 'https://via.placeholder.com/40'}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover border border-surface-variant"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/40';
                              }}
                            />
                            <div>
                              <span className="font-bold text-on-surface block">{product.name}</span>
                              <span className="text-xs text-on-surface-variant capitalize">{product.category}</span>
                            </div>
                          </td>
                          <td className="py-4 font-semibold">
                            ₹{product.price} / {product.unit || 'kg'}
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              product.quantity > 10
                                ? 'bg-success/10 text-success'
                                : product.quantity > 0
                                ? 'bg-warning/10 text-warning'
                                : 'bg-error/10 text-error'
                            }`}>
                              {product.quantity > 0 ? `${product.quantity} ${product.unit || 'kg'} left` : 'Out of stock'}
                            </span>
                          </td>
                          <td className="py-4">
                            {product.organic ? (
                              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">Organic</span>
                            ) : (
                              <span className="bg-surface-container-high text-on-surface-variant text-xs font-semibold px-2 py-0.5 rounded-full">Conventional</span>
                            )}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => navigate(`/products/edit/${product._id}`)}
                                className="p-1 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded transition-colors"
                                title="Edit Product"
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="p-1 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded transition-colors"
                                title="Delete Product"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tabValue === 1 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-on-surface">Recent Orders</h3>
                <button
                  onClick={() => navigate('/orders')}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  View All Orders
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant">
                  No orders received yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order._id}
                      className="border border-surface-variant rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-sm transition-shadow bg-surface-container-lowest"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                          <span className="material-symbols-outlined">local_shipping</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface">Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}</h4>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            Buyer: <span className="font-semibold">{order.buyer?.name || 'Customer'}</span> • {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div>
                          <span className="text-lg font-extrabold text-primary block">₹{order.totalAmount}</span>
                          <span className="text-[10px] font-semibold text-on-surface-variant">{order.items?.length || 0} items</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          order.orderStatus === 'delivered'
                            ? 'bg-success/15 text-success'
                            : order.orderStatus === 'cancelled'
                            ? 'bg-error/15 text-error'
                            : 'bg-warning/15 text-warning'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tabValue === 2 && (
            <div className="space-y-3">
              <div className="bg-success/10 border border-success/20 p-4 rounded-xl flex gap-3 items-start">
                <span className="material-symbols-outlined text-success mt-0.5">check_circle</span>
                <div>
                  <h4 className="font-bold text-on-surface text-sm">System Status Optimal</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Your farmer profile is verified. Product listings are live and visible to buyers.
                  </p>
                </div>
              </div>
              <div className="bg-info/10 border border-info/20 p-4 rounded-xl flex gap-3 items-start">
                <span className="material-symbols-outlined text-info mt-0.5">info</span>
                <div>
                  <h4 className="font-bold text-on-surface text-sm">Weather Alert</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Heavy rainfall expected tomorrow. Adjust irrigation timers accordingly.
                  </p>
                </div>
              </div>
              <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex gap-3 items-start">
                <span className="material-symbols-outlined text-warning mt-0.5">warning</span>
                <div>
                  <h4 className="font-bold text-on-surface text-sm">Action Required: Low Stock</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Some items in your inventory are running low. Update stock quantities to prevent order cancellations.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Charts and Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Order Status Distribution Bar Chart */}
        <div className="col-span-1 lg:col-span-6 bg-white border border-surface-variant rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">bar_chart</span>
            Order Status Breakdown
          </h2>
          <div className="h-64 relative">
            <Bar
              data={orderStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>

        {/* Quick Insights List */}
        <div className="col-span-1 lg:col-span-6 bg-white border border-surface-variant rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">lightbulb</span>
            Quick Advisory & Insights
          </h2>
          <ul className="space-y-4">
            <li className="flex gap-3.5 items-start">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined">eco</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Top Selling Product</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Tomatoes - 150kg sold this month. Consider expanding your crop area next season.</p>
              </div>
            </li>
            <li className="flex gap-3.5 items-start">
              <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary flex-shrink-0">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Market Trends Advice</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Wheat prices are high right now. Sell your harvested crop while pricing holds strong.</p>
              </div>
            </li>
            <li className="flex gap-3.5 items-start">
              <div className="w-10 h-10 rounded-full bg-error-container/30 flex items-center justify-center text-error flex-shrink-0">
                <span className="material-symbols-outlined">bug_report</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Pest Risk</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Aphid infestation warning is active. Spray organic neem oil as a preventive measure.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
