import { Router } from 'express';
import {
  addReviewsFromFileHandler,
  getGooglePlaces,
  healthHandler,
  testHandler,
  getDiningGroups,
  getDiners,
  getDinerRestaurantReviews,
  previewHandler,
  getVisitReviews,
  getReviewedRestaurants,
  chatHandler,
  searchAndFilterHandler,
  submitPlaceHandler,
  submitNewRestaurantHandler,
  deleteRestaurantHandler,
  getNewRestaurants,
  getPlaces,
  deletePlaceHandler,
} from '../controllers';
import { reviewHandler } from '../controllers/review';

const router = Router();

router.get('/health', healthHandler);
router.get('/test', testHandler);

router.get('/googlePlaces', getGooglePlaces);

router.post('/reviews/addReviewsFromFile', addReviewsFromFileHandler);

router.get('/newRestaurants', getNewRestaurants);
router.post('/submitNewRestaurant', submitNewRestaurantHandler);
router.post('/deleteRestaurant', deleteRestaurantHandler);

router.get('/places', getPlaces);
router.post('/submitPlace', submitPlaceHandler);
router.post('/deletePlace', deletePlaceHandler);

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
