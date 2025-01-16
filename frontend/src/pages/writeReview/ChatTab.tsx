import { Box, Button, TextField, Typography, useMediaQuery } from '@mui/material';
import '../../styles/multiPanelStyles.css';
import '../../styles/chatStyles.css';
import { ItemReview, ChatMessage, ChatResponse, ReviewData } from '../../types';
import { useState } from 'react';
import { formatDateToMMDDYYYY } from '../../utilities';
import PulsingDots from '../../components/PulsingDots';

interface ChatTabProps {
  reviewData: ReviewData;
  onSendChatMessage: (message: string) => void;
  setNewReviewData: React.Dispatch<React.SetStateAction<ReviewData>>;
}

const ChatTab: React.FC<ChatTabProps> = (props: ChatTabProps) => {

  console.log('ReviewChatPanel::props:', props);

  const { reviewData, onSendChatMessage } = props;

  const isMobile = useMediaQuery('(max-width:768px)');

  const [isLoading, setIsLoading] = useState(false);

  const [chatInput, setChatInput] = useState<string>('');

  const handleSendChatMessage = async () => {
    if (!reviewData.sessionId || !chatInput) return;
    try {
      setIsLoading(true);
      await onSendChatMessage(chatInput);
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
        {itemReview.item}
        {itemReview.review ? ` - ${itemReview.review}` : ''}
      </li>
    );
  };

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

  const renderAIResponse = (chatResponse: ChatResponse): JSX.Element => {
    const getReturnString = () => {
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
            {renderItemReviews(chatResponse.itemReviews)}
          </ul>
          <Typography><strong>Retrieved Location:</strong>{reviewData.place?.formatted_address}</Typography>
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
          renderAIResponse(chatMessage.message as ChatResponse)
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
    <div
      id="chat"
      className="tab-panel active"
      style={{
        marginLeft: '8px',
        maxHeight: isMobile ? 'calc(60vh)' : 'auto'
      }}
    >
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

      <Button
        disabled={!chatInput || chatInput.length === 0}
        onClick={handleSendChatMessage}
      >
        Send
      </Button>

      {renderPulsingDots()}

    </div>
  );
};

export default ChatTab;
