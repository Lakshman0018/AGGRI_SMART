const CropRecommendation = require('../models/CropRecommendation');
const SoilData = require('../models/SoilData');
const { asyncHandler } = require('../middleware/errorHandler');

// Crop database with requirements
const cropDatabase = {
  'Wheat': {
    season: ['Rabi', 'Winter'],
    soilType: ['Alluvial', 'Clay', 'Loamy'],
    ph: { min: 6.0, max: 7.5 },
    temperature: { min: 10, max: 25, optimal: 20 },
    rainfall: { min: 400, max: 700, optimal: 550 },
    waterRequirement: 'Medium',
    growingPeriod: '120-140 days',
    marketDemand: 'High',
    profitability: 'High'
  },
  'Rice': {
    season: ['Kharif', 'Monsoon'],
    soilType: ['Alluvial', 'Clay'],
    ph: { min: 5.5, max: 7.0 },
    temperature: { min: 20, max: 35, optimal: 28 },
    rainfall: { min: 1000, max: 2000, optimal: 1500 },
    waterRequirement: 'High',
    growingPeriod: '120-150 days',
    marketDemand: 'High',
    profitability: 'High'
  },
  'Maize': {
    season: ['Kharif', 'Summer'],
    soilType: ['Alluvial', 'Loamy', 'Sandy'],
    ph: { min: 5.5, max: 7.5 },
    temperature: { min: 18, max: 32, optimal: 25 },
    rainfall: { min: 600, max: 1100, optimal: 800 },
    waterRequirement: 'Medium',
    growingPeriod: '90-120 days',
    marketDemand: 'High',
    profitability: 'Medium'
  },
  'Cotton': {
    season: ['Kharif', 'Summer'],
    soilType: ['Black', 'Alluvial'],
    ph: { min: 5.8, max: 8.0 },
    temperature: { min: 21, max: 35, optimal: 28 },
    rainfall: { min: 500, max: 1000, optimal: 700 },
    waterRequirement: 'Medium',
    growingPeriod: '180-200 days',
    marketDemand: 'High',
    profitability: 'High'
  },
  'Potato': {
    season: ['Rabi', 'Winter'],
    soilType: ['Loamy', 'Sandy'],
    ph: { min: 5.0, max: 6.5 },
    temperature: { min: 15, max: 25, optimal: 20 },
    rainfall: { min: 400, max: 800, optimal: 600 },
    waterRequirement: 'Medium',
    growingPeriod: '90-120 days',
    marketDemand: 'High',
    profitability: 'High'
  },
  'Tomato': {
    season: ['Year-round'],
    soilType: ['Loamy', 'Sandy', 'Clay'],
    ph: { min: 6.0, max: 7.0 },
    temperature: { min: 18, max: 30, optimal: 24 },
    rainfall: { min: 600, max: 1000, optimal: 800 },
    waterRequirement: 'Medium',
    growingPeriod: '60-90 days',
    marketDemand: 'High',
    profitability: 'High'
  },
  'Onion': {
    season: ['Rabi', 'Winter'],
    soilType: ['Alluvial', 'Loamy'],
    ph: { min: 6.0, max: 7.5 },
    temperature: { min: 13, max: 24, optimal: 20 },
    rainfall: { min: 400, max: 800, optimal: 600 },
    waterRequirement: 'Low',
    growingPeriod: '120-150 days',
    marketDemand: 'High',
    profitability: 'Medium'
  },
  'Pulses': {
    season: ['Kharif', 'Rabi'],
    soilType: ['Loamy', 'Clay', 'Sandy'],
    ph: { min: 6.0, max: 7.5 },
    temperature: { min: 20, max: 30, optimal: 25 },
    rainfall: { min: 400, max: 600, optimal: 500 },
    waterRequirement: 'Low',
    growingPeriod: '90-120 days',
    marketDemand: 'Medium',
    profitability: 'Medium'
  },
  'Sugarcane': {
    season: ['Year-round'],
    soilType: ['Alluvial', 'Loamy'],
    ph: { min: 6.0, max: 8.0 },
    temperature: { min: 20, max: 40, optimal: 30 },
    rainfall: { min: 1200, max: 2500, optimal: 1800 },
    waterRequirement: 'High',
    growingPeriod: '300-365 days',
    marketDemand: 'High',
    profitability: 'High'
  },
  'Groundnut': {
    season: ['Kharif', 'Summer'],
    soilType: ['Sandy', 'Loamy'],
    ph: { min: 6.0, max: 6.5 },
    temperature: { min: 25, max: 35, optimal: 30 },
    rainfall: { min: 400, max: 1000, optimal: 600 },
    waterRequirement: 'Medium',
    growingPeriod: '100-130 days',
    marketDemand: 'Medium',
    profitability: 'Medium'
  }
};

