import { ChatOpenAI } from '@langchain/openai';
import { GeoJSONPoint, WouldReturn } from '../types';
import { createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor } from "langchain/agents";
import { GetOpenForLunchTool } from "../tools/openForLunchTool";

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
  reviewData: ReviewData[]
): Promise<any> => {
  // Step 1: Set up ChatGPT with LangChain agent
  const model = new ChatOpenAI({ model: "gpt-4" });
  const getOpenForLunchTool = new GetOpenForLunchTool();
  const tools = [getOpenForLunchTool]; // Include the tool
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant that retrieves relevant places and reviews based on a natural language query."],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  const agent = await createToolCallingAgent({
    llm: model,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });

  // Step 2: Handle the query using the agent
  const agentResults = await agentExecutor.invoke({
    input: query,
  });

  // Step 3: Return results
  return agentResults;
};


