import { Router } from 'express';
import {
  getGooglePlaces,
  healthHandler,
  testHandler,
  submitPlaceHandler,
  getPlaces,
  deletePlaceHandler,
  searchAndFilterHandler,
} from '../controllers';

const router = Router();

router.get('/health', healthHandler);
router.get('/test', testHandler);

router.get('/googlePlaces', getGooglePlaces);

router.get('/places', getPlaces);
router.post('/submitPlace', submitPlaceHandler);
router.post('/deletePlace', deletePlaceHandler);

router.post('/searchAndFilter', searchAndFilterHandler);

export default router;
