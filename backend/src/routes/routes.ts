import { Router } from 'express';
import { healthHandler, testHandler } from '../controllers';

const router = Router();

// Example route using OpenAI
router.get('/health', healthHandler);
router.get('/test', testHandler);

export default router;
