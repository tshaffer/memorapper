import { useState } from "react";
import '../styles/multiPanelStyles.css';
import ReviewFormPanel from "./ReviewFormPanel";
import ReviewPreviewPanel from "./ReviewPreviewPanel";
import ReviewChatPanel from "./ReviewChatPanel";
import { Button } from "@mui/material";
import { ChatRequestBody, ChatResponse, FreeformReviewProperties, GooglePlace, ReviewData, StructuredReviewProperties, SubmitReviewBody, WouldReturn } from "../types";

const MultiPanelReviewForm = () => {

  const initialReviewData: ReviewData = {
    place: null,
    reviewText: '',
    dateOfVisit: '',
    wouldReturn: null,
    itemReviews: [],
    reviewer: null,
    sessionId: '',
    restaurantName: '',
    chatHistory: [],
  };

  const [reviewData, setReviewData] = useState<ReviewData>(initialReviewData);
  const resetReviewData = () => setReviewData(initialReviewData);



  const [activeTab, setActiveTab] = useState("form");

  const [googlePlace, setGooglePlace] = useState<GooglePlace | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [wouldReturn, setWouldReturn] = useState<WouldReturn | null>(null); // New state
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

  function handleSetWouldReturn(wouldReturn: WouldReturn | null) {
    setWouldReturn(wouldReturn);
  }

  const handleSetFreeformReviewProperties = (freeformReviewProperties: FreeformReviewProperties) => {
    setFreeformReviewProperties(freeformReviewProperties
    );
  }

  const handleSetSessionId = (sessionId: string) => {
    setSessionId(sessionId);
  }

  const handleReceivedPreviewResponse = () => {
    setActiveTab("preview");
  }

  const handleFormSubmit = async (formData: Omit<ReviewData, 'chatHistory'>) => {
    setReviewData((prev) => ({ ...prev, ...formData }));
    // Call backend API to generate preview data
    const previewResponse = await fetch('/api/generatePreview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const previewData = await previewResponse.json();
    setReviewData((prev) => ({ ...prev, ...previewData }));
  };

  const handleReviewSubmit = async () => {
    // await fetch('/api/submitReview', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(reviewData),
    // });

    const structuredReviewProperties: StructuredReviewProperties = { dateOfVisit: dateOfVisit!, wouldReturn };
    const submitBody: SubmitReviewBody = {
      _id: '', // _id,
      place: reviewData.place!,
      structuredReviewProperties,
      freeformReviewProperties: {
        reviewText: reviewText!,
        itemReviews: reviewData.itemReviews,
        reviewer: reviewData.reviewer ? reviewData.reviewer : undefined
      },
      reviewText: reviewText!,
      sessionId: sessionId!,
    };
    console.log('submitBody:', submitBody);

    const response = await fetch('/api/reviews/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...submitBody,
      }),
    });
    const data = await response.json();
    console.log('Review submitted:', data);

    resetReviewData(); // Reset data after successful submission
  };

  const handleChatMessage = async (chatInput: string) => {
    const chatRequestBody: ChatRequestBody = {
      userInput: chatInput,
      sessionId: reviewData.sessionId!,
      reviewText: reviewData.reviewText!,
    };
    const response: Response = await fetch('/api/reviews/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatRequestBody),
    });
    const chatResponse: ChatResponse = (await response.json()) as ChatResponse;
    const { freeformReviewProperties, updatedReviewText } = chatResponse;

    setFreeformReviewProperties(freeformReviewProperties);

    setReviewData((prev) => ({
       ...prev, 
       reviewText: updatedReviewText,
       chatHistory: [...reviewData.chatHistory, { role: 'user', message: chatInput }, { role: 'ai', message: freeformReviewProperties }]
      }));
  };

  return (
    <div className="container">
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
            reviewData={reviewData}
            setReviewData={setReviewData}
            onSubmit={handleFormSubmit}
            onReceivedPreviewResponse={handleReceivedPreviewResponse}
          />
        )}
        {activeTab === "preview" && (
          <ReviewPreviewPanel
            reviewData={reviewData}
            onSubmitReview={handleReviewSubmit}
          />
        )}
        {activeTab === "chat" && (
          <ReviewChatPanel
            reviewData={reviewData}
            setReviewData={setReviewData}
            onSendMessage={handleChatMessage}
          />
        )}
      </section>
    </div>
  );
};

export default MultiPanelReviewForm;
