import { Tool } from "langchain/tools";
import { MongoClient } from "mongodb";

// MongoDB client setup
// const mongoClient = new MongoClient(process.env.MONGO_URI!);

export class GetOpenForLunchTool extends Tool {
  // Define the tool's name and description
  name = "GetOpenForLunch";
  description = "Finds restaurants open for lunch based on their opening hours.";

  // Implement the method to handle tool execution
  async _call(input: string): Promise<string> {
    try {
      console.log('input:', input);
      return 'test';
      // await mongoClient.connect();
      // const db = mongoClient.db("memorapper");

      // const restaurants = await db.collection("restaurants").find({
      //   "openingHours.lunch": { $exists: true },
      // }).toArray();

      // if (restaurants.length === 0) {
      //   return "No restaurants are open for lunch.";
      // }

      // return restaurants.map(r => r.name).join(", "); // Return a list of restaurant names
    } catch (error) {
      console.error("Error querying MongoDB:", error);
      return "An error occurred while retrieving lunch data.";
    }
  }
}
