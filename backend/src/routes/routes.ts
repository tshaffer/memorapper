import { Router } from 'express';
import {
  getGooglePlaces,
  healthHandler,
  testHandler,
  submitPlaceHandler,
  getPlacesHandler,
  deletePlaceHandler,
  searchAndFilterHandler,
} from '../controllers';

const router = Router();

router.get('/health', healthHandler);
router.get('/test', testHandler);

router.get('/googlePlaces', getGooglePlaces);

router.get('/places', getPlacesHandler);
router.post('/submitPlace', submitPlaceHandler);
router.post('/deletePlace', deletePlaceHandler);

router.post('/searchAndFilter', searchAndFilterHandler);

export default router;
