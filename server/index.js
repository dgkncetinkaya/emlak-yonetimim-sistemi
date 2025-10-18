import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import subscription routes
import subscriptionRoutes from './routes/subscription.js';
import webhookRoutes from './routes/webhooks.js';
import adminRoutes from './routes/admin.js';
import { webhookQueue, webhookScheduler } from './services/webhookQueue.js';
import dunningScheduler from './services/dunningScheduler.js';
import {
  helmetConfig,
  corsConfig,
  apiRateLimit,
  authRateLimit,
  webhookRateLimit,
  adminRateLimit,
  requestLogger,
  errorHandler,
  securityHeaders,
  sessionSecurity
} from './middleware/security.js';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'emlak-secret-key-2024';

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(corsConfig);
app.use(securityHeaders);
app.use(sessionSecurity);
app.use(requestLogger);

// Body parsing middleware
app.use(express.json());

// Raw body parser for webhooks (must be before express.json())
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// Serve static files from React build
app.use(express.static('build'));

// Subscription and billing routes with rate limiting
app.use('/api/subscription', apiRateLimit, subscriptionRoutes);
app.use('/api/webhooks', webhookRateLimit, webhookRoutes);
app.use('/api/admin', adminRateLimit, adminRoutes);

// Mock data - Local Storage simulation
const mockData = {
  users: [
    {
      id: 1,
      email: 'admin@emlak.com',
      password: '$2b$10$RsEfv5NmgE/kpYMJy8KW5.JqSl/x4ExvHMabWQx7h5q8DPnwH1rBm', // admin123
      role: 'admin',
      name: 'Admin Kullanıcı'
    },
    {
       id: 2,
       email: 'danışman@emlak.com',
       password: '$2b$10$3/XLGNocHr.T.zZzP.V2huM/TMiewYCsbMckkF0nkFtYplvA2B8yW', // danışman123
       role: 'consultant',
       name: 'Danışman Kullanıcı'
     }
  ],
  properties: [
    {
      id: 1,
      title: 'Merkez Mahallesi Lüks 3+1 Daire',
      propertyType: 'apartment',
      price: 850000,
      area: 140,
      rooms: '3+1',
      address: 'Merkez Mahallesi, Bağdat Caddesi No:123, Kadıköy/İstanbul',
      status: 'for_sale',
      description: 'Merkez konumda, deniz manzaralı, asansörlü binada 3+1 lüks daire. Tüm odalar geniş ve ferah. Site içerisinde kapalı otopark, güvenlik ve sosyal tesisler mevcut.',
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
      city: 'İstanbul',
      district: 'Kadıköy',
      neighborhood: 'Merkez Mahallesi',
      deedStatus: 'clear',
      buildingAge: '5',
      createdBy: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Bahçelievler Modern Villa',
      propertyType: 'villa',
      price: 1250000,
      area: 220,
      rooms: '4+2',
      address: 'Bahçelievler Mahallesi, Çamlık Sokak No:45, Bahçelievler/İstanbul',
      status: 'for_sale',
      description: 'Bahçeli, modern mimarili villa. Geniş bahçe, özel otopark, güvenlik sistemi mevcut. Aile yaşamı için ideal.',
      images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
      city: 'İstanbul',
      district: 'Bahçelievler',
      neighborhood: 'Bahçelievler Mahallesi',
      deedStatus: 'clear',
      buildingAge: '2',
      createdBy: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Beşiktaş Merkez Kiralık Daire',
      propertyType: 'apartment',
      price: 12000,
      area: 110,
      rooms: '2+1',
      address: 'Sinanpaşa Mahallesi, Barbaros Bulvarı No:78, Beşiktaş/İstanbul',
      status: 'for_rent',
      description: 'Merkezi konumda, ulaşım imkanları mükemmel, eşyalı kiralık daire. Metro ve otobüs duraklarına yürüme mesafesi.',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
      city: 'İstanbul',
      district: 'Beşiktaş',
      neighborhood: 'Sinanpaşa Mahallesi',
      deedStatus: 'clear',
      buildingAge: '8',
      createdBy: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 4,
      title: 'Sarıyer Deniz Manzaralı Kiralık Villa',
      propertyType: 'villa',
      price: 28000,
      area: 280,
      rooms: '5+2',
      address: 'Tarabya Mahallesi, Sahil Yolu No:156, Sarıyer/İstanbul',
      status: 'for_rent',
      description: 'Boğaz manzaralı, lüks villa. Özel bahçe, havuz, denize sıfır konum. Tatil evi olarak da kullanılabilir.',
      images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
      city: 'İstanbul',
      district: 'Sarıyer',
      neighborhood: 'Tarabya Mahallesi',
      deedStatus: 'clear',
      buildingAge: '3',
      createdBy: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 5,
      title: 'Fatih Tarihi Bölge Eski Daire',
      propertyType: 'apartment',
      price: 450000,
      area: 85,
      rooms: '2+1',
      address: 'Sultanahmet Mahallesi, Divanyolu Caddesi No:234, Fatih/İstanbul',
      status: 'inactive',
      description: 'Tarihi yarımadada yer alan, restore edilmesi gereken eski daire. Yatırım fırsatı.',
      images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
      city: 'İstanbul',
      district: 'Fatih',
      neighborhood: 'Sultanahmet Mahallesi',
      deedStatus: 'clear',
      buildingAge: '45',
      createdBy: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  customers: [
    {
      id: 1,
      name: 'Mehmet Yılmaz',
      phone: '+90 532 123 4567',
      email: 'mehmet@example.com',
      type: 'buyer',
      status: 'active',
      budget: { min: 800000, max: 1500000 },
      preferences: { type: 'apartment', area: 'Kadıköy', rooms: '3+1' },
      assignedAgent: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Ayşe Demir',
      phone: '+90 533 987 6543',
      email: 'ayse@example.com',
      type: 'seller',
      status: 'active',
      propertyId: 1,
      assignedAgent: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Zeynep Şahin',
      phone: '+90 536 234 5678',
      email: 'zeynep@example.com',
      type: 'buyer',
      status: 'active',
      budget: { min: 3000000, max: 4500000 },
      preferences: { type: 'villa', area: 'Göztepe', rooms: '4+2' },
      assignedAgent: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Ali Kaya',
      phone: '+90 535 789 0123',
      email: 'ali@example.com',
      type: 'buyer',
      status: 'active',
      budget: { min: 1500000, max: 2500000 },
      preferences: { type: 'house', area: 'Bahçelievler', rooms: '4+1' },
      assignedAgent: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  appointments: [
    {
      id: 1,
      customerId: 1,
      propertyId: 1,
      agentId: 1,
      date: '2024-01-15',
      time: '14:00',
      type: 'showing',
      status: 'pending',
      notes: 'İlk görüşme',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      customerId: 2,
      propertyId: 2,
      agentId: 1,
      date: '2024-01-16',
      time: '15:30',
      type: 'showing',
      status: 'confirmed',
      notes: 'Villa görüşmesi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      customerId: 3,
      propertyId: 3,
      agentId: 2,
      date: '2024-01-17',
      time: '10:00',
      type: 'showing',
      status: 'completed',
      notes: 'Tamamlanan görüşme',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 4,
      customerId: 4,
      propertyId: 4,
      agentId: 2,
      date: '2024-01-18',
      time: '16:00',
      type: 'showing',
      status: 'postponed',
      notes: 'Ertelenen randevu',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 5,
      customerId: 1,
      propertyId: 5,
      agentId: 1,
      date: '2024-01-19',
      time: '11:30',
      type: 'showing',
      status: 'cancelled',
      notes: 'İptal edilen randevu',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

// Helper functions
let nextId = {
  users: 3,
  properties: 10,
  customers: 5,
  appointments: 6
};

const findUser = (email) => mockData.users.find(u => u.email === email);
const findUserById = (id) => mockData.users.find(u => u.id === id);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Role middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

// Auth routes with rate limiting
app.post('/api/auth/login', authRateLimit, async (req, res) => {
  console.log('🔍 Backend: Login request received', {
    body: req.body,
    headers: req.headers,
    ip: req.ip
  });
  
  try {
    const { email, password, role } = req.body;
    
    console.log('🔍 Backend: Extracted credentials', { email, role, hasPassword: !!password });
    
    if (!email || !password || !role) {
      console.log('❌ Backend: Missing required fields');
      return res.status(400).json({ message: 'Email, şifre ve rol gerekli' });
    }

    const user = findUser(email);
    console.log('🔍 Backend: User lookup result', { found: !!user, userEmail: user?.email, userRole: user?.role });
    
    if (!user || user.role !== role) {
      console.log('❌ Backend: User not found or role mismatch');
      return res.status(401).json({ message: 'Geçersiz kimlik bilgileri' });
    }

    const ok = await bcrypt.compare(password, user.password);
    console.log('🔍 Backend: Password validation', { isValid: ok });
    
    if (!ok) {
      console.log('❌ Backend: Invalid password');
      return res.status(401).json({ message: 'Geçersiz kimlik bilgileri' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Backend: Login successful, sending response');
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (e) {
    console.error('❌ Backend: Login error:', e);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.post('/api/auth/logout', authRateLimit, authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Token validation endpoint
app.get('/api/auth/validate', authRateLimit, authenticateToken, (req, res) => {
  // If we reach here, token is valid (authenticateToken middleware passed)
  res.json({ valid: true, user: req.user });
});

app.get('/api/auth/me', authRateLimit, authenticateToken, async (req, res) => {
  try {
    const user = findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ id: user.id, email: user.email, role: user.role, name: user.name });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Properties routes
app.get('/api/properties', apiRateLimit, authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, minPrice, maxPrice } = req.query;

    let filteredProperties = mockData.properties;

    // Apply filters
    if (type) filteredProperties = filteredProperties.filter(p => p.type === type);
    if (status) filteredProperties = filteredProperties.filter(p => p.status === status);
    if (minPrice) filteredProperties = filteredProperties.filter(p => p.price >= Number(minPrice));
    if (maxPrice) filteredProperties = filteredProperties.filter(p => p.price <= Number(maxPrice));
    if (req.user.role === 'consultant') {
      filteredProperties = filteredProperties.filter(p => p.createdBy === req.user.id);
    }

    const total = filteredProperties.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

    res.json({
      properties: paginatedProperties,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});

app.get('/api/properties/:id', apiRateLimit, authenticateToken, async (req, res) => {
  try {
    const property = mockData.properties.find(p => p.id === Number(req.params.id));
    if (!property) return res.status(404).json({ message: 'Property not found' });
    
    if (req.user.role === 'consultant' && property.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    res.json(property);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch property' });
  }
});

app.post('/api/properties', apiRateLimit, authenticateToken, async (req, res) => {
  try {
    // Input validation
    const { title, propertyType, price, area, rooms, address, status } = req.body;
    
    if (!title || !propertyType || !price || !area || !rooms || !address || !status) {
      return res.status(400).json({ 
        message: 'Gerekli alanlar eksik: title, propertyType, price, area, rooms, address, status' 
      });
    }
    
    if (!['apartment', 'villa', 'house', 'office', 'land', 'commercial'].includes(propertyType)) {
      return res.status(400).json({ 
        message: 'Geçersiz emlak tipi. Geçerli değerler: apartment, villa, house, office, land, commercial' 
      });
    }
    
    if (!['for_sale', 'for_rent', 'sold', 'rented', 'inactive'].includes(status)) {
      return res.status(400).json({ 
        message: 'Geçersiz durum. Geçerli değerler: for_sale, for_rent, sold, rented, inactive' 
      });
    }
    
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ 
        message: 'Fiyat pozitif bir sayı olmalıdır' 
      });
    }
    
    if (typeof area !== 'number' || area <= 0) {
      return res.status(400).json({ 
        message: 'Alan pozitif bir sayı olmalıdır' 
      });
    }
    
    const newProperty = {
      id: nextId.properties++,
      title,
      propertyType,
      price,
      area,
      rooms,
      address,
      status,
      description: req.body.description || '',
      images: req.body.images || [],
      city: req.body.city || '',
      district: req.body.district || '',
      neighborhood: req.body.neighborhood || '',
      deedStatus: req.body.deedStatus || '',
      buildingAge: req.body.buildingAge || '',
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockData.properties.push(newProperty);
    console.log(`✅ New property created: ${newProperty.title} (ID: ${newProperty.id})`);
    res.status(201).json(newProperty);
  } catch (e) {
    console.error('❌ Error creating property:', e);
    res.status(500).json({ message: 'Emlak oluşturulurken hata oluştu' });
  }
});

app.put('/api/properties/:id', apiRateLimit, authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: 'Geçersiz emlak ID' });
    }
    
    const propertyIndex = mockData.properties.findIndex(p => p.id === id);
    
    if (propertyIndex === -1) {
      return res.status(404).json({ message: 'Emlak bulunamadı' });
    }
    
    // Check if user can edit this property
    if (req.user.role === 'consultant' && mockData.properties[propertyIndex].createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Bu emlakı güncelleme yetkiniz yok' });
    }
    
    // Input validation for updated fields
    if (req.body.propertyType && !['apartment', 'villa', 'house', 'office', 'land', 'commercial'].includes(req.body.propertyType)) {
      return res.status(400).json({ 
        message: 'Geçersiz emlak tipi. Geçerli değerler: apartment, villa, house, office, land, commercial' 
      });
    }
    
    if (req.body.status && !['for_sale', 'for_rent', 'sold', 'rented', 'inactive'].includes(req.body.status)) {
      return res.status(400).json({ 
        message: 'Geçersiz durum. Geçerli değerler: for_sale, for_rent, sold, rented, inactive' 
      });
    }
    
    if (req.body.price && (typeof req.body.price !== 'number' || req.body.price <= 0)) {
      return res.status(400).json({ 
        message: 'Fiyat pozitif bir sayı olmalıdır' 
      });
    }
    
    if (req.body.area && (typeof req.body.area !== 'number' || req.body.area <= 0)) {
      return res.status(400).json({ 
        message: 'Alan pozitif bir sayı olmalıdır' 
      });
    }
    
    mockData.properties[propertyIndex] = {
      ...mockData.properties[propertyIndex],
      ...req.body,
      id,
      updatedAt: new Date().toISOString()
    };
    
    console.log(`✅ Property updated: ${mockData.properties[propertyIndex].title} (ID: ${id})`);
    res.json(mockData.properties[propertyIndex]);
  } catch (e) {
    console.error('❌ Error updating property:', e);
    res.status(500).json({ message: 'Emlak güncellenirken hata oluştu' });
  }
});

app.delete('/api/properties/:id', apiRateLimit, authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const propertyIndex = mockData.properties.findIndex(p => p.id === id);
    
    if (propertyIndex === -1) return res.status(404).json({ message: 'Property not found' });
    
    mockData.properties.splice(propertyIndex, 1);
    res.json({ message: 'Property deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to delete property' });
  }
});

// Customers routes
app.get('/api/customers', apiRateLimit, authenticateToken, async (req, res) => {
  try {
    let filteredCustomers = mockData.customers;
    
    if (req.user.role === 'consultant') {
      filteredCustomers = filteredCustomers.filter(c => c.assignedAgent === req.user.id);
    }
    
    res.json(filteredCustomers);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

app.post('/api/customers', apiRateLimit, authenticateToken, async (req, res) => {
  try {
    // Input validation
    const { name, phone, email, type } = req.body;
    
    if (!name || !phone || !email || !type) {
      return res.status(400).json({ 
        message: 'Gerekli alanlar eksik: name, phone, email, type' 
      });
    }
    
    if (!['buyer', 'seller', 'tenant'].includes(type)) {
      return res.status(400).json({ 
        message: 'Geçersiz müşteri tipi. Geçerli değerler: buyer, seller, tenant' 
      });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Geçersiz email formatı' 
      });
    }
    
    // Check if email already exists
    const existingCustomer = mockData.customers.find(c => c.email === email);
    if (existingCustomer) {
      return res.status(409).json({ 
        message: 'Bu email adresi zaten kullanılıyor' 
      });
    }
    
    const newCustomer = {
      id: nextId.customers++,
      ...req.body,
      assignedAgent: req.user.id, // Assign to current user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockData.customers.push(newCustomer);
    console.log(`✅ New customer created: ${newCustomer.name} (ID: ${newCustomer.id})`);
    res.status(201).json(newCustomer);
  } catch (e) {
    console.error('❌ Error creating customer:', e);
    res.status(500).json({ message: 'Müşteri oluşturulurken hata oluştu' });
  }
});

app.put('/api/customers/:id', apiRateLimit, authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: 'Geçersiz müşteri ID' });
    }
    
    const customerIndex = mockData.customers.findIndex(c => c.id === id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ message: 'Müşteri bulunamadı' });
    }
    
    // Check authorization - consultants can only update their own customers
    if (req.user.role === 'consultant' && mockData.customers[customerIndex].assignedAgent !== req.user.id) {
      return res.status(403).json({ message: 'Bu müşteriyi güncelleme yetkiniz yok' });
    }
    
    // Input validation for email if provided
    if (req.body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ 
          message: 'Geçersiz email formatı' 
        });
      }
      
      // Check if email already exists (excluding current customer)
      const existingCustomer = mockData.customers.find(c => c.email === req.body.email && c.id !== id);
      if (existingCustomer) {
        return res.status(409).json({ 
          message: 'Bu email adresi zaten kullanılıyor' 
        });
      }
    }
    
    // Validate customer type if provided
    if (req.body.type && !['buyer', 'seller', 'tenant'].includes(req.body.type)) {
      return res.status(400).json({ 
        message: 'Geçersiz müşteri tipi. Geçerli değerler: buyer, seller, tenant' 
      });
    }
    
    mockData.customers[customerIndex] = {
      ...mockData.customers[customerIndex],
      ...req.body,
      id,
      updatedAt: new Date().toISOString()
    };
    
    console.log(`✅ Customer updated: ${mockData.customers[customerIndex].name} (ID: ${id})`);
    res.json(mockData.customers[customerIndex]);
  } catch (e) {
    console.error('❌ Error updating customer:', e);
    res.status(500).json({ message: 'Müşteri güncellenirken hata oluştu' });
  }
});

