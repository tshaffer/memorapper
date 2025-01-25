import { Router } from 'express';
import {
  addReviewsFromFileHandler,
  getPlaces,
  healthHandler,
  testHandler,
  getNewRestaurants,
  submitNewRestaurantHandler,
  getDiningGroups,
  getDiners,
  getDinerRestaurantReviews,
  previewHandler,
  getVisitReviews,
  getReviewedRestaurants,
  chatHandler,
  searchAndFilterHandler,
  deleteRestaurantHandler,
} from '../controllers';
import { reviewHandler } from '../controllers/review';

const router = Router();

router.get('/health', healthHandler);
router.get('/test', testHandler);
router.get('/places', getPlaces);
router.get('/newRestaurants', getNewRestaurants);

router.post('/reviews/addReviewsFromFile', addReviewsFromFileHandler);

router.post('/submitNewRestaurant', submitNewRestaurantHandler);
router.post('/deleteRestaurant', deleteRestaurantHandler);


router.get('/diningGroups', getDiningGroups);
router.get('/diners', getDiners);
router.get('/visitReviews', getVisitReviews);
router.get('/dinerRestaurantReviews', getDinerRestaurantReviews);
router.get('/reviewedRestaurants', getReviewedRestaurants);

router.post('/preview', previewHandler);
router.post('/review', reviewHandler);
router.post('/chat', chatHandler);
router.post('/searchAndFilter', searchAndFilterHandler);

export default router;
