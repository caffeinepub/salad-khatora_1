import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InvoiceInput {
    invoiceDate: bigint;
    discount: number;
    paymentMode: PaymentMode;
    customerId?: bigint;
    items: Array<InvoiceInputItem>;
}
export interface InvoiceItem {
    recipeId: bigint;
    quantity: bigint;
    unitPrice: number;
    totalPrice: number;
}
export interface RecipeInput {
    name: string;
    bowlSize: BowlSize;
    ingredients: Array<RecipeIngredient>;
}
export interface InventoryState {
    totalValue: number;
    ingredients: Array<Ingredient>;
}
export type SessionId = string;
export interface InvoiceInputItem {
    recipeId: bigint;
    quantity: bigint;
    unitPrice: number;
}
export interface Customer {
    id: bigint;
    contactInfo: string;
    name: string;
    createdAt: bigint;
    isActive: boolean;
    updatedAt: bigint;
    address: string;
}
export interface RecipeIngredient {
    quantity: Weight;
    ingredientId: bigint;
}
export interface SubscriptionInput {
    paymentStatus: Variant_cancelled_pending_paid_overdue;
    endDate: string;
    customerId: bigint;
    price: number;
    planType: Variant_weekly6days_monthly24days;
    bowlSize: BowlSize;
    startDate: string;
}
export interface Subscription {
    id: bigint;
    paymentStatus: Variant_cancelled_pending_paid_overdue;
    endDate: string;
    createdAt: bigint;
    isActive: boolean;
    customerId: bigint;
    price: number;
    planType: Variant_weekly6days_monthly24days;
    bowlSize: BowlSize;
    startDate: string;
}
export interface IngredientInput {
    lowStockThreshold: Weight;
    supplierName: string;
    name: string;
    quantity: Weight;
    costPricePerUnit: number;
}
export interface CustomerInput {
    contactInfo: string;
    name: string;
    address: string;
}
export interface Ingredient {
    id: bigint;
    lowStockThreshold: Weight;
    supplierName: string;
    name: string;
    quantity: Weight;
    costPricePerUnit: number;
}
export interface SalesInvoice {
    id: bigint;
    invoiceDate: bigint;
    totalAmount: number;
    discount: number;
    paymentMode: PaymentMode;
    customerId?: bigint;
    items: Array<InvoiceItem>;
}
export interface InventoryAdjustment {
    timestamp: bigint;
    relatedInvoiceId?: bigint;
    ingredientId: bigint;
    quantityChanged: Weight;
    reason: Variant_sale_restock;
}
export interface Recipe {
    id: bigint;
    name: string;
    bowlSize: BowlSize;
    ingredients: Array<RecipeIngredient>;
}
export interface Weight {
    value: bigint;
    unit: Variant_kilograms_grams;
}
export enum BowlSize {
    large = "large",
    small = "small",
    medium = "medium"
}
export enum PaymentMode {
    upi = "upi",
    card = "card",
    cash = "cash"
}
export enum Variant_cancelled_pending_paid_overdue {
    cancelled = "cancelled",
    pending = "pending",
    paid = "paid",
    overdue = "overdue"
}
export enum Variant_kilograms_grams {
    kilograms = "kilograms",
    grams = "grams"
}
export enum Variant_sale_restock {
    sale = "sale",
    restock = "restock"
}
export enum Variant_weekly6days_monthly24days {
    weekly6days = "weekly6days",
    monthly24days = "monthly24days"
}
export interface backendInterface {
    addCustomer(sessionId: SessionId, customerData: CustomerInput): Promise<bigint>;
    addIngredient(sessionId: SessionId, ingredient: IngredientInput): Promise<void>;
    addRecipe(sessionId: SessionId, recipe: RecipeInput): Promise<void>;
    addSubscription(sessionId: SessionId, subscriptionInput: SubscriptionInput): Promise<bigint>;
    createInvoice(sessionId: SessionId, invoiceInput: InvoiceInput): Promise<bigint>;
    createSession(): Promise<SessionId>;
    deleteCustomer(sessionId: SessionId, customerId: bigint): Promise<void>;
    deleteSubscription(sessionId: SessionId, subscriptionId: bigint): Promise<void>;
    endSession(sessionId: SessionId): Promise<void>;
    getAllIngredients(): Promise<Array<Ingredient>>;
    getAllInvoices(): Promise<Array<SalesInvoice>>;
    getAllRecipes(): Promise<Array<Recipe>>;
    getCustomers(): Promise<Array<Customer>>;
    getExpiringSubscriptions(): Promise<Array<Subscription>>;
    getIngredient(ingredientId: bigint): Promise<Ingredient | null>;
    getInventoryAdjustments(ingredientId: bigint): Promise<Array<InventoryAdjustment>>;
    getInventoryState(): Promise<InventoryState>;
    getInvoice(invoiceId: bigint): Promise<SalesInvoice | null>;
    getInvoicesByCustomer(customerId: bigint): Promise<Array<SalesInvoice>>;
    getLowStockIngredients(): Promise<Array<Ingredient>>;
    getRecipe(recipeId: bigint): Promise<Recipe | null>;
    getSubscriptions(customerId: bigint | null): Promise<Array<Subscription>>;
    isSessionActive(sessionId: SessionId): Promise<boolean>;
    restockIngredient(sessionId: SessionId, ingredientId: bigint, quantity: Weight): Promise<void>;
    updateCustomer(sessionId: SessionId, customerId: bigint, updatedData: CustomerInput): Promise<void>;
    updateIngredient(sessionId: SessionId, ingredientId: bigint, updatedIngredient: IngredientInput): Promise<void>;
    updateRecipe(sessionId: SessionId, recipeId: bigint, updatedRecipe: RecipeInput): Promise<void>;
    updateSubscription(sessionId: SessionId, subscriptionId: bigint, updatedInput: SubscriptionInput): Promise<void>;
}
