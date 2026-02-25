# Specification

## Summary
**Goal:** Fix data persistence across page refreshes and tab navigation, and ensure all CRUD operations work correctly for the Salad Khatora meal delivery subscription management app.

**Planned changes:**
- Declare all backend data collections (Ingredients, Recipes, Customers, Subscriptions, Invoices, Plans) as `stable` variables in `main.mo` so data survives canister upgrades and page refreshes
- Implement full CRUD backend endpoints for Ingredients, Customers, Subscriptions, Plans, Recipes, and Invoices, all reading from and writing to stable storage
- Fix `IngredientForm` to correctly call `createIngredient`/`updateIngredient` backend mutations and invalidate the query cache on success so `IngredientList` re-renders immediately
- Wire all React Query hooks in `useQueries.ts` to the correct stable backend actor methods for all entities (ingredients, recipes, customers, subscriptions, invoices, plans)
- Ensure mutations trigger query invalidation so all tabs (Dashboard, Subscriptions, Customers, Inventory, Menu, Sales, Plans) reflect current state without stale or empty displays
- Preserve all existing navigation tabs and routing in `Layout.tsx` unchanged
- Add a migration in `main.mo` to handle canister upgrades, converting any legacy boolean `delivered` fields to the tri-state `#delivered / #missed / #pending` status variant

**User-visible outcome:** All records (ingredients, customers, subscriptions, plans, recipes, invoices) now persist across page refreshes and tab switches. Adding or editing any record immediately reflects in the relevant list without a manual reload, and no data is lost on navigation.
