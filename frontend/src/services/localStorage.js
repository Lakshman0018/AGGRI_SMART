// Local Storage Service - replaces MongoDB API calls
// Reads from JSON files in src/data/ and uses localStorage for user data

import usersData from '../data/users.json';
import cropsData from '../data/crops.json';
import fertilizersData from '../data/fertilizers.json';
import schemesData from '../data/schemes.json';
import vegetablesData from '../data/vegetables.json';
import pestsData from '../data/pests.json';
import irrigationData from '../data/irrigation.json';
import weatherData from '../data/weather.json';
import plantDiseasesData from '../data/plantDiseases.json';
import soilData from '../data/soil.json';

// Helper to get/update data in localStorage
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    return false;
  }
};

// Seed default data if not present
export const initializeDatabase = (force = false) => {
  const users = getStorageItem('agrismart_users', []);
  const products = getStorageItem('agrismart_products', []);
  const isOldDb = users.length > 0 && !users.some(u => u.email === 'john@example.com');
  // Force reseed if products are outdated (fewer than source data)
  const isStaleProducts = products.length < (vegetablesData.vegetables || []).length;
  
  if (force || !localStorage.getItem('agrismart_initialized') || isOldDb || isStaleProducts) {
    setStorageItem('agrismart_users', usersData.users || []);
    
    // Normalise vegetables to products - merge category/description fields if needed
    const productsList = (vegetablesData.vegetables || []).map(item => ({
      ...item,
      id: item.id || Math.floor(Math.random() * 100000),
      _id: item._id || String(item.id),
      stock: item.stock ?? 100,
      inStock: item.inStock ?? true,
      featured: item.featured ?? (Math.random() > 0.5),
      discount: item.discount ?? Math.floor(Math.random() * 20),
      rating: item.rating ?? parseFloat((Math.random() * 2 + 3).toFixed(1)),
      reviews: item.reviews ?? Math.floor(Math.random() * 50),
      organic: item.organic ?? true,
      farmer: item.farmer || { id: '1', name: 'John Farmer', location: item.origin || 'Punjab' }
    }));
    
    setStorageItem('agrismart_products', productsList);
    setStorageItem('agrismart_orders', []);
    
    const combinedSchemes = [
      ...(schemesData.governmentSchemes || []).map(s => ({ ...s, type: 'government' })),
      ...(schemesData.stateSchemes || []).flatMap(stateGroup => 
        (stateGroup.schemes || []).map(s => ({
          id: Math.floor(Math.random() * 100000),
          schemeName: s.name,
          fullName: s.name,
          description: s.benefit || '',
          state: stateGroup.state,
          type: 'state',
          status: 'Active',
          benefits: [s.benefit],
          eligibility: ['All resident farmers of the state'],
          documentsRequired: ['Aadhaar Card', 'Land Records', 'Bank Passbook'],
          applicationProcess: 'Apply online through State Agriculture Portal',
          lastDate: 'Ongoing'
        }))
      )
    ];
    setStorageItem('agrismart_schemes', combinedSchemes);
    setStorageItem('agrismart_crop_trends', cropsData.cropTrends || []);
    setStorageItem('agrismart_weather', weatherData || {});
    setStorageItem('agrismart_pest_alerts', pestsData.pestAlerts || []);
    setStorageItem('agrismart_soil_history', soilData.soilHistory || [
      {
        id: 'RPT-12345',
        soilType: 'Loamy Soil',
        pH: 6.8,
        nitrogen: 'Medium',
        phosphorus: 'High',
        potassium: 'Medium',
        organicMatter: '2.8%',
        recommendations: [
          'Grow nitrogen-fixing legumes next season',
          'Add farmyard manure to increase organic matter'
        ],
        analyzedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]);
    setStorageItem('agrismart_irrigation_schedule', irrigationData.irrigationSchedule || []);
    setStorageItem('agrismart_water_usage', irrigationData.waterUsage || [
      { month: 'Jan', usage: 120 },
      { month: 'Feb', usage: 150 },
      { month: 'Mar', usage: 180 },
      { month: 'Apr', usage: 220 },
      { month: 'May', usage: 250 }
    ]);
    setStorageItem('agrismart_fertilizers', fertilizersData.fertilizers || []);
    setStorageItem('agrismart_organic_fertilizers', fertilizersData.organicFertilizers || []);
    setStorageItem('agrismart_pests', pestsData.pests || []);
    setStorageItem('agrismart_scheme_applications', []);
    setStorageItem('agrismart_pest_reports', []);
    
    localStorage.setItem('agrismart_initialized', 'true');
    console.log('✅ LocalStorage Mock Database Initialized and Seeded.');
  }
};


// Auto initialize on import
initializeDatabase();

// Auth Service
export const authService = {
  login: async (credentials) => {
    const storedUsers = getStorageItem('agrismart_users', usersData.users || []);
    const user = storedUsers.find(
      u => u.email === credentials.email && u.password === credentials.password
    );
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Create session
    const token = `mock-jwt-token-${Date.now()}-${user.id}`;
    const userData = { ...user };
    delete userData.password; // Don't store password

    setStorageItem('agrismart_token', token);
    setStorageItem('agrismart_user', userData);
    localStorage.setItem('token', token); // in case some code checks 'token' key
    localStorage.setItem('user', JSON.stringify(userData));

    return { success: true, token, user: userData, status: 'success', data: { user: userData, accessToken: token } };
  },

  signup: async (userData) => {
    const storedUsers = getStorageItem('agrismart_users', usersData.users || []);
    
    // Check if email exists
    const existingUser = storedUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password, // In real app, hash this
      phone: userData.phone || '',
      location: userData.location || 'India',
      farmSize: userData.farmSize || '',
      crops: userData.crops || [],
      joinedDate: new Date().toISOString().split('T')[0],
      verified: false,
      profileImage: '/images/user.png',
      role: userData.role || 'farmer'
    };

    storedUsers.push(newUser);
    setStorageItem('agrismart_users', storedUsers);

    // Auto login
    const token = `mock-jwt-token-${Date.now()}-${newUser.id}`;
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;

    setStorageItem('agrismart_token', token);
    setStorageItem('agrismart_user', userWithoutPassword);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));

    return { success: true, token, user: userWithoutPassword, status: 'success', data: { user: userWithoutPassword, accessToken: token } };
  },

  getProfile: async () => {
    const user = getStorageItem('agrismart_user');
    if (!user) {
      throw new Error('User not authenticated');
    }
    return { success: true, user, status: 'success', data: user };
  },

  updateProfile: async (profileData) => {
    const user = getStorageItem('agrismart_user');
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updatedUser = { ...user, ...profileData };
    setStorageItem('agrismart_user', updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    const storedUsers = getStorageItem('agrismart_users', []);
    const userIndex = storedUsers.findIndex(u => String(u.id) === String(user.id));
    if (userIndex !== -1) {
      storedUsers[userIndex] = { ...storedUsers[userIndex], ...profileData };
      setStorageItem('agrismart_users', storedUsers);
    }

    return { success: true, user: updatedUser, status: 'success', data: updatedUser };
  },

  logout: async () => {
    localStorage.removeItem('agrismart_token');
    localStorage.removeItem('agrismart_user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true, status: 'success' };
  }
};

// Products/Vegetables Service
export const productsService = {
  getProducts: async (params = {}) => {
    let products = getStorageItem('agrismart_products', []);
    
    // Apply filters
    if (params.category && params.category !== 'All') {
      products = products.filter(p => p.category?.toLowerCase() === params.category?.toLowerCase() || p.type?.toLowerCase() === params.category?.toLowerCase());
    }
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }
    if (params.organic === 'true' || params.organic === true) {
      products = products.filter(p => p.organic === true);
    }
    
    return { success: true, data: products, status: 'success' };
  },

  getProductById: async (id) => {
    const products = getStorageItem('agrismart_products', []);
    const product = products.find(p => String(p.id) === String(id) || String(p._id) === String(id));
    if (!product) {
      throw new Error('Product not found');
    }
    return { success: true, data: product, status: 'success' };
  },

  getCategories: async () => {
    const defaultCategories = [
      { id: 1, name: 'Leafy Greens', icon: '🥬' },
      { id: 2, name: 'Root Vegetables', icon: '🥕' },
      { id: 3, name: 'Fruit Vegetables', icon: '🍅' },
      { id: 4, name: 'Pod Vegetables', icon: '🫛' },
      { id: 5, name: 'Bulb Vegetables', icon: '🧅' },
      { id: 6, name: 'Flower Vegetables', icon: '🥦' }
    ];
    return { success: true, data: defaultCategories, status: 'success' };
  },

  searchProducts: async (query) => {
    const products = getStorageItem('agrismart_products', []);
    const searchLower = query.toLowerCase();
    const results = products.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower)
    );
    return { success: true, data: results, status: 'success' };
  }
};

