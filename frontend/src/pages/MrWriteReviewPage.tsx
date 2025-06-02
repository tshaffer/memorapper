import { Button, Box } from "@mui/material";
import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { GooglePlace, MrReviewData } from "../types";
import { getFormattedDate } from "../utilities";
import MrReviewEntry from "./MrReviewEntry";

const MrWriteReviewPage = () => {

  const { _id } = useParams<{ _id: string }>();

  let place: GooglePlace | null = null;

  const initialReviewData: MrReviewData = {
    _id: _id ? _id : '',
    place,
    reviewText: '',
    dateOfVisit: getFormattedDate(),
    itemReviews: [],
  };

  const [mrReviewData, setMrReviewData] = useState<MrReviewData>(initialReviewData);

  const [activeTab, setActiveTab] = useState("form");

  const handleAddReview = async () => {
    console.log('Submitting review:', mrReviewData);
  }

  return (
    <div className="container">
      <section className="tab-content">
        {activeTab === "form" && (
          <MrReviewEntry
            mrReviewData={mrReviewData}
            setMrReviewData={setMrReviewData}
            onSubmit={handleAddReview}
          />
        )}
      </section>
    </div>
  );
}

export default MrWriteReviewPage;
