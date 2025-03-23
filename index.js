require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productoRoutes = require('./routes/productoRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://kiosco-frontend.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/productos', productoRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
