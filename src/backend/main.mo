import Array "mo:core/Array";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Migration "migration";

(with migration = Migration.run)
actor {
  type Weight = {
    value : Int; // In grams
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

  type IngredientInput = {
    name : Text;
    quantity : Weight;
    costPricePerUnit : Float;
    supplierName : Text;
    lowStockThreshold : Weight;
  };

  type BowlSize = {
    #small; // 250gm
    #medium; // 350gm
    #large; // 500gm
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

  type RecipeInput = {
    name : Text;
    bowlSize : BowlSize;
    ingredients : [RecipeIngredient];
  };

  type InventoryState = {
    ingredients : [Ingredient];
    totalValue : Float;
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

  type CustomerInput = {
    name : Text;
    contactInfo : Text;
    address : Text;
  };

  type SessionId = Text;

  module SessionId {
    public func compare(sessionId1 : SessionId, sessionId2 : SessionId) : Order.Order {
      Text.compare(sessionId1, sessionId2);
    };
  };

  var nextIngredientId = 1;
  var nextRecipeId = 1;
  var nextCustomerId = 1;

  let activeSessions = Set.empty<SessionId>();
  let ingredients = Map.empty<Nat, Ingredient>();
  let recipes = Map.empty<Nat, Recipe>();
  let customers = Map.empty<Nat, Customer>();

  // Authentication & session management
  public shared ({ caller }) func createSession() : async SessionId {
    let sessionId = caller.toText();
    activeSessions.add(sessionId);
    sessionId;
  };

  public query ({ caller }) func isSessionActive(sessionId : SessionId) : async Bool {
    activeSessions.contains(sessionId);
  };

  func validateSession(sessionId : SessionId) : () {
    if (not activeSessions.contains(sessionId)) {
      Runtime.trap("Invalid session. Please authenticate.");
    };
  };

  public shared ({ caller }) func endSession(sessionId : SessionId) : async () {
    activeSessions.remove(sessionId);
  };

  // Inventory management with persistent state
  public shared ({ caller }) func addIngredient(sessionId : SessionId, ingredient : IngredientInput) : async () {
    validateSession(sessionId);

    let newIngredient : Ingredient = {
      id = nextIngredientId;
      name = ingredient.name;
      quantity = ingredient.quantity;
      costPricePerUnit = ingredient.costPricePerUnit;
      supplierName = ingredient.supplierName;
      lowStockThreshold = ingredient.lowStockThreshold;
    };
    ingredients.add(newIngredient.id, newIngredient);
    nextIngredientId += 1;
  };

  public shared ({ caller }) func updateIngredient(sessionId : SessionId, ingredientId : Nat, updatedIngredient : IngredientInput) : async () {
    validateSession(sessionId);

    switch (ingredients.get(ingredientId)) {
      case (null) {
        Runtime.trap("Ingredient not found");
      };
      case (?existingIngredient) {
        let updatedIngredientObject = {
          existingIngredient with
          name = updatedIngredient.name;
          quantity = updatedIngredient.quantity;
          costPricePerUnit = updatedIngredient.costPricePerUnit;
          supplierName = updatedIngredient.supplierName;
          lowStockThreshold = updatedIngredient.lowStockThreshold;
        };
        ingredients.add(ingredientId, updatedIngredientObject);
      };
    };
  };

  public query ({ caller }) func getIngredient(ingredientId : Nat) : async ?Ingredient {
    ingredients.get(ingredientId);
  };

  public query ({ caller }) func getAllIngredients() : async [Ingredient] {
    ingredients.values().toArray();
  };

  public query ({ caller }) func getLowStockIngredients() : async [Ingredient] {
    ingredients.values().toArray().filter(
      func(ingredient) {
        ingredient.quantity.value < ingredient.lowStockThreshold.value;
      }
    );
  };

  // Recipe management with persistent state
  public shared ({ caller }) func addRecipe(sessionId : SessionId, recipe : RecipeInput) : async () {
    validateSession(sessionId);

    let newRecipe : Recipe = {
      id = nextRecipeId;
      name = recipe.name;
      bowlSize = recipe.bowlSize;
      ingredients = recipe.ingredients;
    };
    recipes.add(newRecipe.id, newRecipe);
    nextRecipeId += 1;
  };

  public shared ({ caller }) func updateRecipe(sessionId : SessionId, recipeId : Nat, updatedRecipe : RecipeInput) : async () {
    validateSession(sessionId);

    switch (recipes.get(recipeId)) {
      case (null) {
        Runtime.trap("Recipe not found");
      };
      case (?existingRecipe) {
        let updatedRecipeObject = {
          existingRecipe with
          name = updatedRecipe.name;
          bowlSize = updatedRecipe.bowlSize;
          ingredients = updatedRecipe.ingredients;
        };
        recipes.add(recipeId, updatedRecipeObject);
      };
    };
  };

  public query ({ caller }) func getRecipe(recipeId : Nat) : async ?Recipe {
    recipes.get(recipeId);
  };

  public query ({ caller }) func getAllRecipes() : async [Recipe] {
    recipes.values().toArray();
  };

  func calculateTotalInventoryValue() : Float {
    ingredients.values().foldLeft(
      0.0,
      func(acc, ingredient) {
        let quantityInKg = switch (ingredient.quantity.unit) {
          case (#grams) { ingredient.quantity.value.toFloat() / 1000.0 };
          case (#kilograms) { ingredient.quantity.value.toFloat() };
        };
        acc + (quantityInKg * ingredient.costPricePerUnit);
      },
    );
  };

  public query ({ caller }) func getInventoryState() : async InventoryState {
    {
      ingredients = ingredients.values().toArray();
      totalValue = calculateTotalInventoryValue();
    };
  };

  // Customer management
  public shared ({ caller }) func addCustomer(sessionId : SessionId, customerData : CustomerInput) : async Nat {
    let currentTime = Time.now();

    let newCustomer : Customer = {
      id = nextCustomerId;
      name = customerData.name;
      contactInfo = customerData.contactInfo;
      address = customerData.address;
      isActive = true;
      createdAt = currentTime;
      updatedAt = currentTime;
    };

    customers.add(newCustomer.id, newCustomer);
    nextCustomerId += 1;
    newCustomer.id;
  };

  public shared ({ caller }) func updateCustomer(sessionId : SessionId, customerId : Nat, updatedData : CustomerInput) : async () {
    switch (customers.get(customerId)) {
      case (null) {
        Runtime.trap("Customer not found");
      };
      case (?existingCustomer) {
        let updatedCustomer = {
          existingCustomer with
          name = updatedData.name;
          contactInfo = updatedData.contactInfo;
          address = updatedData.address;
          updatedAt = Time.now();
        };
        customers.add(customerId, updatedCustomer);
      };
    };
  };

  public shared ({ caller }) func deleteCustomer(sessionId : SessionId, customerId : Nat) : async () {
    customers.remove(customerId);
  };

  public query ({ caller }) func getCustomers() : async [Customer] {
    customers.values().toArray();
  };
};
