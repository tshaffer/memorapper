import { Box, Button, Card, TextField, Typography } from '@mui/material';
import '../styles/multiPanelStyles.css';
import { ChatRequestBody, ChatResponse, FreeformReviewProperties, ReviewEntity } from '../types';
import { useEffect, useState } from 'react';

type ChatMessage = {
  role: 'user' | 'ai';
  message: string | FreeformReviewProperties;
};

interface ReviewChatPanelProps {
  sessionId: string;
  reviewText: string;
}


const ReviewChatPanel: React.FC<ReviewChatPanelProps> = (props: ReviewChatPanelProps) => {

  console.log('ReviewChatPanel::props:', props);

  const { sessionId, reviewText } = props;

  const [isLoading, setIsLoading] = useState(false);

  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const [theReviewText, setTheReviewText] = useState('');
  const [freeformReviewProperties, setFreeformReviewProperties] = useState<FreeformReviewProperties | null>(null);

  useEffect(() => {
    setTheReviewText(reviewText);
    console.log('useEffect: sessionId:', sessionId);
  }, [reviewText]);


  const setTheChatHistory = (chatHistory: ChatMessage[]) => {
    console.log('setTheChatHistory::chatHistory:', chatHistory);
    setChatHistory(chatHistory);
  }

  const handleSendChatMessage = async () => {
    if (!sessionId || !chatInput) return;
    try {
      setIsLoading(true);
      const chatRequestBody: ChatRequestBody = {
        userInput: chatInput,
        sessionId,
        reviewText: theReviewText,
      };
      const response: Response = await fetch('/api/reviews/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatRequestBody),
      });
      const chatResponse: ChatResponse = (await response.json()) as ChatResponse;
      const { freeformReviewProperties, updatedReviewText } = chatResponse;

      setFreeformReviewProperties(freeformReviewProperties);
      setTheReviewText(updatedReviewText);
      setTheChatHistory([...chatHistory, { role: 'user', message: chatInput }, { role: 'ai', message: freeformReviewProperties }]);
      setChatInput('');
    } catch (error) {
      console.error('Error during chat:', error);
    }
    setIsLoading(false);
  };

  const renderPreviewResponse = (freeformReviewProperties: FreeformReviewProperties): JSX.Element => {
    // const place: GooglePlace = googlePlace!;
    // const getReturnString = () => {
    //   if (wouldReturn === true) return 'Yes';
    //   if (wouldReturn === false) return 'No';
    //   return 'Not specified';
    // }
    return (
      <Box sx={{ textAlign: 'left' }}>
        {/* <Typography><strong>Restaurant:</strong> {place.name || 'Not provided'}</Typography> */}
        {/* <Typography><strong>Date of Visit:</strong> {formatDateToMMDDYYYY(dateOfVisit) || 'Not provided'}</Typography> */}
        {/* <Typography><strong>Would Return:</strong> {getReturnString()}</Typography> */}
        <Typography><strong>Items Ordered:</strong></Typography>
        <ul>
          {freeformReviewProperties.itemReviews.map((itemReview, idx) => (
            <li key={idx}>
              {itemReview.item} - {itemReview.review || 'No rating provided'}
            </li>
          ))}
        </ul>
        {/* <Typography><strong>Retrieved Location:</strong>{place?.formatted_address}</Typography> */}
        <Typography><strong>Reviewer:</strong> {freeformReviewProperties.reviewer || 'Not provided'}</Typography>
      </Box>
    )
  };

  const renderChatQuestionAndResponse = (chatMessage: ChatMessage, index: number): JSX.Element => {
    return (
      <Box
        key={index}
        sx={{
          display: 'flex',
          justifyContent: chatMessage.role === 'user' ? 'flex-end' : 'flex-start',
          mb: 2,
        }}
      >
        <Card
          sx={{
            backgroundColor: chatMessage.role === 'user' ? 'lightgrey' : 'white',
            padding: 2,
            maxWidth: '80%',
            borderRadius: 2,
          }}
        >
          {typeof chatMessage.message === 'string' ? (
            <Typography variant="body1">{chatMessage.message}</Typography>
          ) : (
            renderPreviewResponse(chatMessage.message as ReviewEntity)
          )}
        </Card>
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
            overflowY: 'auto', // Enable scrolling
            maxHeight: 'calc(100vh - 400px)', // Adjust height based on other components like headers
            padding: 2,
          }}
        >
          {chatHistory.map((msg, idx) => (
            renderChatQuestionAndResponse(msg, idx)
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <div id="chat" className="tab-panel active">
      <h2>Chat</h2>
      <div className="chat-history">
        <Typography><strong>You:</strong> Example question</Typography>
        <Typography><strong>ChatGPT:</strong> Example response</Typography>
        {renderChatHistory()}
      </div>
      {/* <textarea placeholder="Type your message..."></textarea> */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Enter your message..."
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
      // onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
      />

      <Button onClick={handleSendChatMessage}>Send</Button>
      <Button>Return to Preview</Button>
    </div>
  );
};

export default ReviewChatPanel;
