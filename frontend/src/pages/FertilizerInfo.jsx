import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/NotificationSystem';
import api from '../services/api.service';
import cropsDataJSON from '../data/crops.json';
import { fertilizersData as localFertilizers } from '../storage/fertilizers';

const fertilizerCategories = ['All', 'Nitrogenous', 'Phosphatic', 'Potassic', 'Complex', 'Micronutrient', 'Organic'];

const soilTypes = [
  { value: 'clay', name: 'Clay Soil', description: 'Heavy, retains water well', ph: '6.5-7.5' },
  { value: 'sandy', name: 'Sandy Soil', description: 'Light, drains quickly', ph: '5.5-6.5' },
  { value: 'loamy', name: 'Loamy Soil', description: 'Ideal, balanced composition', ph: '6.0-7.0' },
  { value: 'silty', name: 'Silty Soil', description: 'Smooth texture, good drainage', ph: '6.0-7.0' },
  { value: 'red', name: 'Red Soil', description: 'Rich in iron, low in nutrients', ph: '5.5-6.5' },
  { value: 'black', name: 'Black Soil', description: 'Good for cotton, retains moisture', ph: '7.0-8.5' }
];

const applicationMethods = [
  { method: 'Broadcasting', description: 'Spreading the fertilizer uniformly all over the field before or after sowing.', suitable: 'Solid nitrogenous and complex fertilizers' },
  { method: 'Band Placement', description: 'Placing fertilizer in narrow bands near the seeds or plant roots during sowing.', suitable: 'Phosphatic and potassic fertilizers' },
  { method: 'Foliar Spray', description: 'Spraying diluted fertilizer solutions directly onto the plant leaves for immediate absorption.', suitable: 'Micronutrients and urea' },
  { method: 'Fertigation', description: 'Applying fertilizers along with irrigation water through drip or sprinkler systems.', suitable: 'Water-soluble fertilizers' }
];

const cropsData = cropsDataJSON.cropDetails || [];
const formatCurrency = (amount) => `₹${Number(amount).toFixed(2)}`;

