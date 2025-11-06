require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Create a farmer user first
const createFarmerAndProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    // Check if farmer exists, if not create one
    let farmer = await User.findOne({ email: 'farmer@agrismart.com' });
    
    if (!farmer) {
      const hashedPassword = await bcrypt.hash('farmer123', 10);
      farmer = await User.create({
        name: 'Green Valley Farms',
        email: 'farmer@agrismart.com',
        password: hashedPassword,
        role: 'Farmer',
        contact: '+91 9876543210',
        address: {
          street: 'Farm Road 12',
          village: 'Green Valley',
          district: 'Nashik',
          state: 'Maharashtra',
          zipcode: '422001'
        },
        location: 'Nashik, Maharashtra',
        profileImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500',
        verificationStatus: true,
        rating: 4.5,
        bankDetails: {
          bankName: 'State Bank of India',
          accountNumber: '1234567890',
          ifsc: 'SBIN0001234'
        }
      });
      console.log('✅ Created farmer account: farmer@agrismart.com');
    }

    // Comprehensive product data
    const products = [
      // VEGETABLES
      {
        name: 'Fresh Organic Tomatoes',
        description: 'Farm-fresh organic tomatoes, perfectly ripe and juicy. Rich in vitamins and antioxidants.',
        price: 40,
        category: 'Vegetables',
        subcategory: 'Tomatoes',
        unit: 'kg',
        quantity: 500,
        minimumOrder: 1,
        maximumOrder: 50,
        images: [
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500',
          'https://images.unsplash.com/photo-1561155707-4b5b15c3a255?w=500'
        ],
        organic: true,
        harvestDate: new Date('2024-11-01'),
        location: {
          state: 'Maharashtra',
          district: 'Nashik',
          village: 'Green Valley'
        },
        tags: ['organic', 'fresh', 'local', 'bestseller'],
        quality: 'A',
        bulkPricing: {
          enabled: true,
          price: 28,
          minimumQuantity: 50
        },
        ratings: { average: 4.5, count: 234 },
        views: 1520,
        isFeatured: true,
        seller: farmer._id
      },
      {
        name: 'Premium Potatoes',
        description: 'High-quality potatoes perfect for all cooking needs.',
        price: 30,
        category: 'Vegetables',
        subcategory: 'Root Vegetables',
        unit: 'kg',
        quantity: 800,
        minimumOrder: 2,
        maximumOrder: 100,
        images: [
          'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500'
        ],
        organic: true,
        quality: 'A',
        bulkPricing: {
          enabled: true,
          price: 20,
          minimumQuantity: 50
        },
        ratings: { average: 4.3, count: 567 },
        views: 2341,
        isFeatured: true,
        seller: farmer._id
      },
      {
        name: 'Green Capsicum',
        description: 'Fresh green bell peppers, crunchy and full of flavor.',
        price: 60,
        category: 'Vegetables',
        subcategory: 'Peppers',
        unit: 'kg',
        quantity: 300,
        minimumOrder: 1,
        maximumOrder: 30,
        images: [
          'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500'
        ],
        organic: false,
        quality: 'A',
        tags: ['fresh', 'healthy', 'vitamin-rich'],
        ratings: { average: 4.4, count: 123 },
        seller: farmer._id
      },
      {
        name: 'Fresh Spinach',
        description: 'Nutrient-rich green leafy vegetables, packed with iron.',
        price: 25,
        category: 'Vegetables',
        subcategory: 'Leafy Greens',
        unit: 'kg',
        quantity: 400,
        minimumOrder: 1,
        maximumOrder: 20,
        images: [
          'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500'
        ],
        organic: true,
        quality: 'A',
        tags: ['organic', 'iron-rich', 'fresh'],
        ratings: { average: 4.6, count: 89 },
        seller: farmer._id
      },
      {
        name: 'Fresh Carrots',
        description: 'Sweet and crunchy orange carrots, rich in beta-carotene.',
        price: 35,
        category: 'Vegetables',
        subcategory: 'Root Vegetables',
        unit: 'kg',
        quantity: 600,
        images: [
          'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500'
        ],
        organic: true,
        quality: 'A',
        tags: ['organic', 'vitamin-a', 'sweet'],
        bulkPricing: {
          enabled: true,
          price: 25,
          minimumQuantity: 30
        },
        ratings: { average: 4.7, count: 234 },
        isFeatured: true,
        seller: farmer._id
      },
      {
        name: 'Lady Finger (Okra)',
        description: 'Fresh okra, perfect for making bhindi masala.',
        price: 40,
        category: 'Vegetables',
        subcategory: 'Others',
        unit: 'kg',
        quantity: 300,
        images: [
          'https://images.unsplash.com/photo-1570986268181-04a9d17f054e?w=500'
        ],
        organic: true,
        quality: 'A',
        seller: farmer._id
      },
      {
        name: 'Cucumber',
        description: 'Cool and refreshing cucumbers, perfect for salads.',
        price: 30,
        category: 'Vegetables',
        subcategory: 'Salad Vegetables',
        unit: 'kg',
        quantity: 450,
        images: [
          'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=500'
        ],
        organic: true,
        quality: 'A',
        tags: ['organic', 'hydrating', 'fresh'],
        seller: farmer._id
      },
      {
        name: 'Cauliflower',
        description: 'White, fresh cauliflower heads. Perfect for curries.',
        price: 45,
        category: 'Vegetables',
        subcategory: 'Cruciferous',
        unit: 'piece',
        quantity: 250,
        images: [
          'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500'
        ],
        seller: farmer._id
      },
      {
        name: 'Green Beans',
        description: 'Tender french beans, perfect for stir-fries.',
        price: 50,
        category: 'Vegetables',
        subcategory: 'Beans',
        unit: 'kg',
        quantity: 350,
        images: [
          'https://images.unsplash.com/photo-1569163142320-ed4977ee70ba?w=500'
        ],
        seller: farmer._id
      },
      {
        name: 'Brinjal (Eggplant)',
        description: 'Purple brinjals, glossy and fresh.',
        price: 35,
        category: 'Vegetables',
        subcategory: 'Others',
        unit: 'kg',
        quantity: 400,
        images: [
          'https://images.unsplash.com/photo-1615484477181-ed9d87c63fdf?w=500'
        ],
        seller: farmer._id
      },

      // FRUITS
      {
        name: 'Alphonso Mangoes',
        description: 'King of mangoes - sweet, aromatic Alphonso mangoes from Ratnagiri.',
        price: 250,
        category: 'Fruits',
        subcategory: 'Tropical',
        unit: 'dozen',
        quantity: 200,
        images: [
          'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500'
        ],
        organic: true,
        quality: 'A',
        tags: ['seasonal', 'premium', 'sweet'],
        bulkPricing: {
          enabled: true,
          price: 180,
          minimumQuantity: 10
        },
        ratings: { average: 4.9, count: 567 },
        isFeatured: true,
        seller: farmer._id
      },
      {
        name: 'Fresh Bananas',
        description: 'Ripe yellow bananas, rich in potassium.',
        price: 40,
        category: 'Fruits',
        subcategory: 'Common',
        unit: 'dozen',
        quantity: 500,
        images: [
          'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500'
        ],
        quality: 'A',
        seller: farmer._id
      },
      {
        name: 'Red Apples',
        description: 'Crisp and sweet Kashmiri apples.',
        price: 150,
        category: 'Fruits',
        subcategory: 'Common',
        unit: 'kg',
        quantity: 300,
        images: [
          'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500'
        ],
        organic: true,
        quality: 'A',
        bulkPricing: {
          enabled: true,
          price: 130,
          minimumQuantity: 10
        },
        ratings: { average: 4.6, count: 456 },
        isFeatured: true,
        seller: farmer._id
      },
      {
        name: 'Sweet Oranges',
        description: 'Juicy Nagpur oranges, packed with vitamin C.',
        price: 60,
        category: 'Fruits',
        subcategory: 'Citrus',
        unit: 'kg',
        quantity: 400,
        images: [
          'https://images.unsplash.com/photo-1547514701-42782101795e?w=500'
        ],
        tags: ['vitamin-c', 'juicy'],
        seller: farmer._id
      },
      {
        name: 'Fresh Grapes',
        description: 'Seedless green grapes, sweet and perfect for snacking.',
        price: 80,
        category: 'Fruits',
        subcategory: 'Berries',
        unit: 'kg',
        quantity: 250,
        images: [
          'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500'
        ],
        organic: true,
        quality: 'A',
        seller: farmer._id
      },
      {
        name: 'Watermelon',
        description: 'Large, juicy watermelons perfect for summer.',
        price: 30,
        category: 'Fruits',
        subcategory: 'Melons',
        unit: 'piece',
        quantity: 100,
        images: [
          'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=500'
        ],
        seller: farmer._id
      },
      {
        name: 'Papaya',
        description: 'Ripe papayas, sweet and rich in enzymes.',
        price: 40,
        category: 'Fruits',
        subcategory: 'Tropical',
        unit: 'kg',
        quantity: 200,
        images: [
          'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=500'
        ],
        seller: farmer._id
      },
      {
        name: 'Pomegranate',
        description: 'Ruby red pomegranates, packed with antioxidants.',
        price: 120,
        category: 'Fruits',
        subcategory: 'Others',
        unit: 'kg',
        quantity: 150,
        images: [
          'https://images.unsplash.com/photo-1615485925645-d0c9d6e9c5a7?w=500'
        ],
        organic: true,
        quality: 'A',
        isFeatured: true,
        seller: farmer._id
      },
      {
        name: 'Strawberries',
        description: 'Fresh strawberries from Mahabaleshwar.',
        price: 200,
        category: 'Fruits',
        subcategory: 'Berries',
        unit: 'piece',
        quantity: 100,
        images: [
          'https://images.unsplash.com/photo-1543158266-4fe88b408ee5?w=500'
        ],
        organic: true,
        quality: 'A',
        isFeatured: true,
        seller: farmer._id
      },
      {
        name: 'Pineapple',
        description: 'Sweet and tangy pineapples.',
        price: 50,
        category: 'Fruits',
        subcategory: 'Tropical',
        unit: 'piece',
        quantity: 180,
        images: [
          'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=500'
        ],
        seller: farmer._id
      },

      // GRAINS & PULSES
      {
        name: 'Basmati Rice',
        description: 'Long grain aromatic basmati rice, aged for perfect texture.',
        price: 150,
        category: 'Grains',
        subcategory: 'Rice',
        unit: 'kg',
        quantity: 1000,
        images: [
          'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500'
        ],
        organic: true,
        quality: 'A',
        bulkPricing: {
          enabled: true,
          price: 120,
          minimumQuantity: 50
        },
        ratings: { average: 4.6, count: 789 },
        seller: farmer._id
      },
      {
        name: 'Wheat Flour (Atta)',
        description: 'Whole wheat flour, freshly ground.',
        price: 40,
        category: 'Grains',
        subcategory: 'Flour',
        unit: 'kg',
        quantity: 800,
        images: [
          'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500'
        ],
        seller: farmer._id
      },
      {
        name: 'Toor Dal',
        description: 'Premium quality toor dal for daily cooking.',
        price: 120,
        category: 'Pulses',
        subcategory: 'Lentils',
        unit: 'kg',
        quantity: 600,
        images: [
          'https://images.unsplash.com/photo-1613518082212-1414e8c69de4?w=500'
        ],
        organic: true,
        quality: 'A',
        seller: farmer._id
      },
      {
        name: 'Moong Dal',
        description: 'Split green gram, perfect for dal preparations.',
        price: 140,
        category: 'Pulses',
        subcategory: 'Lentils',
        unit: 'kg',
        quantity: 500,
        images: [
          'https://images.unsplash.com/photo-1609501676664-f50f8730e1e9?w=500'
        ],
        seller: farmer._id
      },
      {
        name: 'Chana Dal',
        description: 'Split chickpeas, versatile pulse for various dishes.',
        price: 100,
        category: 'Pulses',
        subcategory: 'Lentils',
        unit: 'kg',
        quantity: 550,
        images: [
          'https://images.unsplash.com/photo-1613545319748-5f2e7ce89c48?w=500'
        ],
        seller: farmer._id
      }
    ];

    // Insert all products
    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    console.log('\n📊 Product Summary:');
    console.log('- Vegetables:', products.filter(p => p.category === 'Vegetables').length);
    console.log('- Fruits:', products.filter(p => p.category === 'Fruits').length);
    console.log('- Grains:', products.filter(p => p.category === 'Grains').length);
    console.log('- Pulses:', products.filter(p => p.category === 'Pulses').length);
    
    console.log('\n✅ Seed completed successfully!');
    console.log('📧 Farmer login: farmer@agrismart.com / farmer123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seed function
createFarmerAndProducts();
