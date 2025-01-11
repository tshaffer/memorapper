import { useState } from 'react';
import { useLocation, useParams } from "react-router-dom";
import '../../styles/multiPanelStyles.css';
import ReviewEntryForm from "./ReviewEntryForm";
import PreviewTab from "./PreviewTab";
import ChatTab from "./ChatTab";
import { Box, Button } from "@mui/material";
import { ChatMessage, ChatRequestBody, ChatResponse, ContributorInput, ContributorInputMapValue, EditableReview, GooglePlace, MemoRappReview, PreviewRequestBody, PreviewResponse, ReviewData, SerializableMap, StructuredReviewProperties, SubmitReviewBody, WouldReturn } from "../../types";
import { getFormattedDate } from "../../utilities";
import { useUserContext } from '../../contexts/UserContext';

const WriteReviewPage = () => {

  const { currentUser } = useUserContext();

  const { _id } = useParams<{ _id: string }>();
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
    primaryRating: review ? review.structuredReviewProperties.primaryRating : 5,
    secondaryRating: review ? review.structuredReviewProperties.secondaryRating : undefined,
    wouldReturn: review ? review.structuredReviewProperties.wouldReturn : WouldReturn.Yes,
    itemReviews: review ? review.freeformReviewProperties.itemReviews : [],
    reviewerId: review ? review.structuredReviewProperties.reviewerId : currentUser!.id,
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

  const testhandleSubmitPreview = async (formData: Omit<ReviewData, 'chatHistory'>) => {

    const ci1: ContributorInput = { contributorId: '1', rating: 1, comments: 'Great!' };
    const ci2: ContributorInput = { contributorId: '2', rating: 2, comments: 'Needs improvement.' };

    const contributorInputByContributor = new SerializableMap<string, ContributorInputMapValue>();
    contributorInputByContributor.set('3', { contributorId: '1', contributorInput: ci1 });
    contributorInputByContributor.set('4', { contributorId: '2', contributorInput: ci2 });

    const myObject = {
      dateOfVisit: '2025-01-10',
      primaryRating: 5,
      wouldReturn: 0,
      reviewerId: '1',
      contributorInputByContributor,
    };

    const serialized = JSON.stringify(myObject);
    console.log(serialized);

    const deserialized = JSON.parse(serialized);
    deserialized.contributorInputByContributor = new SerializableMap(
      deserialized.contributorInputByContributor
    );
    console.log(deserialized);
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
      'chatHistory': chatHistory,
    }));
  };

  const handleSubmitReview = async () => {
    const structuredReviewProperties: StructuredReviewProperties = {
      dateOfVisit: reviewData.dateOfVisit!,
      primaryRating: reviewData.primaryRating!,
      secondaryRating: reviewData.secondaryRating,
      wouldReturn: reviewData.wouldReturn!,
      reviewerId: reviewData.reviewerId,
      contributorInputByContributor: reviewData.contributorInputByContributor,
    };
    const submitBody: SubmitReviewBody = {
      _id: reviewData._id,
      place: reviewData.place!,
      structuredReviewProperties,
      freeformReviewProperties: {
        reviewText: reviewData.reviewText!,
        itemReviews: reviewData.itemReviews,
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
          <ReviewEntryForm
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

      {/* Reset Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={resetReviewData}
        >
          Reset
        </Button>
      </Box>
    </div>
  );
};

export default WriteReviewPage;
