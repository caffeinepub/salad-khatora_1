import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAuth } from '../contexts/AuthContext';
import type { Ingredient, Recipe, Customer, IngredientInput, RecipeInput, CustomerInput } from '../backend';

export function useIngredients() {
  const { actor, isFetching } = useActor();

  return useQuery<Ingredient[]>({
    queryKey: ['ingredients'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllIngredients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddIngredient() {
  const { actor } = useActor();
  const { sessionId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ingredient: IngredientInput) => {
      if (!actor || !sessionId) throw new Error('Not authenticated');
      return actor.addIngredient(sessionId, ingredient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryState'] });
    },
  });
}

export function useUpdateIngredient() {
  const { actor } = useActor();
  const { sessionId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ingredient }: { id: bigint; ingredient: IngredientInput }) => {
      if (!actor || !sessionId) throw new Error('Not authenticated');
      return actor.updateIngredient(sessionId, id, ingredient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryState'] });
    },
  });
}

export function useInventoryState() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['inventoryState'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getInventoryState();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLowStockIngredients() {
  const { actor, isFetching } = useActor();

  return useQuery<Ingredient[]>({
    queryKey: ['lowStockIngredients'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLowStockIngredients();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useRecipes() {
  const { actor, isFetching } = useActor();

  return useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRecipes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddRecipe() {
  const { actor } = useActor();
  const { sessionId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipe: RecipeInput) => {
      if (!actor || !sessionId) throw new Error('Not authenticated');
      return actor.addRecipe(sessionId, recipe);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

export function useUpdateRecipe() {
  const { actor } = useActor();
  const { sessionId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, recipe }: { id: bigint; recipe: RecipeInput }) => {
      if (!actor || !sessionId) throw new Error('Not authenticated');
      return actor.updateRecipe(sessionId, id, recipe);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

export function useCustomers() {
  const { actor, isFetching } = useActor();

  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCustomers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCustomer() {
  const { actor } = useActor();
  const { sessionId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerData: CustomerInput) => {
      if (!actor || !sessionId) throw new Error('Not authenticated');
      return actor.addCustomer(sessionId, customerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const { actor } = useActor();
  const { sessionId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, customerData }: { id: bigint; customerData: CustomerInput }) => {
      if (!actor || !sessionId) throw new Error('Not authenticated');
      return actor.updateCustomer(sessionId, id, customerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
