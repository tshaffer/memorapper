import { ReviewData } from "../../types";

interface ReviewEntryFormProps {
  reviewData: ReviewData;
  setReviewData: React.Dispatch<React.SetStateAction<ReviewData>>;
  onSubmitPreview: (formData: Omit<ReviewData, 'chatHistory'>) => void;
  onReceivedPreviewResponse: () => any;
}

const ReviewEntryForm: React.FC<ReviewEntryFormProps> = (props: ReviewEntryFormProps) => {
  return (
    <div>pizza</div>
  )
}

export default ReviewEntryForm;
