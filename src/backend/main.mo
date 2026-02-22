import Array "mo:core/Array";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Float "mo:core/Float";

actor {
  type Weight = {
    value : Int;
    unit : { #grams; #kilograms };
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

  type BowlSize = { #small; #medium; #large };

  type RecipeIngredient = {
    ingredientId : Nat;
    quantity : Weight; // quantity in grams for the ingredient
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

  type Subscription = {
    id : Nat;
    customerId : Nat;
    planType : { #weekly6days; #monthly24days };
    startDate : Text;
    endDate : Text;
    bowlSize : BowlSize;
    price : Float;
    paymentStatus : { #paid; #pending; #overdue; #cancelled };
    isActive : Bool;
    createdAt : Int;
  };

  type SubscriptionInput = {
    customerId : Nat;
    planType : { #weekly6days; #monthly24days };
    startDate : Text;
    endDate : Text;
    bowlSize : BowlSize;
    price : Float;
    paymentStatus : { #paid; #pending; #overdue; #cancelled };
  };

  type InvoiceItem = {
    recipeId : Nat;
    quantity : Nat;
    unitPrice : Float;
    totalPrice : Float;
  };

  type PaymentMode = { #cash; #card; #upi };

  type SalesInvoice = {
    id : Nat;
    customerId : ?Nat;
    invoiceDate : Int;
    items : [InvoiceItem];
    discount : Float;
    paymentMode : PaymentMode;
    totalAmount : Float;
  };

  type InvoiceInputItem = {
    recipeId : Nat;
    quantity : Nat;
    unitPrice : Float;
  };

  type InvoiceInput = {
    customerId : ?Nat;
    invoiceDate : Int;
    items : [InvoiceInputItem];
    discount : Float;
    paymentMode : PaymentMode;
  };

  type InventoryAdjustment = {
    ingredientId : Nat;
    quantityChanged : Weight;
    timestamp : Int;
    reason : { #sale; #restock };
    relatedInvoiceId : ?Nat;
  };

  var nextIngredientId = 1;
  var nextRecipeId = 1;
  var nextCustomerId = 1;
  var nextSubscriptionId = 1;
  var nextInvoiceId = 1;

  let activeSessions = Map.empty<Text, ()>();
  let ingredients = Map.empty<Nat, Ingredient>();
  let recipes = Map.empty<Nat, Recipe>();
  let customers = Map.empty<Nat, Customer>();
  let subscriptions = Map.empty<Nat, Subscription>();
  let salesInvoices = Map.empty<Nat, SalesInvoice>();
  let inventoryAdjustments = Map.empty<Nat, List.List<InventoryAdjustment>>();

  public shared ({ caller }) func createSession() : async SessionId {
    let sessionId = caller.toText();
    activeSessions.add(sessionId, ());
    sessionId;
  };

  public query ({ caller }) func isSessionActive(sessionId : SessionId) : async Bool {
    activeSessions.containsKey(sessionId);
  };

  func validateSession(sessionId : SessionId) : () {
    if (not activeSessions.containsKey(sessionId)) {
      Runtime.trap("Invalid session. Please authenticate.");
    };
  };

  public shared ({ caller }) func endSession(sessionId : SessionId) : async () {
    activeSessions.remove(sessionId);
  };

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

  // Subscription Management
  public shared ({ caller }) func addSubscription(sessionId : SessionId, subscriptionInput : SubscriptionInput) : async Nat {
    validateSession(sessionId);
    let currentTime = Time.now();

    let newSubscription : Subscription = {
      id = nextSubscriptionId;
      customerId = subscriptionInput.customerId;
      planType = subscriptionInput.planType;
      startDate = subscriptionInput.startDate;
      endDate = subscriptionInput.endDate;
      bowlSize = subscriptionInput.bowlSize;
      price = subscriptionInput.price;
      paymentStatus = subscriptionInput.paymentStatus;
      isActive = true;
      createdAt = currentTime;
    };

    subscriptions.add(nextSubscriptionId, newSubscription);
    nextSubscriptionId += 1;
    newSubscription.id;
  };

  public query ({ caller }) func getSubscriptions(customerId : ?Nat) : async [Subscription] {
    subscriptions.values().toArray().filter(
      func(sub) {
        switch (customerId) {
          case (null) { true };
          case (?id) { sub.customerId == id };
        };
      }
    );
  };

  public shared ({ caller }) func updateSubscription(sessionId : SessionId, subscriptionId : Nat, updatedInput : SubscriptionInput) : async () {
    validateSession(sessionId);

    switch (subscriptions.get(subscriptionId)) {
      case (null) {
        Runtime.trap("Subscription not found");
      };
      case (?existingSubscription) {
        let updatedSubscription = {
          existingSubscription with
          customerId = updatedInput.customerId;
          planType = updatedInput.planType;
          startDate = updatedInput.startDate;
          endDate = updatedInput.endDate;
          bowlSize = updatedInput.bowlSize;
          price = updatedInput.price;
          paymentStatus = updatedInput.paymentStatus;
        };
        subscriptions.add(subscriptionId, updatedSubscription);
      };
    };
  };

  public shared ({ caller }) func deleteSubscription(sessionId : SessionId, subscriptionId : Nat) : async () {
    validateSession(sessionId);
    subscriptions.remove(subscriptionId);
  };

  public query ({ caller }) func getExpiringSubscriptions() : async [Subscription] {
    let currentTimeInt = Time.now();
    let expiringThreshold = currentTimeInt + (2 * 24 * 60 * 60 * 1000000000); // 2 days in nanoseconds

    subscriptions.values().toArray().filter(
      func(sub) {
        switch (parseSubscriptionEndDate(sub.endDate)) {
          case (?endDateTimestamp) {
            endDateTimestamp >= currentTimeInt and endDateTimestamp <= expiringThreshold
          };
          case (null) { false };
        };
      }
    );
  };

  func parseSubscriptionEndDate(_dateString : Text) : ?Int {
    // Only nanoseconds are supported in times. Converting string to nanoseconds required.
    null;
  };

  // Sales Module implementation
  public shared ({ caller }) func createInvoice(sessionId : SessionId, invoiceInput : InvoiceInput) : async Nat {
    validateSession(sessionId);

    let currentTime = Time.now();
    let items = invoiceInput.items.map(
      func(itemInput) {
        {
          recipeId = itemInput.recipeId;
          quantity = itemInput.quantity;
          unitPrice = itemInput.unitPrice;
          totalPrice = itemInput.unitPrice * itemInput.quantity.toFloat();
        };
      }
    );
    let totalAmount = items.foldLeft(
      0.0,
      func(acc, item) {
        acc + item.totalPrice;
      },
    ) - invoiceInput.discount;

    let newInvoice : SalesInvoice = {
      id = nextInvoiceId;
      customerId = invoiceInput.customerId;
      invoiceDate = currentTime;
      items;
      discount = invoiceInput.discount;
      paymentMode = invoiceInput.paymentMode;
      totalAmount;
    };

    salesInvoices.add(nextInvoiceId, newInvoice);

    adjustInventoryForSale(items, nextInvoiceId);

    nextInvoiceId += 1;
    newInvoice.id;
  };

  func adjustInventoryForSale(invoiceItems : [InvoiceItem], invoiceId : Nat) {
    let inventoryAdjustmentsList = List.empty<(Nat, InventoryAdjustment)>();

    for (item in invoiceItems.values()) {
      switch (recipes.get(item.recipeId)) {
        case (null) {};
        case (?recipe) {
          for (ingredient in recipe.ingredients.values()) {
            inventoryAdjustmentsList.add(
              (
                ingredient.ingredientId,
                {
                  ingredientId = ingredient.ingredientId;
                  quantityChanged = {
                    value = -ingredient.quantity.value * item.quantity.toInt();
                    unit = ingredient.quantity.unit;
                  };
                  timestamp = Time.now();
                  reason = #sale;
                  relatedInvoiceId = ?invoiceId;
                },
              ),
            );
          };
        };
      };
    };

    let inventoryAdjustmentsArray = inventoryAdjustmentsList.toArray();
    for (adjustment in inventoryAdjustmentsArray.values()) {
      switch (adjustment) {
        case ((ingredientId, inventoryAdjustment)) {
          let currentAdjustments = switch (inventoryAdjustments.get(ingredientId)) {
            case (null) {
              let newList = List.empty<InventoryAdjustment>();
              newList.add(inventoryAdjustment);
              newList;
            };
            case (?existingAdjustments) {
              existingAdjustments.add(inventoryAdjustment);
              existingAdjustments;
            };
          };

          inventoryAdjustments.add(ingredientId, currentAdjustments);

          switch (ingredients.get(ingredientId)) {
            case (?existingIngredient) {
              let currentQuantity = existingIngredient.quantity.value;
              let quantityChange = inventoryAdjustment.quantityChanged.value; // Change (diff)
              let newQuantity = currentQuantity + quantityChange; // Add diff to quantity and persist data type change
              let updatedIngredient = {
                existingIngredient with
                quantity = {
                  value = newQuantity;
                  unit = existingIngredient.quantity.unit;
                };
              };
              ingredients.add(ingredientId, updatedIngredient);
            };
            case (null) {};
          };
        };
      };
    };
  };

  public query ({ caller }) func getInvoice(invoiceId : Nat) : async ?SalesInvoice {
    salesInvoices.get(invoiceId);
  };

  public query ({ caller }) func getAllInvoices() : async [SalesInvoice] {
    salesInvoices.values().toArray();
  };

  public query ({ caller }) func getInvoicesByCustomer(customerId : Nat) : async [SalesInvoice] {
    let allInvoices = salesInvoices.values().toArray();
    allInvoices.filter(
      func(invoice) {
        switch (invoice.customerId) {
          case (?id) { id == customerId };
          case (null) { false };
        };
      }
    );
  };

  public query ({ caller }) func getInventoryAdjustments(ingredientId : Nat) : async [InventoryAdjustment] {
    switch (inventoryAdjustments.get(ingredientId)) {
      case (null) { [] };
      case (?adjustmentsList) {
        let result = adjustmentsList.toArray();
        result.map(
          func(adjustment) { adjustment }, // Map over the array and return each adjustment
        );
      };
    };
  };

  public shared ({ caller }) func restockIngredient(
    sessionId : SessionId,
    ingredientId : Nat,
    quantity : Weight,
  ) : async () {
    validateSession(sessionId);

    if (quantity.value <= 0) {
      Runtime.trap("Quantity must be positive");
    };

    switch (ingredients.get(ingredientId)) {
      case (null) {
        Runtime.trap("Ingredient not found");
      };
      case (?existingIngredient) {
        let updatedIngredient = {
          existingIngredient with
          quantity = {
            value = existingIngredient.quantity.value + quantity.value;
            unit = existingIngredient.quantity.unit;
          };
        };

        ingredients.add(ingredientId, updatedIngredient);

        let adjustment : InventoryAdjustment = {
          ingredientId;
          quantityChanged = quantity;
          timestamp = Time.now();
          reason = #restock;
          relatedInvoiceId = null;
        };

        let currentAdjustments = switch (inventoryAdjustments.get(ingredientId)) {
          case (null) {
            let newList = List.empty<InventoryAdjustment>();
            newList.add(adjustment);
            newList;
          };
          case (?existingAdjustments) {
            existingAdjustments.add(adjustment);
            existingAdjustments;
          };
        };

        inventoryAdjustments.add(ingredientId, currentAdjustments);
      };
    };
  };
};
