import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface IngredientInput {
    lowStockThreshold: Weight;
    supplierName: string;
    name: string;
    quantity: Weight;
    costPricePerUnit: number;
}
export interface Weight {
    value: bigint;
    unit: Variant_kilograms_grams;
}
export interface RecipeInput {
    name: string;
    bowlSize: BowlSize;
    ingredients: Array<RecipeIngredient>;
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
export interface InventoryState {
    totalValue: number;
    ingredients: Array<Ingredient>;
}
export type SessionId = string;
export interface Recipe {
    id: bigint;
    name: string;
    bowlSize: BowlSize;
    ingredients: Array<RecipeIngredient>;
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
export enum BowlSize {
    large = "large",
    small = "small",
    medium = "medium"
}
export enum Variant_kilograms_grams {
    kilograms = "kilograms",
    grams = "grams"
}
export interface backendInterface {
    addCustomer(sessionId: SessionId, customerData: CustomerInput): Promise<bigint>;
    addIngredient(sessionId: SessionId, ingredient: IngredientInput): Promise<void>;
    addRecipe(sessionId: SessionId, recipe: RecipeInput): Promise<void>;
    createSession(): Promise<SessionId>;
    deleteCustomer(sessionId: SessionId, customerId: bigint): Promise<void>;
    endSession(sessionId: SessionId): Promise<void>;
    getAllIngredients(): Promise<Array<Ingredient>>;
    getAllRecipes(): Promise<Array<Recipe>>;
    getCustomers(): Promise<Array<Customer>>;
    getIngredient(ingredientId: bigint): Promise<Ingredient | null>;
    getInventoryState(): Promise<InventoryState>;
    getLowStockIngredients(): Promise<Array<Ingredient>>;
    getRecipe(recipeId: bigint): Promise<Recipe | null>;
    isSessionActive(sessionId: SessionId): Promise<boolean>;
    updateCustomer(sessionId: SessionId, customerId: bigint, updatedData: CustomerInput): Promise<void>;
    updateIngredient(sessionId: SessionId, ingredientId: bigint, updatedIngredient: IngredientInput): Promise<void>;
    updateRecipe(sessionId: SessionId, recipeId: bigint, updatedRecipe: RecipeInput): Promise<void>;
}
