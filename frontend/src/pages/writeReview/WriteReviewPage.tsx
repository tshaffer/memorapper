import { useState } from 'react';
import '../../styles/multiPanelStyles.css';
import FormTab from "./FormTab";
import PreviewTab from "./PreviewTab";
import ChatTab from "./ChatTab";
import { Button } from "@mui/material";
import { ChatMessage, ChatRequestBody, ChatResponse, EditableReview, GooglePlace, MemoRappReview, PreviewRequestBody, PreviewResponse, ReviewData, StructuredReviewProperties, SubmitReviewBody } from "../../types";
import { getFormattedDate } from "../../utilities";
import { useLocation, useParams } from "react-router-dom";

const MultiPanelReviewForm = () => {

  const { _id } = useParams<{ _id: string }>();
  console.log('MultiPanelReviewForm _id:', _id);
  const location = useLocation();
  const editableReview = location.state as EditableReview | null;

  let place: GooglePlace | null = null;
  let review: MemoRappReview | null = null;
  if (editableReview) {
    place = editableReview.place;
    review = editableReview.review;
  }

  const initialReviewData: ReviewData = {
    _id: _id ? _id : '',
    place,
    restaurantName: place ? place.name : '',
    reviewText: review ? review.freeformReviewProperties.reviewText : '',
    dateOfVisit: getFormattedDate(),
    wouldReturn: review ? review.structuredReviewProperties.wouldReturn : null,
    itemReviews: review ? review.freeformReviewProperties.itemReviews : [],
    reviewer: review ? review.freeformReviewProperties.reviewer : '',
    sessionId: '',
    chatHistory: [],
  };

  const [reviewData, setReviewData] = useState<ReviewData>(initialReviewData);
  const resetReviewData = () => setReviewData(initialReviewData);

  const [activeTab, setActiveTab] = useState("form");

  const handleTabClick = (tab: any) => {
    setActiveTab(tab);
  };

  const handleReceivedPreviewResponse = () => {
    setActiveTab("preview");
  }

  const handleSubmitPreview = async (formData: Omit<ReviewData, 'chatHistory'>) => {
    setReviewData((prev) => ({ ...prev, ...formData }));

    const previewBody: PreviewRequestBody = {
      reviewText: reviewData.reviewText!,
      sessionId: reviewData.sessionId!,
    };
    const response = await fetch('/api/reviews/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(previewBody),
    });
    const data: PreviewResponse = await response.json();
    const chatHistory: ChatMessage[] = reviewData.chatHistory;
    const userChatMessage: ChatMessage = { role: 'user', message: reviewData.reviewText! };
    const aiChatMessage: ChatMessage = { role: 'ai', message: data.freeformReviewProperties };
    chatHistory.push(userChatMessage, aiChatMessage);

    setReviewData((prev) => ({
      ...prev,
      'reviewText': data.freeformReviewProperties.reviewText,
      'itemReviews': data.freeformReviewProperties.itemReviews,
      'reviewer': data.freeformReviewProperties.reviewer,
      'chatHistory': chatHistory,
    }));
  };

  const handleSubmitReview = async () => {
    const structuredReviewProperties: StructuredReviewProperties = { dateOfVisit: reviewData.dateOfVisit!, wouldReturn: reviewData.wouldReturn! };
    const submitBody: SubmitReviewBody = {
      _id: reviewData._id,
      place: reviewData.place!,
      structuredReviewProperties,
      freeformReviewProperties: {
        reviewText: reviewData.reviewText!,
        itemReviews: reviewData.itemReviews,
        reviewer: reviewData.reviewer ? reviewData.reviewer : undefined
      },
      reviewText: reviewData.reviewText!,
      sessionId: reviewData.sessionId!,
    };
    console.log('submitBody:', submitBody);

    try {
      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...submitBody,
        }),
      });
      const data = await response.json();
      console.log('Review submitted:', data);

      resetReviewData();

    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleSendChatMessage = async (chatInput: string) => {
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

    setReviewData((prev) => ({
      ...prev,
      reviewText: updatedReviewText,
      itemReviews: freeformReviewProperties.itemReviews,
      reviewer: freeformReviewProperties.reviewer,
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
          <FormTab
            reviewData={reviewData}
            setReviewData={setReviewData}
            onSubmitPreview={handleSubmitPreview}
            onReceivedPreviewResponse={handleReceivedPreviewResponse}
          />
        )}
        {activeTab === "preview" && (
          <PreviewTab
            reviewData={reviewData}
            onSubmitReview={handleSubmitReview}
          />
        )}
        {activeTab === "chat" && (
          <ChatTab
            reviewData={reviewData}
            setReviewData={setReviewData}
            onSendChatMessage={handleSendChatMessage}
          />
        )}
      </section>
    </div>
  );
};

export default MultiPanelReviewForm;
