import { ChatCompletionMessageParam } from 'openai/resources/chat';
import getOpenAIClient from '../services/openai';
import { Request, Response } from 'express';
import Review, { IReview } from "../models/Review";
import { extractItemReviews } from '../utilities';
import { ChatRequestBody, ChatResponse, FreeformReviewProperties, ItemReview, MemoRappReview, PreviewRequestBody, PreviewResponse, SubmitReviewBody } from '../types';
import { addPlace, getPlace } from './places';
import { IMongoPlace } from '../models';
import { addReview } from './reviews';

// Store conversations for each session
interface ReviewConversations {
  [sessionId: string]: ChatCompletionMessageParam[];
}
const reviewConversations: ReviewConversations = {};

export const previewReviewHandler = async (
  req: Request<{}, {}, PreviewRequestBody>,
  res: Response
): Promise<any> => {

  console.log('Preview review request:', req.body); // Debugging log

  const { reviewText, sessionId } = req.body;

  try {
    const freeformReviewProperties: FreeformReviewProperties = await parsePreview(sessionId, reviewText);
    console.log('freeformReviewProperties:', freeformReviewProperties); // Debugging log
    const previewResponse: PreviewResponse = { freeformReviewProperties };
    return res.json(previewResponse);
  } catch (error) {
    console.error('Error processing review preview:', error);
    return res.status(500).json({ error: 'An error occurred while processing the review preview.' });
  }
};

export const parsePreview = async (sessionId: string, reviewText: string): Promise<FreeformReviewProperties> => {

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
    const freeformReviewProperties: FreeformReviewProperties = {
      reviewText,
      itemReviews,
    };

    return freeformReviewProperties;
  } catch (error) {
    console.error('Error processing review preview:', error);
    throw new Error('Error processing review preview.');
  }
}

export const chatReviewHandler = async (
  req: Request<{}, {}, ChatRequestBody>,
  res: Response
): Promise<void> => {
  const { userInput, sessionId, reviewText } = req.body;

  if (!reviewConversations[sessionId]) {
    res.status(400).json({ error: 'Session not found. Start with a preview first.' });
    return;
  }

  // Add user input to the conversation
  reviewConversations[sessionId].push({ role: "user", content: userInput });

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4",
      messages: [
        ...reviewConversations[sessionId],
        {
          role: "system",
          content: `Please provide:
          1. The updated structured data based on the full conversation. If you cannot generate structured data, explicitly state "No Updated Structured Data available."
          2. An updated review text that incorporates the latest user modifications. Always provide this, even if the structured data is unavailable. Ensure that the updated review text begins with "Updated Review Text:".

          Original Review: "${reviewText}"`,
        },
      ],
      max_tokens: 500,
      temperature: 0.5,
    });

    const messageContent = response.choices[0].message?.content;
    console.log('ChatGPT response:', messageContent); // Debugging log

    if (!messageContent) {
      res.status(500).json({ error: 'Failed to extract data from the response.' });
      return;
    }

    // Updated parsing logic
    const structuredDataMatch = messageContent.match(/^Updated Structured Data:\s*([\s\S]*?)Updated Review Text:/m);
    const updatedReviewTextMatch = messageContent.match(/Updated Review Text:\s*([\s\S]+)/s);

    const structuredDataText = structuredDataMatch ? structuredDataMatch[1].trim() : "No Updated Structured Data available";
    const updatedReviewText = updatedReviewTextMatch ? updatedReviewTextMatch[1].trim() : null;

    if (!updatedReviewText) {
      console.error('Parsing error: Updated Review Text not found');
      res.status(500).json({ error: 'Failed to parse updated review text.' });
      return;
    }

    let itemReviews: ItemReview[] | null = null;

    if (structuredDataText !== "No Updated Structured Data available") {
      try {
        itemReviews = extractItemReviews(structuredDataText);
      } catch (error) {
        console.warn('Failed to extract structured data, returning null for structured data');
        itemReviews = null;
      }
    }

    const freeformReviewProperties: FreeformReviewProperties = {
      reviewText: updatedReviewText,
      itemReviews: itemReviews || [],
    };

    const chatResponse: ChatResponse = {
      freeformReviewProperties,
      updatedReviewText,
    };

    res.json(chatResponse);
  } catch (error) {
    console.error('Error during chat interaction:', error);
    res.status(500).json({ error: 'An error occurred while processing the chat response.' });
  }
};

export const submitReviewHandler = async (req: Request, res: Response): Promise<any> => {

  const body: SubmitReviewBody = req.body;
  console.log('Submit review request:', body); // Debugging log
  
  try {
    const newReview = await submitReview(body);
    return res.status(201).json({ message: 'Review saved successfully!', review: newReview });
  } catch (error) {
    console.error('Error saving review:', error);
    return res.status(500).json({ error: 'An error occurred while saving the review.' });
  }
};

export const submitReview = async (memoRappReview: SubmitReviewBody): Promise<IReview | null> => {

  const { _id, place, structuredReviewProperties, freeformReviewProperties, sessionId } = memoRappReview;
  const googlePlaceId = place.googlePlaceId;

  let mongoPlace: IMongoPlace | null = await getPlace(googlePlaceId);
  console.log('place:', place);
  if (!mongoPlace) {
    mongoPlace = await addPlace(place);
    if (!place) {
      throw new Error('Error saving place.');
    }
  }

  const addReviewBody: MemoRappReview = {
    googlePlaceId: place.googlePlaceId,
    structuredReviewProperties,
    freeformReviewProperties,
  };

  let savedReview: IReview | null;

  if (_id) {
    // If _id is provided, update the existing document
    savedReview = await Review.findByIdAndUpdate(_id, addReviewBody, {
      new: true,    // Return the updated document
      runValidators: true // Ensure the updated data complies with schema validation
    });

    if (!savedReview) {
      throw new Error('Review not found for update.');
    }
  } else {
    const newReview: IReview | null = await addReview(addReviewBody);
    console.log('newReview:', newReview?.toObject());
  }

  // Clear conversation history for the session after submission
  delete reviewConversations[sessionId];

  return null;
}
