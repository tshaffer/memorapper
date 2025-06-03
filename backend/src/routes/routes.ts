import { Router } from 'express';
import {
  getGooglePlaces,
  healthHandler,
  testHandler,
  submitPlaceHandler,
  getPlacesHandler,
  deletePlaceHandler,
  searchAndFilterHandler,
  submitMrPlaceHandler,
  updateMrPlaceHandler,
  getMrPlacesHandler,
  addReviewHandler,
  upsertMrPlaceHandler,
} from '../controllers';

const router = Router();

router.get('/health', healthHandler);
router.get('/test', testHandler);

router.get('/googlePlaces', getGooglePlaces);

// router.get('/places', getPlacesHandler);
// router.post('/submitPlace', submitPlaceHandler);
// router.post('/deletePlace', deletePlaceHandler);

router.post('/searchAndFilter', searchAndFilterHandler);

router.get('/mrPlaces', getMrPlacesHandler);
router.post('/submitMrPlace', submitMrPlaceHandler);
router.post('/updateMrPlace', updateMrPlaceHandler);
router.post('/upsertMrPlace', upsertMrPlaceHandler);
router.post('/addReview', addReviewHandler);
export default router;
