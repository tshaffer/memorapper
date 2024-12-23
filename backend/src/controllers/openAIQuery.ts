import { ChatOpenAI } from "@langchain/openai";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { GetOpenForBreakfastTool, GetOpenForLunchTool } from "../tools";
import { GeoJSONPoint, WouldReturn } from "../types";

interface PlaceData {
  id: string;
  name: string;
  address: string;
  location?: GeoJSONPoint;
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
  reviewData: ReviewData[]
): Promise<any> => {
  // Step 1: Set up ChatGPT with LangChain agent
  const model = new ChatOpenAI({ model: "gpt-4" });

  // Define the tools
  const tools = [new GetOpenForBreakfastTool(), new GetOpenForLunchTool()];

  // Define the prompt
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a helpful assistant that retrieves relevant places and reviews based on a natural language query.
      Use external tools when necessary. Always respond with JSON data only.`,
    ],
    ["user", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  // Create the agent
  const agent = await createToolCallingAgent({
    llm: model,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });

  // Combine user query with internal data
  const userInput = `
    Find relevant places and reviews for the query: "${query}". 
    The places are: ${JSON.stringify(placeData)}. 
    The reviews are: ${JSON.stringify(reviewData)}.

    You can call external tools if you need additional information, like restaurant opening hours.
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
    }
  `;

  // Step 2: Execute the agent with the combined input
  const agentResults = await agentExecutor.invoke({
    input: userInput,
  });

  // Step 3: Retrieve restaurants open for breakfast
  const breakfastPlaceNames: string[] = JSON.parse(
    await new GetOpenForBreakfastTool()._call("")
  );

  // Step 4: Filter reviews based on OpenAI results
  const agentReviews = JSON.parse(agentResults.output).reviews;
  const openAIReviews = reviewData.filter((review) =>
    agentReviews.some((r: any) => r.id === review.id.toString())
  );

  // Step 5: Intersect OpenAI results with breakfast places
  const filteredPlaces = placeData.filter((place) =>
    breakfastPlaceNames.includes(place.name) &&
    openAIReviews.some((review) => review.place_id === place.id)
  );

  const filteredReviews = openAIReviews.filter((review) =>
    filteredPlaces.some((place) => place.id === review.place_id)
  );

  // Step 6: Combine results
  return {
    agent: agentResults.output, // Optional: Include agent's reasoning
    places: filteredPlaces,
    reviews: filteredReviews,
  };
};
