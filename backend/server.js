require('dotenv').config();
const express = require('express');
const cors = require('cors');
const opportunitiesRouter = require('./routes/opportunities');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/opportunities', opportunitiesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Research Portal API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to University Research Opportunity Portal API',
    endpoints: {
      health: 'GET /api/health',
      opportunities: {
        getAll: 'GET /api/opportunities',
        getOne: 'GET /api/opportunities/:id',
        create: 'POST /api/opportunities',
        update: 'PUT /api/opportunities/:id',
        delete: 'DELETE /api/opportunities/:id',
      },
    },
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
    error: err.message,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Research Portal API running on http://localhost:${PORT}`);
  console.log(`📋 API Documentation: http://localhost:${PORT}/`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
