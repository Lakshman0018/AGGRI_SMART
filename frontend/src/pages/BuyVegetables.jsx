import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/NotificationSystem';
import CartModal from '../components/CartModal';
import api from '../services/api.service';

const categoryList = [
  { value: 'All', label: 'All Categories' },
  { value: 'Vegetables', label: 'Vegetables' },
  { value: 'Leafy Greens', label: 'Leafy Greens' },
  { value: 'Fruits', label: 'Fruits' },
  { value: 'Herbs', label: 'Herbs' },
  { value: 'Exotic', label: 'Exotic' }
];

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'discount', label: 'Discount' }
];

const formatCurrency = (amount) => `₹${Number(amount).toFixed(2)}`;
const calculateDiscountPrice = (price, discount) => price - (price * discount / 100);

function BuyVegetables() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [addedToCart, setAddedToCart] = useState({});
  const [vegetablesData, setVegetablesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Custom filter state
  const [priceRange, setPriceRange] = useState(1000);
  const [organicOnly, setOrganicOnly] = useState(false);
  
  const { addToCart, getCartCount, setIsCartOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/products', { limit: 100 });
        if (response && response.status === 'success' && response.data) {
          const products = Array.isArray(response.data) ? response.data : [];
          const normalizedProducts = products.map((product) => ({
            ...product,
            price: Number(product.price ?? 0),
            discount: Number(product.discount ?? 0),
            rating: Number(product.rating ?? 0),
            reviews: Number(product.reviews ?? 0),
            unit: product.unit || 'kg',
            imageUrl: product.imageUrl || product.image || '/images/vegetables.png',
            farmer: product.seller
              ? {
                  name: product.seller.name || 'Local Farmer',
                  location: product.seller.location || 'Local'
                }
              : product.farmer || null
          }));
          setVegetablesData(normalizedProducts);
        } else {
          setVegetablesData([]);
          setError('Unable to load fresh vegetables at the moment.');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load fresh vegetables. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Handle add to cart
  const handleAddToCart = (vegetable) => {
    if (!isAuthenticated()) {
      showWarning('Please login to add items to cart');
      return;
    }
    if (vegetable.stock !== undefined && vegetable.stock <= 0) {
      showError('Sorry, this item is out of stock');
      return;
    }
    addToCart(vegetable);
    const vegId = vegetable.id || vegetable._id;
    setAddedToCart(prev => ({ ...prev, [vegId]: true }));
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [vegId]: false }));
    }, 1500);
    showSuccess(`${vegetable.name} added to cart!`);
  };
  
  // Filter and sort vegetables
  const filteredVegetables = useMemo(() => {
    let filtered = [...vegetablesData];

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(veg => veg.category === selectedCategory);
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(veg => 
        veg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        veg.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(veg => calculateDiscountPrice(veg.price, veg.discount) <= priceRange);

    // Organic filter
    if (organicOnly) {
      filtered = filtered.filter(veg => veg.organic);
    }
    
    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        sorted.sort((a, b) => calculateDiscountPrice(a.price, a.discount) - calculateDiscountPrice(b.price, b.discount));
        break;
      case 'price-high':
        sorted.sort((a, b) => calculateDiscountPrice(b.price, b.discount) - calculateDiscountPrice(a.price, a.discount));
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        sorted.sort((a, b) => b.discount - a.discount);
        break;
      default:
        break;
    }
    
    return sorted;
  }, [selectedCategory, searchTerm, sortBy, priceRange, organicOnly, vegetablesData]);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6">
      <CartModal />

      {/* Header Banner */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Fresh <span className="text-secondary">Vegetables</span> Store
          </h1>
          <p className="text-on-surface-variant max-w-[600px]">
            Shop fresh produce directly from local farms. Guarantees fresh delivery at competitive prices.
          </p>
        </div>
        
        {/* Floating/Right-aligned Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-2 bg-primary text-white py-3 px-5 rounded-xl font-semibold shadow-md hover:bg-primary-container transition-all active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          <span>Cart</span>
          <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {getCartCount()}
          </span>
        </button>
      </header>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl mb-6 flex gap-3 items-center">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
          {/* Categories Sidebar */}
          <div className="bg-white rounded-xl p-5 border border-surface-variant shadow-sm">
            <h3 className="font-bold text-lg text-primary mb-4">Categories</h3>
            <ul className="space-y-1">
              {categoryList.map((cat) => (
                <li key={cat.value}>
                  <button
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedCategory === cat.value
                        ? 'bg-primary-container text-on-primary-container font-bold'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                    }`}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range Filter */}
          <div className="bg-white rounded-xl p-5 border border-surface-variant shadow-sm">
            <h3 className="font-bold text-lg text-primary mb-4">Max Price (₹)</h3>
            <div className="space-y-3">
              <input
                type="range"
                min="10"
                max="1000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-on-surface-variant font-bold">
                <span>₹10</span>
                <span>₹{priceRange}</span>
                <span>₹1000+</span>
              </div>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="bg-white rounded-xl p-5 border border-surface-variant shadow-sm">
            <h3 className="font-bold text-lg text-primary mb-4">Filter By</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={organicOnly}
                onChange={(e) => setOrganicOnly(e.target.checked)}
                className="form-checkbox h-5 w-5 text-primary rounded border-surface-variant focus:ring-primary"
              />
              <span className="text-sm font-semibold text-on-surface-variant flex items-center gap-1">
                100% Organic
                <span className="material-symbols-outlined text-green-600 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </span>
            </label>
          </div>
        </aside>

        {/* Products Grid & Search Area */}
        <div className="flex-grow flex flex-col gap-6">
          {/* Search and Sort Filter Header */}
          <div className="bg-white rounded-xl p-4 border border-surface-variant shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                type="text"
                placeholder="Search fresh produce..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-surface-variant rounded-lg focus:ring-primary focus:border-primary text-sm focus:outline-none"
              />
            </div>
            
            <div className="flex items-center gap-4 justify-between w-full sm:w-auto">
              <span className="text-sm text-on-surface-variant font-semibold">
                {filteredVegetables.length} products found
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-on-surface-variant">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-surface-container-low border border-surface-variant rounded-lg py-1.5 px-3 text-xs font-semibold focus:ring-primary focus:border-primary cursor-pointer text-on-surface"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loader or Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-surface-variant rounded-xl overflow-hidden p-4 space-y-3 animate-pulse">
                  <div className="aspect-video bg-surface-container-high rounded-lg"></div>
                  <div className="h-5 bg-surface-container-high rounded w-3/4"></div>
                  <div className="h-4 bg-surface-container-high rounded w-1/2"></div>
                  <div className="h-8 bg-surface-container-high rounded w-full mt-4"></div>
                </div>
              ))}
            </div>
          ) : filteredVegetables.length === 0 ? (
            <div className="text-center py-16 bg-white border border-surface-variant rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-2">shopping_basket</span>
              <h3 className="text-lg font-bold text-on-surface mb-1">No products found</h3>
              <p className="text-sm text-on-surface-variant mb-4">Adjust your filters or search keywords and try again.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchTerm('');
                  setPriceRange(1000);
                  setOrganicOnly(false);
                }}
                className="bg-primary text-white py-2 px-4 rounded-lg font-semibold text-sm hover:bg-primary-container transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {filteredVegetables.map((product) => {
                const vegId = product.id || product._id;
                const isItemAdded = addedToCart[vegId];
                const discPrice = calculateDiscountPrice(product.price, product.discount);

                return (
                  <div
                    key={vegId}
                    className="bg-white border border-surface-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col relative"
                  >
                    {/* Discount & Organic Badges */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                      {product.discount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {product.discount}% OFF
                        </span>
                      )}
                      {product.organic && (
                        <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                          Organic
                        </span>
                      )}
                    </div>

                    {/* Image Area */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-farm-green-50 to-emerald-50 overflow-hidden relative flex items-center justify-center">
                      {product.emoji ? (
                        <span className="text-7xl select-none group-hover:scale-110 transition-transform duration-300">
                          {product.emoji}
                        </span>
                      ) : (
                        <img
                          src={product.imageUrl || '/images/vegetables.png'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = `<span style="font-size:4rem">${product.name.charAt(0)}</span>`;
                          }}
                        />
                      )}
                    </div>

                    {/* Details Container */}
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-bold text-base text-on-surface line-clamp-1 mb-1">
                        {product.name}
                      </h3>
                      
                      <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">
                        {product.description}
                      </p>

                      {/* Ratings and Reviews */}
                      <div className="flex items-center gap-1 text-xs text-on-surface-variant mb-2">
                        <span className="material-symbols-outlined text-yellow-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-semibold text-on-surface">{product.rating ? Number(product.rating).toFixed(1) : '4.5'}</span>
                        <span>({product.reviews || 0})</span>
                        <span className="mx-1">•</span>
                        <span className="material-symbols-outlined text-xs text-on-surface-variant">location_on</span>
                        <span className="line-clamp-1 max-w-[80px]">{product.farmer?.location || 'Local Farm'}</span>
                      </div>

                      {/* Price Section */}
                      <div className="mt-auto pt-3 border-t border-surface-variant flex items-end justify-between">
                        <div>
                          {product.discount > 0 && (
                            <span className="text-xs text-on-surface-variant line-through block leading-none mb-1">
                              ₹{product.price}
                            </span>
                          )}
                          <span className="text-lg font-extrabold text-primary">₹{discPrice}</span>
                          <span className="text-xs text-on-surface-variant font-semibold"> / {product.unit || 'kg'}</span>
                        </div>

                        {/* Add to Cart button */}
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock !== undefined && product.stock <= 0}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isItemAdded
                              ? 'bg-success text-white'
                              : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {isItemAdded ? 'check' : 'add_shopping_cart'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BuyVegetables;
