export enum ReviewFormDisplayTabs {
  ReviewText = 0,
  ExtractedInformation = 1,
  ChatHistory = 2
}

export enum WouldReturn {
  Yes = 0,
  No = 1,
  NotSure = 2,
  Undefined = 3,
}

export enum DistanceAwayFilter {
  HalfMile = 0.5,
  OneMile = 1,
  FiveMiles = 5,
  TenMiles = 10,
  AnyDistance = 1000000,
}

export enum SortCriteria {
  Distance = "distance",
  MostRecentReview = "mostRecentReview",
  Name = "name",
  Reviewer = "reviewer",
}

export enum RestaurantType {
  Generic = 0,
  CoffeeShop = 1,
  Bar = 2,
  Bakery = 3,
  Taqueria = 4,
  PizzaPlace = 5,
  ItalianRestaurant = 6,
  DessertShop = 7,
}
