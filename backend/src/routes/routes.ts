import { Router } from 'express';
import {
  getGooglePlaces,
  healthHandler,
  testHandler,
  searchAndFilterHandler,
  getMrPlacesHandler,
  addReviewHandler,
  upsertMrPlaceHandler,
  deletePlaceHandler,
  updateReviewHandler,
} from '../controllers';

const router = Router();

router.get('/health', healthHandler);
router.get('/test', testHandler);

router.get('/googlePlaces', getGooglePlaces);

router.post('/searchAndFilter', searchAndFilterHandler);

router.get('/mrPlaces', getMrPlacesHandler);
router.post('/upsertMrPlace', upsertMrPlaceHandler);
router.post('/addReview', addReviewHandler);
router.post('/updateReview', updateReviewHandler);
router.post('/deletePlace', deletePlaceHandler);

export default router;
