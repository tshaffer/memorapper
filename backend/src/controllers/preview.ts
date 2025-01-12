import { ChatCompletionMessageParam } from 'openai/resources/chat';
import getOpenAIClient from '../services/openai';
import { Request, Response } from 'express';
import { extractItemReviews } from '../utilities';
import { ChatGPTOutput, ItemReview, NewPreviewResponse, PreviewRequestBody } from '../types';

// Store conversations for each session
interface ReviewConversations {
  [sessionId: string]: ChatCompletionMessageParam[];
}
const reviewConversations: ReviewConversations = {};

export const previewHandler = async (
  req: Request<{}, {}, PreviewRequestBody>,
  res: Response
): Promise<any> => {

  console.log('Preview review request:', req.body); // Debugging log

  const { reviewText, sessionId } = req.body;

  try {
    const chatGPTOutput: ChatGPTOutput = await parsePreview(sessionId, reviewText);
    console.log('ChatGPTOutput:', chatGPTOutput); // Debugging log
    const previewResponse: NewPreviewResponse = { chatGPTOutput };
    return res.json(previewResponse);
  } catch (error) {
    console.error('Error processing review preview:', error);
    return res.status(500).json({ error: 'An error occurred while processing the review preview.' });
  }
};

const parsePreview = async (sessionId: string, reviewText: string): Promise<ChatGPTOutput> => {

  // Initialize conversation history if it doesn't exist
  if (!reviewConversations[sessionId]) {
    reviewConversations[sessionId] = [
      {
        role: "system",
        content: `
        You are a helpful assistant aiding in extracting structured information from restaurant reviews.
        Your task is to extract the following:
        - Reviewer name (if provided)
        - Date of visit (in YYYY-MM-DD format, if provided)
        - A list of items ordered with concise comments for each item, formatted as "itemReviews" with properties "item" and "review".
        
        When extracting items ordered:
        - Include all food or beverage items explicitly mentioned in the review, even if no comments are provided.
        - For each item, extract any associated descriptive comment (e.g., "delicious", "overcooked", etc.). Avoid including unnecessary phrases such as "I had" or "we ordered."
        - If no comment is provided for an item, leave the review field blank.
        
        If any details (e.g., reviewer name or date) are missing, still attempt to extract as much information as possible.
        
        Example format of the response:
        - Reviewer name: [Name or ""]
        - Date of visit: [YYYY-MM-DD or ""]
        - Item reviews: [{ "item": "pizza", "review": "delicious" }, { "item": "pasta", "review": "" }]
        
        Always include all mentioned items, even if they have no associated comments.
        `,
      }
    ];
  }
  reviewConversations[sessionId].push({ role: "user", content: reviewText });

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4",
      messages: reviewConversations[sessionId],
      max_tokens: 500,
      temperature: 0.5,
    });

    const messageContent = response.choices[0].message?.content;
    if (!messageContent) {
      throw new Error('Failed to extract data from the response.');
    }

    const itemReviews: ItemReview[] = extractItemReviews(messageContent);

    // Extract structured information using adjusted parsing
    const chatGPTOutput: ChatGPTOutput = {
      reviewText,
      itemReviews,
    };

    return chatGPTOutput;
  } catch (error) {
    console.error('Error processing review preview:', error);
    throw new Error('Error processing review preview.');
  }
}

