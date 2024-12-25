import { Router } from 'express';
import { addReviewsFromFileHandler, chatReviewHandler, checkTextSimilarityHandler, filterResultsHandler, getPlaces, getReviews, getStandardizedNames, healthHandler, nlQueryHandler, previewReviewHandler, submitReviewHandler, testHandler } from '../controllers';
import { getUsers, unifiedQueryHandler } from '../controllers';

const router = Router();

// Example route using OpenAI
router.get('/health', healthHandler);
router.get('/test', testHandler);
router.get('/places', getPlaces);
router.get('/reviews', getReviews);
router.get('/users', getUsers);

router.get('/standardizedNames', getStandardizedNames);
router.post('/reviews/preview', previewReviewHandler);
router.post('/reviews/chat', chatReviewHandler);
router.post('/reviews/submit', submitReviewHandler);
router.post('/reviews/addReviewsFromFile', addReviewsFromFileHandler);
router.post('/checkTextSimilarity', checkTextSimilarityHandler);

router.post('/reviews/nlQuery', nlQueryHandler);
router.post('/reviews/filterResults', filterResultsHandler);

router.post('/reviews/unifiedQuery', unifiedQueryHandler);

export default router;
