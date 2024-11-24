import { Router } from 'express';
import { addReviewsFromFileHandler, chatReviewHandler, checkTextSimilarityHandler, filterReviewsHandler, getPlaces, getReviews, getStandardizedNames, healthHandler, naturalLanguageQueryHandler, previewReviewHandler, submitReviewHandler, testHandler } from '../controllers';

const router = Router();

// Example route using OpenAI
router.get('/health', healthHandler);
router.get('/test', testHandler);
router.get('/places', getPlaces);
router.get('/reviews', getReviews);
router.get('/standardizedNames', getStandardizedNames);
router.post('/reviews/preview', previewReviewHandler);
router.post('/reviews/chat', chatReviewHandler);
router.post('/reviews/submit', submitReviewHandler);
router.post('/reviews/naturalLanguageQuery', naturalLanguageQueryHandler);
router.post('/reviews/filterReviews', filterReviewsHandler);
router.post('/reviews/addReviewsFromFile', addReviewsFromFileHandler);
router.post('/checkTextSimilarity', checkTextSimilarityHandler);

export default router;
