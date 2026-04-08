const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const prisma = require('./config/prisma');
const { setupNotificationWorker } = require('./utils/notificationWorker');

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8081', 'http://172.24.174.95:8081',
    'http://localhost:8082', 'http://192.168.0.183:8082',
    'http://10.96.23.95:8081', 'https://goatbookapp.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Farm-ID'],
  credentials: true
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Root health check (Render heartbeat)
app.get('/', (req, res) => res.status(200).send('GoatBook API Running'));

// Diagnostic route for DB
app.get('/api/test-db', async (req, res) => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;
    res.json({ status: 'connected', duration: `${duration}ms` });
  } catch (err) {
    res.status(500).json({ status: 'failed', error: err.message });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/breeds', require('./routes/breeds'));
app.use('/api/animals', require('./routes/animals'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/weights', require('./routes/weights'));
app.use('/api/farms', require('./routes/farms'));
app.use('/api/vaccines', require('./routes/vaccines'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/transactions', require('./routes/transactions'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err);
  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: err.message 
  });
});

const PORT = process.env.PORT || 5001; // Avoid port 5000 conflict with macOS AirPlay

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  // Start the notification background service with a delay to ensure port binding on Render
  setTimeout(() => {
    console.log('[Worker] Initiating background service...');
    setupNotificationWorker();
  }, 10000);
});
