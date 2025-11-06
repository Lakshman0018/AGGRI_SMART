import React, { useState, useEffect } from 'react';
import api from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Alert,
  CircularProgress,
  Avatar,
  Fade
} from '@mui/material';
import {
  Science as ScienceIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
  Agriculture as AgricultureIcon
} from '@mui/icons-material';

function SoilHealth() {
  const { isAuthenticated } = useAuth();
  const [soilData, setSoilData] = useState({
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    organicMatter: '',
    moisture: '',
    temperature: ''
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedSoilData, setSavedSoilData] = useState(null);

  // Fetch saved soil data if authenticated
  useEffect(() => {
    const fetchSoilData = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/soil');
        // Backend returns: { status: 'success', statusCode: 200, data: {...}, message: '...' }
        if (response && response.status === 'success' && response.data) {
          const data = response.data;
          setSavedSoilData(data);
          // Pre-fill form if data exists
          if (data.ph) setSoilData(prev => ({ ...prev, ph: data.ph }));
          if (data.nitrogen) setSoilData(prev => ({ ...prev, nitrogen: data.nitrogen }));
          if (data.phosphorus) setSoilData(prev => ({ ...prev, phosphorus: data.phosphorus }));
          if (data.potassium) setSoilData(prev => ({ ...prev, potassium: data.potassium }));
          if (data.organicMatter) setSoilData(prev => ({ ...prev, organicMatter: data.organicMatter }));
          if (data.moisture) setSoilData(prev => ({ ...prev, moisture: data.moisture }));
        }
      } catch (error) {
        console.error('Error fetching soil data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSoilData();
  }, [isAuthenticated]);

  const handleInputChange = (field, value) => {
    setSoilData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      // If authenticated, save to backend
      if (isAuthenticated()) {
        try {
          await api.post('/soil', {
            ph: parseFloat(soilData.ph),
            nitrogen: parseFloat(soilData.nitrogen),
            phosphorus: parseFloat(soilData.phosphorus),
            potassium: parseFloat(soilData.potassium),
            organicMatter: parseFloat(soilData.organicMatter),
            moisture: parseFloat(soilData.moisture)
          });
        } catch (saveError) {
          console.error('Error saving soil data:', saveError);
          // Continue with local analysis even if save fails
        }
      }
    } catch (error) {
      console.error('Error saving soil data:', error);
    }
    
    // Simulate processing time (analysis happens locally)
    setTimeout(() => {
      const toNum = (v) => {
        const n = typeof v === 'string' ? v.trim() : v;
        if (n === '' || n === null || n === undefined) return null;
        const p = parseFloat(n);
        return !isNaN(p) && isFinite(p) ? p : null;
      };

      const ph = toNum(soilData.ph);
      const N = toNum(soilData.nitrogen);
      const P = toNum(soilData.phosphorus);
      const K = toNum(soilData.potassium);
      const OM = toNum(soilData.organicMatter);
      const moisture = toNum(soilData.moisture);

      const scoreForRange = (val, min, max, weight = 1.0) => {
        if (val === null) return 0;
        
        const optimalMid = (min + max) / 2;
        const range = (max - min) / 2;
        
        if (val >= min && val <= max) {
          const distFromMid = Math.abs(val - optimalMid);
          const midScore = 100 - (distFromMid / range * 15);
          return Math.round(midScore * weight);
        }
        
        const dist = val < min ? (min - val) : (val - max);
        const decayRate = 0.03 * (max - min);
        const score = 100 * Math.exp(-dist / decayRate);
        return Math.max(0, Math.round(score * weight));
      };

      const phScore = scoreForRange(ph, 6.0, 7.5);
      const nScore = scoreForRange(N, 20, 40);
      const pScore = scoreForRange(P, 10, 25);
      const kScore = scoreForRange(K, 100, 200);
      const omScore = scoreForRange(OM, 2, 5);
      const mScore = scoreForRange(moisture, 40, 60);

      const subs = [phScore, nScore, pScore, kScore, omScore, mScore];
      const validSubs = subs.filter((s) => Number.isFinite(s));
      const avg = validSubs.length ? Math.round(validSubs.reduce((a, b) => a + b, 0) / validSubs.length) : 0;

      const health = avg >= 85 ? 'Excellent' : avg >= 70 ? 'Good' : avg >= 50 ? 'Fair' : 'Poor';

      const issues = [];
      const recs = [];

      if (ph !== null) {
        if (ph < 6.0) {
          issues.push({ type: 'pH Level - Acidic', severity: ph < 5.5 ? 'High' : 'Medium', description: 'Soil pH is below the optimal range (6.0-7.5).' });
          recs.push('Apply agricultural lime to raise pH into the optimal 6.0–7.0 range.');
        } else if (ph > 7.5) {
          issues.push({ type: 'pH Level - Alkaline', severity: ph > 8.0 ? 'High' : 'Medium', description: 'Soil pH is above the optimal range (6.0-7.5).' });
          recs.push('Incorporate elemental sulfur or acid-forming fertilizers to gently lower pH.');
        }
      }

      const nutrientIssue = (name, val, low, high) => {
        if (val === null) return;
        if (val < low) {
          issues.push({ type: `${name} Deficiency`, severity: val < low * 0.7 ? 'High' : 'Medium', description: `${name} is below the recommended level (${low}-${high} ppm).` });
          if (name === 'Nitrogen') recs.push('Apply a nitrogen source (e.g., urea, ammonium nitrate) and consider split applications.');
          if (name === 'Phosphorus') recs.push('Apply a phosphorus fertilizer (e.g., DAP/TSP) and place near root zone for better uptake.');
          if (name === 'Potassium') recs.push('Apply muriate of potash (MOP) or sulfate of potash (SOP) based on crop sensitivity.');
        } else if (val > high) {
          issues.push({ type: `${name} Excess`, severity: val > high * 1.3 ? 'High' : 'Medium', description: `${name} exceeds the recommended level (${low}-${high} ppm).` });
          recs.push('Avoid over-fertilization; consider leaching/adjusting future applications based on crop removal rates.');
        }
      };

      nutrientIssue('Nitrogen', N, 20, 40);
      nutrientIssue('Phosphorus', P, 10, 25);
      nutrientIssue('Potassium', K, 100, 200);

      if (OM !== null) {
        if (OM < 2) {
          issues.push({ type: 'Low Organic Matter', severity: OM < 1.5 ? 'High' : 'Medium', description: 'Organic matter is below the recommended 2–5% range.' });
          recs.push('Incorporate well-decomposed compost or farmyard manure; use cover crops to build soil carbon.');
        } else if (OM > 5) {
          issues.push({ type: 'High Organic Matter', severity: OM > 7 ? 'High' : 'Low', description: 'Organic matter is above the recommended 2–5% range.' });
          recs.push('Monitor N immobilization and ensure balanced fertilization; avoid excessive organic amendments.');
        }
      }

      if (moisture !== null) {
        if (moisture < 40) {
          issues.push({ type: 'Low Moisture', severity: moisture < 30 ? 'High' : 'Medium', description: 'Soil moisture is below the optimal 40–60% range.' });
          recs.push('Increase irrigation frequency or improve mulching to conserve moisture.');
        } else if (moisture > 60) {
          issues.push({ type: 'High Moisture', severity: moisture > 75 ? 'High' : 'Medium', description: 'Soil moisture is above the optimal 40–60% range.' });
          recs.push('Reduce irrigation or improve drainage (raised beds, organic matter for structure).');
        }
      }

      const npkAvg = Math.round([nScore, pScore, kScore].reduce((a, b) => a + b, 0) / 3);
      const nutrientStatus = {
        score: npkAvg,
        text: npkAvg >= 85 ? 'Excellent' : npkAvg >= 70 ? 'Good' : npkAvg >= 50 ? 'Moderate' : 'Low',
      };

      const cropProfiles = [
        { name: 'Wheat', ph: [6.0, 7.5], moisture: [35, 55], n: [20, 35], p: [12, 20], k: [120, 180], note: 'Prefers neutral pH and moderate moisture.', suitability: 0 },
        { name: 'Rice', ph: [5.0, 7.0], moisture: [60, 85], n: [25, 40], p: [10, 20], k: [80, 150], note: 'Thrives in high moisture conditions.', suitability: 0 },
        { name: 'Tomato', ph: [6.0, 7.0], moisture: [45, 65], n: [25, 35], p: [15, 25], k: [150, 200], note: 'Needs balanced NPK and good drainage.', suitability: 0 },
        { name: 'Potato', ph: [5.0, 6.5], moisture: [50, 70], n: [30, 40], p: [15, 25], k: [140, 200], note: 'Slightly acidic soils are preferred.', suitability: 0 },
      ];

      const suitabilityFor = (profile) => {
        let s = 100;
        let factors = 0;
        
        if (ph !== null) {
          const ps = scoreForRange(ph, profile.ph[0], profile.ph[1]);
          s = (s + ps) / 2;
          factors++;
        }
        if (moisture !== null) {
          const ms = scoreForRange(moisture, profile.moisture[0], profile.moisture[1]);
          s = (s + ms) / 2;
          factors++;
        }
        if (N !== null) {
          const ns = scoreForRange(N, profile.n[0], profile.n[1]);
          s = (s + ns) / 2;
          factors++;
        }
        if (P !== null) {
          const ps = scoreForRange(P, profile.p[0], profile.p[1]);
          s = (s + ps) / 2;
          factors++;
        }
        if (K !== null) {
          const ks = scoreForRange(K, profile.k[0], profile.k[1]);
          s = (s + ks) / 2;
          factors++;
        }
        
        return factors > 0 ? Math.round(s) : 50;
      };

      cropProfiles.forEach(profile => {
        profile.suitability = suitabilityFor(profile);
      });

      cropProfiles.sort((a, b) => b.suitability - a.suitability);
      const suitableCrops = cropProfiles.slice(0, 4).map(crop => ({
        name: crop.name,
        suitability: crop.suitability,
        reason: crop.note,
        icon: '🌱'
      }));

      setAnalysisResult({
        score: avg,
        overallHealth: health,
        nutrientStatus,
        issues,
        recommendations: recs,
        suitableCrops
      });
      
      setIsAnalyzing(false);
    }, 2000);
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'warning.main';
    return 'error.main';
  };

  const getHealthBg = (score) => {
    if (score >= 80) return 'success.light';
    if (score >= 60) return 'warning.light';
    return 'error.light';
  };

  const getSeverityColor = (severity) => {
    if (severity === 'Low') return 'warning';
    if (severity === 'Medium') return 'info';
    return 'error';
  };

  return (
    <Box className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Soil Health <span style={{ color: '#10b981' }}>Analyzer</span>
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
            Analyze your soil composition and get personalized recommendations for optimal crop growth and soil improvement.
          </Typography>
        </Box>

        {/* Input Form */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h5" fontWeight="semibold" textAlign="center" gutterBottom>
            Enter Soil Test Results 🌍
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {[
              { field: 'ph', label: 'pH Level', placeholder: '6.5', ideal: 'Ideal range: 6.0-7.5', type: 'number', step: 0.1, min: 0, max: 14 },
              { field: 'nitrogen', label: 'Nitrogen (ppm)', placeholder: '25', ideal: 'Ideal range: 20-40 ppm', type: 'number' },
              { field: 'phosphorus', label: 'Phosphorus (ppm)', placeholder: '15', ideal: 'Ideal range: 10-25 ppm', type: 'number' },
              { field: 'potassium', label: 'Potassium (ppm)', placeholder: '120', ideal: 'Ideal range: 100-200 ppm', type: 'number' },
              { field: 'organicMatter', label: 'Organic Matter (%)', placeholder: '3.5', ideal: 'Ideal range: 2-5%', type: 'number', step: 0.1 },
              { field: 'moisture', label: 'Moisture (%)', placeholder: '45', ideal: 'Ideal range: 40-60%', type: 'number' },
            ].map((input) => (
              <Grid item xs={12} sm={6} md={4} key={input.field}>
                <TextField
                  fullWidth
                  type={input.type}
                  label={input.label}
                  value={soilData[input.field]}
                  onChange={(e) => handleInputChange(input.field, e.target.value)}
                  placeholder={input.placeholder}
                  inputProps={{ step: input.step, min: input.min, max: input.max }}
                  helperText={input.ideal}
                  variant="outlined"
                />
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" mt={4}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleAnalyze}
              disabled={
                isAnalyzing ||
                !soilData.ph ||
                !soilData.nitrogen ||
                !soilData.phosphorus ||
                !soilData.potassium ||
                !soilData.organicMatter ||
                !soilData.moisture
              }
              startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : <ScienceIcon />}
              sx={{ minWidth: 250, py: 1.5 }}
            >
              {isAnalyzing ? 'Analyzing Soil...' : 'Analyze Soil Health'}
            </Button>
          </Box>
        </Paper>

        {/* Analysis Results */}
        {analysisResult && (
          <Fade in>
            <Box>
              {/* Overall Health Score */}
              <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box textAlign="center" mb={4}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Soil Health Analysis
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: getHealthBg(analysisResult.score),
                      mt: 2,
                    }}
                  >
                    <Typography variant="h3">🌱</Typography>
                    <Box>
                      <Typography variant="h3" fontWeight="bold" color={getHealthColor(analysisResult.score)}>
                        {analysisResult.score}/100
                      </Typography>
                      <Typography variant="h6" fontWeight="semibold">
                        {analysisResult.overallHealth} Health
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Health Indicators */}
                <Grid container spacing={3}>
                  {[
                    { icon: '⚗️', title: 'pH Level', value: soilData.ph || 'N/A', desc: 'Optimal: 6.0-7.5', color: 'info' },
                    { icon: '🌿', title: 'Nutrients', value: analysisResult.nutrientStatus?.text || '—', desc: 'NPK status based on inputs', color: 'success' },
                    { icon: '💧', title: 'Moisture', value: soilData.moisture ? `${soilData.moisture}%` : 'N/A', desc: 'Optimal: 40-60%', color: 'secondary' },
                  ].map((indicator, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Card
                        sx={{
                          bgcolor: `${indicator.color}.light`,
                          borderRadius: 2,
                          textAlign: 'center',
                          p: 2.5,
                          height: '100%',
                        }}
                      >
                        <Typography variant="h4" sx={{ mb: 1 }}>{indicator.icon}</Typography>
                        <Typography variant="h6" fontWeight="semibold" gutterBottom>
                          {indicator.title}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color={`${indicator.color}.main`}>
                          {indicator.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {indicator.desc}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Recommendations & Issues */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={6}>
                  <Paper elevation={4} sx={{ p: 4, borderRadius: 4, height: '100%' }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LightbulbIcon color="warning" /> Recommendations 💡
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 3 }}>
                      {analysisResult.recommendations.map((rec, index) => (
                        <Alert key={index} severity="success" icon={<CheckCircleIcon />}>
                          {rec}
                        </Alert>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} lg={6}>
                  <Paper elevation={4} sx={{ p: 4, borderRadius: 4, height: '100%' }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon color="error" /> Issues Found ⚠️
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 3 }}>
                      {analysisResult.issues.map((issue, index) => (
                        <Alert
                          key={index}
                          severity={issue.severity === 'High' ? 'error' : issue.severity === 'Medium' ? 'warning' : 'info'}
                          icon={<WarningIcon />}
                        >
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Typography fontWeight="semibold">{issue.type}</Typography>
                              <Chip
                                label={issue.severity}
                                color={getSeverityColor(issue.severity)}
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2">{issue.description}</Typography>
                          </Box>
                        </Alert>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              {/* Suitable Crops */}
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
                  Recommended Crops 🌾
                </Typography>
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  {analysisResult.suitableCrops.map((crop, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Card
                        sx={{
                          bgcolor: 'primary.light',
                          borderRadius: 2,
                          textAlign: 'center',
                          height: '100%',
                          transition: 'all 0.3s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4,
                          },
                        }}
                      >
                        <CardContent>
                          <Typography variant="h4" sx={{ mb: 1 }}>{crop.icon}</Typography>
                          <Typography variant="h6" fontWeight="semibold" gutterBottom>
                            {crop.name}
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <LinearProgress
                                variant="determinate"
                                value={crop.suitability}
                                sx={{ flex: 1, height: 8, borderRadius: 1 }}
                                color="primary"
                              />
                              <Typography variant="body2" fontWeight="medium">
                                {crop.suitability}%
                              </Typography>
                            </Stack>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {crop.reason}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Box>
          </Fade>
        )}

        {/* Soil Testing Tips */}
        <Paper elevation={4} sx={{ p: 4, mt: 4, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
            Soil Testing Tips 🧪
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {[
              { icon: '📅', title: 'When to Test', desc: 'Test soil every 2-3 years, preferably in spring or fall before planting.' },
              { icon: '📍', title: 'Sampling Location', desc: 'Take samples from multiple locations and mix them for representative results.' },
              { icon: '🌡️', title: 'Temperature Matters', desc: 'Test soil temperature as it affects nutrient availability and plant growth.' },
              { icon: '💧', title: 'Moisture Level', desc: 'Ensure soil is not too wet or too dry when taking samples.' },
            ].map((tip, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="h4">{tip.icon}</Typography>
                  <Box>
                    <Typography variant="h6" fontWeight="semibold" gutterBottom>
                      {tip.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tip.desc}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default SoilHealth;
