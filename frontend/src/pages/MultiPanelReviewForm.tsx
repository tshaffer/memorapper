import { useState } from "react";
import '../styles/multiPanelStyles.css';
import ReviewFormPanel from "./ReviewFormPanel";
import ReviewPreviewPanel from "./ReviewPreviewPanel";
import ReviewChatPanel from "./ReviewChatPanel";
import { Button } from "@mui/material";
import { ChatRequestBody, ChatResponse, FreeformReviewProperties, PreviewRequestBody, PreviewResponse, ReviewData, StructuredReviewProperties, SubmitReviewBody } from "../types";

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

  type ChatMessage = {
    role: 'user' | 'ai';
    message: string | FreeformReviewProperties;
  };

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
      _id: '', // _id,
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
          <ReviewFormPanel
            reviewData={reviewData}
            setReviewData={setReviewData}
            onSubmitPreview={handleSubmitPreview}
            onReceivedPreviewResponse={handleReceivedPreviewResponse}
          />
        )}
        {activeTab === "preview" && (
          <ReviewPreviewPanel
            reviewData={reviewData}
            onSubmitReview={handleSubmitReview}
          />
        )}
        {activeTab === "chat" && (
          <ReviewChatPanel
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
