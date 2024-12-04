import { Box, Button, TextField, Typography } from '@mui/material';
import '../styles/multiPanelStyles.css';
import '../styles/chatStyles.css';
import { FreeformReviewProperties, ItemReview, ReviewData, ReviewEntity, WouldReturn } from '../types';
import { useState } from 'react';
import { formatDateToMMDDYYYY } from '../utilities';
import PulsingDots from '../components/PulsingDots';

type ChatMessage = {
  role: 'user' | 'ai';
  message: string | FreeformReviewProperties;
};

interface ReviewChatPanelProps {
  reviewData: ReviewData;
  onSendChatMessage: (message: string) => void;
  setReviewData: React.Dispatch<React.SetStateAction<ReviewData>>;
}

const ReviewChatPanel: React.FC<ReviewChatPanelProps> = (props: ReviewChatPanelProps) => {

  console.log('ReviewChatPanel::props:', props);

  const { reviewData, onSendChatMessage } = props;

  const [isLoading, setIsLoading] = useState(false);

  const [chatInput, setChatInput] = useState<string>('');

  const handleSendChatMessage = async () => {
    if (!reviewData.sessionId || !chatInput) return;
    try {
      setIsLoading(true);
      onSendChatMessage(chatInput);
      setChatInput('');
    } catch (error) {
      console.error('Error during chat:', error);
    }
    setIsLoading(false);
  };

  const renderChatQuestion = (chatMessage: string): JSX.Element => {
    return (
      <div className="user-message">
        <Typography>{chatMessage}</Typography>
      </div>
    );
  }

  const renderItemReview = (itemReview: ItemReview, idx: number): JSX.Element => {
    return (
      <li key={idx}>
        {itemReview.item} - {itemReview.review || 'No rating provided'}
      </li>
    );
  }

  const renderItemReviews = (itemReviews: ItemReview[]): JSX.Element[] | null => {
    if (itemReviews.length === 0) {
      return null;
    } else {
      {
        const itemsReviewsJSX: JSX.Element[] = [];
        itemReviews.forEach((itemReview, idx) => {
          itemsReviewsJSX.push(renderItemReview(itemReview, idx));
        });
        return itemsReviewsJSX;
      }
    }
  }

  const renderAIResponse = (freeformReviewProperties: FreeformReviewProperties): JSX.Element => {
    const getReturnString = () => {
      if (reviewData.wouldReturn === WouldReturn.Yes) return 'Yes';
      if (reviewData.wouldReturn === WouldReturn.No) return 'No';
      if (reviewData.wouldReturn === WouldReturn.NotSure) return 'Not sure';
      return 'Not specified';
    }
    return (
      <div className='ai-message'>
        <Box sx={{ textAlign: 'left' }}>
          <Typography><strong>Restaurant:</strong> {reviewData.place!.name || 'Not provided'}</Typography>
          <Typography><strong>Date of Visit:</strong> {formatDateToMMDDYYYY(reviewData.dateOfVisit!) || 'Not provided'}</Typography>
          <Typography><strong>Would Return:</strong> {getReturnString()}</Typography>
          <Typography><strong>Items Ordered:</strong></Typography>
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {renderItemReviews(freeformReviewProperties.itemReviews)}
          </ul>
          <Typography><strong>Retrieved Location:</strong>{reviewData.place?.formatted_address}</Typography>
          <Typography><strong>Reviewer:</strong> {freeformReviewProperties.reviewer || 'Not provided'}</Typography>
        </Box>
      </div>
    )
  };

  const renderChatQuestionAndResponse = (chatMessage: ChatMessage, index: number): JSX.Element => {
    console.log('renderChatQuestionAndResponse::chatMessage:', chatMessage, 'index:', index);
    return (
      <Box
        key={index}
        sx={{
          display: 'flex',
          mb: 2,
        }}
      >
        {typeof chatMessage.message === 'string' ? (
          renderChatQuestion(chatMessage.message)
        ) : (
          renderAIResponse(chatMessage.message as ReviewEntity)
        )}
      </Box>

    );
  }

  const renderChatHistory = (): JSX.Element | null => {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%', // Full height of the parent container
        }}
      >
        <Box
          sx={{
            flexGrow: 1, // Take available space
            // overflowY: 'auto', // Enable scrolling
            maxHeight: 'calc(100vh - 400px)', // Adjust height based on other components like headers
            padding: 2,
          }}
        >
          {reviewData.chatHistory.map((msg, idx) => (
            renderChatQuestionAndResponse(msg, idx)
          ))}
        </Box>
      </Box>
    );
  }

  const renderPulsingDots = (): JSX.Element | null => {
    if (!isLoading) {
      return null;
    }
    return (<PulsingDots />);
  };

  return (
    <div id="chat" className="tab-panel active">
      <h2>Chat</h2>
      <div className="chat-history">
        {renderChatHistory()}
      </div>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Enter your message..."
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
      // onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
      />

      <Button onClick={handleSendChatMessage}>Send</Button>

      {renderPulsingDots()}

    </div>
  );
};

export default ReviewChatPanel;
