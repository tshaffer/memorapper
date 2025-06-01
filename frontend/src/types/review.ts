// types/Review.ts

import { ItemOrdered } from "./itemOrdered";

export interface Review {
  dateOfVisit: string; // ISO date string, e.g., '2024-06-01'
  itemsOrdered: ItemOrdered[];
  reviewText: string;
}