// Calculate crop suitability score
const calculateCropSuitability = (crop, cropData, soilData, weatherData, season) => {
  let score = 0;
  let factors = 0;
  
  // Season matching (25%)
  if (cropData.season.includes(season) || cropData.season.includes('Year-round')) {
    score += 25;
  }
  factors += 25;
  
  // Soil type matching (20%)
  if (soilData?.soilType && cropData.soilType.includes(soilData.soilType)) {
    score += 20;
  } else if (!soilData?.soilType) {
    score += 10; // Partial score if soil type unknown
  }
  factors += 20;
  
  // pH suitability (20%)
  if (soilData?.ph) {
    if (soilData.ph >= cropData.ph.min && soilData.ph <= cropData.ph.max) {
      score += 20;
    } else if (Math.abs(soilData.ph - cropData.ph.optimal) <= 1) {
      score += 10;
    }
  } else {
    score += 10; // Partial score if pH unknown
  }
  factors += 20;
  
  // Temperature suitability (15%)
  if (weatherData?.current?.temperature) {
    const temp = weatherData.current.temperature;
    if (temp >= cropData.temperature.min && temp <= cropData.temperature.max) {
      score += 15;
    } else if (Math.abs(temp - cropData.temperature.optimal) <= 5) {
      score += 8;
    }
  } else {
    score += 8;
  }
  factors += 15;
  
  // Market demand (10%)
  if (cropData.marketDemand === 'High') score += 10;
  else if (cropData.marketDemand === 'Medium') score += 6;
  else score += 3;
  factors += 10;
  
  // Profitability (10%)
  if (cropData.profitability === 'High') score += 10;
  else if (cropData.profitability === 'Medium') score += 6;
  else score += 3;
  factors += 10;
  
  return Math.round((score / factors) * 100);
};

// Get current season based on month
const getCurrentSeason = (month = new Date().getMonth()) => {
  // Indian agricultural seasons
  if (month >= 5 && month <= 9) return 'Kharif'; // June-October
  if (month >= 9 || month <= 2) return 'Rabi'; // October-March
  return 'Zaid'; // April-June
};

// Get crop recommendations
exports.getCropRecommendations = asyncHandler(async (req, res) => {
  const { season, region, soilType, customSeason } = req.query;
  
  // Get user's soil data if available
  const userSoilData = await SoilData.findOne({ user: req.user._id });
  
  // Weather data removed - using default values
  const weatherData = null;
  
  const currentSeason = customSeason || season || getCurrentSeason();
  
  // Calculate suitability scores for all crops
  const recommendations = [];
  
  for (const [cropName, cropData] of Object.entries(cropDatabase)) {
    const suitabilityScore = calculateCropSuitability(
      cropName,
      cropData,
      userSoilData || { soilType },
      weatherData,
      currentSeason
    );
    
    if (suitabilityScore > 30) { // Only recommend crops with >30% suitability
      recommendations.push({
        name: cropName,
        suitabilityScore,
        expectedYield: `${Math.round(suitabilityScore * 0.5 + 20)} quintals/hectare`,
        marketDemand: cropData.marketDemand,
        profitability: cropData.profitability,
        waterRequirement: cropData.waterRequirement,
        growingPeriod: cropData.growingPeriod,
        bestPractices: generateBestPractices(cropName, userSoilData),
        risks: generateRisks(cropName, weatherData)
      });
    }
  }
  
  // Sort by suitability score
  recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  
  res.json({
    success: true,
    season: currentSeason,
    location: region || req.user.location || 'Default',
    soilAnalysisAvailable: !!userSoilData,
    weatherDataAvailable: !!weatherData,
    recommendations: recommendations.slice(0, 10), // Top 10 recommendations
    factors: {
      soilHealth: userSoilData?.healthScore || 'Not available',
      currentTemperature: weatherData?.current?.temperature || 'Not available',
      soilPH: userSoilData?.ph || 'Not available'
    }
  });
});

// Generate best practices for a crop
const generateBestPractices = (cropName, soilData) => {
  const practices = [
    `Plant ${cropName} at recommended spacing`,
    'Use certified seeds for better yield',
    'Apply organic manure before planting'
  ];
  
  if (soilData?.nitrogen < 280) {
    practices.push('Apply nitrogen fertilizer as per soil test');
  }
  if (soilData?.ph < 6.0) {
    practices.push('Apply lime to correct soil acidity');
  }
  
  return practices;
};

// Generate risks for a crop
const generateRisks = (cropName, weatherData) => {
  const risks = [];
  
  if (weatherData?.current?.humidity > 80) {
    risks.push('High humidity may cause fungal diseases');
  }
  if (weatherData?.forecast?.[0]?.rainfall > 50) {
    risks.push('Heavy rainfall expected - ensure proper drainage');
  }
  
  // Crop-specific risks
  if (cropName === 'Cotton') {
    risks.push('Monitor for bollworm infestation');
  }
  if (cropName === 'Rice') {
    risks.push('Watch for stem borer and leaf folder');
  }
  
  return risks.length > 0 ? risks : ['Normal risk levels'];
};

