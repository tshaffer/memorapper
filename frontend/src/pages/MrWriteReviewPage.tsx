import { useState } from "react";
import { MrPlaceWithGooglePlace, MrReviewData } from "../types";
import { getFormattedDate } from "../utilities";
import MrReviewEntry from "./MrReviewEntry";
import { useDispatch, useSelector } from 'react-redux';
import { addMrRestaurantReview } from '../redux/memorapperSlice';
import {
  selectAllMrPlacesWithGooglePlaces
} from "../redux/memorapperSelectors";

const MrWriteReviewPage = () => {
  const dispatch = useDispatch();

  const [mrReviewData, setMrReviewData] = useState<MrReviewData>({
    place: null,
    dateOfVisit: getFormattedDate(),
    itemReviews: [],
  });

  const allMrPlacesWithGooglePlaces = useSelector(selectAllMrPlacesWithGooglePlaces);

  const handleAddReview = async () => {
    console.log('Submitting review:', mrReviewData);

    if (!mrReviewData.place || !mrReviewData.place._id) {
      console.error('handleAddReview: No valid place in mrReviewData');
      return;
    }

    const placeId = mrReviewData.place._id;
    const mrPlaceWithGooglePlace: MrPlaceWithGooglePlace | undefined =
      allMrPlacesWithGooglePlaces.find(p => p._id === placeId);

    if (!mrPlaceWithGooglePlace) {
      console.error('handleAddReview: No matching place found for _id:', placeId);
      return;
    }

    if (!mrPlaceWithGooglePlace.googlePlace) {
      console.error('handleAddReview: No googlePlace data found for _id:', placeId);
      return;
    }

    // 1️⃣ Update Redux state immediately
    dispatch(addMrRestaurantReview(mrReviewData));

    // 2️⃣ Send updated MrPlace to backend
    try {
      const response = await fetch('/api/addReview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mrReviewData),
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
};

export default MrWriteReviewPage;