function FertilizerInfo() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedSoil, setSelectedSoil] = useState('');
  const [area, setArea] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [expandedDetails, setExpandedDetails] = useState({});
  const [fertilizersData, setFertilizersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState({});

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showWarning } = useNotification();

  // Fetch fertilizers from API
  useEffect(() => {
    const fetchFertilizers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/info/fertilizers');
        if (response && response.status === 'success' && response.data) {
          const fertilizers = Array.isArray(response.data) ? response.data : [];
          if (fertilizers.length > 0) {
            setFertilizersData(fertilizers);
            return;
          }
        }
        setFertilizersData(localFertilizers || []);
      } catch (error) {
        console.error('Error fetching fertilizers:', error);
        setFertilizersData(localFertilizers || []);
      } finally {
        setLoading(false);
      }
    };
    fetchFertilizers();
  }, []);

  // Filter fertilizers based on category
  const filteredFertilizers = useMemo(() => {
    if (selectedCategory === 'All') return fertilizersData;
    return fertilizersData.filter(f => f.type === selectedCategory);
  }, [selectedCategory, fertilizersData]);

  // Calculate fertilizer requirement
  const requirement = useMemo(() => {
    if (!selectedCrop || !area) return null;
    const crop = cropsData.find(c => c.name.toLowerCase() === selectedCrop.toLowerCase());
    if (!crop) return null;
    const areaNum = parseFloat(area) || 0;
    return {
      nitrogen: crop.fertilizer ? parseFloat(crop.fertilizer.nitrogen) * areaNum : 0,
      phosphorus: crop.fertilizer ? parseFloat(crop.fertilizer.phosphorus) * areaNum : 0,
      potassium: crop.fertilizer ? parseFloat(crop.fertilizer.potassium) * areaNum : 0
    };
  }, [selectedCrop, area]);

  const handleAddToCart = (fertilizer) => {
    if (!isAuthenticated()) {
      showWarning('Please login to add items to cart');
      return;
    }

    const itemId = fertilizer._id || fertilizer.id;
    const price = Number(fertilizer.price ?? 0);

    addToCart({
      id: itemId,
      name: fertilizer.name,
      price,
      unit: fertilizer.unit || 'pack',
      category: fertilizer.type || 'Fertilizer',
      description: fertilizer.description,
      imageUrl: fertilizer.imageUrl || '/images/fertilizer.png',
      type: 'Fertilizer'
    });

    setAddedToCart(prev => ({ ...prev, [itemId]: true }));
    showSuccess(`${fertilizer.name} added to cart`);

    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [itemId]: false }));
    }, 1500);
  };

  const toggleExpand = (id) => {
    setExpandedDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6">
      {/* Header Banner */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">agriculture</span>
          Fertilizer Information & Guide
        </h1>
        <p className="text-on-surface-variant max-w-[700px]">
          Learn about nutrient types, calculate dosage based on crop and area, and shop certified organic and chemical fertilizers.
        </p>
      </header>

      {/* Navigation Tab Header */}
      <div className="bg-white border border-surface-variant rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="flex border-b border-surface-variant bg-surface-container-low">
          {['Fertilizer Guide', 'NPK Requirement Calculator', 'Application Guides'].map((label, idx) => (
            <button
              key={label}
              onClick={() => setActiveTab(idx)}
              className={`flex-1 py-4 text-center font-bold text-xs md:text-sm border-b-2 transition-all ${
                activeTab === idx
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-on-surface-variant hover:bg-white/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 0: Fertilizer Guide */}
      {activeTab === 0 && (
        <div className="space-y-6">
          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {fertilizerCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-surface-variant text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Fertilizers List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-surface-variant rounded-xl p-6 space-y-3 animate-pulse">
                  <div className="h-6 bg-surface-container-high rounded w-1/3"></div>
                  <div className="h-4 bg-surface-container-high rounded w-3/4"></div>
                  <div className="h-4 bg-surface-container-high rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredFertilizers.length === 0 ? (
            <div className="text-center py-12 bg-white border border-surface-variant rounded-xl">
              <p className="text-on-surface-variant">No fertilizers found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFertilizers.map((fertilizer) => {
                const fId = fertilizer._id || fertilizer.id;
                const isExpanded = expandedDetails[fId];
                return (
                  <div key={fId} className="bg-white border border-surface-variant rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-primary">{fertilizer.name}</h3>
                          <span className="text-xs text-on-surface-variant font-bold">NPK Rating: {fertilizer.npk || 'N/A'}</span>
                        </div>
                        <span className="bg-primary-container text-on-primary-container text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {fertilizer.type}
                        </span>
                      </div>
                      
                      <p className="text-sm text-on-surface-variant mb-4">{fertilizer.description}</p>
                      
                      {/* Accordion detail toggle */}
                      <div className="border-t border-surface-variant pt-3 mb-4">
                        <button
                          onClick={() => toggleExpand(fId)}
                          className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                          <span>{isExpanded ? 'Hide Application Details' : 'Show Application Details'}</span>
                          <span className="material-symbols-outlined text-xs">
                            {isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="mt-3 bg-surface-container-low p-3.5 rounded-lg space-y-2 text-xs">
                            {fertilizer.applicationTime && (
                              <div>
                                <span className="font-bold block text-primary">Application Timing:</span>
                                <span className="text-on-surface-variant">{fertilizer.applicationTime}</span>
                              </div>
                            )}
                            {fertilizer.benefits && (
                              <div>
                                <span className="font-bold block text-primary">Key Benefits:</span>
                                <span className="text-on-surface-variant">
                                  {Array.isArray(fertilizer.benefits) ? fertilizer.benefits.join(', ') : fertilizer.benefits}
                                </span>
                              </div>
                            )}
                            {fertilizer.precautions && (
                              <div>
                                <span className="font-bold block text-error">Precautions & Safety:</span>
                                <span className="text-on-surface-variant">
                                  {Array.isArray(fertilizer.precautions) ? fertilizer.precautions.join(', ') : fertilizer.precautions}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-surface-variant flex items-center justify-between">
                      <div>
                        <span className="text-lg font-extrabold text-primary">{formatCurrency(fertilizer.price || 450)}</span>
                        <span className="text-xs text-on-surface-variant"> / {fertilizer.unit || '50 kg Bag'}</span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(fertilizer)}
                        className={`py-2 px-4 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                          addedToCart[fId]
                            ? 'bg-success text-white'
                            : 'bg-primary text-white hover:bg-primary-container'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {addedToCart[fId] ? 'check' : 'shopping_cart'}
                        </span>
                        {addedToCart[fId] ? 'Added!' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Calculator */}
      {activeTab === 1 && (
        <section className="bg-white border border-surface-variant rounded-xl p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-primary border-b border-surface-variant pb-3">NPK Recommendation Calculator</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant">Select Crop Type</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-surface-variant rounded-xl focus:ring-primary focus:border-primary focus:outline-none font-semibold text-on-surface cursor-pointer"
              >
                <option value="">-- Choose Crop --</option>
                {cropsData.map((crop) => (
                  <option key={crop.id || crop.name} value={crop.name}>{crop.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant">Select Soil Texture</label>
              <select
                value={selectedSoil}
                onChange={(e) => setSelectedSoil(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-surface-variant rounded-xl focus:ring-primary focus:border-primary focus:outline-none font-semibold text-on-surface cursor-pointer"
              >
                <option value="">-- Choose Soil --</option>
                {soilTypes.map((soil) => (
                  <option key={soil.value} value={soil.value}>{soil.name} ({soil.ph})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant">Total Cultivation Area</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g. 2.5"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-surface-variant rounded-xl focus:ring-primary focus:border-primary focus:outline-none font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">hectares</span>
              </div>
            </div>
          </div>

          {requirement && (
            <div className="bg-primary/10 border border-primary/20 text-on-surface p-6 rounded-xl space-y-3 mt-6">
              <h3 className="font-bold text-base text-primary">Calculated Nutrient Requirement:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-surface-variant text-center">
                  <span className="text-xs text-on-surface-variant block mb-1 font-bold">Nitrogen (N)</span>
                  <span className="text-2xl font-extrabold text-primary">{requirement.nitrogen.toFixed(2)} kg</span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-surface-variant text-center">
                  <span className="text-xs text-on-surface-variant block mb-1 font-bold">Phosphorus (P)</span>
                  <span className="text-2xl font-extrabold text-primary">{requirement.phosphorus.toFixed(2)} kg</span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-surface-variant text-center">
                  <span className="text-xs text-on-surface-variant block mb-1 font-bold">Potassium (K)</span>
                  <span className="text-2xl font-extrabold text-primary">{requirement.potassium.toFixed(2)} kg</span>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant italic mt-2 text-right">
                Formula adjusted for selected crop suitability criteria.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Application Guides */}
      {activeTab === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applicationMethods.map((method, idx) => (
              <div key={idx} className="bg-white border border-surface-variant rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3 text-primary">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">science</span>
                    </div>
                    <h3 className="font-bold text-lg">{method.method}</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{method.description}</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg mt-4 border border-surface-variant">
                  <span className="text-xs font-bold text-primary block mb-0.5">Best Suited For:</span>
                  <span className="text-xs text-on-surface-variant">{method.suitable}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-surface-variant rounded-xl p-6 md:p-8 shadow-sm">
            <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">lightbulb</span>
              Critical Fertilizer Application Tips
            </h3>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li className="flex gap-2 items-start">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                <div>
                  <span className="font-bold text-on-surface">Prioritize Soil Testing:</span> Always conduct a diagnostic soil test before ordering fertilizers to ensure you do not over-apply.
                </div>
              </li>
              <li className="flex gap-2 items-start">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                <div>
                  <span className="font-bold text-on-surface">Time of Day:</span> Apply foliar fertilizer sprays during early morning or late evening hours to prevent leaf scorching.
                </div>
              </li>
              <li className="flex gap-2 items-start">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                <div>
                  <span className="font-bold text-on-surface">Avoid Wind/Rain:</span> Refrain from broadcasting chemical elements when high winds or rainfall are forecast.
                </div>
              </li>
              <li className="flex gap-2 items-start">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                <div>
                  <span className="font-bold text-on-surface">Safety Equipment:</span> Wear protective gloves and respirators when mixing water-soluble powders or chemical mixtures.
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default FertilizerInfo;
