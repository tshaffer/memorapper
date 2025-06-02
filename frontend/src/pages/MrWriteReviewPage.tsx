import { useState } from "react";
import { GooglePlace, MrReviewData } from "../types";
import { getFormattedDate } from "../utilities";
import MrReviewEntry from "./MrReviewEntry";
import { useDispatch } from 'react-redux';
import { addMrRestaurantReview } from '../redux/memorapperSlice';

const MrWriteReviewPage = () => {

  const dispatch = useDispatch();

  let place: GooglePlace | null = null;

  const initialReviewData: MrReviewData = {
    place,
    placeComments: '',
    dateOfVisit: getFormattedDate(),
    itemReviews: [],
  };

  const [mrReviewData, setMrReviewData] = useState<MrReviewData>(initialReviewData);

  const old_handleAddReview = async () => {
    console.log('Submitting review:', mrReviewData);
    dispatch(addMrRestaurantReview(mrReviewData));
  }

  const handleAddReview = async () => {
    console.log('Submitting review:', mrReviewData);

    // 1️⃣ Update Redux state immediately
    dispatch(addMrRestaurantReview(mrReviewData));

    // 2️⃣ Send updated MrPlace to backend
    if (!mrReviewData.place) {
      console.error('handleAddReview: No place data found in mrReviewData');
      return;
    }

    const updatedPlace = {
      ...mrReviewData.place,
      placeComments: mrReviewData.placeComments,
      mrPlaceReviews: [
        ...(mrReviewData.place.mrPlaceReviews || []),
        {
          dateOfVisit: mrReviewData.dateOfVisit,
          itemReviews: mrReviewData.itemReviews,
        },
      ],
    };

    console.log('Persisting updated place to backend:', updatedPlace);
    try {
      const response = await fetch('/api/updateMrPlace', {
        method: 'POST', // Or 'PUT' if using RESTful convention
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlace),
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
