import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  public type Weight = {
    value : Float;
    unit : {
      #grams;
      #kilograms;
    };
  };

  public type Ingredient = {
    id : Nat;
    name : Text;
    quantity : Weight;
    costPricePerUnit : Float;
    supplierName : Text;
    lowStockThreshold : Weight;
  };

  public type BowlSize = {
    #small;
    #medium;
    #large;
  };

  public type RecipeIngredient = {
    ingredientId : Nat;
    quantity : Weight;
  };

  public type Recipe = {
    id : Nat;
    name : Text;
    bowlSize : BowlSize;
    ingredients : [RecipeIngredient];
  };

  public type InventoryState = {
    ingredients : [Ingredient];
    totalValue : Float;
  };

  public type Customer = {
    id : Nat;
    name : Text;
    contactInfo : Text;
    address : Text;
    isActive : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  public type DayRecord = {
    date : Text;
    status : {
      #pending;
      #delivered;
      #missed;
    };
  };

  public type SubscriptionAdvanced = {
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

  public type InvoiceItem = {
    recipeId : Nat;
    quantity : Nat;
    unitPrice : Float;
    totalPrice : Float;
  };

  public type PaymentMode = { #cash; #card; #upi };

  public type SalesInvoice = {
    id : Nat;
    customerId : ?Nat;
    invoiceDate : Int;
    items : [InvoiceItem];
    discount : Float;
    paymentMode : PaymentMode;
    totalAmount : Float;
  };

  public type InventoryAdjustment = {
    ingredientId : Nat;
    quantityChanged : Weight;
    timestamp : Int;
    reason : { #sale; #restock };
    relatedInvoiceId : ?Nat;
  };

  public type Plan = {
    id : Nat;
    name : Text;
    price : Float;
    bowlSize : Text;
    bowlPrice : Float;
    createdAt : Int;
  };

  public type PlanEnrollmentCount = {
    planId : Nat;
    count : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  public type OldActor = {
    ingredients : Map.Map<Nat, Ingredient>;
    recipes : Map.Map<Nat, Recipe>;
    customers : Map.Map<Nat, Customer>;
    subscriptionsAdvanced : Map.Map<Nat, SubscriptionAdvanced>;
    salesInvoices : Map.Map<Nat, SalesInvoice>;
    plans : Map.Map<Nat, Plan>;
    userProfiles : Map.Map<Principal, UserProfile>;
    activeSessions : Map.Map<Text, ()>;
    inventoryAdjustments : Map.Map<Nat, List.List<InventoryAdjustment>>;
  };

  public type NewActor = {
    ingredients : Map.Map<Nat, Ingredient>;
    recipes : Map.Map<Nat, Recipe>;
    customers : Map.Map<Nat, Customer>;
    subscriptionsAdvanced : Map.Map<Nat, SubscriptionAdvanced>;
    salesInvoices : Map.Map<Nat, SalesInvoice>;
    plans : Map.Map<Nat, Plan>;
    userProfiles : Map.Map<Principal, UserProfile>;
    inventoryAdjustments : Map.Map<Nat, [InventoryAdjustment]>;
  };

  public func run(old : OldActor) : NewActor {
    let newInventoryAdjustments = old.inventoryAdjustments.map<Nat, List.List<InventoryAdjustment>, [InventoryAdjustment]>(
      func(_key, list) { list.toArray() }
    );
    {
      ingredients = old.ingredients;
      recipes = old.recipes;
      customers = old.customers;
      subscriptionsAdvanced = old.subscriptionsAdvanced;
      salesInvoices = old.salesInvoices;
      plans = old.plans;
      userProfiles = old.userProfiles;
      inventoryAdjustments = newInventoryAdjustments;
    };
  };
};
