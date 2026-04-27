// ============================================================
// seed.js — Populate TechMart database with demo data
// Run: node seed.js
// Fixes: unique SKU generation, dual user roles
// ============================================================

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Category = require('./models/Category');
const Product  = require('./models/Product');
const Customer = require('./models/Customer');
const Order    = require('./models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/techmart';

const CATEGORIES = [
  { name: 'Headphones',  icon: 'ri-headphone-line',  description: 'Gaming headsets & audio gear' },
  { name: 'Gaming Mouse',icon: 'ri-mouse-line',       description: 'Precision gaming mice' },
  { name: 'Keyboards',   icon: 'ri-keyboard-line',    description: 'Mechanical & gaming keyboards' },
  { name: 'Controllers', icon: 'ri-gamepad-line',     description: 'Console & PC controllers' },
  { name: 'Laptops',     icon: 'ri-laptop-line',      description: 'Gaming & productivity laptops' },
  { name: 'Mobiles',     icon: 'ri-smartphone-line',  description: 'Smartphones & accessories' },
  { name: 'Accessories', icon: 'ri-plug-line',        description: 'Cables, hubs & more' },
];

// Each product now has a unique SKU — fixes the duplicate key error
const PRODUCTS = [
  { name:'Gaming Logi G Pro X',     sku:'HDX-001', price:2490,  comparePrice:3600,  stock:45,  rating:4.8, reviewCount:127, brand:'Logitech',    isFeatured:true,  image:'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', category:'Headphones'  },
  { name:'Immersion Xtreme Pro',    sku:'HDX-002', price:1290,  comparePrice:2199,  stock:8,   rating:4.6, reviewCount:98,  brand:'HyperX',      isFeatured:false, image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', category:'Headphones'  },
  { name:'Itan X Gaming Headset',   sku:'HDX-003', price:1080,  comparePrice:1499,  stock:23,  rating:4.5, reviewCount:64,  brand:'SteelSeries', isFeatured:false, image:'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400', category:'Headphones'  },
  { name:'Onyx Predator Elite',     sku:'HDX-004', price:3650,  comparePrice:4200,  stock:12,  rating:4.9, reviewCount:203, brand:'Razer',       isFeatured:true,  image:'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400', category:'Headphones'  },
  { name:'Razer DeathAdder V3',     sku:'MSE-001', price:4199,  comparePrice:5999,  stock:67,  rating:4.9, reviewCount:312, brand:'Razer',       isFeatured:true,  image:'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400', category:'Gaming Mouse' },
  { name:'Logitech G502 X Plus',    sku:'MSE-002', price:7499,  comparePrice:9999,  stock:0,   rating:4.8, reviewCount:189, brand:'Logitech',    isFeatured:false, image:'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400', category:'Gaming Mouse' },
  { name:'SteelSeries Prime Mini',  sku:'MSE-003', price:3299,  comparePrice:4499,  stock:5,   rating:4.6, reviewCount:156, brand:'SteelSeries', isFeatured:false, image:'https://images.unsplash.com/photo-1563297007-0686b7003af7?w=400', category:'Gaming Mouse' },
  { name:'HyperX Pulsefire Haste',  sku:'MSE-004', price:2799,  comparePrice:3499,  stock:34,  rating:4.7, reviewCount:241, brand:'HyperX',      isFeatured:false, image:'https://images.unsplash.com/photo-1602488283247-29bf1f5b148a?w=400', category:'Gaming Mouse' },
  { name:'Corsair K100 RGB',        sku:'KBD-001', price:12999, comparePrice:16999, stock:30,  rating:4.9, reviewCount:412, brand:'Corsair',     isFeatured:true,  image:'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', category:'Keyboards'   },
  { name:'Razer BlackWidow V4',     sku:'KBD-002', price:8499,  comparePrice:10999, stock:14,  rating:4.7, reviewCount:298, brand:'Razer',       isFeatured:false, image:'https://images.unsplash.com/photo-1595044778672-bfd32fe71104?w=400', category:'Keyboards'   },
  { name:'SteelSeries Apex Pro',    sku:'KBD-003', price:14999, comparePrice:18999, stock:9,   rating:4.8, reviewCount:178, brand:'SteelSeries', isFeatured:false, image:'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400', category:'Keyboards'   },
  { name:'Xbox Elite Series 2',     sku:'CTL-001', price:11999, comparePrice:14999, stock:22,  rating:4.9, reviewCount:523, brand:'Microsoft',   isFeatured:true,  image:'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400', category:'Controllers' },
  { name:'DualSense PS5 Edge',      sku:'CTL-002', price:9499,  comparePrice:11999, stock:3,   rating:4.8, reviewCount:389, brand:'Sony',        isFeatured:false, image:'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=400', category:'Controllers' },
  { name:'ASUS ROG Zephyrus G14',   sku:'LPT-001', price:89999, comparePrice:109999,stock:7,   rating:4.9, reviewCount:234, brand:'ASUS',        isFeatured:true,  image:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400', category:'Laptops'     },
  { name:'Razer Blade 15 (2025)',   sku:'LPT-002', price:119999,comparePrice:139999,stock:4,   rating:4.8, reviewCount:156, brand:'Razer',       isFeatured:false, image:'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400', category:'Laptops'     },
  { name:'Samsung Galaxy S25 Ultra',sku:'MOB-001', price:84999, comparePrice:99999, stock:28,  rating:4.7, reviewCount:678, brand:'Samsung',     isFeatured:true,  image:'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400', category:'Mobiles'     },
  { name:'Razer Mouse Pad XXL',     sku:'ACC-001', price:1999,  comparePrice:2999,  stock:100, rating:4.6, reviewCount:445, brand:'Razer',       isFeatured:false, image:'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', category:'Accessories' },
];

const CUSTOMERS = [
  { name:'Arjun Sharma', email:'arjun@example.com', phone:'9876543210', city:'Mumbai',    address:{ street:'12 Marine Drive',     city:'Mumbai',    state:'Maharashtra', zip:'400001' } },
  { name:'Priya Mehta',  email:'priya@example.com', phone:'9876543211', city:'Delhi',     address:{ street:'45 Connaught Place',  city:'Delhi',     state:'Delhi',       zip:'110001' } },
  { name:'Rahul Verma',  email:'rahul@example.com', phone:'9876543212', city:'Bangalore', address:{ street:'8 MG Road',           city:'Bangalore', state:'Karnataka',   zip:'560001' } },
  { name:'Sneha Patel',  email:'sneha@example.com', phone:'9876543213', city:'Chennai',   address:{ street:'22 Anna Salai',       city:'Chennai',   state:'Tamil Nadu',  zip:'600002' } },
  { name:'Vikram Nair',  email:'vikram@example.com',phone:'9876543214', city:'Hyderabad', address:{ street:'9 Banjara Hills',     city:'Hyderabad', state:'Telangana',   zip:'500034' } },
];

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected\n');

    // Drop the problematic SKU unique index if it exists
    try {
      await mongoose.connection.collection('products').dropIndex('sku_1');
      console.log('🗑  Dropped old sku_1 index\n');
    } catch (_) { /* index may not exist — that's fine */ }

    console.log('🧹 Clearing old data...');
    await Promise.all([
      User.deleteMany({}), Category.deleteMany({}),
      Product.deleteMany({}), Customer.deleteMany({}), Order.deleteMany({})
    ]);
    console.log('✅ Cleared\n');

    // Users
    console.log('👤 Creating users...');
    await User.create({ name:'Admin User', email:'admin@techmart.com', password:'Admin@123', role:'admin' });
    await User.create({ name:'Demo User',  email:'user@techmart.com',  password:'User@123',  role:'user'  });
    console.log('   ✅ admin@techmart.com / Admin@123 (role: admin)');
    console.log('   ✅ user@techmart.com  / User@123  (role: user)\n');

    // Categories
    console.log('📂 Creating categories...');
    const catDocs = await Category.insertMany(CATEGORIES);
    const catMap  = Object.fromEntries(catDocs.map(c => [c.name, c._id]));
    console.log(`   ✅ ${catDocs.length} categories\n`);

    // Products — with unique SKUs
    console.log('📦 Creating products...');
    const prods = PRODUCTS.map(p => ({
      name: p.name, sku: p.sku, price: p.price, comparePrice: p.comparePrice,
      stock: p.stock, rating: p.rating, reviewCount: p.reviewCount, brand: p.brand,
      isFeatured: p.isFeatured, image: p.image, isActive: true,
      lowStockAlert: 10, description: `${p.brand} ${p.name} — high-performance gaming gear.`,
      category: catMap[p.category] || null, source: 'manual', tags: [p.brand, p.category],
    }));
    const productDocs = await Product.insertMany(prods);
    console.log(`   ✅ ${productDocs.length} products\n`);

    // Customers
    console.log('👥 Creating customers...');
    const customerDocs = await Customer.insertMany(CUSTOMERS.map(c => ({ ...c, isActive: true })));
    console.log(`   ✅ ${customerDocs.length} customers\n`);

    // Orders
    console.log('🛒 Creating orders...');
    const statuses   = ['Placed','Processing','Shipped','Delivered','Cancelled'];
    const payments   = ['Paid','Pending','Paid','Paid','Refunded'];
    const payMethods = ['UPI','Credit Card','COD','Debit Card','Net Banking'];
    const orders = [];
    for (let i = 0; i < 12; i++) {
      const customer = customerDocs[i % customerDocs.length];
      const prod1    = productDocs[i % productDocs.length];
      const prod2    = productDocs[(i + 3) % productDocs.length];
      const qty1     = Math.floor(Math.random() * 2) + 1;
      const subtotal = prod1.price * qty1 + prod2.price;
      const tax      = Math.round(subtotal * 0.18);
      const shipping = subtotal > 5000 ? 0 : 99;
      const si       = i % statuses.length;
      orders.push({
        orderNumber:    `TM-${new Date().getFullYear()}-${String(i+1).padStart(5,'0')}`,
        customer:       customer._id,
        items: [
          { product: prod1._id, name: prod1.name, price: prod1.price, quantity: qty1 },
          { product: prod2._id, name: prod2.name, price: prod2.price, quantity: 1   },
        ],
        subtotal, tax, shippingCharge: shipping, totalAmount: subtotal + tax + shipping,
        paymentMethod: payMethods[i % payMethods.length], paymentStatus: payments[si],
        status: statuses[si], shippingAddress: customer.address,
        trackingNumber: statuses[si]==='Shipped' ? `TRK${100000+i}` : '',
        createdAt: new Date(Date.now() - (11-i)*86400000),
      });
    }
    await Order.insertMany(orders);
    console.log(`   ✅ ${orders.length} orders\n`);

    console.log('═══════════════════════════════════════════════');
    console.log('🎉 Seeded successfully!\n');
    console.log('🔑 Login credentials:');
    console.log('   Admin → admin@techmart.com / Admin@123');
    console.log('   User  → user@techmart.com  / User@123');
    console.log('\n🚀 Run: npm run dev');
    console.log('═══════════════════════════════════════════════');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
