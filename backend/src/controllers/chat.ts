import getOpenAIClient from '../services/openai';
import { Request, Response } from 'express';
import Review, { IReview } from "../models/Review";
import { extractItemReviews } from '../utilities';
import { ChatRequestBody, ChatResponse, FreeformReviewProperties, ItemReview, MemoRappReview, NewChatResponse, PreviewRequestBody, PreviewResponse, SerializableMap, SubmitReviewBody } from '../types';
import { addPlace, getPlace } from './places';
import { IMongoPlace } from '../models';
import { addReview } from './reviews';

import { reviewConversations } from '../data/data';

export const chatHandler = async (
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
    // const structuredDataMatch = messageContent.match(/^Updated Structured Data:\s*([\s\S]*?)Updated Review Text:/m);
    const structuredDataMatch = messageContent.match(/1\. Updated Structured Data:\s*([\s\S]*?)2\. Updated Review Text:/m);

    if (structuredDataMatch) {
      const structuredData = structuredDataMatch[1].trim();
      console.log('Extracted Structured Data:', structuredData);
    } else {
      console.error('Failed to extract structured data from the response.');
    }

    const reviewTextMatch = messageContent.match(/2\. Updated Review Text:\s*(.*)/s);

    if (reviewTextMatch) {
      const updatedReviewText = reviewTextMatch[1].trim();
      console.log('Extracted Review Text:', updatedReviewText);
    } else {
      console.error('Failed to extract updated review text from the response.');
    }
    
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

    const chatResponse: NewChatResponse = {
      reviewText: updatedReviewText,
      itemReviews: itemReviews || [],
      updatedReviewText,
    };

    res.json(chatResponse);
  } catch (error) {
    console.error('Error during chat interaction:', error);
    res.status(500).json({ error: 'An error occurred while processing the chat response.' });
  }
};

