import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
  Chip,
  Avatar,
  Stack,
  Alert,
  CircularProgress,
  Fade,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Tooltip,
  Badge
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Science as ScienceIcon,
  PhotoCamera as PhotoCameraIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Lightbulb as LightbulbIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  LocalFlorist,
  BugReport,
  HealthAndSafety,
  TrendingUp,
  Park as Eco
} from '@mui/icons-material';
import diseaseService from '../services/disease.service';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/NotificationSystem';

const cropTypes = [
  'Tomato', 'Potato', 'Rice', 'Wheat', 'Cotton',
  'Maize', 'Onion', 'Chilli', 'Cabbage', 'Cucumber',
  'Other'
];

function PlantDetectionEnhanced() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [cropType, setCropType] = useState('');
  const [currentScan, setCurrentScan] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const [stats, setStats] = useState(null);
  
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();

  useEffect(() => {
    loadScanHistory();
    loadStats();
  }, []);

  const loadScanHistory = async () => {
    try {
      setLoading(true);
      const response = await diseaseService.getMyScans({ page: 1, limit: 10 });
      // Backend returns: { status: 'success', statusCode: 200, data: {...}, message: '...' }
      if (response && response.status === 'success' && response.data) {
        setScanHistory(response.data.scans || response.data || []);
      }
    } catch (error) {
      console.error('Error loading scan history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await diseaseService.getDiseaseStats();
      // Backend returns: { status: 'success', statusCode: 200, data: {...}, message: '...' }
      if (response && response.status === 'success' && response.data) {
        setStats(response.data.stats || response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleImageSelection = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) {
      showError('Please select an image first');
      return;
    }

    if (!cropType) {
      showError('Please select the crop type');
      return;
    }

    setAnalyzing(true);
    setCurrentScan(null);

    try {
      const response = await diseaseService.scanDisease(imageFile, cropType);
      
      // Backend returns: { status: 'success', statusCode: 200, data: {...}, message: '...' }
      if (response && response.status === 'success' && response.data) {
        setCurrentScan(response.data.scan || response.data);
        showSuccess('Disease analysis completed successfully!');
        
        // Reload history to include new scan
        loadScanHistory();
        loadStats();
      } else {
        showError(response?.error || response?.message || 'Failed to analyze image');
      }
    } catch (error) {
      showError('Error analyzing image. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setImageFile(null);
    setCurrentScan(null);
    setCropType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const viewScanDetails = async (scanId) => {
    try {
      const response = await diseaseService.getScanDetails(scanId);
      // Backend returns: { status: 'success', statusCode: 200, data: {...}, message: '...' }
      if (response && response.status === 'success' && response.data) {
        setSelectedScan(response.data.scan || response.data);
        setViewDialog(true);
      }
    } catch (error) {
      showError('Failed to load scan details');
    }
  };

  const deleteScan = async (scanId) => {
    if (window.confirm('Are you sure you want to delete this scan?')) {
      try {
        const response = await diseaseService.deleteScan(scanId);
        // Backend returns: { status: 'success', statusCode: 200, data: {...}, message: '...' }
        if (response && response.status === 'success') {
          showSuccess('Scan deleted successfully');
          loadScanHistory();
          loadStats();
        }
      } catch (error) {
        showError('Failed to delete scan');
      }
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      case 'Critical': return 'error';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Low': return <CheckCircleIcon />;
      case 'Medium': return <WarningIcon />;
      case 'High': return <ErrorIcon />;
      case 'Critical': return <ErrorIcon />;
      default: return <Eco />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        AI Plant Disease Detection
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Upload a photo of your plant's leaves to instantly identify diseases and get treatment recommendations
      </Typography>

      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Upload Plant Image
            </Typography>

            {!selectedImage ? (
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'action.hover'
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Click to Upload or Drag & Drop
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported formats: JPG, PNG, GIF (Max 5MB)
                </Typography>
              </Box>
            ) : (
              <Box>
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <img
                    src={selectedImage}
                    alt="Selected plant"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'background.paper'
                    }}
                    onClick={resetAnalysis}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Box>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Crop Type</InputLabel>
                  <Select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    label="Crop Type"
                  >
                    {cropTypes.map(crop => (
                      <MenuItem key={crop} value={crop}>{crop}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={analyzing ? <CircularProgress size={20} /> : <ScienceIcon />}
                  onClick={analyzeImage}
                  disabled={analyzing || !cropType}
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Disease'}
                </Button>
              </Box>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageSelection}
            />
          </Paper>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          {currentScan ? (
            <Zoom in={true}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Analysis Results
                </Typography>

                <Box mb={2}>
                  <Chip
                    icon={getSeverityIcon(currentScan.severity)}
                    label={`Severity: ${currentScan.severity}`}
                    color={getSeverityColor(currentScan.severity)}
                    sx={{ mb: 1, mr: 1 }}
                  />
                  <Chip
                    icon={<TrendingUp />}
                    label={`Confidence: ${currentScan.confidence}%`}
                    color="primary"
                  />
                </Box>

                <Alert severity={getSeverityColor(currentScan.severity)} sx={{ mb: 2 }}>
                  <Typography variant="h6">{currentScan.disease}</Typography>
                  <Typography variant="body2" mt={1}>
                    {currentScan.recommendedAction}
                  </Typography>
                </Alert>

                {currentScan.treatments && currentScan.treatments.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                      Recommended Treatments:
                    </Typography>
                    <List dense>
                      {currentScan.treatments.map((treatment, index) => (
                        <ListItem key={index}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: treatment.organic ? 'success.main' : 'warning.main' }}>
                              {treatment.organic ? <Eco /> : <BugReport />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={treatment.type || treatment}
                            secondary={treatment.description || 'Apply as directed'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Paper>
            </Zoom>
          ) : (
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Box textAlign="center" py={4}>
                <LocalFlorist sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No analysis yet
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Upload an image and click analyze to get started
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Statistics */}
        {stats && (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Your Disease Detection Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Scans
                      </Typography>
                      <Typography variant="h4">
                        {stats.totalScans || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Diseases Detected
                      </Typography>
                      <Typography variant="h4">
                        {stats.diseases?.length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Most Common
                      </Typography>
                      <Typography variant="h6">
                        {stats.diseases?.[0]?._id || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Scan History */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Recent Scans
              </Typography>
              <IconButton onClick={loadScanHistory}>
                <RefreshIcon />
              </IconButton>
            </Box>

            {loading ? (
              <Box textAlign="center" py={4}>
                <CircularProgress />
              </Box>
            ) : scanHistory.length === 0 ? (
              <Box textAlign="center" py={4}>
                <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                  No scan history yet
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {scanHistory.map((scan) => (
                  <Grid item xs={12} sm={6} md={4} key={scan._id}>
                    <Card>
                      {scan.imageUrl && (
                        <CardMedia
                          component="img"
                          height="140"
                          image={`http://localhost:9653${scan.imageUrl}`}
                          alt={scan.disease}
                        />
                      )}
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {scan.disease || 'Processing...'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Crop: {scan.cropType}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </Typography>
                        <Box mt={1}>
                          <Chip
                            size="small"
                            label={scan.severity}
                            color={getSeverityColor(scan.severity)}
                          />
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => viewScanDetails(scan._id)}>
                          View
                        </Button>
                        <Button size="small" color="error" onClick={() => deleteScan(scan._id)}>
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* View Details Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Scan Details</DialogTitle>
        <DialogContent>
          {selectedScan && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedScan.disease}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Scanned on: {new Date(selectedScan.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedScan.recommendedAction}
              </Typography>
              {selectedScan.expertNotes && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Expert Notes:</Typography>
                  <Typography variant="body2">{selectedScan.expertNotes}</Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PlantDetectionEnhanced;
