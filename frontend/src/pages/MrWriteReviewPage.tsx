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

  const handleAddReview = async () => {
    console.log('Submitting review:', mrReviewData);
    dispatch(addMrRestaurantReview(mrReviewData));

  }

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
