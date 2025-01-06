import { Router } from 'express';
import { addReviewsFromFileHandler, chatReviewHandler, getFuturePlaces, getFuturePlacesToVisit, getPlaces, getReviews, getUsers, healthHandler, nlQueryHandler, previewReviewHandler, searchAndFilterHandler, submitReviewHandler, testHandler } from '../controllers';
import { submitFuturePlaceHandler } from '../controllers/futurePlaces';

const router = Router();

// Example route using OpenAI
router.get('/health', healthHandler);
router.get('/test', testHandler);
router.get('/places', getPlaces);
router.get('/futurePlaces', getFuturePlaces);
router.get('/futurePlacesToVisit', getFuturePlacesToVisit);
router.get('/reviews', getReviews);
router.get('/users', getUsers);

router.post('/reviews/preview', previewReviewHandler);
router.post('/reviews/chat', chatReviewHandler);
router.post('/reviews/submit', submitReviewHandler);
router.post('/reviews/addReviewsFromFile', addReviewsFromFileHandler);

router.post('/reviews/nlQuery', nlQueryHandler);

router.post('/reviews/searchAndFilter', searchAndFilterHandler);

router.post('/submitFuturePlace', submitFuturePlaceHandler);

export default router;
