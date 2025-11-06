import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link
} from '@mui/material';
import {
  Search as SearchIcon,
  AccountBalance as AccountBalanceIcon,
  Agriculture as AgricultureIcon,
  Check as CheckIcon,
  Article as ArticleIcon,
  CalendarToday as CalendarTodayIcon,
  ExpandMore as ExpandMoreIcon,
  Launch as LaunchIcon,
  Info as InfoIcon,
  Category as CategoryIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  School as SchoolIcon,
  Water as WaterIcon,
  Store as StoreIcon,
  LocalFlorist as LocalFloristIcon,
  Park as EcoIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import api from '../services/api.service';

const schemeCategories = ['All', 'Income Support', 'Crop Insurance', 'Credit Facility', 'Irrigation', 'Marketing', 'Organic Farming', 'Soil Management', 'Development'];
const applySteps = [
  { step: 1, title: 'Check Eligibility', description: 'Verify you meet all eligibility criteria' },
  { step: 2, title: 'Gather Documents', description: 'Collect all required documents' },
  { step: 3, title: 'Fill Application', description: 'Complete the application form' },
  { step: 4, title: 'Submit Application', description: 'Submit through online portal or office' },
  { step: 5, title: 'Track Status', description: 'Monitor your application status' }
];

function GovernmentSchemes() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [expandedScheme, setExpandedScheme] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [governmentSchemes, setGovernmentSchemes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch schemes from API
    useEffect(() => {
        const fetchSchemes = async () => {
            try {
                setLoading(true);
                const response = await api.get('/info/schemes');
                // Backend returns: { status: 'success', statusCode: 200, data: [...], message: '...' }
                if (response && response.status === 'success' && response.data) {
                    const schemes = Array.isArray(response.data) ? response.data : [];
                    setGovernmentSchemes(schemes);
                }
            } catch (error) {
                console.error('Error fetching schemes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchemes();
    }, []);

    // Category icons mapping
    const categoryIcons = {
      'Income Support': <CurrencyRupeeIcon />,
      'Crop Insurance': <AgricultureIcon />,
      'Credit Facility': <AccountBalanceIcon />,
      'Irrigation': <WaterIcon />,
      'Marketing': <StoreIcon />,
      'Organic Farming': <EcoIcon />,
      'Soil Management': <LocalFloristIcon />,
      'Development': <SchoolIcon />
    };

    // Filter schemes based on search and category
    const filteredSchemes = useMemo(() => {
      let filtered = [...governmentSchemes];
      
      if (selectedCategory !== 'All') {
        filtered = filtered.filter(scheme => scheme.category === selectedCategory);
      }
      
      if (searchTerm) {
        filtered = filtered.filter(scheme => {
          const name = (scheme.title || scheme.name || scheme.schemeName || '').toLowerCase();
          const fullName = (scheme.fullName || '').toLowerCase();
          const description = (scheme.description || '').toLowerCase();
          const search = searchTerm.toLowerCase();
          return name.includes(search) || fullName.includes(search) || description.includes(search);
        });
      }
      
      return filtered;
    }, [searchTerm, selectedCategory, governmentSchemes]);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box textAlign="center" mb={4}>
                <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                    Government <span style={{ color: '#10b981' }}>Schemes</span>
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
                    Access various government schemes and subsidies designed to support farmers and agricultural development
                </Typography>
            </Box>

            {/* Search Bar */}
            <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
                <TextField
                    fullWidth
                    placeholder="Search schemes by name, benefits, or eligibility..."
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

            {/* Category Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs
                    value={selectedCategory}
                    onChange={(e, newValue) => setSelectedCategory(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {schemeCategories.map((category) => (
                        <Tab
                            key={category}
                            label={category}
                            value={category}
                            icon={categoryIcons[category] || <CategoryIcon />}
                            iconPosition="start"
                        />
                    ))}
                </Tabs>
            </Box>

            {/* Schemes Grid */}
            <Grid container spacing={3}>
                {loading ? (
                    <Grid item xs={12}>
                        <Typography>Loading schemes...</Typography>
                    </Grid>
                ) : filteredSchemes.length === 0 ? (
                    <Grid item xs={12}>
                        <Alert severity="info">
                            No schemes found matching your criteria. Try different search terms or categories.
                        </Alert>
                    </Grid>
                ) : (
                    filteredSchemes.map((scheme) => (
                        <Grid item xs={12} sm={6} md={4} key={scheme._id || scheme.id}>
                            <Card 
                                sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    transition: 'all 0.3s',
                                    borderRadius: 2,
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 3
                                    }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    {/* Header */}
                                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                        <Box flex={1}>
                                            <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                                                {scheme.title || scheme.name || scheme.schemeName}
                                            </Typography>
                                            {(scheme.fullName || scheme.description) && (
                                                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                                    {scheme.fullName || scheme.description}
                                                </Typography>
                                            )}
                                        </Box>
                                        {scheme.status && (
                                            <Chip
                                                label={scheme.status}
                                                color={scheme.status === 'Active' ? 'success' : 'default'}
                                                size="small"
                                            />
                                        )}
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {scheme.description}
                                    </Typography>

                                    {/* Benefits */}
                                    {scheme.benefits && scheme.benefits.length > 0 && (
                                        <Box mb={2}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                Key Benefits:
                                            </Typography>
                                            {(Array.isArray(scheme.benefits) ? scheme.benefits : []).slice(0, 2).map((benefit, idx) => (
                                            <Box key={idx} display="flex" alignItems="center" mb={0.5}>
                                                <CheckIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                                                <Typography variant="caption">
                                                    {benefit}
                                                </Typography>
                                            </Box>
                                            ))}
                                        </Box>
                                    )}

                                    {/* Expandable Details */}
                                    <Accordion
                                        expanded={expandedScheme === (scheme._id || scheme.id)}
                                        onChange={() => setExpandedScheme(expandedScheme === (scheme._id || scheme.id) ? false : (scheme._id || scheme.id))}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography variant="subtitle2">View Details</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                    Eligibility:
                                                </Typography>
                                                <List dense>
                                                    {(Array.isArray(scheme.eligibility) ? scheme.eligibility : (scheme.eligibility ? [scheme.eligibility] : [])).map((item, idx) => (
                                                        <ListItem key={idx}>
                                                            <ListItemIcon>
                                                                <CheckIcon fontSize="small" color="primary" />
                                                            </ListItemIcon>
                                                            <ListItemText primary={item} />
                                                        </ListItem>
                                                    ))}
                                                </List>

                                                {scheme.documentsRequired && scheme.documentsRequired.length > 0 && (
                                                    <>
                                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                            Documents Required:
                                                        </Typography>
                                                        <List dense>
                                                            {(Array.isArray(scheme.documentsRequired) ? scheme.documentsRequired : []).map((doc, idx) => (
                                                        <ListItem key={idx}>
                                                            <ListItemIcon>
                                                                <ArticleIcon fontSize="small" color="action" />
                                                            </ListItemIcon>
                                                            <ListItemText primary={doc} />
                                                            </ListItem>
                                                            ))}
                                                        </List>
                                                    </>
                                                )}

                                                {scheme.lastDate && (
                                                    <Alert severity="info" sx={{ mt: 2 }}>
                                                        <Typography variant="caption">
                                                            <strong>Last Date:</strong> {scheme.lastDate}
                                                        </Typography>
                                                    </Alert>
                                                )}
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>

                                    {scheme.category && (
                                        <Box mt={2}>
                                            <Chip
                                                icon={categoryIcons[scheme.category] || <CategoryIcon />}
                                                label={scheme.category}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </Box>
                                    )}
                                </CardContent>

                                {(scheme.link || scheme.officialLink) && (
                                    <CardActions>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            href={scheme.link || scheme.officialLink}
                                            target="_blank"
                                            endIcon={<LaunchIcon />}
                                        >
                                            Apply Now
                                        </Button>
                                    </CardActions>
                                )}
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Application Process Section */}
            <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    How to Apply for Government Schemes
                </Typography>
                
                <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 3 }}>
                    {applySteps.map((step, index) => (
                        <Step key={step.step} expanded>
                            <StepLabel
                                onClick={() => setActiveStep(index)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {step.title}
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <Typography variant="body2" color="text.secondary">
                                    {step.description}
                                </Typography>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            {/* Quick Links */}
            <Box mt={4}>
                <Alert severity="info">
                    <Typography variant="body1" gutterBottom>
                        <strong>Important Links:</strong>
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
                        <Button
                            variant="outlined"
                            size="small"
                            href="https://pmkisan.gov.in"
                            target="_blank"
                        >
                            PM-KISAN Portal
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            href="https://pmfby.gov.in"
                            target="_blank"
                        >
                            PMFBY Portal
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            href="https://enam.gov.in"
                            target="_blank"
                        >
                            e-NAM Portal
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            href="https://india.gov.in/category/agriculture-rural-environment"
                            target="_blank"
                        >
                            All Schemes
                        </Button>
                    </Box>
                </Alert>
            </Box>
        </Container>
    );
}

export default GovernmentSchemes;