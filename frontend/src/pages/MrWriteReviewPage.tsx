import { useState } from "react";
import { GooglePlace, MrPlaceWithGooglePlace, MrReviewData } from "../types";
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
    dateOfVisit: getFormattedDate(),
    itemReviews: [],
  };

  const [mrReviewData, setMrReviewData] = useState<MrReviewData>(initialReviewData);

  const getMrPlaceWithGooglePlace = (_id: string): MrPlaceWithGooglePlace | undefined => {
    return mrPlacesWithGooglePlaces.find((place) => place._id === _id);
  };

  const handleAddReview = async () => {

    console.log('Submitting review:', mrReviewData);

    if (!mrReviewData.place) {
      console.error('handleAddReview: No place data found in mrReviewData');
      return;
    }

    console.log('handleAddReview: mrReviewData.place._id:', mrReviewData.place._id);

    const mrPlaceWithGooglePlace: MrPlaceWithGooglePlace | undefined = getMrPlaceWithGooglePlace(mrReviewData.place._id!);
    if (!mrPlaceWithGooglePlace) {
      console.error('handleAddReview: No matching place found for _id:', mrReviewData.place._id);
      return;
    }

    if (!mrPlaceWithGooglePlace.googlePlace) {
      console.error('handleAddReview: No googlePlace data found for _id:', mrReviewData.place._id);
      return;
    }

    // 1️⃣ Update Redux state immediately
    dispatch(addMrRestaurantReview(mrReviewData));

    // 2️⃣ Send updated MrPlace to backend

    // update place properties if necessary
    console.log('addReviewRequestBody:', mrReviewData);
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
}

export default MrWriteReviewPage;