// Orders Service
export const ordersService = {
  createOrder: async (orderData) => {
    const orders = getStorageItem('agrismart_orders', []);
    const user = getStorageItem('agrismart_user');
    
    const newOrder = {
      id: Date.now().toString(),
      _id: Date.now().toString(),
      userId: user?.id || null,
      items: orderData.items || [],
      shippingAddress: orderData.shippingAddress || orderData.address,
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
      paymentStatus: orderData.paymentStatus || 'completed',
      orderStatus: 'confirmed',
      total: orderData.total,
      subtotal: orderData.subtotal || orderData.total,
      deliveryCharge: orderData.deliveryCharge || 0,
      gst: orderData.gst || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.push(newOrder);
    setStorageItem('agrismart_orders', orders);

    return { success: true, data: newOrder, status: 'success' };
  },

  getOrders: async () => {
    const user = getStorageItem('agrismart_user');
    const orders = getStorageItem('agrismart_orders', []);
    
    if (user) {
      const userOrders = orders.filter(o => String(o.userId) === String(user.id));
      return { success: true, data: userOrders, status: 'success' };
    }
    
    return { success: true, data: [], status: 'success' };
  },

  getOrderById: async (id) => {
    const orders = getStorageItem('agrismart_orders', []);
    const order = orders.find(o => String(o.id) === String(id) || String(o._id) === String(id));
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    return { success: true, data: order, status: 'success' };
  },

  updateOrder: async (id, data) => {
    const orders = getStorageItem('agrismart_orders', []);
    const orderIndex = orders.findIndex(o => String(o.id) === String(id) || String(o._id) === String(id));
    
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    setStorageItem('agrismart_orders', orders);
    return { success: true, data: orders[orderIndex], status: 'success' };
  },

  cancelOrder: async (id) => {
    const orders = getStorageItem('agrismart_orders', []);
    const orderIndex = orders.findIndex(o => String(o.id) === String(id) || String(o._id) === String(id));
    
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    orders[orderIndex].orderStatus = 'cancelled';
    orders[orderIndex].updatedAt = new Date().toISOString();
    
    setStorageItem('agrismart_orders', orders);
    return { success: true, data: orders[orderIndex], status: 'success' };
  }
};

// Soil Health Service
export const soilService = {
  analyzeSoil: async (data) => {
    const soilType = data.soilType || 'Loamy Soil';
    const conservation = getStorageItem('agrismart_soil_conservation', soilData.soilConservationPractices || []);
    
    return {
      success: true,
      status: 'success',
      data: {
        soilType,
        pH: data.pH || 6.5,
        nitrogen: data.nitrogen || 'Medium',
        phosphorus: data.phosphorus || 'Medium',
        potassium: data.potassium || 'Medium',
        organicMatter: data.organicMatter || '2.5%',
        recommendations: conservation.map(c => `${c.practice}: ${c.benefits.join(', ')}`),
        analyzedAt: new Date().toISOString()
      }
    };
  },

  getSoilHistory: async () => {
    const history = getStorageItem('agrismart_soil_history', []);
    return { success: true, data: history, status: 'success' };
  },

  getRecommendations: async (soilType) => {
    const soilTypes = getStorageItem('agrismart_schemes_soilTypes', soilData.soilTypes || []);
    let recommendations = [];
    
    if (soilType) {
      const soilTypeData = soilTypes.find(s => s.type?.toLowerCase().includes(soilType?.toLowerCase()));
      if (soilTypeData) {
        recommendations = [{
          soilType: soilTypeData.type,
          suitableCrops: soilTypeData.suitableCrops,
          improvements: soilTypeData.improvements,
          characteristics: soilTypeData.characteristics
        }];
      }
    } else {
      recommendations = soilTypes;
    }
    
    return { success: true, data: recommendations, status: 'success' };
  }
};

// Irrigation Service
export const irrigationService = {
  getSchedule: async () => {
    const schedule = getStorageItem('agrismart_irrigation_schedule', []);
    return { success: true, data: schedule, status: 'success' };
  },

  updateSchedule: async (data) => {
    setStorageItem('agrismart_irrigation_schedule', data);
    return { success: true, data, status: 'success' };
  },

  getWaterUsage: async () => {
    const usage = getStorageItem('agrismart_water_usage', []);
    return { success: true, data: usage, status: 'success' };
  },

  getRecommendations: async (cropType) => {
    const schedule = getStorageItem('agrismart_irrigation_schedule', []);
    let recommendations = [];
    
    if (cropType) {
      const found = schedule.find(s => s.crop?.toLowerCase() === cropType?.toLowerCase());
      if (found) {
        recommendations = [found];
      }
    } else {
      recommendations = schedule;
    }
    
    return { success: true, data: recommendations, status: 'success' };
  }
};

// Government Schemes Service
export const schemesService = {
  getSchemes: async (filters = {}) => {
    let schemes = getStorageItem('agrismart_schemes', []);
    
    if (filters.status) {
      schemes = schemes.filter(s => s.status?.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters.state) {
      schemes = schemes.filter(s => s.state?.toLowerCase() === filters.state?.toLowerCase() || s.type === 'government');
    }
    
    return { success: true, data: schemes, status: 'success' };
  },

  getSchemeById: async (id) => {
    const schemes = getStorageItem('agrismart_schemes', []);
    const scheme = schemes.find(s => String(s.id) === String(id));
    
    if (!scheme) {
      throw new Error('Scheme not found');
    }
    
    return { success: true, data: scheme, status: 'success' };
  },

  applyForScheme: async (id, applicationData) => {
    const applications = getStorageItem('agrismart_scheme_applications', []);
    const user = getStorageItem('agrismart_user');
    
    const application = {
      id: Date.now().toString(),
      _id: Date.now().toString(),
      schemeId: id,
      userId: user?.id || null,
      ...applicationData,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };

    applications.push(application);
    setStorageItem('agrismart_scheme_applications', applications);

    return { success: true, data: application, status: 'success' };
  }
};

// Pest Management Service
export const pestService = {
  getPestAlerts: async (location) => {
    let alerts = getStorageItem('agrismart_pest_alerts', []);
    
    if (location) {
      alerts = alerts.filter(a => 
        a.regions?.some(r => r.toLowerCase().includes(location.toLowerCase()))
      );
    }
    
    return { success: true, data: alerts, status: 'success' };
  },

  reportPest: async (data) => {
    const reports = getStorageItem('agrismart_pest_reports', []);
    const user = getStorageItem('agrismart_user');
    
    const report = {
      id: Date.now().toString(),
      _id: Date.now().toString(),
      userId: user?.id || null,
      ...data,
      status: 'pending',
      reportedAt: new Date().toISOString()
    };

    reports.push(report);
    setStorageItem('agrismart_pest_reports', reports);

    return { success: true, data: report, status: 'success' };
  },

  getTreatments: async (pestId) => {
    const alerts = getStorageItem('agrismart_pest_alerts', []);
    const pest = alerts.find(p => String(p.id) === String(pestId));
    if (!pest) {
      throw new Error('Pest not found');
    }
    
    return { success: true, data: pest.treatment || [], status: 'success' };
  }
};

// Crop Trends Service
export const trendsService = {
  getMarketTrends: async () => {
    const trends = getStorageItem('agrismart_crop_trends', []);
    return { success: true, data: trends, status: 'success' };
  },

  getPriceTrends: async (cropId) => {
    const trends = getStorageItem('agrismart_crop_trends', []);
    const found = trends.find(t => String(t.id) === String(cropId) || t.crop?.toLowerCase() === String(cropId).toLowerCase());
    return { success: true, data: found || { crop: 'Crop', data: [] }, status: 'success' };
  },

  getDemandForecast: async () => {
    const forecast = getStorageItem('agrismart_demand_forecast', [
      { crop: 'Wheat', demand: 'High', priceTrend: 'Upward', confidence: 90 },
      { crop: 'Rice', demand: 'Medium', priceTrend: 'Stable', confidence: 85 },
      { crop: 'Cotton', demand: 'High', priceTrend: 'Upward', confidence: 95 }
    ]);
    return { success: true, data: forecast, status: 'success' };
  }
};

// Payment Service
export const paymentService = {
  createPaymentIntent: async (amount) => {
    const paymentIntent = {
      id: `pi_${Date.now()}`,
      _id: `pi_${Date.now()}`,
      amount,
      currency: 'INR',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const intents = getStorageItem('agrismart_payment_intents', []);
    intents.push(paymentIntent);
    setStorageItem('agrismart_payment_intents', intents);

    return { success: true, data: paymentIntent, status: 'success' };
  },

  confirmPayment: async (paymentId) => {
    const intents = getStorageItem('agrismart_payment_intents', []);
    const intent = intents.find(i => i.id === paymentId);
    
    if (!intent) {
      throw new Error('Payment intent not found');
    }

    intent.status = 'succeeded';
    setStorageItem('agrismart_payment_intents', intents);

    return { success: true, data: intent, status: 'success' };
  },

  getPaymentHistory: async () => {
    const intents = getStorageItem('agrismart_payment_intents', []);
    return { success: true, data: intents, status: 'success' };
  }
};

// Export all services
export default {
  authService,
  productsService,
  ordersService,
  soilService,
  irrigationService,
  schemesService,
  pestService,
  trendsService,
  paymentService
};
