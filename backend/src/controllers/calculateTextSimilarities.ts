import { Request, Response } from "express";
import ItemOrderedModel from "../models/ItemOrdered";
import { cosineSimilarity, generateEmbeddings } from "./textSimilarity";

export const calculateTextSimilarities: any = async (req: Request, res: Response) => {
  try {
    // Step 1: Retrieve all inputNames from the database
    const items = await ItemOrderedModel.find({}, "inputName").exec();
    const inputNames = items.map((item) => item.inputName);

    if (inputNames.length < 2) {
      return res.status(400).json({
        error: "At least two inputNames are required to calculate similarities.",
      });
    }

    // Step 2: Generate embeddings for all inputNames
    const embeddings = await generateEmbeddings(inputNames);

    // Step 3: Calculate cosine similarities between all pairs
    const similarities: { inputName1: string; inputName2: string; similarity: number }[] = [];
    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
        similarities.push({
          inputName1: inputNames[i],
          inputName2: inputNames[j],
          similarity,
        });
      }
    }

    // Step 4: Return the similarity data
    res.json(similarities);
  } catch (error) {
    console.error("Error calculating text similarities:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
