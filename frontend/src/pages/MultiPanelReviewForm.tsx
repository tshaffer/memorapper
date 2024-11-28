import { useState } from "react";
import '../styles/multiPanelStyles.css';
import ReviewFormPanel from "./ReviewFormPanel";
import ReviewPreviewPanel from "./ReviewPreviewPanel";
import ReviewChatPanel from "./ReviewChatPanel";
import { Button } from "@mui/material";
import { FreeformReviewProperties, GooglePlace } from "../types";

const MultiPanelReviewForm = () => {
  const [activeTab, setActiveTab] = useState("form");

  const [googlePlace, setGooglePlace] = useState<GooglePlace | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [wouldReturn, setWouldReturn] = useState<boolean | null>(null); // New state
  const [dateOfVisit, setDateOfVisit] = useState('');
  const [freeformReviewProperties, setFreeformReviewProperties] = useState<FreeformReviewProperties | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleTabClick = (tab: any) => {
    setActiveTab(tab);
  };

  const handleSetGooglePlace = (googlePlace: any) => {
    setGooglePlace(googlePlace);
  }

  const handleSetReviewText = (reviewText: string) => {
    setReviewText(reviewText);
  }

  const handleSetDateOfVisit = (dateOfVisit: string) => {
    setDateOfVisit(dateOfVisit);
  }

  function handleSetWouldReturn(wouldReturn: boolean | null) {
    setWouldReturn(wouldReturn);
  }

  const handleSetFreeformReviewProperties = (freeformReviewProperties: FreeformReviewProperties) => {
    setFreeformReviewProperties(freeformReviewProperties
    );
  }

  const handleSetSessionId = (sessionId: string) => {
    setSessionId(sessionId);
  }

  return (
    <div className="container">
      <header>
        <h1>Memorapper Review</h1>
      </header>
      <nav className="tabs">
        <Button
          className={`tab-button ${activeTab === "form" ? "active" : ""}`}
          onClick={() => handleTabClick("form")}
        >
          Form
        </Button>
        <Button
          className={`tab-button ${activeTab === "preview" ? "active" : ""}`}
          onClick={() => handleTabClick("preview")}
        >
          Review Preview
        </Button>
        <Button
          className={`tab-button ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => handleTabClick("chat")}
        >
          Chat
        </Button>
      </nav>
      <section className="tab-content">
        {activeTab === "form" && (
          <ReviewFormPanel
            onSetGooglePlace={handleSetGooglePlace}
            onSetReviewText={handleSetReviewText}
            onSetDateOfVisit={handleSetDateOfVisit}
            onSetWouldReturn={handleSetWouldReturn}
            onSetFreeformReviewProperties={handleSetFreeformReviewProperties}
            onSetSessionId={handleSetSessionId}
          />
        )}
        {activeTab === "preview" && (
          <ReviewPreviewPanel
            place={googlePlace!}
            wouldReturn={wouldReturn}
            dateOfVisit={dateOfVisit}
            reviewText={reviewText}
            freeformReviewProperties={freeformReviewProperties!}
            sessionId={sessionId!}
          />
        )}
        {activeTab === "chat" && (
          <ReviewChatPanel
            sessionId={sessionId!}
            reviewText={reviewText}
            // freeformReviewProperties={freeformReviewProperties!}
           />
        )}
      </section>
    </div>
  );
};

export default MultiPanelReviewForm;
