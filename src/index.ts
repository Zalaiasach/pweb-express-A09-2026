import express from 'express';
import 'dotenv/config';
import heroRoutes from './routes/hero.js';
import skinRoutes from './routes/skin.js';
import playerRoutes from './routes/player.js';
import {
  loggerMiddleware,
  notFoundMiddleware,
  errorHandlerMiddleware,
} from './middleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware bawaan untuk membaca body JSON
app.use(express.json());

// 1. Pasang Logger
app.use(loggerMiddleware);

// 2. Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: true,
    message: 'Server MLBB Shop berjalan dengan baik',
  });
});

// 3. Pasang route Hero & Skin
app.use('/api/heroes', heroRoutes);
app.use('/api/skins', skinRoutes);
app.use('/api/players', playerRoutes);

// 4. Fallback Not Found (404) untuk rute yang tidak terdaftar
app.use(notFoundMiddleware);

// 5. Centralized Error Handler (harus dipasang paling akhir)
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
