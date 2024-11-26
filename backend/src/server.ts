import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/routes';
import mongoose from 'mongoose';
import path from 'path';

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

// Serve the frontend
const frontendPath = path.resolve(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use('/api', routes);

// // Serve the static files from the build directory
// app.use(express.static(path.join(__dirname, 'dist')));

// // Serve index.html for all other routes (React SPA behavior)
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
