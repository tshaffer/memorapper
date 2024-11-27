import '../styles/multiPanelStyles.css';

const ReviewPreviewPanel = () => {
  return (
    <div id="preview" className="tab-panel active">
      <h2>Review Preview</h2>
      <p><strong>Restaurant Name:</strong> [Example]</p>
      <p><strong>Date of Visit:</strong> [Example]</p>
      <p><strong>Would Return?</strong> [Example]</p>
      <p><strong>Review Text:</strong></p>
      <p>[Example]</p>
      <h3>Extracted Information</h3>
      <ul>
        <li>Item 1: Comment</li>
        <li>Item 2: Comment</li>
      </ul>
      <button>Save Review</button>
      <button>Edit Form</button>
      <button>Chat with ChatGPT</button>
    </div>
  );
};

export default ReviewPreviewPanel;
