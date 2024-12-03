import { Router } from 'express';
import { addReviewsFromFileHandler, chatReviewHandler, checkTextSimilarityHandler, getPlaces, getReviews, getStandardizedNames, healthHandler, previewReviewHandler, submitReviewHandler, testHandler } from '../controllers';
import { unifiedQueryHandler } from '../controllers/unifiedQuery';
import { calculateTextSimilarities } from '../controllers/calculateTextSimilarities';


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
router.post('/reviews/addReviewsFromFile', addReviewsFromFileHandler);
router.post('/checkTextSimilarity', checkTextSimilarityHandler);

router.post('/reviews/unifiedQuery', unifiedQueryHandler);

router.get("/text-similarities", calculateTextSimilarities);

export default router;
