import { ChatCompletionMessageParam } from 'openai/resources/chat';

export interface ReviewConversations {
  [sessionId: string]: ChatCompletionMessageParam[];
}

export const reviewConversations: ReviewConversations = {};

