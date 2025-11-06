const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/trends', priceController.getPriceTrends);
router.get('/market', priceController.getMarketPrices);
router.get('/commodity', priceController.getCommodityPrices);
router.get('/predictions/:product', priceController.getPricePredictions);

// Protected routes
router.post('/alerts', verifyToken, priceController.subscribeToPriceAlerts);

module.exports = router;
