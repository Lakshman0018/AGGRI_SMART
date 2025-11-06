import React, { useState, useMemo } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Chip,
  Rating,
  Box,
  IconButton,
  Badge,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Paper,
  Skeleton,
  Alert,
  Snackbar,
  Divider,
  Avatar
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  LocalShipping as LocalShippingIcon,
  Park as EcoIcon,
  Verified as VerifiedIcon,
  FilterList as FilterListIcon,
  Done as DoneIcon
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/NotificationSystem';
import CartModal from '../components/CartModal';
import api from '../services/api.service';

// Format currency helper
const formatCurrency = (amount) => {
  return `₹${Number(amount).toFixed(2)}`;
};

// Calculate discount price
const calculateDiscountPrice = (price, discount) => {
  return price - (price * discount / 100);
};

// Categories
const categoryList = [
  { value: 'All', label: 'All Categories' },
  { value: 'Vegetables', label: 'Vegetables' },
  { value: 'Leafy Greens', label: 'Leafy Greens' },
  { value: 'Fruits', label: 'Fruits' },
  { value: 'Herbs', label: 'Herbs' },
  { value: 'Exotic', label: 'Exotic' }
];

// Sort options
const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'discount', label: 'Discount' }
];

function BuyVegetables() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [addedToCart, setAddedToCart] = useState({});
  const [vegetablesData, setVegetablesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { addToCart, getCartCount, setIsCartOpen } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  
  // Fetch products from API
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/products', { limit: 100 });
        // Backend returns: { status: 'success', statusCode: 200, data: [...], message: '...' }
        if (response && response.status === 'success' && response.data) {
          const products = Array.isArray(response.data)
            ? response.data
            : [];

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
    
    // Check stock
    if (vegetable.stock !== undefined && vegetable.stock <= 0) {
      showError('Sorry, this item is out of stock');
      return;
    }
    
    addToCart(vegetable);
    
    // Show added animation
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
    
    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
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
  }, [selectedCategory, searchTerm, sortBy, vegetablesData]);


  return (
    <>
      <CartModal />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header with Cart */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box flex={1}>
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
              Fresh <span style={{ color: '#10b981' }}>Vegetables</span>
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px' }}>
              Shop the freshest vegetables directly from local farms. Quality guaranteed, delivered to your doorstep.
            </Typography>
          </Box>
          
          <IconButton
            onClick={() => setIsCartOpen(true)}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.1)' },
              transition: 'all 0.3s',
              p: 2
            }}
          >
            <Badge badgeContent={getCartCount()} color="error">
              <ShoppingCartIcon fontSize="large" />
            </Badge>
          </IconButton>
        </Box>

        {/* Search and Filter Bar */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search vegetables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <FilterListIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  {filteredVegetables.length} items found
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Error state */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Category Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs
            value={selectedCategory}
            onChange={(e, newValue) => setSelectedCategory(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { minHeight: 60, fontSize: '1rem', fontWeight: 500 }
            }}
          >
            {categoryList.map((category) => (
              <Tab
                key={category.value}
                label={category.label}
                value={category.value}
                icon={category.value === 'Organic' ? <EcoIcon /> : null}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>

        {/* Vegetables Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
                <Card sx={{ height: '100%' }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={32} width="80%" />
                    <Skeleton variant="text" height={20} width="60%" />
                    <Skeleton variant="text" height={20} width="40%" />
                  </CardContent>
                  <CardActions sx={{ p: 2 }}>
                    <Skeleton variant="rectangular" height={36} width="100%" />
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : filteredVegetables.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">No vegetables found matching your criteria.</Alert>
            </Grid>
          ) : (
            filteredVegetables.map((vegetable) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={vegetable._id || vegetable.id}
                sx={{
                  display: 'flex'
                }}
              >
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 2,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 4,
                    },
                    '&:hover img': {
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', width: '100%', pt: '60%', bgcolor: 'grey.100' }}>
                    <CardMedia
                      component="img"
                      image={vegetable.imageUrl || vegetable.image || '/images/vegetables.png'}
                      alt={vegetable.name}
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.35s ease'
                      }}
                    />

                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        display: 'flex',
                        gap: 1
                      }}
                    >
                      {vegetable.discount > 0 && (
                        <Chip
                          label={`${vegetable.discount}% OFF`}
                          color="error"
                          size="small"
                          sx={{ bgcolor: 'error.main', color: 'common.white' }}
                        />
                      )}
                      {vegetable.organic && (
                        <Chip
                          icon={<EcoIcon />}
                          label="Organic"
                          color="success"
                          size="small"
                          sx={{ bgcolor: 'success.main', color: 'common.white' }}
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {vegetable.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {vegetable.description}
                    </Typography>
                    
                    {/* Rating */}
                    <Box display="flex" alignItems="center">
                      <Rating value={vegetable.rating} readOnly size="small" />
                      {vegetable.reviews > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({vegetable.reviews})
                      </Typography>
                    )}
                  </Box>

                  {/* Farmer Info */}
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 28, height: 28 }}>
                      <VerifiedIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {vegetable.farmer?.name || 'Local Farmer'} • {vegetable.farmer?.location || 'Local'}
                    </Typography>
                  </Box>
                    
                    {/* Price */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                      <Box>
                        {vegetable.discount > 0 && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textDecoration: 'line-through' }}
                          >
                            {formatCurrency(vegetable.price)}
                          </Typography>
                        )}
                        <Typography variant="h5" color="primary" fontWeight="bold">
                          {formatCurrency(calculateDiscountPrice(vegetable.price, vegetable.discount))}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        per {vegetable.unit}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color={addedToCart[vegetable._id || vegetable.id] ? 'success' : 'primary'}
                      startIcon={addedToCart[vegetable._id || vegetable.id] ? <DoneIcon /> : <AddIcon />}
                      onClick={() => handleAddToCart(vegetable)}
                      disabled={vegetable.stock !== undefined && vegetable.stock <= 0}
                    >
                      {addedToCart[vegetable._id || vegetable.id]
                        ? 'Added!'
                        : vegetable.stock === undefined || vegetable.stock > 0
                          ? 'Add to Cart'
                          : 'Out of Stock'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Why Choose AgriSmart */}
        <Paper elevation={3} sx={{ p: 6, mb: 6, textAlign: 'center', background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)' }}>
          <Box maxWidth="md" mx="auto">
            <Avatar
              sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
            >
              <span style={{ fontSize: '2.5rem' }}>🌾</span>
            </Avatar>
            
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Direct from Farmers to You
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Cut out the middleman! Buy fresh, organic produce directly from local farmers.
              Support sustainable agriculture while getting the best quality at fair prices.
            </Typography>
            
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="center" mt={4}>
              <Chip 
                icon={<VerifiedIcon />} 
                label="100% Organic" 
                color="success" 
                sx={{ px: 2, py: 3, fontSize: '1rem' }}
              />
              <Chip 
                icon={<LocalShippingIcon />} 
                label="Farm Fresh Delivery" 
                color="primary" 
                sx={{ px: 2, py: 3, fontSize: '1rem' }}
              />
              <Chip 
                icon={<EcoIcon />} 
                label="Support Local Farmers" 
                variant="outlined"
                color="success"
                sx={{ px: 2, py: 3, fontSize: '1rem' }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Features */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
              <Avatar sx={{ width: 48, height: 48, mx: 'auto', mb: 2, bgcolor: 'secondary.light' }}>
                <LocalShippingIcon />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Free Delivery
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Free delivery on orders above ₹500
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
              <Avatar sx={{ width: 48, height: 48, mx: 'auto', mb: 2, bgcolor: 'success.light' }}>
                <EcoIcon />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Farm Fresh
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Direct from local farms to your table
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
              <Avatar sx={{ width: 48, height: 48, mx: 'auto', mb: 2, bgcolor: 'warning.light' }}>
                <VerifiedIcon />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Quality Guarantee
              </Typography>
              <Typography variant="body2" color="text.secondary">
                100% satisfaction or money back
              </Typography>
            </Paper>
          </Grid>
        </Grid>

      </Container>
    </>
  );
}

export default BuyVegetables;
