import { Router } from 'express';
import { addReviewsFromFileHandler, chatReviewHandler, filterResultsHandler, getPlaces, getReviews, healthHandler, nlQueryHandler, previewReviewHandler, submitReviewHandler, testHandler } from '../controllers';
import { getUsers, unifiedQueryHandler } from '../controllers';
import { searchAndFilterHandler } from '../controllers/searchAndFilter';

const router = Router();

// Example route using OpenAI
router.get('/health', healthHandler);
router.get('/test', testHandler);
router.get('/places', getPlaces);
router.get('/reviews', getReviews);
router.get('/users', getUsers);

router.post('/reviews/preview', previewReviewHandler);
router.post('/reviews/chat', chatReviewHandler);
router.post('/reviews/submit', submitReviewHandler);
router.post('/reviews/addReviewsFromFile', addReviewsFromFileHandler);

router.post('/reviews/nlQuery', nlQueryHandler);
router.post('/reviews/filterResults', filterResultsHandler);

router.post('/reviews/unifiedQuery', unifiedQueryHandler);

router.post('/reviews/searchAndFilter', searchAndFilterHandler);

export default router;