// Get detailed crop information
exports.getCropDetails = asyncHandler(async (req, res) => {
  const { crop } = req.params;
  
  const cropData = cropDatabase[crop];
  
  if (!cropData) {
    return res.status(404).json({
      success: false,
      message: 'Crop information not found'
    });
  }
  
  res.json({
    success: true,
    crop,
    details: {
      ...cropData,
      cultivation: {
        seedRate: `${Math.random() * 50 + 50} kg/hectare`,
        spacing: `${Math.random() * 30 + 20} cm x ${Math.random() * 30 + 20} cm`,
        depth: `${Math.random() * 5 + 2} cm`,
        bestMonths: getPlantingMonths(cropData.season)
      },
      fertilizer: {
        basal: 'NPK 10:26:26 - 100 kg/hectare',
        topDressing: 'Urea - 50 kg/hectare after 30 days'
      },
      irrigation: {
        frequency: cropData.waterRequirement === 'High' ? 'Every 3-4 days' :
                  cropData.waterRequirement === 'Medium' ? 'Every 5-7 days' : 'Every 10-12 days',
        criticalStages: ['Germination', 'Flowering', 'Grain filling']
      },
      diseases: getCommonDiseases(crop),
      pests: getCommonPests(crop)
    }
  });
});

// Helper function to get planting months
const getPlantingMonths = (seasons) => {
  const months = [];
  seasons.forEach(season => {
    if (season === 'Kharif') months.push('June', 'July');
    if (season === 'Rabi') months.push('October', 'November');
    if (season === 'Zaid') months.push('April', 'May');
    if (season === 'Year-round') months.push('Any month with suitable conditions');
  });
  return months;
};

// Helper function to get common diseases
const getCommonDiseases = (crop) => {
  const diseases = {
    'Wheat': ['Rust', 'Powdery mildew', 'Karnal bunt'],
    'Rice': ['Blast', 'Bacterial leaf blight', 'Sheath blight'],
    'Cotton': ['Wilt', 'Grey mildew', 'Bacterial blight'],
    'Tomato': ['Early blight', 'Late blight', 'Leaf curl'],
    'Potato': ['Late blight', 'Early blight', 'Common scab']
  };
  return diseases[crop] || ['Various fungal and bacterial diseases'];
};

// Helper function to get common pests
const getCommonPests = (crop) => {
  const pests = {
    'Wheat': ['Aphids', 'Termites', 'Stem borer'],
    'Rice': ['Stem borer', 'Leaf folder', 'Brown plant hopper'],
    'Cotton': ['Bollworm', 'Whitefly', 'Aphids'],
    'Tomato': ['Fruit borer', 'Whitefly', 'Leaf miner'],
    'Potato': ['Cutworm', 'Aphids', 'Potato tuber moth']
  };
  return pests[crop] || ['Various insect pests'];
};

// Save crop recommendation
exports.saveCropRecommendation = asyncHandler(async (req, res) => {
  const {
    region,
    state,
    district,
    soilType,
    season,
    crops,
    temperature,
    rainfall,
    humidity
  } = req.body;
  
  const recommendation = new CropRecommendation({
    region,
    state,
    district,
    soilType,
    season,
    crops,
    temperature,
    rainfall,
    humidity
  });
  
  await recommendation.save();
  
  res.status(201).json({
    success: true,
    message: 'Crop recommendation saved successfully',
    data: recommendation
  });
});

// Get seasonal calendar
exports.getSeasonalCalendar = asyncHandler(async (req, res) => {
  const calendar = {
    Kharif: {
      duration: 'June to October',
      crops: ['Rice', 'Cotton', 'Maize', 'Groundnut', 'Sugarcane'],
      activities: {
        June: 'Land preparation, Sowing',
        July: 'Transplanting, Weeding',
        August: 'Fertilizer application, Pest control',
        September: 'Monitoring, Irrigation',
        October: 'Harvesting begins'
      }
    },
    Rabi: {
      duration: 'October to March',
      crops: ['Wheat', 'Potato', 'Onion', 'Mustard', 'Gram'],
      activities: {
        October: 'Land preparation',
        November: 'Sowing',
        December: 'Germination, First irrigation',
        January: 'Growth stage, Weeding',
        February: 'Flowering, Disease control',
        March: 'Harvesting'
      }
    },
    Zaid: {
      duration: 'April to June',
      crops: ['Watermelon', 'Cucumber', 'Muskmelon', 'Fodder'],
      activities: {
        April: 'Sowing',
        May: 'Growth and maintenance',
        June: 'Harvesting'
      }
    }
  };
  
  res.json({
    success: true,
    currentSeason: getCurrentSeason(),
    calendar
  });
});

module.exports = exports;
