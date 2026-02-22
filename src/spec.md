# Specification

## Summary
**Goal:** Implement a functional customer management page with the ability to add and edit customer details.

**Planned changes:**
- Replace the placeholder CustomersPage with a functional customer list display showing existing customers in a grid layout
- Add an "Add Customer" button that opens a form dialog for creating new customers
- Create a CustomerForm component with fields for name, mobile number, email, reference source, preferences, and address
- Implement form validation for mobile number and email formats using react-hook-form
- Add backend CRUD operations (addCustomer, updateCustomer, getCustomers) in the main actor with session protection
- Create a CustomerList component that displays customer cards with name, mobile, email, and edit buttons
- Add React Query hooks (useCustomers, useAddCustomer, useUpdateCustomer) for data fetching and mutations
- Enable editing of existing customers by opening the CustomerForm dialog with pre-filled data

**User-visible outcome:** Users can view all customers in a grid layout, add new customers using a form dialog with validated fields (name, mobile, email, reference source, preferences, address), and edit existing customer information. The page follows the same design pattern as the Inventory and Menu pages.
