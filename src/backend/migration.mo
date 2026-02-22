import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Int "mo:core/Int";

module {
  type Weight = {
    value : Int;
    unit : {
      #grams;
      #kilograms;
    };
  };

  type Ingredient = {
    id : Nat;
    name : Text;
    quantity : Weight;
    costPricePerUnit : Float;
    supplierName : Text;
    lowStockThreshold : Weight;
  };

  type BowlSize = {
    #small;
    #medium;
    #large;
  };

  type RecipeIngredient = {
    ingredientId : Nat;
    quantity : Weight;
  };

  type Recipe = {
    id : Nat;
    name : Text;
    bowlSize : BowlSize;
    ingredients : [RecipeIngredient];
  };

  type Customer = {
    id : Nat;
    name : Text;
    contactInfo : Text;
    address : Text;
    isActive : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  type OldActor = {
    nextIngredientId : Nat;
    nextRecipeId : Nat;
    activeSessions : Set.Set<Text>;
    ingredients : Map.Map<Nat, Ingredient>;
    recipes : Map.Map<Nat, Recipe>;
  };

  type NewActor = {
    nextCustomerId : Nat;
    nextIngredientId : Nat;
    nextRecipeId : Nat;
    activeSessions : Set.Set<Text>;
    ingredients : Map.Map<Nat, Ingredient>;
    recipes : Map.Map<Nat, Recipe>;
    customers : Map.Map<Nat, Customer>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      nextCustomerId = 1;
      customers = Map.empty<Nat, Customer>();
    };
  };
};
