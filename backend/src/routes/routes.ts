import { Router } from 'express';
import {
  addReviewsFromFileHandler,
  getPlaces,
  healthHandler,
  testHandler,
  getDesiredRestaurants,
  submitDesiredRestaurantHandler,
  getAccounts,
  getAccountUsers,
  getAccountUserInputs,
  previewHandler,
  getAccountPlaceReviews,
  getUserPlaceSummaries,
  chatHandler,
} from '../controllers';
import { reviewHandler } from '../controllers/review';
import { newSearchAndFilterHandler } from '../controllers/newSearchAndFilter';

const router = Router();

router.get('/health', healthHandler);
router.get('/test', testHandler);
router.get('/places', getPlaces);
router.get('/desiredRestaurants', getDesiredRestaurants);

router.post('/reviews/addReviewsFromFile', addReviewsFromFileHandler);

router.post('/submitDesiredRestaurant', submitDesiredRestaurantHandler);


router.get('/accounts', getAccounts);
router.get('/accountUsers', getAccountUsers);
router.get('/accountPlaceReviews', getAccountPlaceReviews);
router.get('/accountUserInputs', getAccountUserInputs);
router.get('/userPlaceSummaries', getUserPlaceSummaries);

router.post('/preview', previewHandler);
router.post('/review', reviewHandler);
router.post('/chat', chatHandler);
router.post('/searchAndFilter', newSearchAndFilterHandler);

export default router;
