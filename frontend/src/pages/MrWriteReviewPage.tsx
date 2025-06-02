import { useState } from "react";
import { GooglePlace, MrPlace, MrPlaceWithGooglePlace, MrReviewData, PlaceType } from "../types";
import { getFormattedDate } from "../utilities";
import MrReviewEntry from "./MrReviewEntry";
import { useDispatch, useSelector } from 'react-redux';
import { addMrRestaurantReview } from '../redux/memorapperSlice';
import { RootState } from "../redux";

const MrWriteReviewPage = () => {

  const { mrPlacesWithGooglePlaces } = useSelector((state: RootState) => state.memorapper);

  const dispatch = useDispatch();

  let place: GooglePlace | null = null;

  const initialReviewData: MrReviewData = {
    place,
    placeComments: '',
    dateOfVisit: getFormattedDate(),
    itemReviews: [],
  };

  const [mrReviewData, setMrReviewData] = useState<MrReviewData>(initialReviewData);

  const getMrPlaceWithGooglePlace = (placeId: string): MrPlaceWithGooglePlace | undefined => {
    return mrPlacesWithGooglePlaces.find((place) => place.placeId === placeId);
  };

  const handleAddReview = async () => {

    console.log('Submitting review:', mrReviewData);

    if (!mrReviewData.place) {
      console.error('handleAddReview: No place data found in mrReviewData');
      return;
    }

    const mrPlaceWithGooglePlace: MrPlaceWithGooglePlace | undefined = getMrPlaceWithGooglePlace(mrReviewData.place.placeId);
    if (!mrPlaceWithGooglePlace) {
      console.error('handleAddReview: No matching place found for placeId:', mrReviewData.place.placeId);
      return;
    }

    if (!mrPlaceWithGooglePlace.googlePlace) {
      console.error('handleAddReview: No googlePlace data found for placeId:', mrReviewData.place.placeId);
      return;
    }

    // 1️⃣ Update Redux state immediately
    dispatch(addMrRestaurantReview(mrReviewData));

    // 2️⃣ Send updated MrPlace to backend

    const updatedPlaceWithGooglePlace: MrPlaceWithGooglePlace = {
      _idPlace: mrReviewData.place._idPlace,
      placeId: mrReviewData.place.placeId,
      googlePlaceId: mrReviewData.place.googlePlaceId || '',
      placeType: mrReviewData.place.placeType,
      placeComments: mrReviewData.placeComments,
      placeRating: mrReviewData.place.placeRating || 0,
      restaurantSpecs: mrReviewData.place.restaurantSpecs,
      restaurantReviews: [
        ...(mrReviewData.place.restaurantReviews || []),
        {
          dateOfVisit: mrReviewData.dateOfVisit,
          itemReviews: mrReviewData.itemReviews,
        },
      ],
      googlePlace: mrPlaceWithGooglePlace.googlePlace,
    };

    console.log('Persisting updated place to backend:', updatedPlaceWithGooglePlace);
    try {
      const response = await fetch('/api/updateMrPlace', {
        method: 'POST', // Or 'PUT' if using RESTful convention
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlaceWithGooglePlace),
      });

      const data = await response.json();
      console.log('Review persisted to backend:', data);
    } catch (error) {
      console.error('Error persisting review to backend:', error);
    }
  };
  return (
    <div className="container">
      <section className="tab-content">
        <MrReviewEntry
          mrReviewData={mrReviewData}
          setMrReviewData={setMrReviewData}
          onSubmit={handleAddReview}
        />
      </section>
    </div>
  );
}

export default MrWriteReviewPage;
