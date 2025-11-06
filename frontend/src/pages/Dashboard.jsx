import React, { useEffect, useState } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  CloudQueue,
  Agriculture,
  LocalFlorist,
  Warning,
  WaterDrop,
  AttachMoney,
  Refresh,
  Notifications,
  Park as EcoIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import weatherService from '../services/weather.service';
import soilService from '../services/soil.service';
import diseaseService from '../services/disease.service';
import orderService from '../services/order.service';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    weather: null,
    soilHealth: null,
    recentScans: [],
    recentOrders: [],
    alerts: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [weatherData, soilData, scansData, ordersData] = await Promise.all([
        weatherService.getForecast(user?.location).catch(() => null),
        soilService.getSoilHealthAnalysis().catch(() => null),
        diseaseService.getMyScans({ page: 1, limit: 3 }).catch(() => null),
        user?.role === 'Farmer' 
          ? Promise.resolve(null)
          : orderService.getMyOrders({ page: 1, limit: 3 }).catch(() => null)
      ]);

      // Backend returns: { status: 'success', statusCode: 200, data: {...}, message: '...' }
      setDashboardData({
        weather: weatherData?.status === 'success' 
          ? (weatherData.data?.weather || weatherData.data)
          : null,
        soilHealth: soilData?.status === 'success'
          ? (soilData.data?.analysis || soilData.data)
          : null,
        recentScans: scansData?.status === 'success'
          ? (scansData.data?.scans || scansData.data || [])
          : [],
        recentOrders: ordersData?.status === 'success'
          ? (ordersData.data?.orders || ordersData.data || [])
          : [],
        alerts: weatherData?.status === 'success' && weatherData.data?.weather?.alerts
          ? weatherData.data.weather.alerts
          : weatherData?.status === 'success' && weatherData.data?.alerts
          ? weatherData.data.alerts
          : []
      });
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, onClick }) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 4
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            <Icon />
          </Avatar>
          {onClick && (
            <Tooltip title="View Details">
              <IconButton size="small">
                <TrendingUp />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Typography color="textSecondary" gutterBottom variant="body2">
          {title}
        </Typography>
        <Typography variant="h4" component="div" fontWeight="bold">
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="textSecondary" mt={1}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const WeatherWidget = () => {
    const weather = dashboardData.weather;
    if (!weather) return null;

    return (
      <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Weather Forecast
          </Typography>
          <IconButton onClick={loadDashboardData} size="small">
            <Refresh />
          </IconButton>
        </Box>
        
        <Box display="flex" alignItems="center" gap={3}>
          <CloudQueue sx={{ fontSize: 64, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3">
              {Math.round(weather.current?.temperature || 0)}°C
            </Typography>
            <Typography color="textSecondary">
              {weather.current?.description}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Humidity: {weather.current?.humidity}%
            </Typography>
          </Box>
        </Box>

        {weather.recommendations && (
          <Box mt={3}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Recommendations
            </Typography>
            <Typography variant="body2">
              {weather.recommendations.irrigation}
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  const SoilHealthWidget = () => {
    const soil = dashboardData.soilHealth;
    if (!soil) {
      return (
        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Soil Health
          </Typography>
          <Box textAlign="center" py={4}>
            <EcoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="textSecondary">
              No soil data available
            </Typography>
            <Chip 
              label="Add Soil Data" 
              color="primary" 
              onClick={() => navigate('/soil-health')}
              sx={{ mt: 2 }}
            />
          </Box>
        </Paper>
      );
    }

    const getHealthColor = (score) => {
      if (score >= 80) return 'success.main';
      if (score >= 60) return 'warning.main';
      return 'error.main';
    };

    return (
      <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Soil Health Analysis
        </Typography>
        
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">Health Score</Typography>
            <Typography variant="body2" fontWeight="bold">
              {soil.healthScore}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={soil.healthScore} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              '& .MuiLinearProgress-bar': {
                backgroundColor: getHealthColor(soil.healthScore)
              }
            }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">pH Level</Typography>
            <Typography variant="h6">{soil.parameters?.ph?.value || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">Nitrogen</Typography>
            <Typography variant="h6">{soil.parameters?.nitrogen?.value || 'N/A'}</Typography>
          </Grid>
        </Grid>

        <Box mt={2}>
          <Chip 
            label="View Full Analysis" 
            size="small" 
            onClick={() => navigate('/soil-health')}
          />
        </Box>
      </Paper>
    );
  };

  const RecentActivity = () => {
    const activities = [
      ...dashboardData.recentScans.map(scan => ({
        type: 'scan',
        title: `Disease Scan: ${scan.disease || 'Processing'}`,
        subtitle: `Crop: ${scan.cropType}`,
        time: new Date(scan.createdAt).toLocaleDateString(),
        icon: LocalFlorist,
        color: 'warning.main'
      })),
      ...dashboardData.recentOrders.map(order => ({
        type: 'order',
        title: `Order #${order._id?.slice(-6)}`,
        subtitle: `₹${order.totalAmount} - ${order.status}`,
        time: new Date(order.createdAt).toLocaleDateString(),
        icon: AttachMoney,
        color: 'success.main'
      }))
    ].slice(0, 5);

    if (activities.length === 0) {
      return (
        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Recent Activity
          </Typography>
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">
              No recent activity
            </Typography>
          </Box>
        </Paper>
      );
    }

    return (
      <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Recent Activity
        </Typography>
        <List>
          {activities.map((activity, index) => (
            <ListItem key={index} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: activity.color }}>
                  <activity.icon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={activity.title}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {activity.subtitle}
                    </Typography>
                    {' — '}
                    {activity.time}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's what's happening with your farm today
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Soil Health"
            value={dashboardData.soilHealth?.healthScore ? `${dashboardData.soilHealth.healthScore}%` : 'N/A'}
            subtitle={dashboardData.soilHealth?.healthStatus || 'Add soil data'}
            icon={EcoIcon}
            color="success.main"
            onClick={() => navigate('/soil-health')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Alerts"
            value={dashboardData.alerts.length}
            subtitle="Weather & pest alerts"
            icon={Warning}
            color="warning.main"
            onClick={() => navigate('/pest-alerts')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Disease Scans"
            value={dashboardData.recentScans.length}
            subtitle="Recent scans"
            icon={LocalFlorist}
            color="error.main"
            onClick={() => navigate('/plant-detection')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={user?.role === 'Farmer' ? 'Products' : 'Orders'}
            value={user?.role === 'Farmer' ? '0' : dashboardData.recentOrders.length}
            subtitle={user?.role === 'Farmer' ? 'Listed products' : 'Recent orders'}
            icon={AttachMoney}
            color="info.main"
            onClick={() => navigate(user?.role === 'Farmer' ? '/my-products' : '/my-orders')}
          />
        </Grid>

        {/* Weather Widget */}
        <Grid item xs={12} md={6}>
          <WeatherWidget />
        </Grid>

        {/* Soil Health Widget */}
        <Grid item xs={12} md={6}>
          <SoilHealthWidget />
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <RecentActivity />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
