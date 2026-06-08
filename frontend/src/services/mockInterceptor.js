import mockService, { getStorageItem, setStorageItem } from './localStorage';

export const handleMockRequest = async (config) => {
  let url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  
  // Normalize URL by removing host details if full URL is given
  if (url.startsWith('http://') || url.startsWith('https://')) {
    url = url.replace(/https?:\/\/[^\/]+/i, '');
  }
  
  // Remove baseURL if present at the start
  if (config.baseURL && url.startsWith(config.baseURL)) {
    url = url.replace(config.baseURL, '');
  }
  if (url.startsWith('/api')) {
    url = url.replace('/api', '');
  }
  
  // Separate route path from query string parameters
  const [routePath, queryString] = url.split('?');
  
  console.log(`🔌 [Mock Interceptor] Routing: ${method.toUpperCase()} ${routePath}`, {
    params: config.params,
    data: config.data
  });
  
  // Helper to parse POST/PUT payload
  const getPayload = () => {
    if (!config.data) return {};
    if (typeof config.data === 'string') {
      try {
        return JSON.parse(config.data);
      } catch (e) {
        return {};
      }
    }
    return config.data;
  };

  try {
    // ----------------------------------------------------
    // AUTHENTICATION
    // ----------------------------------------------------
    if (routePath === '/auth/login') {
      const payload = getPayload();
      const result = await mockService.authService.login(payload);
      return { status: 200, statusText: 'OK', headers: {}, config, data: result };
    }
    
    if (routePath === '/auth/signup') {
      const payload = getPayload();
      const result = await mockService.authService.signup(payload);
      return { status: 201, statusText: 'Created', headers: {}, config, data: result };
    }
    
    if (routePath === '/auth/profile') {
      const result = await mockService.authService.getProfile();
      return { status: 200, statusText: 'OK', headers: {}, config, data: result };
    }
    
    if (routePath === '/auth/update-profile') {
      const payload = getPayload();
      const result = await mockService.authService.updateProfile(payload);
      return { status: 200, statusText: 'OK', headers: {}, config, data: result };
    }
    
    if (routePath === '/auth/logout') {
      const result = await mockService.authService.logout();
      return { status: 200, statusText: 'OK', headers: {}, config, data: result };
    }
    
    // ----------------------------------------------------
    // PRODUCTS (VEGETABLES)
    // ----------------------------------------------------
    if (routePath === '/products' || routePath === '/products/') {
      const params = config.params || {};
      const result = await mockService.productsService.getProducts(params);
      const products = result.data || [];
      
      // Return a hybrid structure that supports:
      // 1. Array-like behavior (BuyVegetables.jsx: Array.isArray(response.data) is true)
      // 2. Object-like behavior with properties (ProductListing.jsx: response.data.data.products)
      const data = [...products];
      data.success = true;
      data.status = 'success';
      data.data = {
        products: products,
        pagination: {
          currentPage: params.page ? parseInt(params.page) : 1,
          totalPages: 1,
          totalProducts: products.length,
          limit: params.limit ? parseInt(params.limit) : 100,
          hasNext: false,
          hasPrev: false
        }
      };
      
      return { status: 200, statusText: 'OK', headers: {}, config, data };
    }
    
    if (routePath === '/products/categories') {
      const result = await mockService.productsService.getCategories();
      const categories = result.data || [];
      
      const data = [...categories];
      data.success = true;
      data.status = 'success';
      data.data = categories;
      
      return { status: 200, statusText: 'OK', headers: {}, config, data };
    }
    
    if (routePath.startsWith('/products/category/')) {
      const category = decodeURIComponent(routePath.substring('/products/category/'.length));
      const result = await mockService.productsService.getProducts({ category });
      const products = result.data || [];
      
      const data = [...products];
      data.success = true;
      data.status = 'success';
      data.data = products;
      
      return { status: 200, statusText: 'OK', headers: {}, config, data };
    }
    
    if (routePath.startsWith('/products/detail/') || routePath.match(/^\/products\/[^\/]+$/)) {
      const id = routePath.split('/').pop();
      if (id !== 'categories' && id !== 'featured' && id !== 'search') {
        const result = await mockService.productsService.getProductById(id);
        return { status: 200, statusText: 'OK', headers: {}, config, data: result };
      }
    }
    
    // ----------------------------------------------------
    // FERTILIZERS & INFO
    // ----------------------------------------------------
    if (routePath === '/info/fertilizers' || routePath === '/fertilizer/list') {
      const fertilizers = getStorageItem('agrismart_fertilizers', []);
      const data = [...fertilizers];
      data.success = true;
      data.status = 'success';
      data.data = fertilizers;
      
      return { status: 200, statusText: 'OK', headers: {}, config, data };
    }
    
    if (routePath === '/info/pests' || routePath === '/pest/alerts') {
      const alerts = getStorageItem('agrismart_pest_alerts', []);
      const data = [...alerts];
      data.success = true;
      data.status = 'success';
      data.data = alerts;
      
      return { status: 200, statusText: 'OK', headers: {}, config, data };
    }
    
    if (routePath === '/info/schemes' || routePath === '/schemes') {
      const schemes = getStorageItem('agrismart_schemes', []);
      const data = [...schemes];
      data.success = true;
      data.status = 'success';
      data.data = schemes;
      
      return { status: 200, statusText: 'OK', headers: {}, config, data };
    }
    
    // ----------------------------------------------------
    // GOVERNMENT SCHEMES
    // ----------------------------------------------------
    if (routePath.startsWith('/schemes/')) {
      const id = routePath.split('/').pop();
      if (id === 'apply') {
        // Handled as POST /schemes/:id/apply
      } else {
        const result = await mockService.schemesService.getSchemeById(id);
        return { status: 200, statusText: 'OK', headers: {}, config, data: result };
      }
    }
    
    if (routePath.match(/^\/schemes\/[^\/]+\/apply$/)) {
      const pathParts = routePath.split('/');
      const id = pathParts[2];
      const payload = getPayload();
      const result = await mockService.schemesService.applyForScheme(id, payload);
      return { status: 200, statusText: 'OK', headers: {}, config, data: result };
    }
    
    // ----------------------------------------------------
    // SOIL ANALYSIS
    // ----------------------------------------------------
    if (routePath === '/soil/analyze' || routePath === '/soil/report') {
      const payload = getPayload();
      const result = await mockService.soilService.analyzeSoil(payload);
      
      // Save soil report in history
      const history = getStorageItem('agrismart_soil_history', []);
      const newReport = {
        _id: `SOIL-${Date.now()}`,
        id: `SOIL-${Date.now()}`,
        userId: getStorageItem('agrismart_user')?.id || 'guest',
        soilType: payload.soilType || 'Loamy Soil',
        pH: parseFloat(payload.pH) || 6.5,
        nitrogen: payload.nitrogen || 'Medium',
        phosphorus: payload.phosphorus || 'Medium',
        potassium: payload.potassium || 'Medium',
        organicMatter: payload.organicMatter || '2.5%',
        recommendations: result.data.recommendations || [],
        analyzedAt: new Date().toISOString()
      };
      history.unshift(newReport);
      setStorageItem('agrismart_soil_history', history);
      
      return {
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        data: { success: true, status: 'success', data: newReport }
      };
    }
    
    if (routePath === '/soil/history' || routePath === '/soil') {
      const result = await mockService.soilService.getSoilHistory();
      const history = result.data || [];
      
      const data = [...history];
      data.success = true;
      data.status = 'success';
      data.data = history;
      
      return { status: 200, statusText: 'OK', headers: {}, config, data };
    }
    
    // ----------------------------------------------------
    // WEATHER FORECAST
    // ----------------------------------------------------
    if (routePath === '/weather/forecast' || routePath.startsWith('/weather')) {
      const weather = getStorageItem('agrismart_weather', {});
      return {
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        data: { success: true, status: 'success', data: weather }
      };
    }
    
    // ----------------------------------------------------
    // SMART IRRIGATION
    // ----------------------------------------------------
    if (routePath === '/irrigation/schedule' || routePath === '/irrigation') {
      if (method === 'put') {
        const payload = getPayload();
        const result = await mockService.irrigationService.updateSchedule(payload);
        return { status: 200, statusText: 'OK', headers: {}, config, data: result };
      }
      const result = await mockService.irrigationService.getSchedule();
      const schedule = result.data || [];
      
      const data = [...schedule];
      data.success = true;
      data.status = 'success';
      data.data = schedule;
      
      return { status: 200, statusText: 'OK', headers: {}, config, data };
    }
    
    if (routePath === '/irrigation/water-usage') {
      const result = await mockService.irrigationService.getWaterUsage();
      const usage = result.data || [];
      
      const data = [...usage];
      data.success = true;
      data.status = 'success';
      data.data = usage;
      
      return { status: 200, statusText: 'OK', headers: {}, config, data };
    }
    
    // ----------------------------------------------------
    // ORDERS & CHECKOUT
    // ----------------------------------------------------
    if (routePath === '/orders/create' || routePath === '/orders/checkout' || routePath === '/orders') {
      if (method === 'post') {
        const payload = getPayload();
        const result = await mockService.ordersService.createOrder(payload);
        return { status: 201, statusText: 'Created', headers: {}, config, data: result };
      }
      const result = await mockService.ordersService.getOrders();
      const orders = result.data || [];
      
      const data = [...orders];
      data.success = true;
      data.status = 'success';
      data.data = orders;
      
      return { status: 200, statusText: 'OK', headers: {}, config, data };
    }
    
    if (routePath === '/orders/my-orders') {
      const result = await mockService.ordersService.getOrders();
      const orders = result.data || [];
      
      const data = [...orders];
      data.success = true;
      data.status = 'success';
      data.data = orders;
      
      return { status: 200, statusText: 'OK', headers: {}, config, data };
    }
    
    if (routePath.startsWith('/orders/')) {
      const id = routePath.split('/').pop();
      if (id === 'cancel') {
        // Handled below
      } else {
        const result = await mockService.ordersService.getOrderById(id);
        return { status: 200, statusText: 'OK', headers: {}, config, data: result };
      }
    }
    
    if (routePath.match(/^\/orders\/[^\/]+\/cancel$/)) {
      const id = routePath.split('/')[2];
      const result = await mockService.ordersService.cancelOrder(id);
      return { status: 200, statusText: 'OK', headers: {}, config, data: result };
    }
    
    // ----------------------------------------------------
    // PRICE TRENDS & CROP DETAILS
    // ----------------------------------------------------
    if (routePath === '/prices/trends' || routePath === '/crops/trends') {
      const result = await mockService.trendsService.getMarketTrends();
      const trends = result.data || [];
      
      const data = [...trends];
      data.success = true;
      data.status = 'success';
      data.data = trends;
      
      return { status: 200, statusText: 'OK', headers: {}, config, data };
    }
    
    if (routePath.startsWith('/prices/product/')) {
      const id = routePath.split('/').pop();
      const result = await mockService.trendsService.getPriceTrends(id);
      return { status: 200, statusText: 'OK', headers: {}, config, data: result };
    }
    
    // ----------------------------------------------------
    // PLANT DISEASE SCANNER (AI)
    // ----------------------------------------------------
    if (routePath === '/disease/scan' || routePath === '/plant/detect-disease') {
      const payload = getPayload();
      const crop = payload.crop || 'Tomato';
      
      const diseases = {
        Tomato: ['Tomato Early Blight', 'Tomato Late Blight', 'Healthy Plant'],
        Potato: ['Potato Early Blight', 'Potato Late Blight', 'Healthy Plant'],
        Rice: ['Rice Blast', 'Rice Brown Spot', 'Healthy Plant'],
        Cotton: ['Cotton Leaf Spot', 'Healthy Plant'],
        Wheat: ['Wheat Rust', 'Healthy Plant']
      };
      
      const cropDiseases = diseases[crop] || [`${crop} Leaf Spot`, 'Healthy Plant'];
      const chosen = cropDiseases[Math.floor(Math.random() * cropDiseases.length)];
      
      const scanResult = {
        _id: `SCAN-${Date.now()}`,
        id: `SCAN-${Date.now()}`,
        crop,
        imageAnalysis: {
          disease: chosen,
          confidence: Math.floor(Math.random() * 20) + 75,
          severity: chosen === 'Healthy Plant' ? 'None' : (Math.random() > 0.5 ? 'Medium' : 'High'),
          affectedArea: chosen === 'Healthy Plant' ? 0 : Math.floor(Math.random() * 40) + 10,
          stage: chosen === 'Healthy Plant' ? 'None' : 'Early'
        },
        symptoms: chosen === 'Healthy Plant' 
          ? ['Leaves appear green, clean, and vibrant'] 
          : ['Concentric dark circles on leaves', 'Yellow rings around damaged patches', 'Dry spots on foliage'],
        treatmentPlan: {
          immediate: [
            'Prune and destroy infected leaves immediately',
            'Avoid overhead irrigation to keep foliage dry'
          ],
          preventive: [
            'Practice crop rotation next season',
            'Use disease-resistant certified seeds'
          ],
          organic: [
            { name: 'Neem Oil Concentrate', description: 'Spray diluted neem oil on affected parts.', dosage: '5 ml per Liter', frequency: 'Every 7 days', cost: 150 },
            { name: 'Baking Soda Solution', description: 'Mix baking soda and organic soap spray.', dosage: '5g baking soda per Liter', frequency: 'Bi-weekly', cost: 50 }
          ],
          chemical: [
            { name: 'Mancozeb Fungicide', activeIngredient: 'Mancozeb', dosage: '2.5g per Liter', frequency: 'Every 10 days', safetyPeriod: '14 days before harvest', cost: 280 }
          ]
        },
        recommendedActions: [
          { type: 'immediate', description: 'Isolate infected plants or prune baselines.', priority: 5, timeline: '24 hours' }
        ],
        createdAt: new Date().toISOString()
      };
      
      return {
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        data: {
          success: true,
          status: 'success',
          data: { scan: scanResult }
        }
      };
    }
    
    // ----------------------------------------------------
    // FALLBACK
    // ----------------------------------------------------
    console.warn(`⚠️ [Mock Interceptor] Unhandled route: ${method.toUpperCase()} ${routePath}. Returning empty success wrapper.`);
    return {
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      data: { success: true, status: 'success', data: [] }
    };
    
  } catch (error) {
    console.error(`❌ [Mock Interceptor] Error processing mock request:`, error);
    return {
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
      config,
      data: { success: false, message: error.message || 'Mock processing error' }
    };
  }
};
