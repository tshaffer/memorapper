import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY as string, // Ensure the API key is loaded
});

export default openai;
