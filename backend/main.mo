import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Array "mo:core/Array";
import Migration "migration";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

(with migration = Migration.run)
actor {
  type Weight = {
    value : Float;
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

  type IngredientError = {
    #duplicateIngredient;
    #storageIssue;
    #validationError : { failedField : Text; errorMessage : Text };
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

  type DayRecord = {
    date : Text;
    status : {
      #pending;
      #delivered;
      #missed;
    };
  };

  type SubscriptionAdvanced = {
    id : Nat;
    customerId : Nat;
    planId : Nat;
    startDate : Text;
    endDate : Text;
    bowlSize : BowlSize;
    price : Float;
    paymentStatus : { #paid; #pending; #overdue; #cancelled };
    isActive : Bool;
    createdAt : Int;
    dayRecords : [DayRecord];
  };

  type SubscriptionInputAdvanced = {
    customerId : Nat;
    planId : Nat;
    startDate : Text;
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

  type Plan = {
    id : Nat;
    name : Text;
    price : Float;
    bowlSize : Text;
    bowlPrice : Float;
    createdAt : Int;
  };

  type PlanInput = {
    name : Text;
    price : Float;
    bowlSize : Text;
    bowlPrice : Float;
  };

  type PlanEnrollmentCount = {
    planId : Nat;
    count : Nat;
  };

  type UserProfile = {
    name : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextIngredientId = 1;
  var nextRecipeId = 1;
  var nextCustomerId = 1;
  var nextSubscriptionId = 1;
  var nextInvoiceId = 1;
  var nextPlanId = 1;
  var userProfiles = Map.empty<Principal, UserProfile>();
  var ingredients = Map.empty<Nat, Ingredient>();
  var recipes = Map.empty<Nat, Recipe>();
  var customers = Map.empty<Nat, Customer>();
  var subscriptionsAdvanced = Map.empty<Nat, SubscriptionAdvanced>();
  var salesInvoices = Map.empty<Nat, SalesInvoice>();
  var plans = Map.empty<Nat, Plan>();
  var inventoryAdjustments = Map.empty<Nat, [InventoryAdjustment]>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createIngredient(input : IngredientInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create ingredients");
    };
    let id = nextIngredientId;
    let ingredient : Ingredient = {
      id;
      name = input.name;
      quantity = input.quantity;
      costPricePerUnit = input.costPricePerUnit;
      supplierName = input.supplierName;
      lowStockThreshold = input.lowStockThreshold;
    };
    ingredients.add(id, ingredient);
    nextIngredientId += 1;
    id;
  };

  public query ({ caller }) func getIngredients() : async [Ingredient] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch ingredients");
    };
    ingredients.values().toArray();
  };

  public shared ({ caller }) func updateIngredient(
    id : Nat,
    input : IngredientInput,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update ingredients");
    };
    switch (ingredients.get(id)) {
      case (null) {
        Runtime.trap("Ingredient not found");
      };
      case (?_) {
        let updatedIngredient : Ingredient = {
          id;
          name = input.name;
          quantity = input.quantity;
          costPricePerUnit = input.costPricePerUnit;
          supplierName = input.supplierName;
          lowStockThreshold = input.lowStockThreshold;
        };
        ingredients.add(id, updatedIngredient);
      };
    };
  };

  public shared ({ caller }) func deleteIngredient(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete ingredients");
    };
    switch (ingredients.get(id)) {
      case (null) {
        Runtime.trap("Ingredient not found");
      };
      case (?_) {
        ingredients.remove(id);
      };
    };
  };

  public shared ({ caller }) func createCustomer(input : CustomerInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create customers");
    };
    let id = nextCustomerId;
    let customer : Customer = {
      id;
      name = input.name;
      contactInfo = input.contactInfo;
      address = input.address;
      isActive = true;
      createdAt = Int.abs(Time.now() * 1000000);
      updatedAt = Int.abs(Time.now() * 1000000);
    };
    customers.add(id, customer);
    nextCustomerId += 1;
    id;
  };

  public query ({ caller }) func getCustomers() : async [Customer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch customers");
    };
    customers.values().toArray();
  };

  public shared ({ caller }) func updateCustomer(
    id : Nat,
    input : CustomerInput,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update customers");
    };
    switch (customers.get(id)) {
      case (null) {
        Runtime.trap("Customer not found");
      };
      case (?existingCustomer) {
        let updatedCustomer : Customer = {
          existingCustomer with
          name = input.name;
          contactInfo = input.contactInfo;
          address = input.address;
          updatedAt = Int.abs(Time.now() * 1000000);
        };
        customers.add(id, updatedCustomer);
      };
    };
  };

  public shared ({ caller }) func deleteCustomer(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete customers");
    };
    switch (customers.get(id)) {
      case (null) {
        Runtime.trap("Customer not found");
      };
      case (?_) {
        customers.remove(id);
      };
    };
  };
};
