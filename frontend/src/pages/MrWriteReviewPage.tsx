import { useState } from "react";
import { GooglePlace, MrReviewData } from "../types";
import { getFormattedDate } from "../utilities";
import MrReviewEntry from "./MrReviewEntry";

const MrWriteReviewPage = () => {

  let place: GooglePlace | null = null;

  const initialReviewData: MrReviewData = {
    place,
    reviewText: '',
    dateOfVisit: getFormattedDate(),
    itemReviews: [],
  };

  const [mrReviewData, setMrReviewData] = useState<MrReviewData>(initialReviewData);

  const handleAddReview = async () => {
    console.log('Submitting review:', mrReviewData);
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
