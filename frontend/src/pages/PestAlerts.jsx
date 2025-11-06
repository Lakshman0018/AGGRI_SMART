import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Alert,
  AlertTitle,
  Button,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Avatar,
  TextField,
  InputAdornment,
  Badge,
  Divider
} from '@mui/material';
import {
  Warning as WarningIcon,
  BugReport as BugReportIcon,
  Agriculture as AgricultureIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  LocalFlorist as LocalFloristIcon,
  WaterDrop as WaterIcon,
  Loop as LoopIcon,
  CleaningServices as CleaningIcon,
  Thermostat as ThermostatIcon,
  Groups as GroupsIcon,
  Report as ReportIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import api from '../services/api.service';
import cropsDataJSON from '../data/crops.json';
import { pestsData as localPests } from '../storage/pests';

const pestCategories = ['All', 'Insects', 'Diseases', 'Nematodes', 'Weeds'];
const severityLevels = [
  { level: 'Low', color: 'success' },
  { level: 'Medium', color: 'warning' },
  { level: 'High', color: 'error' },
  { level: 'Critical', color: 'error' }
];
const controlMethods = ['Chemical', 'Biological', 'Cultural', 'Physical', 'Integrated'];
const cropsData = cropsDataJSON.cropDetails || [];

function PestAlerts() {
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPest, setExpandedPest] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [pestsData, setPestsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pests from API
  useEffect(() => {
    const fetchPests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/info/pests');
        // Backend returns: { status: 'success', statusCode: 200, data: [...], message: '...' }
        if (response && response.status === 'success' && response.data) {
          const pests = Array.isArray(response.data) ? response.data : [];
          if (pests.length > 0) {
            setPestsData(pests);
            return;
          }
        }
        setPestsData(localPests || []);
      } catch (error) {
        console.error('Error fetching pests:', error);
        setPestsData(localPests || []);
      } finally {
        setLoading(false);
      }
    };

    fetchPests();
  }, []);

  // Filter pests based on selections
  const filteredPests = useMemo(() => {
    let filtered = [...pestsData];
    
    if (selectedSeverity !== 'All') {
      filtered = filtered.filter(pest => pest.severity === selectedSeverity);
    }
    
    if (selectedCrop !== 'All') {
      filtered = filtered.filter(pest => 
        pest.affectedCrops.some(crop => crop.toLowerCase() === selectedCrop.toLowerCase())
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(pest => 
        pest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pest.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pest.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [selectedSeverity, selectedCrop, searchTerm, pestsData]);

  // Get severity color for MUI
  const getSeverityColor = (severity) => {
    const level = severityLevels.find(l => l.level === severity);
    return level ? level.color : 'grey';
  };

  // Get unique crops from pests data
  const affectedCrops = useMemo(() => {
    const crops = new Set(['All']);
    pestsData.forEach(pest => {
      (pest.affectedCrops || []).forEach(crop => crops.add(crop));
    });
    return Array.from(crops);
  }, [pestsData]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Pest & Disease <span style={{ color: '#10b981' }}>Alerts</span>
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
          Stay informed about pest and disease outbreaks. Get early warnings, identification tips, and control measures.
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search pests by name, symptoms, or affected crops..."
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
      </Paper>

      {/* Filter Tabs */}
      <Paper elevation={2} sx={{ mb: 4 }}>
        <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)} centered>
          <Tab label="Active Alerts" icon={<WarningIcon />} iconPosition="start" />
          <Tab label="Control Methods" icon={<SecurityIcon />} iconPosition="start" />
          <Tab label="Prevention Tips" icon={<InfoIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {selectedTab === 0 && (
        <>
          {/* Severity and Crop Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Filter by Severity
                </Typography>
                <Box display="flex" gap={1.5} flexWrap="wrap" mt={2}>
                  <Chip
                    label="All"
                    onClick={() => setSelectedSeverity('All')}
                    color={selectedSeverity === 'All' ? 'primary' : 'default'}
                    variant={selectedSeverity === 'All' ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.95rem', py: 2.5, px: 1 }}
                  />
                  {severityLevels.map((level) => (
                    <Chip
                      key={level.level}
                      label={level.level}
                      onClick={() => setSelectedSeverity(level.level)}
                      color={selectedSeverity === level.level ? 'primary' : 'default'}
                      variant={selectedSeverity === level.level ? 'filled' : 'outlined'}
                      icon={<Badge color={level.color} variant="dot"><span /></Badge>}
                      sx={{ fontSize: '0.95rem', py: 2.5, px: 1 }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Filter by Crop
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {affectedCrops.map((crop) => (
                    <Chip
                      key={crop}
                      label={crop}
                      onClick={() => setSelectedCrop(crop)}
                      color={selectedCrop === crop ? 'primary' : 'default'}
                      variant={selectedCrop === crop ? 'filled' : 'outlined'}
                      icon={<AgricultureIcon />}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Pest Alerts Grid */}
          <Grid container spacing={3}>
            {loading ? (
              <Grid item xs={12}>
                <Typography>Loading pest alerts...</Typography>
              </Grid>
            ) : filteredPests.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  No pest alerts found matching your criteria. Try different filters or search terms.
                </Alert>
              </Grid>
            ) : (
              filteredPests.map((pest) => (
                <Grid item xs={12} key={pest._id || pest.id}>
                  <Card
                    sx={{
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent>
                      {/* Header with Severity */}
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
                        <Box display="flex" gap={2}>
                          <Avatar sx={{ bgcolor: 'error.light', width: 48, height: 48 }}>
                            <BugReportIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                              {pest.name || pest.pestName}
                            </Typography>
                            {pest.scientificName && (
                              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                {pest.scientificName}
                              </Typography>
                            )}
                            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                              {(pest.affectedCrops || []).slice(0, 3).map((crop, idx) => (
                                <Chip
                                  key={idx}
                                  label={crop}
                                  size="small"
                                  icon={<AgricultureIcon />}
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                        
                        {pest.severity && (
                          <Alert
                            severity={getSeverityColor(pest.severity)}
                            sx={{ py: 0.5, px: 2 }}
                          >
                            <Typography variant="body2" fontWeight="bold">
                              {pest.severity} Severity
                            </Typography>
                          </Alert>
                        )}
                      </Box>

                      {/* Symptoms */}
                      <Box mb={3}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          <WarningIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Symptoms to Watch For:
                        </Typography>
                        <Grid container spacing={1}>
                          {(pest.symptoms || []).map((symptom, idx) => (
                            <Grid item xs={12} sm={6} key={idx}>
                              <Box display="flex" alignItems="center">
                                <CheckIcon fontSize="small" color="warning" sx={{ mr: 1 }} />
                                <Typography variant="body2">{symptom}</Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>

                      {/* Expandable Control Measures */}
                      <Accordion
                        expanded={expandedPest === (pest._id || pest.id)}
                        onChange={() => setExpandedPest(expandedPest === (pest._id || pest.id) ? false : (pest._id || pest.id))}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Control Measures & Details
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            {/* Cultural Control */}
                            <Grid item xs={12} md={4}>
                              <Paper elevation={1} sx={{ p: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                                  Cultural Control
                                </Typography>
                                <List dense>
                                  {(pest.controlMeasures?.cultural || pest.preventiveMeasures || []).length > 0 ? (
                                    (Array.isArray(pest.controlMeasures?.cultural) ? pest.controlMeasures.cultural : (pest.preventiveMeasures || [])).map((measure, idx) => (
                                      <ListItem key={idx}>
                                        <ListItemIcon>
                                          <LocalFloristIcon fontSize="small" color="success" />
                                        </ListItemIcon>
                                        <ListItemText primary={measure} />
                                      </ListItem>
                                    ))
                                  ) : (
                                    <ListItem>
                                      <ListItemText primary="No cultural control measures available" secondary="Data not available" />
                                    </ListItem>
                                  )}
                                </List>
                              </Paper>
                            </Grid>
                            
                            {/* Biological Control */}
                            <Grid item xs={12} md={4}>
                              <Paper elevation={1} sx={{ p: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                                  Biological Control
                                </Typography>
                                <List dense>
                                  {(pest.controlMeasures?.biological || []).length > 0 ? (
                                    (Array.isArray(pest.controlMeasures?.biological) ? pest.controlMeasures.biological : []).map((measure, idx) => (
                                      <ListItem key={idx}>
                                        <ListItemIcon>
                                          <BugReportIcon fontSize="small" color="info" />
                                        </ListItemIcon>
                                        <ListItemText primary={measure} />
                                      </ListItem>
                                    ))
                                  ) : (
                                    <ListItem>
                                      <ListItemText primary="No biological control measures available" secondary="Data not available" />
                                    </ListItem>
                                  )}
                                </List>
                              </Paper>
                            </Grid>
                            
                            {/* Chemical Control */}
                            <Grid item xs={12} md={4}>
                              <Paper elevation={1} sx={{ p: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                                  Chemical Control
                                </Typography>
                                <List dense>
                                  {(pest.controlMeasures?.chemical || pest.treatment || []).length > 0 ? (
                                    (Array.isArray(pest.controlMeasures?.chemical) ? pest.controlMeasures.chemical : (pest.treatment || [])).map((measure, idx) => (
                                      <ListItem key={idx}>
                                        <ListItemIcon>
                                          <WarningIcon fontSize="small" color="error" />
                                        </ListItemIcon>
                                        <ListItemText primary={measure} />
                                      </ListItem>
                                    ))
                                  ) : (
                                    <ListItem>
                                      <ListItemText primary="No chemical control measures available" secondary={pest.control_measures || "Data not available"} />
                                    </ListItem>
                                  )}
                                </List>
                              </Paper>
                            </Grid>
                            
                            {/* Additional Info */}
                            <Grid item xs={12}>
                              <Alert severity="info">
                                <AlertTitle>Important Information</AlertTitle>
                                {pest.identificationTips && (
                                  <Typography variant="body2" paragraph>
                                    <strong>Identification:</strong> {pest.identificationTips}
                                  </Typography>
                                )}
                                {pest.seasonalOccurrence && (
                                  <Typography variant="body2" paragraph>
                                    <strong>Seasonal Occurrence:</strong> {pest.seasonalOccurrence}
                                  </Typography>
                                )}
                                {pest.economicThreshold && (
                                  <Typography variant="body2">
                                    <strong>Economic Threshold:</strong> {pest.economicThreshold}
                                  </Typography>
                                )}
                                {pest.description && (
                                  <Typography variant="body2">
                                    <strong>Description:</strong> {pest.description}
                                  </Typography>
                                )}
                                {!pest.identificationTips && !pest.seasonalOccurrence && !pest.economicThreshold && !pest.description && (
                                  <Typography variant="body2">
                                    Additional information will be available soon.
                                  </Typography>
                                )}
                              </Alert>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </>
      )}

      {selectedTab === 1 && (
        /* Control Methods Tab */
        <Grid container spacing={3}>
          {controlMethods.map((method, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <SecurityIcon />
                    </Avatar>
                    <Typography variant="h6">{method}</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Detailed information about {method.toLowerCase()} control methods for managing pests and diseases effectively.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedTab === 2 && (
        /* Prevention Tips Tab */
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Avatar sx={{ bgcolor: 'info.main', mb: 2 }}>
                  <SearchIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  Regular Monitoring
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Inspect your crops regularly for early signs of pests and diseases. Early detection is key to effective control.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Avatar sx={{ bgcolor: 'success.main', mb: 2 }}>
                  <LocalFloristIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  Healthy Plants
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Maintain healthy plants through proper nutrition, watering, and spacing. Healthy plants resist pests better.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Avatar sx={{ bgcolor: 'secondary.main', mb: 2 }}>
                  <LoopIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  Crop Rotation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Practice crop rotation to break pest and disease cycles. Avoid planting the same crop in the same field.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Avatar sx={{ bgcolor: 'warning.main', mb: 2 }}>
                  <CleaningIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  Field Sanitation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Keep fields clean by removing plant debris, weeds, and infected materials that can harbor pests.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Avatar sx={{ bgcolor: 'error.main', mb: 2 }}>
                  <ThermostatIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  Weather Monitoring
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor weather conditions as they affect pest and disease development. Take preventive measures accordingly.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
                  <GroupsIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  Community Alerts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stay connected with local farming communities to share information about pest outbreaks and solutions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Emergency Contact Section */}
      <Paper elevation={3} sx={{ p: 3, mt: 4, bgcolor: 'error.50', border: 2, borderColor: 'error.200' }}>
        <Box textAlign="center">
          <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 2, bgcolor: 'error.main' }}>
            <ReportIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Emergency Pest Control
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            If you notice severe pest damage or disease outbreaks, contact your local agricultural extension office immediately.
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<PhoneIcon />}
            >
              Contact Extension Office
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="large"
              startIcon={<ReportIcon />}
            >
              Report New Pest
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default PestAlerts;
