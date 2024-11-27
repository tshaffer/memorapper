import '../styles/multiPanelStyles.css';

const ReviewChatPanel = () => {
  return (
    <div id="chat" className="tab-panel active">
    <h2>Chat</h2>
    <div className="chat-history">
      <p><strong>You:</strong> Example question</p>
      <p><strong>ChatGPT:</strong> Example response</p>
    </div>
    <textarea placeholder="Type your message..."></textarea>
    <button>Send</button>
    <button>Return to Preview</button>
  </div>
);
};

export default ReviewChatPanel;
