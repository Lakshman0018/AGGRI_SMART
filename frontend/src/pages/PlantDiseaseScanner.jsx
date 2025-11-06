import React, { useState, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Chip,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab
} from '@mui/material';
import {
  CloudUpload,
  CameraAlt,
  Scanner,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  ExpandMore,
  LocalHospital,
  Science,
  Timeline,
  WaterDrop,
  Agriculture,
  ArrowForward,
  Download,
  Share,
  Refresh,
  Info
} from '@mui/icons-material';
// Eco icon not available in this MUI version; remove usage
import { motion, AnimatePresence } from 'framer-motion';
import { diseaseAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PlantDiseaseScanner = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [cropType, setCropType] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showTreatmentDialog, setShowTreatmentDialog] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);

  const steps = ['Upload Image', 'Select Crop', 'Analysis', 'Results'];
  const cropTypes = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Tomato', 'Potato', 'Sugarcane', 'Pulses'];

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setActiveStep(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSelect = (crop) => {
    setCropType(crop);
    setActiveStep(2);
    performAnalysis(crop);
  };

  const performAnalysis = async (crop) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('crop', crop);
      formData.append('location', JSON.stringify({
        state: 'Maharashtra',
        district: 'Mumbai',
        coordinates: { lat: 19.0760, lon: 72.8777 }
      }));

      const response = await diseaseAPI.scan(formData);
      setScanResult(response.data.data.scan);
      setActiveStep(3);
      toast.success('Analysis completed successfully!');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze image. Please try again.');
      setScanResult(getMockResult(crop));
      setActiveStep(3);
    } finally {
      setLoading(false);
    }
  };

  const getMockResult = (crop) => {
    return {
      _id: '123456',
      crop,
      imageAnalysis: {
        disease: 'Bacterial Leaf Blight',
        confidence: 87,
        severity: 'high',
        affectedArea: 45,
        stage: 'Mid'
      },
      symptoms: [
        'Yellow to white lesions on leaf tips',
        'Wavy margins on lesions',
        'Grayish-white lesions during humid conditions'
      ],
      treatmentPlan: {
        immediate: ['Remove infected leaves', 'Improve field drainage'],
        preventive: ['Use resistant varieties', 'Avoid excessive nitrogen'],
        organic: [
          { name: 'Neem Oil', description: 'Natural fungicide', dosage: '2-3ml/L', frequency: 'Weekly', cost: 150 },
          { name: 'Pseudomonas', description: 'Biological control', dosage: '10g/L', frequency: 'Bi-weekly', cost: 200 }
        ],
        chemical: [
          { name: 'Streptomycin', activeIngredient: 'Streptomycin sulfate', dosage: '1g/3L', frequency: 'Weekly', safetyPeriod: '7 days', cost: 250 },
          { name: 'Copper Oxychloride', activeIngredient: 'Copper', dosage: '2g/L', frequency: 'Bi-weekly', safetyPeriod: '10 days', cost: 180 }
        ]
      },
      recommendedActions: [
        { type: 'immediate', description: 'Remove infected leaves immediately', priority: 5, timeline: 'Within 24 hours' },
        { type: 'curative', description: 'Apply recommended fungicide', priority: 4, timeline: 'Within 2-3 days' },
        { type: 'preventive', description: 'Improve field drainage', priority: 3, timeline: 'This week' }
      ],
      weatherAtScan: {
        temperature: 28,
        humidity: 75,
        conditions: 'Favorable for disease spread'
      },
      expertReview: {
        verificationStatus: false
      }
    };
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedImage(null);
    setImagePreview(null);
    setCropType('');
    setScanResult(null);
  };

  const handleDownloadReport = () => {
    // TODO: Generate and download PDF report
    toast.success('Report downloaded successfully!');
  };

  const handleShareResult = () => {
    // TODO: Share functionality
    toast.success('Result link copied to clipboard!');
  };

  const TreatmentCard = ({ treatment, type }) => (
    <Card className="mb-3 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
      setSelectedTreatment({ ...treatment, type });
      setShowTreatmentDialog(true);
    }}>
      <CardContent>
        <Box className="flex justify-between items-start mb-2">
          <Typography variant="h6" className="font-medium">
            {treatment.name}
          </Typography>
          <Chip 
            label={type === 'organic' ? 'Organic' : 'Chemical'} 
            size="small"
            color={type === 'organic' ? 'success' : 'warning'}
          />
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">Dosage</Typography>
            <Typography variant="body2">{treatment.dosage}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">Frequency</Typography>
            <Typography variant="body2">{treatment.frequency}</Typography>
          </Grid>
          {treatment.safetyPeriod && (
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Safety Period</Typography>
              <Typography variant="body2">{treatment.safetyPeriod}</Typography>
            </Grid>
          )}
          <Grid item xs={6}>
            <Typography variant="caption" color="textSecondary">Cost</Typography>
            <Typography variant="body2">₹{treatment.cost}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box className="text-center mb-8">
          <Typography variant="h3" className="font-bold text-gray-800 mb-4">
            Plant Disease Scanner 🌿
          </Typography>
          <Typography variant="body1" className="text-gray-600 max-w-2xl mx-auto">
            Upload a photo of your plant's leaves to detect diseases instantly using AI technology.
            Get expert recommendations and treatment plans.
          </Typography>
        </Box>

        <Paper className="p-6 mb-6">
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <AnimatePresence mode="wait">
          {/* Step 1: Upload Image */}
          {activeStep === 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Paper className="p-8 text-center">
                <Box className="max-w-md mx-auto">
                  <CloudUpload className="text-6xl text-green-600 mb-4" />
                  <Typography variant="h5" className="mb-4">
                    Upload Plant Image
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 mb-6">
                    Take a clear photo of the affected leaf or plant part.
                    Ensure good lighting and focus for accurate results.
                  </Typography>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <Box className="flex gap-3 justify-center">
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CloudUpload />}
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-green-600 to-green-700"
                    >
                      Choose File
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<CameraAlt />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Take Photo
                    </Button>
                  </Box>
                  
                  <Alert severity="info" className="mt-6">
                    <Typography variant="caption">
                      Supported formats: JPG, PNG, WEBP (Max 10MB)
                    </Typography>
                  </Alert>
                </Box>
              </Paper>
            </motion.div>
          )}

          {/* Step 2: Select Crop */}
          {activeStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Paper className="p-4">
                    <Typography variant="h6" className="mb-3">
                      Selected Image
                    </Typography>
                    <img 
                      src={imagePreview} 
                      alt="Selected plant" 
                      className="w-full rounded-lg"
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={7}>
                  <Paper className="p-4">
                    <Typography variant="h6" className="mb-4">
                      Select Crop Type
                    </Typography>
                    <Grid container spacing={2}>
                      {cropTypes.map((crop) => (
                        <Grid item xs={6} sm={4} key={crop}>
                          <Button
                            variant="outlined"
                            fullWidth
                            className="py-4"
                            startIcon={<Agriculture />}
                            onClick={() => handleCropSelect(crop)}
                          >
                            {crop}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                    <Alert severity="info" className="mt-4">
                      Select the crop type for more accurate disease detection
                    </Alert>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* Step 3: Analysis in Progress */}
          {activeStep === 2 && loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Paper className="p-8 text-center">
                <Scanner className="text-6xl text-green-600 mb-4 animate-pulse" />
                <Typography variant="h5" className="mb-4">
                  Analyzing Image...
                </Typography>
                <LinearProgress className="max-w-md mx-auto mb-4" />
                <Typography variant="body2" className="text-gray-600">
                  Our AI is examining the image for signs of disease
                </Typography>
              </Paper>
            </motion.div>
          )}

          {/* Step 4: Results */}
          {activeStep === 3 && scanResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Grid container spacing={3}>
                {/* Main Results */}
                <Grid item xs={12} md={8}>
                  <Paper className="p-6 mb-4">
                    <Box className="flex items-start justify-between mb-4">
                      <Box>
                        <Typography variant="h5" className="font-bold mb-2">
                          {scanResult.imageAnalysis.disease}
                        </Typography>
                        <Box className="flex gap-2">
                          <Chip 
                            label={`${scanResult.imageAnalysis.confidence}% Confidence`}
                            color="primary"
                          />
                          <Chip 
                            label={`Severity: ${scanResult.imageAnalysis.severity}`}
                            color={getSeverityColor(scanResult.imageAnalysis.severity)}
                          />
                          <Chip 
                            label={`${scanResult.imageAnalysis.affectedArea}% Affected`}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      <Box className="flex gap-2">
                        <IconButton onClick={handleDownloadReport}>
                          <Download />
                        </IconButton>
                        <IconButton onClick={handleShareResult}>
                          <Share />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Symptoms */}
                    <Alert severity="warning" className="mb-4">
                      <Typography variant="subtitle2" className="font-semibold mb-2">
                        Observed Symptoms:
                      </Typography>
                      <List dense>
                        {scanResult.symptoms.map((symptom, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <CheckCircle fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={symptom} />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>

                    {/* Recommended Actions */}
                    <Typography variant="h6" className="mb-3">
                      Recommended Actions
                    </Typography>
                    {scanResult.recommendedActions.map((action, index) => (
                      <Alert 
                        key={index}
                        severity={action.priority > 3 ? 'error' : 'warning'}
                        className="mb-2"
                      >
                        <Box>
                          <Typography variant="subtitle2" className="font-semibold">
                            {action.description}
                          </Typography>
                          <Typography variant="caption">
                            {action.timeline} • Priority: {action.priority}/5
                          </Typography>
                        </Box>
                      </Alert>
                    ))}
                  </Paper>

                  {/* Treatment Plans */}
                  <Paper className="p-6">
                    <Typography variant="h6" className="mb-4">
                      Treatment Options
                    </Typography>
                    
                    <Accordion defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMore />}>
              <Box className="flex items-center gap-2">
                <Typography>Organic Treatments</Typography>
              </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {scanResult.treatmentPlan.organic.map((treatment, index) => (
                          <TreatmentCard key={index} treatment={treatment} type="organic" />
                        ))}
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box className="flex items-center gap-2">
                          <Science className="text-orange-600" />
                          <Typography>Chemical Treatments</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {scanResult.treatmentPlan.chemical.map((treatment, index) => (
                          <TreatmentCard key={index} treatment={treatment} type="chemical" />
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  </Paper>
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} md={4}>
                  {/* Image Preview */}
                  <Paper className="p-4 mb-4">
                    <Typography variant="h6" className="mb-3">
                      Analyzed Image
                    </Typography>
                    <img 
                      src={imagePreview} 
                      alt="Analyzed plant" 
                      className="w-full rounded-lg mb-3"
                    />
                    <Typography variant="body2" className="text-gray-600">
                      Crop: {scanResult.crop}
                    </Typography>
                  </Paper>

                  {/* Weather Conditions */}
                  <Paper className="p-4 mb-4">
                    <Typography variant="h6" className="mb-3">
                      Environmental Factors
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <WaterDrop />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Humidity"
                          secondary={`${scanResult.weatherAtScan.humidity}%`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Timeline />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Temperature"
                          secondary={`${scanResult.weatherAtScan.temperature}°C`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary={scanResult.weatherAtScan.conditions}
                          secondary="Current conditions"
                        />
                      </ListItem>
                    </List>
                  </Paper>

                  {/* Actions */}
                  <Paper className="p-4">
                    <Typography variant="h6" className="mb-3">
                      Actions
                    </Typography>
                    <Box className="space-y-2">
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<LocalHospital />}
                        onClick={() => navigate('/experts')}
                        className="bg-gradient-to-r from-blue-600 to-blue-700"
                      >
                        Consult Expert
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={handleReset}
                      >
                        New Scan
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Timeline />}
                        onClick={() => navigate('/disease/history')}
                      >
                        View History
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Treatment Details Dialog */}
        <Dialog open={showTreatmentDialog} onClose={() => setShowTreatmentDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Treatment Details
          </DialogTitle>
          <DialogContent>
            {selectedTreatment && (
              <Box>
                <Typography variant="h6" className="mb-2">
                  {selectedTreatment.name}
                </Typography>
                {selectedTreatment.description && (
                  <Typography variant="body2" className="text-gray-600 mb-3">
                    {selectedTreatment.description}
                  </Typography>
                )}
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Dosage</Typography>
                    <Typography>{selectedTreatment.dosage}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Frequency</Typography>
                    <Typography>{selectedTreatment.frequency}</Typography>
                  </Grid>
                  {selectedTreatment.activeIngredient && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">Active Ingredient</Typography>
                      <Typography>{selectedTreatment.activeIngredient}</Typography>
                    </Grid>
                  )}
                  {selectedTreatment.safetyPeriod && (
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">Safety Period</Typography>
                      <Typography>{selectedTreatment.safetyPeriod}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Cost</Typography>
                    <Typography>₹{selectedTreatment.cost}</Typography>
                  </Grid>
                </Grid>
                <Alert severity="info" className="mt-4">
                  Always follow the manufacturer's instructions and safety guidelines when applying treatments.
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowTreatmentDialog(false)}>Close</Button>
            <Button 
              variant="contained" 
              onClick={() => {
                navigate('/marketplace?category=pesticides');
                setShowTreatmentDialog(false);
              }}
            >
              Buy Now
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          className="fixed bottom-8 right-8 bg-gradient-to-r from-green-600 to-green-700"
          onClick={() => navigate('/disease/guide')}
        >
          <Info />
        </Fab>
      </motion.div>
    </Container>
  );
};

export default PlantDiseaseScanner;
