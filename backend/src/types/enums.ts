export enum SearchDistanceFilter {
  HalfMile = 0.5,
  OneMile = 1,
  FiveMiles = 5,
  TenMiles = 10,
  AnyDistance = 1000000,
}

export enum RestaurantTypeQuery {
  Any = -1,
  Restaurant = 0,
  CoffeeShop = 1,
  Bar = 2,
  Bakery = 3,
  Taqueria = 4,
  PizzaPlace = 5,
  ItalianRestaurant = 6,
  DessertShop = 7,
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
}

export enum PlaceType {
  Restaurant = 0,
  GroceryStore = 1,
  Destination = 2,
}

export enum PlaceTypeQuery {
  Any = -1,
  Restaurant = 0,
  GroceryStore = 1,
  Destination = 2,
}

export enum OpenFilterMode {
  Any = 'ANY',
  Now = 'NOW',
  Meals = 'MEALS',
}

export enum MealType {
  Breakfast = 'BREAKFAST',
  Lunch = 'LUNCH',
  Dinner = 'DINNER',
}