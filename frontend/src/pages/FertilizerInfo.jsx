import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Paper,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  CardActions
} from '@mui/material';
import {
  Agriculture as AgricultureIcon,
  Park as EcoIcon,
  Science as ScienceIcon,
  Timer as TimerIcon,
  LocalFlorist as LocalFloristIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  Calculate as CalculateIcon,
  Grass as GrassIcon,
  AddShoppingCart as AddShoppingCartIcon
} from '@mui/icons-material';
import { formatCurrency } from '../utils/helpers';
import api from '../services/api.service';
import cropsDataJSON from '../data/crops.json';
import { fertilizersData as localFertilizers } from '../storage/fertilizers';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/NotificationSystem';

const fertilizerCategories = ['All', 'Nitrogenous', 'Phosphatic', 'Potassic', 'Complex', 'Micronutrient', 'Organic'];
const applicationMethods = ['Broadcast', 'Band Placement', 'Foliar Spray', 'Soil Application', 'Fertigation'];
const cropsData = cropsDataJSON.cropDetails || [];


function FertilizerInfo() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedSoil, setSelectedSoil] = useState('');
  const [area, setArea] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState(false);
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
        // Backend returns: { status: 'success', statusCode: 200, data: [...], message: '...' }
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

  const soilTypes = [
    { value: 'clay', name: 'Clay Soil', description: 'Heavy, retains water well', ph: '6.5-7.5' },
    { value: 'sandy', name: 'Sandy Soil', description: 'Light, drains quickly', ph: '5.5-6.5' },
    { value: 'loamy', name: 'Loamy Soil', description: 'Ideal, balanced composition', ph: '6.0-7.0' },
    { value: 'silty', name: 'Silty Soil', description: 'Smooth texture, good drainage', ph: '6.0-7.0' },
    { value: 'red', name: 'Red Soil', description: 'Rich in iron, low in nutrients', ph: '5.5-6.5' },
    { value: 'black', name: 'Black Soil', description: 'Good for cotton, retains moisture', ph: '7.0-8.5' }
  ];

  // Filter fertilizers based on category
  const filteredFertilizers = useMemo(() => {
    if (selectedCategory === 'All') return fertilizersData;
    return fertilizersData.filter(f => f.type === selectedCategory);
  }, [selectedCategory, fertilizersData]);

  // Calculate fertilizer requirement
  const calculateRequirement = () => {
    if (!selectedCrop || !area) return null;
    
    const crop = cropsData.find(c => c.name.toLowerCase() === selectedCrop.toLowerCase());
    if (!crop) return null;

    const areaNum = parseFloat(area);
    const result = {
      nitrogen: crop.fertilizer ? parseFloat(crop.fertilizer.nitrogen) * areaNum : 0,
      phosphorus: crop.fertilizer ? parseFloat(crop.fertilizer.phosphorus) * areaNum : 0,
      potassium: crop.fertilizer ? parseFloat(crop.fertilizer.potassium) * areaNum : 0
    };
    
    return result;
  };

  const requirement = calculateRequirement();

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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Fertilizer <span style={{ color: '#10b981' }}>Information</span>
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
          Comprehensive guide to fertilizers, application methods, and personalized recommendations for your crops
        </Typography>
      </Box>

      {/* Calculator and Information Tabs */}
      <Paper elevation={2} sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} centered>
          <Tab label="Fertilizer Guide" icon={<ScienceIcon />} iconPosition="start" />
          <Tab label="Calculator" icon={<CalculateIcon />} iconPosition="start" />
          <Tab label="Application Methods" icon={<AgricultureIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {activeTab === 0 && (
        /* Fertilizer Guide Tab */
        <Grid container spacing={3}>
          {/* Category Filter */}
          <Grid item xs={12}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={selectedCategory}
                onChange={(e, newValue) => setSelectedCategory(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {fertilizerCategories.map((category) => (
                  <Tab key={category} label={category} value={category} />
                ))}
              </Tabs>
            </Box>
          </Grid>

          {/* Fertilizer Cards */}
          {loading ? (
            <Grid item xs={12}>
              <Typography>Loading fertilizers...</Typography>
            </Grid>
          ) : filteredFertilizers.length === 0 ? (
            <Grid item xs={12}>
              <Typography>No fertilizers found.</Typography>
            </Grid>
          ) : (
            filteredFertilizers.map((fertilizer) => {
            const fertilizerId = fertilizer._id || fertilizer.id;
            return (
            <Grid item xs={12} sm={6} md={6} key={fertilizerId} sx={{ display: 'flex' }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 420 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" component="h3" fontWeight="bold">
                      {fertilizer.name}
                    </Typography>
                    <Chip
                      label={fertilizer.type}
                      color="primary"
                      size="small"
                      icon={fertilizer.type === 'Organic' ? <EcoIcon /> : <ScienceIcon />}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {fertilizer.description}
                  </Typography>

                  <Box mb={2}>
                    {fertilizer.npk && (
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        NPK: {fertilizer.npk}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      <strong>Usage:</strong> {fertilizer.usage || fertilizer.description}
                    </Typography>
                  </Box>

                  <Accordion
                    expanded={expandedAccordion === fertilizer.id}
                    onChange={() => setExpandedAccordion(expandedAccordion === fertilizer.id ? false : fertilizer.id)}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">More Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {fertilizer.applicationTime && (
                          <ListItem>
                            <ListItemIcon><TimerIcon fontSize="small" /></ListItemIcon>
                            <ListItemText
                              primary="Application Time"
                              secondary={fertilizer.applicationTime}
                            />
                          </ListItem>
                        )}
                        <ListItem>
                          <ListItemIcon><CheckCircleIcon fontSize="small" /></ListItemIcon>
                          <ListItemText
                            primary="Benefits"
                            secondary={fertilizer.benefits && Array.isArray(fertilizer.benefits) ? fertilizer.benefits.join(', ') : fertilizer.benefits || 'N/A'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><WarningIcon fontSize="small" /></ListItemIcon>
                          <ListItemText
                            primary="Precautions"
                            secondary={fertilizer.precautions && Array.isArray(fertilizer.precautions) ? fertilizer.precautions.join(', ') : fertilizer.precautions || 'N/A'}
                          />
                        </ListItem>
                      </List>
                    </AccordionDetails>
                  </Accordion>

                  {fertilizer.price && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" color="primary">
                          {formatCurrency(fertilizer.price)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fertilizer.unit || ''}
                        </Typography>
                      </Box>
                    </>
                  )}

                  {fertilizer.suitableFor && (
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        Suitable for: {fertilizer.suitableFor && Array.isArray(fertilizer.suitableFor) ? fertilizer.suitableFor.join(', ') : fertilizer.suitableFor || 'Various crops'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ px: 3, pb: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color={addedToCart[fertilizerId] ? 'success' : 'primary'}
                    startIcon={<AddShoppingCartIcon />}
                    onClick={() => handleAddToCart(fertilizer)}
                  >
                    {addedToCart[fertilizerId] ? 'Added!' : 'Add to Cart'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            );
            })
          )}
        </Grid>
      )}

      {activeTab === 1 && (
        /* Calculator Tab */
        <Paper elevation={2} sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Crop</InputLabel>
                <Select
                  value={selectedCrop}
                  label="Select Crop"
                  onChange={(e) => setSelectedCrop(e.target.value)}
                >
                  {cropsData.map((crop) => (
                    <MenuItem key={crop.id} value={crop.name}>
                      {crop.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Soil Type</InputLabel>
                <Select
                  value={selectedSoil}
                  label="Soil Type"
                  onChange={(e) => setSelectedSoil(e.target.value)}
                >
                  {soilTypes.map((soil) => (
                    <MenuItem key={soil.value} value={soil.value}>
                      <Box>
                        <Typography variant="body1">{soil.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {soil.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Area (in hectares)"
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">ha</InputAdornment>,
                }}
              />
            </Grid>

            {requirement && (
              <Grid item xs={12}>
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  <Typography variant="h6" gutterBottom>
                    Calculated Requirements:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2">
                        <strong>Nitrogen:</strong> {requirement.nitrogen.toFixed(2)} kg
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2">
                        <strong>Phosphorus:</strong> {requirement.phosphorus.toFixed(2)} kg
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2">
                        <strong>Potassium:</strong> {requirement.potassium.toFixed(2)} kg
                      </Typography>
                    </Grid>
                  </Grid>
                </Alert>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {activeTab === 2 && (
        /* Application Methods Tab */
        <Grid container spacing={3}>
          {applicationMethods.map((method, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <AgricultureIcon />
                    </Avatar>
                    <Typography variant="h6" component="h3">
                      {method.method}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {method.description}
                  </Typography>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="caption">
                      <strong>Best for:</strong> {method.suitable}
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          ))}
          
          {/* Additional Tips */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 4, mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Important Tips for Fertilizer Application
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Soil Testing"
                    secondary="Always test your soil before applying fertilizers to avoid over-application"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Timing"
                    secondary="Apply fertilizers at the right growth stages for maximum effectiveness"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Weather Conditions"
                    secondary="Avoid application during heavy rain or strong winds"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Water After Application"
                    secondary="Water your crops after fertilizing to help nutrients reach the roots"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Safety"
                    secondary="Always wear protective equipment when handling chemical fertilizers"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

    </Container>
  );
}

export default FertilizerInfo;