// Appointments routes
app.get('/api/appointments', apiRateLimit, authenticateToken, async (req, res) => {
  try {
    let filteredAppointments = mockData.appointments;
    
    if (req.user.role === 'consultant') {
      filteredAppointments = filteredAppointments.filter(a => a.agentId === req.user.id);
    }
    
    res.json(filteredAppointments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

app.post('/api/appointments', apiRateLimit, authenticateToken, async (req, res) => {
  try {
    const newAppointment = {
      id: nextId.appointments++,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockData.appointments.push(newAppointment);
    res.status(201).json(newAppointment);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to create appointment' });
  }
});

// Update appointment status
app.put('/api/appointments/:id', apiRateLimit, authenticateToken, async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const appointmentIndex = mockData.appointments.findIndex(a => a.id === appointmentId);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }
    
    // Update appointment
    mockData.appointments[appointmentIndex] = {
      ...mockData.appointments[appointmentIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json(mockData.appointments[appointmentIndex]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Randevu güncellenemedi' });
  }
});

// AI Matching endpoint
app.post('/api/customers/:id/ai-match', apiRateLimit, authenticateToken, async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const customer = mockData.customers.find(c => c.id === customerId);
    
    if (!customer) {
      return res.status(404).json({ message: 'Müşteri bulunamadı' });
    }

    if (customer.type !== 'buyer') {
      return res.status(400).json({ message: 'AI eşleştirme sadece alıcı müşteriler için kullanılabilir' });
    }

    // AI Matching Algorithm - Basit skor hesaplama sistemi
    const matchedProperties = mockData.properties
      .filter(property => property.status === 'for_sale' || property.status === 'for_rent')
      .map(property => {
        let score = 0;
        let reasons = [];

        // Bütçe uyumluluğu (40% ağırlık)
        if (customer.budget && customer.budget.min && customer.budget.max) {
          if (property.price >= customer.budget.min && property.price <= customer.budget.max) {
            score += 40;
            reasons.push('Bütçe aralığına uygun');
          } else if (property.price <= customer.budget.max * 1.1) {
            score += 25;
            reasons.push('Bütçeye yakın fiyat');
          }
        }

        // Emlak tipi uyumluluğu (25% ağırlık)
        if (customer.preferences && customer.preferences.type) {
          if (property.type === customer.preferences.type) {
            score += 25;
            reasons.push('Tercih edilen emlak tipi');
          }
        }

        // Konum uyumluluğu (20% ağırlık)
        if (customer.preferences && customer.preferences.area) {
          if (property.address.toLowerCase().includes(customer.preferences.area.toLowerCase())) {
            score += 20;
            reasons.push('Tercih edilen bölgede');
          }
        }

        // Oda sayısı uyumluluğu (15% ağırlık)
        if (customer.preferences && customer.preferences.rooms) {
          if (property.rooms === customer.preferences.rooms) {
            score += 15;
            reasons.push('İstenen oda sayısı');
          }
        }

        return {
          property,
          score,
          reasons,
          matchPercentage: Math.min(score, 100)
        };
      })
      .filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // En iyi 10 eşleşme

    res.json({
      customer: {
        id: customer.id,
        name: customer.name,
        preferences: customer.preferences,
        budget: customer.budget
      },
      matches: matchedProperties,
      totalMatches: matchedProperties.length,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ message: 'AI eşleştirme hatası', error: error.message });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', apiRateLimit, authenticateToken, async (req, res) => {
  try {
    const userProperties = req.user.role === 'consultant' 
      ? mockData.properties.filter(p => p.createdBy === req.user.id)
      : mockData.properties;
      
    const userCustomers = req.user.role === 'consultant'
      ? mockData.customers.filter(c => c.assignedAgent === req.user.id)
      : mockData.customers;
      
    const userAppointments = req.user.role === 'consultant'
      ? mockData.appointments.filter(a => a.agentId === req.user.id)
      : mockData.appointments;

    const stats = {
      totalProperties: userProperties.length,
      activeProperties: userProperties.filter(p => p.status === 'for_sale' || p.status === 'for_rent').length,
      totalCustomers: userCustomers.length,
      activeCustomers: userCustomers.filter(c => c.status === 'active').length,
      pendingAppointments: userAppointments.filter(a => a.status === 'scheduled').length,
      monthlyRevenue: 125000,
      recentActivities: [
        { id: 1, type: 'property_added', description: 'Yeni emlak eklendi', time: '2 saat önce' },
        { id: 2, type: 'appointment_scheduled', description: 'Randevu planlandı', time: '4 saat önce' },
        { id: 3, type: 'customer_added', description: 'Yeni müşteri eklendi', time: '6 saat önce' },
      ],
    };

    res.json(stats);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      database: 'connected', // Mock data kullandığımız için always connected
      api: 'operational'
    }
  };
  
  res.status(200).json(healthStatus);
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Error handling// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📝 ${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`❌ ${timestamp} - Error in ${req.method} ${req.path}:`);
  console.error(err.stack);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({ 
    message: err.message || 'Sunucu hatası oluştu',
    ...(isDevelopment && { stack: err.stack })
  });
});// Serve React app for root route only
app.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  } catch (error) {
    res.status(404).send('Page not found');
  }
});

// Serve React app for common routes
app.get('/dashboard', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  } catch (error) {
    res.status(404).send('Page not found');
  }
});

app.get('/login', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  } catch (error) {
    res.status(404).send('Page not found');
  }
});

app.get('/subscription-management', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  } catch (error) {
    res.status(404).send('Page not found');
  }
});

// 404 handler
app.use((req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`⚠️  ${timestamp} - 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'API endpoint bulunamadı' });
});

// Start dunning scheduler
dunningScheduler.start();
console.log('Dunning scheduler started');

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});