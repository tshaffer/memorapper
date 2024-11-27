import { useState } from "react";
import '../multiPanelStyles.css'

const MultiPanelReviewForm = () => {
  const [activeTab, setActiveTab] = useState("form");

  const handleTabClick = (tab: any) => {
    setActiveTab(tab);
  };

  return (
    <div className="container">
      <header>
        <h1>Memorapper Review</h1>
      </header>
      <nav className="tabs">
        <button
          className={`tab-button ${activeTab === "form" ? "active" : ""}`}
          onClick={() => handleTabClick("form")}
        >
          Form
        </button>
        <button
          className={`tab-button ${activeTab === "preview" ? "active" : ""}`}
          onClick={() => handleTabClick("preview")}
        >
          Review Preview
        </button>
        <button
          className={`tab-button ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => handleTabClick("chat")}
        >
          Chat
        </button>
      </nav>
      <section className="tab-content">
        {activeTab === "form" && (
          <div id="form" className="tab-panel active">
            <h2>Form</h2>
            <form>
              <label htmlFor="restaurant-name">Restaurant Name (Required):</label>
              <input type="text" id="restaurant-name" placeholder="Enter restaurant name" required />

              <label htmlFor="review-text">Review Text (Required):</label>
              <textarea id="review-text" placeholder="Write your review here..." required></textarea>

              <label htmlFor="visit-date">Date of Visit (Optional):</label>
              <input type="date" id="visit-date" />

              <label htmlFor="return">Would Return? (Optional):</label>
              <input type="checkbox" id="return" /> Yes

              <button type="submit">Submit</button>
            </form>
          </div>
        )}
        {activeTab === "preview" && (
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
        )}
        {activeTab === "chat" && (
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
        )}
      </section>
    </div>
  );
};

export default MultiPanelReviewForm;
