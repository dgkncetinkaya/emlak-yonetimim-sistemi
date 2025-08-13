import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'emlak-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());

// Mock data - Local Storage simulation
const mockData = {
  users: [
    {
      id: 1,
      email: 'admin@emlak.com',
      password: '$2b$10$EnRoVSJ3jTsOeMeyEqeNb.vvfpOXw8xympJV7oNkfYIc6Q7G01uPm', // admin123
      role: 'admin',
      name: 'Admin Kullanıcı'
    },
    {
      id: 2,
      email: 'danışman@emlak.com',
      password: '$2b$10$oXpV6g3WejX/hNOJM1BBeeOpPRdjceO6WDvO5PSl/jm7D8s2I2wFq', // danışman123
      role: 'consultant',
      name: 'Danışman Kullanıcı'
    }
  ],
  properties: [
    {
      id: 1,
      title: 'Lüks Daire Merkezde',
      type: 'apartment',
      price: 1250000,
      area: 120,
      rooms: '3+1',
      address: 'Kadıköy, İstanbul',
      status: 'for_sale',
      description: 'Modern ve lüks daire, merkezi konumda',
      images: ['apartment1.jpg'],
      createdBy: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Satılık Villa Bahçeli',
      type: 'villa',
      price: 3500000,
      area: 250,
      rooms: '4+2',
      address: 'Beykoz, İstanbul',
      status: 'for_sale',
      description: 'Bahçeli villa, doğa içinde',
      images: ['villa1.jpg'],
      createdBy: 2,
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
      preferences: { type: 'apartment', area: 'Kadıköy' },
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
      status: 'scheduled',
      notes: 'İlk görüşme',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

// Helper functions
let nextId = {
  users: 3,
  properties: 3,
  customers: 3,
  appointments: 2
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

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = findUser(email);
    if (!user || user.role !== role) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

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
    console.error(e);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
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
app.get('/api/properties', authenticateToken, async (req, res) => {
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

app.get('/api/properties/:id', authenticateToken, async (req, res) => {
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

app.post('/api/properties', authenticateToken, async (req, res) => {
  try {
    const newProperty = {
      id: nextId.properties++,
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockData.properties.push(newProperty);
    res.status(201).json(newProperty);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to create property' });
  }
});

app.put('/api/properties/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const propertyIndex = mockData.properties.findIndex(p => p.id === id);
    
    if (propertyIndex === -1) return res.status(404).json({ message: 'Property not found' });
    
    const existing = mockData.properties[propertyIndex];
    if (req.user.role === 'consultant' && existing.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    mockData.properties[propertyIndex] = {
      ...existing,
      ...req.body,
      id,
      updatedAt: new Date().toISOString()
    };
    
    res.json(mockData.properties[propertyIndex]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update property' });
  }
});

app.delete('/api/properties/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
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
app.get('/api/customers', authenticateToken, async (req, res) => {
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

app.post('/api/customers', authenticateToken, async (req, res) => {
  try {
    const newCustomer = {
      id: nextId.customers++,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockData.customers.push(newCustomer);
    res.status(201).json(newCustomer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to create customer' });
  }
});

app.put('/api/customers/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const customerIndex = mockData.customers.findIndex(c => c.id === id);
    
    if (customerIndex === -1) return res.status(404).json({ message: 'Customer not found' });
    
    mockData.customers[customerIndex] = {
      ...mockData.customers[customerIndex],
      ...req.body,
      id,
      updatedAt: new Date().toISOString()
    };
    
    res.json(mockData.customers[customerIndex]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update customer' });
  }
});

// Appointments routes
app.get('/api/appointments', authenticateToken, async (req, res) => {
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

app.post('/api/appointments', authenticateToken, async (req, res) => {
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

// Dashboard stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});