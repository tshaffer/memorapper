import { useState } from 'react';
import { useLocation, useParams } from "react-router-dom";
import '../../styles/multiPanelStyles.css';
import PreviewTab from "./NewPreviewTab";
import ChatTab from "./NewChatTab";
import NewReviewEntryForm from './NewReviewEntryForm';
import { Box, Button } from "@mui/material";
import { NewSubmitReviewBody, AccountPlaceReview, ChatGPTOutput, ChatMessage, EditableReview, GooglePlace, MemoRappReview, NewPreviewResponse, NewReviewData, PreviewRequestBody } from "../../types";
import { getFormattedDate } from "../../utilities";
import { useUserContext } from '../../contexts/UserContext';

const WriteReviewPage = () => {

  const { currentUser } = useUserContext();

  const { _id } = useParams<{ _id: string }>();
  const location = useLocation();
  const editableReview = location.state as EditableReview | null;

  let place: GooglePlace | null = null;
  let accountPlaceReview: AccountPlaceReview | null = null;
  let review: MemoRappReview | null = null;
  if (editableReview) {
    place = editableReview.place;
    review = editableReview.review;
  }

  const initialNewReviewData: NewReviewData = {
    _id: _id ? _id : '',
    accountId: currentUser!.id,
    place,
    restaurantName: place ? place.name : '',
    reviewText: '',
    dateOfVisit: getFormattedDate(),
    itemReviews: [],
    sessionId: '',
    chatHistory: [],
    accountUserInputs: [],
  };

  const [newReviewData, setNewReviewData] = useState<NewReviewData>(initialNewReviewData);
  const resetNewReviewData = () => setNewReviewData(initialNewReviewData);

  const [activeTab, setActiveTab] = useState("form");

  const handleTabClick = (tab: any) => {
    setActiveTab(tab);
  };

  const handleReceivedPreviewResponse = () => {
    setActiveTab("preview");
  }

  const newHandleSubmitPreview = async (formData: Omit<NewReviewData, 'chatHistory'>) => {
    console.log('newHandleSubmitPreview:');
    setNewReviewData((prev) => ({ ...prev, ...formData }));

    const previewBody: PreviewRequestBody = {
      reviewText: newReviewData.reviewText!,
      sessionId: newReviewData.sessionId!,
    };
    const response = await fetch('/api/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(previewBody),
    });
    const data: NewPreviewResponse = await response.json();
    console.log('newHandleSubmitPreview data:', data);

    const chatGPTOutput: ChatGPTOutput = (data as any).chatGPTOutput;
    console.log('chatGPTOutput:', chatGPTOutput);

    const chatHistory: ChatMessage[] = newReviewData.chatHistory;
    const userChatMessage: ChatMessage = { role: 'user', message: newReviewData.reviewText! };
    const aiChatMessage: ChatMessage = { role: 'ai', message: chatGPTOutput };
    chatHistory.push(userChatMessage, aiChatMessage);

    setNewReviewData((prev) => ({
      ...prev,
      'reviewText': chatGPTOutput.reviewText,
      'itemReviews': chatGPTOutput.itemReviews,
      'chatHistory': chatHistory,
    }));

  }

  const handleSendChatMessage = async (chatInput: string) => {
  }

  const handleSubmitReview = async () => {
    const body: NewSubmitReviewBody = {
      _id: newReviewData._id,
      accountId: newReviewData.accountId,
      place: newReviewData.place!,
      accountUserInputs: newReviewData.accountUserInputs!,
      dateOfVisit: newReviewData.dateOfVisit!,
      reviewText: newReviewData.reviewText!,
      itemReviews: newReviewData.itemReviews,
      sessionId: newReviewData.sessionId!,
    }
    console.log('submitBody:', body);

    const serialized = JSON.stringify(body);
    console.log(serialized);

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serialized
      });
      const data = await response.json();
      console.log('Review submitted:', data);

      resetNewReviewData();

    } catch (error) {
      console.error('Error submitting review:', error);
    }

  }
  
  /*
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
*/

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
          <NewReviewEntryForm
            reviewData={newReviewData}
            setReviewData={setNewReviewData}
            onSubmitPreview={newHandleSubmitPreview}
            onReceivedPreviewResponse={handleReceivedPreviewResponse}
          />
        )}
        {activeTab === "preview" && (
          <PreviewTab
            reviewData={newReviewData}
            onSubmitReview={handleSubmitReview}
          />
        )}
        {activeTab === "chat" && (
          <ChatTab
            reviewData={newReviewData}
            setNewReviewData={setNewReviewData}
            onSendChatMessage={handleSendChatMessage}
          />
        )}
      </section>

      {/* Reset Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={resetNewReviewData}
        >
          Reset
        </Button>
      </Box>
    </div>
  );
};

export default WriteReviewPage;
