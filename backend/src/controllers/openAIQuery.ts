import openai from '../services/openai';
import { GeoJSONPoint, WouldReturn } from '../types';

interface PlaceData {
  id: string;
  name: string;
  address: string;
  location?: GeoJSONPoint
}

interface ReviewData {
  id: any;
  text: string;
  dateOfVisit: string;
  wouldReturn: WouldReturn | null;
  place_id: string;
}
export const performOpenAIQuery = async (
  query: string,
  placeData: PlaceData[],
  reviewData: ReviewData[],
): Promise<any> => {

  // Step 2: Call OpenAI API
  const response: any = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant that retrieves relevant places and reviews based on a natural language query. Respond with JSON data only, without additional commentary.`,
      },
      {
        role: "user",
        content: `Find relevant places and reviews for the query: "${query}". 
        The places are: ${JSON.stringify(placeData)}. 
        The reviews are: ${JSON.stringify(reviewData)}.

        Return the results in the following JSON format:
        {
          "places": [
            { "id": "place_id_1" },
            { "id": "place_id_2" },
            ...
          ],
          "reviews": [
            { "id": "review_id_1" },
            { "id": "review_id_2" },
            ...
          ]
        }`,
      },
    ],
  });

  return response;
};
