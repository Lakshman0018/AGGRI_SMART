import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI, paymentAPI } from '../api';

const getItemPrice = (priceVal) => {
  if (typeof priceVal === 'number') return priceVal;
  if (typeof priceVal === 'string') {
    return parseFloat(priceVal.replace(/[₹,]/g, '')) || 0;
  }
  return 0;
};

const Payment = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart, shippingAddress, setShippingAddress } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // Initialize local form with saved shipping address and keep it in sync
  useEffect(() => {
    if (shippingAddress) {
      setFormData(prev => ({
        ...prev,
        fullName: shippingAddress.fullName || '',
        email: shippingAddress.email || '',
        phone: shippingAddress.phone || '',
        address: shippingAddress.address || '',
        city: shippingAddress.city || '',
        pincode: shippingAddress.pincode || ''
      }));
    }
  }, [shippingAddress]);

  const deliveryCharge = getCartTotal() >= 500 ? 0 : 40;
  const gst = getCartTotal() * 0.05;
  const finalTotal = getCartTotal() + deliveryCharge + gst;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Also update shared shipping address for relevant fields
    if ([
      'fullName',
      'email',
      'phone',
      'address',
      'city',
      'pincode'
    ].includes(name)) {
      setShippingAddress(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validate shipping address
      if (!formData.fullName || !formData.address || !formData.city || !formData.pincode) {
        alert('Please fill in all shipping address fields');
        setIsProcessing(false);
        return;
      }

      // Create payment intent
      const paymentIntent = await paymentAPI.createPaymentIntent(finalTotal);
      
      // Create order
      const orderData = {
        items: cartItems,
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode
        },
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        total: finalTotal,
        subtotal: getCartTotal(),
        deliveryCharge: deliveryCharge,
        gst: gst
      };

      // Confirm payment
      await paymentAPI.confirmPayment(paymentIntent.data.data.id);
      
      // Create order
      await ordersAPI.createOrder(orderData);
      
      alert('🎉 Payment Successful! Your order has been placed.');
      clearCart();
      setIsProcessing(false);
      navigate('/');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-farm-green-50 via-white to-farm-green-100 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="text-8xl mb-4">🛒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to proceed with checkout</p>
          <button
            onClick={() => navigate('/buy')}
            className="btn-primary px-8 py-3"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-farm-green-50 via-white to-farm-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-farm-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Delivery Information
              </h2>
              {/* Shipping Address Preview */}
              {formData.address && (
                <div className="mb-6 bg-gradient-to-r from-farm-green-50 to-blue-50 border-l-4 border-farm-green-600 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-farm-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                    </svg>
                    Shipping Address
                  </h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-medium">{formData.fullName}</p>
                    <p>{formData.address}</p>
                    <p>{formData.city}, {formData.pincode}</p>
                    <p className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>{formData.phone}</p>
                    <p className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>{formData.email}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                    placeholder="+91 1234567890"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <textarea
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                    placeholder="Enter complete address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                    placeholder="123456"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-farm-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                Payment Method
              </h2>

              {/* Payment Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center transition ${
                    paymentMethod === 'card'
                      ? 'border-farm-green-500 bg-farm-green-50'
                      : 'border-gray-300 hover:border-farm-green-300'
                  }`}
                >
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                  <span className="font-semibold">Credit/Debit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center transition ${
                    paymentMethod === 'upi'
                      ? 'border-farm-green-500 bg-farm-green-50'
                      : 'border-gray-300 hover:border-farm-green-300'
                  }`}
                >
                  <span className="text-3xl mb-2">📱</span>
                  <span className="font-semibold">UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center transition ${
                    paymentMethod === 'cod'
                      ? 'border-farm-green-500 bg-farm-green-50'
                      : 'border-gray-300 hover:border-farm-green-300'
                  }`}
                >
                  <span className="text-3xl mb-2">💵</span>
                  <span className="font-semibold">Cash on Delivery</span>
                </button>
              </div>

              {/* Card Details */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      required
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      maxLength="19"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                    <input
                      type="text"
                      name="cardName"
                      required
                      value={formData.cardName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                      placeholder="Name on card"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                      <input
                        type="text"
                        name="expiryDate"
                        required
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                      <input
                        type="text"
                        name="cvv"
                        required
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI */}
              {paymentMethod === 'upi' && (
                <div className="animate-fade-in space-y-6">
                  {/* QR Code Scanner */}
                  <div className="bg-gradient-to-br from-farm-green-50 to-white p-6 rounded-xl border-2 border-farm-green-200">
                    <h3 className="text-lg font-semibold text-center text-gray-800 mb-4 flex items-center justify-center">
                      <span className="mr-2">📱</span>
                      Scan QR Code to Pay
                    </h3>
                    <div className="flex justify-center mb-4">
                      <div className="bg-white p-4 rounded-lg shadow-lg">
                        <img 
                          src="/images/upi-qr.png" 
                          alt="UPI QR Code" 
                          className="w-64 h-64 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-64 h-64 bg-gray-100 rounded-lg hidden flex-col items-center justify-center text-center p-4">
                          <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
                          </svg>
                          <p className="text-sm text-gray-600">QR Code</p>
                          <p className="text-xs text-gray-500 mt-1">Scan using any UPI app</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        💳 Amount to Pay: <span className="text-xl font-bold text-farm-green-600">₹{(paymentMethod === 'cod' ? finalTotal + 20 : finalTotal).toFixed(2)}</span>
                      </p>
                      <p className="text-xs text-gray-600">Open any UPI app and scan the QR code</p>
                      <div className="flex items-center justify-center space-x-4 pt-2">
                        <span className="text-2xl">📱</span>
                        <span className="text-xs text-gray-500">Google Pay • PhonePe • Paytm • BHIM</span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  {/* Manual UPI ID Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter UPI ID Manually
                    </label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Or scan the QR code above for instant payment
                    </p>
                  </div>
                </div>
              )}

              {/* COD */}
              {paymentMethod === 'cod' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 animate-fade-in">
                  <p className="text-sm text-yellow-800">
                    💵 Please keep exact change ready. Additional ₹20 COD charges will apply.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 animate-slide-up">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cartItems.map((item) => {
                  const price = getItemPrice(item.price);
                  return (
                    <div key={item.id} className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                      <div className="w-12 h-12 bg-gradient-to-br from-farm-green-50 to-farm-green-100 rounded flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                        {item.emoji ? (
                          <span className="select-none">{item.emoji}</span>
                        ) : (
                          <img 
                            src={item.imageUrl || item.image || '/images/vegetables.png'} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentNode.innerText = '🌱';
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-600">
                          {item.quantity} kg × {typeof item.price === 'number' ? `₹${item.price}` : item.price}
                        </p>
                      </div>
                      <p className="font-semibold text-farm-green-600 flex-shrink-0">
                        ₹{(price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery</span>
                  <span className={deliveryCharge === 0 ? 'text-green-600 font-semibold' : ''}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>GST (5%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-gray-700">
                    <span>COD Charges</span>
                    <span>₹20.00</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-300">
                  <span>Total</span>
                  <span className="text-farm-green-600">
                    ₹{(paymentMethod === 'cod' ? finalTotal + 20 : finalTotal).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Place Order</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </span>
                )}
              </button>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                </svg>
                <span>Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
