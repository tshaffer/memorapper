import { Router } from 'express';
import {
  addReviewsFromFileHandler,
  getPlaces,
  healthHandler,
  testHandler,
  getDesiredRestaurants,
  submitDesiredRestaurantHandler,
  getDiningGroups,
  getDiners,
  getDinerRestaurantReviews,
  previewHandler,
  getVisitReviews,
  getRestaurantReviews,
  chatHandler,
  searchAndFilterHandler,
} from '../controllers';
import { reviewHandler } from '../controllers/review';

const router = Router();

router.get('/health', healthHandler);
router.get('/test', testHandler);
router.get('/places', getPlaces);
router.get('/desiredRestaurants', getDesiredRestaurants);

router.post('/reviews/addReviewsFromFile', addReviewsFromFileHandler);

router.post('/submitDesiredRestaurant', submitDesiredRestaurantHandler);


router.get('/diningGroups', getDiningGroups);
router.get('/diners', getDiners);
router.get('/visitReviews', getVisitReviews);
router.get('/dinerRestaurantReviews', getDinerRestaurantReviews);
router.get('/restaurantReviews', getRestaurantReviews);

router.post('/preview', previewHandler);
router.post('/review', reviewHandler);
router.post('/chat', chatHandler);
router.post('/searchAndFilter', searchAndFilterHandler);

export default router;
