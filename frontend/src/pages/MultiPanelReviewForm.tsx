import { useState } from "react";
import '../styles/multiPanelStyles.css';
import ReviewFormPanel from "./ReviewFormPanel";
import ReviewPreviewPanel from "./ReviewPreviewPanel";
import ReviewChatPanel from "./ReviewChatPanel";

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
          <ReviewFormPanel />
        )}
        {activeTab === "preview" && (
          <ReviewPreviewPanel />
        )}
        {activeTab === "chat" && (
          <ReviewChatPanel />
        )}
      </section>
    </div>
  );
};

export default MultiPanelReviewForm;
