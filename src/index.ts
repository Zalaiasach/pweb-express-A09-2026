import express from 'express';
import type { Request, Response } from 'express';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint /health
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: true,
    message: 'Server MLBB Shop berjalan dengan baik',
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});