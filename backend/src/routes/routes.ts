import { Router } from 'express';
import {
  addReviewsFromFileHandler,
  chatReviewHandler,
  getContributors,
  getContributorInputs,
  getPlaces,
  getReviews,
  getUsers,
  healthHandler,
  nlQueryHandler,
  previewReviewHandler,
  searchAndFilterHandler,
  submitReviewHandler,
  testHandler,
  getVisitedRestaurants,
  getDesiredRestaurants,
  submitDesiredRestaurantHandler,
  getAccounts,
  getAccountUsers,
  getAccountUserInputs,
  previewHandler,
} from '../controllers';
import { reviewHandler } from '../controllers/review';

const router = Router();

router.get('/health', healthHandler);
router.get('/test', testHandler);
router.get('/places', getPlaces);
router.get('/visitedRestaurant', getVisitedRestaurants);
router.get('/desiredRestaurant', getDesiredRestaurants);
router.get('/reviews', getReviews);
router.get('/users', getUsers);
router.get('/contributors', getContributors);
router.get('/contributorInputs', getContributorInputs);

router.post('/reviews/preview', previewReviewHandler);
router.post('/reviews/chat', chatReviewHandler);
router.post('/reviews/submit', submitReviewHandler);
router.post('/reviews/addReviewsFromFile', addReviewsFromFileHandler);

router.post('/submitDesiredRestaurant', submitDesiredRestaurantHandler);

router.post('/reviews/nlQuery', nlQueryHandler);

router.post('/reviews/searchAndFilter', searchAndFilterHandler);

router.get('/accounts', getAccounts);
router.get('/accountUsers', getAccountUsers);
router.get('/accountUserInputs', getAccountUserInputs);
router.post('/preview', previewHandler);
router.post('/review', reviewHandler);

export default router;
