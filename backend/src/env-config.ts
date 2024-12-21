// env-config.ts
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

console.log('Environment variables loaded:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);
