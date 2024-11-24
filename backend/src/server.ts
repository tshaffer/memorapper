import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health';

// Load environment variables
dotenv.config();

console.log('environment variables:');
console.log(process.env.OPENAI_API_KEY);
console.log(process.env.MONGODB_URI);
console.log(process.env.PORT);

const app: express.Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', healthRoutes); // Add the health routes under /api

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
