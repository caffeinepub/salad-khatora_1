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
    addIngredient(sessionId: SessionId, ingredient: IngredientInput): Promise<void>;
    addRecipe(sessionId: SessionId, recipe: RecipeInput): Promise<void>;
    createSession(): Promise<SessionId>;
    endSession(sessionId: SessionId): Promise<void>;
    getAllIngredients(): Promise<Array<Ingredient>>;
    getAllRecipes(): Promise<Array<Recipe>>;
    getIngredient(ingredientId: bigint): Promise<Ingredient | null>;
    getInventoryState(): Promise<InventoryState>;
    getLowStockIngredients(): Promise<Array<Ingredient>>;
    getRecipe(recipeId: bigint): Promise<Recipe | null>;
    isSessionActive(sessionId: SessionId): Promise<boolean>;
    updateIngredient(sessionId: SessionId, ingredientId: bigint, updatedIngredient: IngredientInput): Promise<void>;
    updateRecipe(sessionId: SessionId, recipeId: bigint, updatedRecipe: RecipeInput): Promise<void>;
}
