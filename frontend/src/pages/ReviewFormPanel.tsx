import '../styles/multiPanelStyles.css';

const ReviewFormPanel = () => {
  return (
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

  );
};

export default ReviewFormPanel;
