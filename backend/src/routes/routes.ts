import { Router } from 'express';
import {
  getGooglePlaces,
  healthHandler,
  testHandler,
  searchAndFilterHandler,
  addReviewHandler,
  upsertMrPlaceHandler,
  deletePlaceHandler,
  updateReviewHandler,
  deleteReviewHandler,
  getMrPlacesWithGooglePlaceHandler,
} from '../controllers';

const router = Router();

router.get('/health', healthHandler);
router.get('/test', testHandler);

router.get('/googlePlaces', getGooglePlaces);

router.post('/searchAndFilter', searchAndFilterHandler);

router.get('/mrPlacesWithGooglePlace', getMrPlacesWithGooglePlaceHandler);
router.post('/upsertMrPlace', upsertMrPlaceHandler);
router.post('/deletePlace', deletePlaceHandler);

router.post('/addReview', addReviewHandler);
router.post('/updateReview', updateReviewHandler);
router.post('/deleteReview', deleteReviewHandler);

export default router;
