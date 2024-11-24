import { Router } from 'express';
import openai from '../services/openai';

const router = Router();

// Example route using OpenAI
router.get('/health', async (req, res) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Use the new supported model
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "Say something about the backend health check" },
            ],
        });

        res.json({
            message: 'Backend is healthy!',
            openaiMessage: completion.choices[0].message?.content,
        });
    } catch (error) {
        console.error('Error with OpenAI:', error);
        res.status(500).json({ error: 'Failed to connect to OpenAI' });
    }
});

export default router;
