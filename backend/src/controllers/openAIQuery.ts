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
  const tools = [new GetOpenForBreakfastTool()];

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

  You have access to the following tools:
  - GetOpenForBreakfastTool: Finds restaurants open for breakfast. Use this tool for queries related to breakfast (e.g., "breakfast", "early morning", "6:00 AM to 10:00 AM").
  - GetOpenForLunchTool: Finds restaurants open for lunch. Use this tool for queries related to lunch (e.g., "lunch", "midday", "11:00 AM to 2:00 PM").

  Select the correct tool based on the query context:
  - If the query mentions breakfast, morning, or similar terms, select GetOpenForBreakfastTool.
  - If the query mentions lunch, midday, or similar terms, select GetOpenForLunchTool.
  - If no time-related terms are mentioned or no tool is required, return "tool": null.

  Example Queries:
  - Query: "Show me restaurants open for breakfast."
    Response: "tool": "GetOpenForBreakfastTool"
  - Query: "Show me reviews where I mentioned shrimp that are open for lunch."
    Response: "tool": "GetOpenForLunchTool"
  - Query: "Show me reviews where I mentioned shrimp."
    Response: "tool": null

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
    ],
    "tool": "GetOpenForBreakfastTool" | "GetOpenForLunchTool" | null
  }
`;

  // Step 2: Execute the agent with the combined input
  const agentResults = await agentExecutor.invoke({
    input: userInput,
  });

  // Step 3: Parse agent results
  const parsedResults = JSON.parse(agentResults.output);
  const agentReviews = parsedResults.reviews;
  let toolToInvoke = parsedResults.tool;

  // Validate tool selection
  if (query.toLowerCase().includes("lunch") && toolToInvoke !== "GetOpenForLunchTool") {
    console.warn(
      `Agent selected the wrong tool (${toolToInvoke}). Overriding to use GetOpenForLunchTool.`
    );
    toolToInvoke = "GetOpenForLunchTool";
  }

  if (query.toLowerCase().includes("breakfast") && toolToInvoke !== "GetOpenForBreakfastTool") {
    console.warn(
      `Agent selected the wrong tool (${toolToInvoke}). Overriding to use GetOpenForBreakfastTool.`
    );
    toolToInvoke = "GetOpenForBreakfastTool";
  }

  // Proceed with tool invocation
  let toolResults: string[] = [];
  if (toolToInvoke === "GetOpenForBreakfastTool") {
    toolResults = JSON.parse(await new GetOpenForBreakfastTool()._call(""));
  } else if (toolToInvoke === "GetOpenForLunchTool") {
    toolResults = JSON.parse(await new GetOpenForLunchTool()._call(""));
  }

  // Step 4: Conditionally invoke the tool
  if (toolToInvoke === "GetOpenForBreakfastTool") {
    toolResults = JSON.parse(await new GetOpenForBreakfastTool()._call(""));
  } else if (toolToInvoke === "GetOpenForLunchTool") {
    toolResults = JSON.parse(await new GetOpenForLunchTool()._call(""));
  }

  // Log the results
  console.log("User Query:", query);
  console.log("Agent Output:", agentResults.output);
  console.log("Selected Tool:", toolToInvoke);
  console.log("Invoking Tool...");

  // Step 5: Filter reviews based on OpenAI results
  const openAIReviews = reviewData.filter((review) =>
    agentReviews.some((r: any) => r.id === review.id.toString())
  );

  // Step 6: Intersect OpenAI results with tool results
  const filteredPlaces = placeData.filter((place) =>
    toolResults.includes(place.name) &&
    openAIReviews.some((review) => review.place_id === place.id)
  );

  const filteredReviews = openAIReviews.filter((review) =>
    filteredPlaces.some((place) => place.id === review.place_id)
  );

  // Step 7: Combine results
  return {
    agent: parsedResults, // Include agent's reasoning if needed
    places: filteredPlaces,
    reviews: filteredReviews,
  };
};
