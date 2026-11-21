const bcrypt = require('bcryptjs');
const { db } = require('./db');

const SEED_PRODUCTS = [
  {
    title: "OnePlus Nord CE 4 Lite 5G (8GB RAM, 128GB, Super Silver)",
    brand: "OnePlus",
    category: "Mobiles & Tablets",
    collection: "Smart Home & Kitchen",
    price: 19999,
    mrp: 22999,
    rating: 4.5,
    reviewsCount: 8942,
    flashDeal: 0,
    variants: ["128GB • Silver", "256GB • Mega Blue"],
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
    highlights: ["5500 mAh battery with 80W SUPERVOOC fast charging", "50MP Sony LYT-600 OIS main camera", "120Hz AMOLED display"],
    reviews: [{ user: "Rohan M.", rating: 5, comment: "Super smooth 120Hz screen and fast charging." }]
  },
  {
    title: "Samsung Galaxy Tab S9 FE 10.9-inch WQXGA Wi-Fi Tablet (6GB/128GB)",
    brand: "Samsung",
    category: "Mobiles & Tablets",
    collection: "Work From Home Setup",
    price: 34999,
    mrp: 44999,
    rating: 4.6,
    reviewsCount: 4120,
    flashDeal: 0,
    variants: ["Gray", "Mint"],
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80",
    highlights: ["Includes S Pen in the box", "IP68 water & dust resistant metal design", "90Hz vivid display"],
    reviews: []
  },
  {
    title: "Nothing Phone (2a) Plus 5G (Metallic Grey, 8GB/256GB)",
    brand: "Nothing",
    category: "Mobiles & Tablets",
    collection: "Streetwear & Sneakers",
    price: 25999,
    mrp: 29999,
    rating: 4.4,
    reviewsCount: 3890,
    flashDeal: 0,
    variants: ["Metallic Grey", "Black"],
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
    highlights: ["Signature Glyph Interface LED notifications", "Dual 50MP rear cameras + 50MP front camera", "Clean Nothing OS"],
    reviews: []
  },
  {
    title: "ASUS Vivobook 15 Intel Core i5 13th Gen (16GB RAM/512GB SSD)",
    brand: "ASUS",
    category: "Laptops & Audio",
    collection: "Work From Home Setup",
    price: 48990,
    mrp: 64990,
    rating: 4.4,
    reviewsCount: 3180,
    flashDeal: 0,
    variants: ["16GB / 512GB", "16GB / 1TB"],
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
    highlights: ["13th Gen Intel Core i5 processor", "15.6-inch FHD Anti-Glare display", "Backlit chiclet keyboard"],
    reviews: []
  },
  {
    title: "Sony WH-CH720N Wireless Active Noise Cancelling Headphones",
    brand: "Sony",
    category: "Laptops & Audio",
    collection: "Work From Home Setup",
    price: 8990,
    mrp: 14990,
    rating: 4.6,
    reviewsCount: 5320,
    flashDeal: 0,
    variants: ["Black", "Navy Blue", "White"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    highlights: ["Ultra-lightweight 192g design", "Integrated Processor V1 ANC", "35 hours battery life"],
    reviews: []
  },
  {
    title: "Noise ColorFit Pro 5 AMOLED Bluetooth Calling Smartwatch",
    brand: "Noise",
    category: "Laptops & Audio",
    collection: "Pro Gaming & Fitness",
    price: 3499,
    mrp: 6999,
    rating: 4.4,
    reviewsCount: 12840,
    flashDeal: 1,
    variants: ["Jet Black", "Champagne Gold"],
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    highlights: ["1.85-inch Always-On AMOLED Display", "100+ sports modes", "IP68 water resistance"],
    reviews: []
  },
  {
    title: "Nike Revolution 7 Men's Lightweight Road Running Sneakers",
    brand: "Nike",
    category: "Fashion & Sneakers",
    collection: "Streetwear & Sneakers",
    price: 3195,
    mrp: 3695,
    rating: 4.4,
    reviewsCount: 4110,
    flashDeal: 1,
    variants: ["UK 8", "UK 9", "UK 10"],
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    highlights: ["Soft foam cushioned midsole", "Breathable engineered mesh upper", "Durable rubber traction"],
    reviews: []
  },
  {
    title: "Urban Edge Polarized Aviator UV400 Metal Sunglasses",
    brand: "Urban Edge",
    category: "Fashion & Sneakers",
    collection: "Streetwear & Sneakers",
    price: 1499,
    mrp: 3299,
    rating: 4.3,
    reviewsCount: 2450,
    flashDeal: 1,
    variants: ["Matte Black / Smoke", "Gold / Green"],
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
    highlights: ["100% UV400 polarized glare protection", "Lightweight stainless steel frame"],
    reviews: []
  },
  {
    title: "Vanguard 30L Water-Resistant Laptop & Travel Backpack",
    brand: "Vanguard",
    category: "Fashion & Sneakers",
    collection: "Streetwear & Sneakers",
    price: 1899,
    mrp: 3999,
    rating: 4.5,
    reviewsCount: 6210,
    flashDeal: 0,
    variants: ["Charcoal Grey", "Midnight Navy"],
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
    highlights: ["Padded 16-inch laptop compartment", "Built-in USB charging pass-through port"],
    reviews: []
  },
  {
    title: "Pigeon Healthifry Digital Air Fryer 4.2L (1200W, 360° Air Crisp)",
    brand: "Pigeon",
    category: "Home & Kitchen",
    collection: "Smart Home & Kitchen",
    price: 2799,
    mrp: 5995,
    rating: 4.3,
    reviewsCount: 16400,
    flashDeal: 1,
    variants: ["4.2 Litres"],
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&q=80",
    highlights: ["Uses up to 85% less oil", "Digital LED touch screen with 8 presets"],
    reviews: []
  },
  {
    title: "Prestige Iris Plus 750W Mixer Grinder with 4 Jars",
    brand: "Prestige",
    category: "Home & Kitchen",
    collection: "Smart Home & Kitchen",
    price: 3299,
    mrp: 5495,
    rating: 4.2,
    reviewsCount: 21500,
    flashDeal: 0,
    variants: ["750W Standard"],
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80",
    highlights: ["750W heavy-duty motor", "3 stainless steel jars + 1 juicer jar"],
    reviews: []
  },
  {
    title: "BaristaBrew 15-Bar Espresso & Cappuccino Coffee Maker",
    brand: "BaristaBrew",
    category: "Home & Kitchen",
    collection: "Smart Home & Kitchen",
    price: 7499,
    mrp: 11999,
    rating: 4.6,
    reviewsCount: 1940,
    flashDeal: 0,
    variants: ["Brushed Steel"],
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&q=80",
    highlights: ["15-bar high-pressure Italian pump", "Built-in milk frother steam wand"],
    reviews: []
  },
  {
    title: "AquaGlow Hyaluronic Acid & Vitamin C Hydrating Serum (30ml)",
    brand: "AquaGlow",
    category: "Beauty & Grooming",
    collection: "Smart Home & Kitchen",
    price: 649,
    mrp: 999,
    rating: 4.5,
    reviewsCount: 7820,
    flashDeal: 0,
    variants: ["30ml Dropper"],
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80",
    highlights: ["Deep 24-hour skin hydration", "Dermatologically tested & fragrance-free"],
    reviews: []
  },
  {
    title: "Noir Elixir Eau De Parfum Long-Lasting Woody Citrus (100ml)",
    brand: "Noir",
    category: "Beauty & Grooming",
    collection: "Streetwear & Sneakers",
    price: 2199,
    mrp: 3499,
    rating: 4.6,
    reviewsCount: 3110,
    flashDeal: 0,
    variants: ["100ml EDP"],
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80",
    highlights: ["12-hour projection with bergamot & cedarwood notes", "Crafted glass bottle"],
    reviews: []
  },
  {
    title: "AeroStyle Ionic Ceramic Fast-Dry Hair Dryer (2000W)",
    brand: "AeroStyle",
    category: "Beauty & Grooming",
    collection: "Smart Home & Kitchen",
    price: 1799,
    mrp: 2999,
    rating: 4.4,
    reviewsCount: 4520,
    flashDeal: 0,
    variants: ["Matte Rose Gold", "Obsidian Black"],
    image: "https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=600&q=80",
    highlights: ["Negative ion frizz-control technology", "3 heat + 2 speed settings with cool shot"],
    reviews: []
  },
  {
    title: "IronCore Hex Rubber Coated Dumbbell Pair (5kg x 2 = 10kg)",
    brand: "IronCore",
    category: "Fitness & Sports",
    collection: "Pro Gaming & Fitness",
    price: 1699,
    mrp: 2899,
    rating: 4.6,
    reviewsCount: 5490,
    flashDeal: 0,
    variants: ["5kg Pair (10kg)", "7.5kg Pair (15kg)"],
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80",
    highlights: ["Anti-roll hexagonal rubber heads", "Knurled chrome ergonomic grip"],
    reviews: []
  },
  {
    title: "ZenFlex 6mm High-Density TPE Anti-Slip Yoga & Workout Mat",
    brand: "ZenFlex",
    category: "Fitness & Sports",
    collection: "Pro Gaming & Fitness",
    price: 899,
    mrp: 1799,
    rating: 4.5,
    reviewsCount: 8310,
    flashDeal: 0,
    variants: ["Teal Blue", "Charcoal"],
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80",
    highlights: ["Dual-layer sweat-resistant grip", "Includes free carry strap"],
    reviews: []
  },
  {
    title: "HydroPulse Insulated Stainless Steel Gym Bottle (1000ml)",
    brand: "HydroPulse",
    category: "Fitness & Sports",
    collection: "Pro Gaming & Fitness",
    price: 749,
    mrp: 1299,
    rating: 4.4,
    reviewsCount: 3920,
    flashDeal: 0,
    variants: ["1000ml Matte Black", "1000ml Cyan"],
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80",
    highlights: ["Keeps drinks ice-cold for 24 hours", "Leak-proof flip straw lid"],
    reviews: []
  },
  {
    title: "Atomic Habits by James Clear (International Bestseller Paperback)",
    brand: "Penguin",
    category: "Books & Desk",
    collection: "Work From Home Setup",
    price: 499,
    mrp: 799,
    rating: 4.8,
    reviewsCount: 94210,
    flashDeal: 0,
    variants: ["Paperback", "Hardcover"],
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
    highlights: ["#1 New York Times Bestseller", "Actionable system for building good habits"],
    reviews: []
  },
  {
    title: "KeyForge K2 Wireless Mechanical Keyboard (75% Layout, RGB Backlit)",
    brand: "KeyForge",
    category: "Books & Desk",
    collection: "Work From Home Setup",
    price: 5499,
    mrp: 7999,
    rating: 4.7,
    reviewsCount: 2890,
    flashDeal: 0,
    variants: ["Brown Tactile Switch", "Red Linear Switch"],
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
    highlights: ["Hot-swappable mechanical switches", "Connects up to 3 devices via Bluetooth 5.1 or USB-C"],
    reviews: []
  },
  {
    title: "Lumina Architect LED Desk Lamp with Wireless Phone Charger",
    brand: "Lumina",
    category: "Books & Desk",
    collection: "Work From Home Setup",
    price: 2199,
    mrp: 3699,
    rating: 4.5,
    reviewsCount: 1740,
    flashDeal: 0,
    variants: ["Matte Silver", "Space Black"],
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80",
    highlights: ["5 color temperature modes & eye-care dimming", "Built-in 10W Qi wireless charging pad"],
    reviews: []
  },
  {
    title: "DualSense Wireless Gaming Controller (Cosmic Red Edition)",
    brand: "PlayStation",
    category: "Gaming & Consoles",
    collection: "Pro Gaming & Fitness",
    price: 5990,
    mrp: 6590,
    rating: 4.8,
    reviewsCount: 11200,
    flashDeal: 0,
    variants: ["Cosmic Red", "Midnight Black", "White"],
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80",
    highlights: ["Haptic feedback & adaptive triggers", "Compatible with PS5, PC & Mobile"],
    reviews: []
  },
  {
    title: "HyperStrike 7.1 Surround Sound RGB Gaming Headset with Mic",
    brand: "HyperStrike",
    category: "Gaming & Consoles",
    collection: "Pro Gaming & Fitness",
    price: 3299,
    mrp: 5499,
    rating: 4.5,
    reviewsCount: 4610,
    flashDeal: 0,
    variants: ["Black / Cyan RGB"],
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=600&q=80",
    highlights: ["50mm neodymium drivers", "Detachable noise-cancelling boom mic"],
    reviews: []
  },
  {
    title: "Vortex Pro 16,000 DPI Ultralight Honeycomb Wireless Gaming Mouse",
    brand: "Vortex",
    category: "Gaming & Consoles",
    collection: "Pro Gaming & Fitness",
    price: 2499,
    mrp: 4299,
    rating: 4.6,
    reviewsCount: 3340,
    flashDeal: 0,
    variants: ["Obsidian Black", "Arctic White"],
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=80",
    highlights: ["63g ultralight honeycomb shell", "Lag-free 2.4GHz wireless + braided USB-C"],
    reviews: []
  }
];

function seed() {
  console.log('Seeding SQLite database...');

  // Clear existing items for clean seeding
  db.exec(`
    DELETE FROM products;
    DELETE FROM reviews;
    DELETE FROM coupons;
    DELETE FROM users;
  `);

  // Predictable sample users are only created for local development.
  if (!process.env.VERCEL) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('nexora123', salt);

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `);
    insertUser.run("Alex Mercer", "alex@nexora.in", passwordHash, "shopper");
    insertUser.run("NEXORA Admin", "admin@nexora.in", passwordHash, "admin");
  }

  // Seed Coupons
  const insertCoupon = db.prepare(`
    INSERT INTO coupons (code, discount_percent, max_discount, min_order, active)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertCoupon.run("NEXORA10", 10, 1500, 999, 1);
  insertCoupon.run("WELCOME20", 20, 2000, 1499, 1);
  insertCoupon.run("FESTIVE500", 15, 500, 2499, 1);

  // Seed Products & Reviews
  const insertProd = db.prepare(`
    INSERT INTO products (
      title, brand, category, collection, price, mrp,
      rating, reviews_count, flash_deal, variants_json, image, highlights_json, stock
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRev = db.prepare(`
    INSERT INTO reviews (product_id, user_name, rating, comment)
    VALUES (?, ?, ?, ?)
  `);

  for (const p of SEED_PRODUCTS) {
    const res = insertProd.run(
      p.title,
      p.brand,
      p.category,
      p.collection,
      p.price,
      p.mrp,
      p.rating,
      p.reviewsCount,
      p.flashDeal,
      JSON.stringify(p.variants),
      p.image,
      JSON.stringify(p.highlights),
      45
    );

    const productId = res.lastInsertRowid;
    if (p.reviews && p.reviews.length > 0) {
      for (const r of p.reviews) {
        insertRev.run(productId, r.user, r.rating, r.comment);
      }
    }
  }

  // Local demo wishlist only; production wishlists belong to registered users.
  if (!process.env.VERCEL) {
    const insertWish = db.prepare(`
      INSERT INTO wishlist (user_email, product_id) VALUES (?, ?)
    `);
    insertWish.run("alex@nexora.in", 1);
    insertWish.run("alex@nexora.in", 7);
  }

  console.log(`Seeding complete: ${SEED_PRODUCTS.length} products, demo coupons, and demo accounts created.`);
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
