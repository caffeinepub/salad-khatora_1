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
    value: number;
    unit: Variant_kilograms_grams;
}
export interface Ingredient {
    id: bigint;
    lowStockThreshold: Weight;
    supplierName: string;
    name: string;
    quantity: Weight;
    costPricePerUnit: number;
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
export interface UserProfile {
    name: string;
}
export interface CustomerInput {
    contactInfo: string;
    name: string;
    address: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_kilograms_grams {
    kilograms = "kilograms",
    grams = "grams"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCustomer(input: CustomerInput): Promise<bigint>;
    createIngredient(input: IngredientInput): Promise<bigint>;
    deleteCustomer(id: bigint): Promise<void>;
    deleteIngredient(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomers(): Promise<Array<Customer>>;
    getIngredients(): Promise<Array<Ingredient>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCustomer(id: bigint, input: CustomerInput): Promise<void>;
    updateIngredient(id: bigint, input: IngredientInput): Promise<void>;
}
