export enum Distance {
  HalfMile = 0.5,
  OneMile = 1,
  FiveMiles = 5,
  TenMiles = 10,
  AnyDistance = 1000000,
}

export enum RestaurantType {
  Restaurant = 0,
  CoffeeShop = 1,
  Bar = 2,
  Bakery = 3,
  Taqueria = 4,
  PizzaPlace = 5,
  ItalianRestaurant = 6,
  DessertShop = 7,
  Seafood = 8,
}

export enum PlaceType {
  Restaurant = 0,
  GroceryStore = 1,
  Destination = 2,
  Accommodations = 3,
}

export enum RestaurantOpen {
  OpenAnyTime = 'OPEN_ANY_TIME',
  OpenNow = 'OPEN_NOW',
  OpenByMeal = 'OPEN_BY_MEAL',
};

export enum MealType {
  Breakfast = 'BREAKFAST',
  Lunch = 'LUNCH',
  Dinner = 'DINNER',
}

export enum VisitedStatus {
  Unvisited = 'UNVISITED',
  Visited = 'VISITED',
  VisitedAndUnvisited = 'VISITED_AND_UNVISITED',
}