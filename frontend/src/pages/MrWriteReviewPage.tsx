import { useEffect, useState } from "react";
import { MrPlaceWithGooglePlace, MrReviewData } from "../types";
import { getFormattedDate } from "../utilities";
import MrReviewEntry from "./MrReviewEntry";
import { useDispatch, useSelector } from 'react-redux';
import { addMrRestaurantReview, updateMrRestaurantReview } from '../redux/memorapperSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { selectMrPlaces } from "../redux";

const MrWriteReviewPage = () => {

  const { placeId, reviewId } = useParams<{ placeId?: string; reviewId?: string }>();
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const [mrReviewData, setMrReviewData] = useState<MrReviewData>({
    place: null,
    dateOfVisit: getFormattedDate(),
    itemReviews: [],
  });

  const allMrPlacesWithGooglePlaces: MrPlaceWithGooglePlace[] = useSelector(selectMrPlaces);

  useEffect(() => {
    if (!placeId) return;
        
    const place = allMrPlacesWithGooglePlaces.find(p => p._id === placeId);
    if (!place) return;

    if (reviewId) {
      const reviewToEdit = place.restaurantReviews.find(r => r._id === reviewId);
      if (reviewToEdit) {
        setMrReviewData({
          place,
          dateOfVisit: reviewToEdit.dateOfVisit,
          itemReviews: reviewToEdit.itemReviews,
          _id: reviewId, // needed to track for update
        });
      }
    } else {
      setMrReviewData(prev => ({ ...prev, place }));
    }
  }, [placeId, reviewId, allMrPlacesWithGooglePlaces]);

  const handleSaveReview = async () => {
    console.log('Saving review:', mrReviewData);

    const place = mrReviewData.place;
    if (!place || !place._id) {
      console.error('No valid place in mrReviewData');
      return;
    }

    const isEditing = Boolean(mrReviewData._id);

    // 1️⃣ Update Redux
    if (isEditing) {
      dispatch(updateMrRestaurantReview(mrReviewData));
    } else {
      dispatch(addMrRestaurantReview(mrReviewData)); // You may want a new updateMrRestaurantReview action
    }

    // 2️⃣ Save to backend
    try {
      const response = await fetch(isEditing ? `/api/updateReview` : `/api/addReview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mrReviewData),
      });

      const data = await response.json();
      console.log('Review saved to backend:', data);
      navigate('/'); // or back to the place panel
    } catch (error) {
      console.error('Error saving review to backend:', error);
    }
  };

  return (
    <div className="container">
      <section className="tab-content">
        <MrReviewEntry
          mrReviewData={mrReviewData}
          setMrReviewData={setMrReviewData}
          onSubmit={handleSaveReview}
        />
      </section>
    </div>
  );
};

export default MrWriteReviewPage;
