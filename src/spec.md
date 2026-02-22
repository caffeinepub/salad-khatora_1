# Specification

## Summary
**Goal:** Fix the /sales route error and implement a comprehensive invoice creation system with customer selection, multiple line items, automatic inventory deduction, and complete invoice details capture.

**Planned changes:**
- Fix the "Something went wrong!" error on the /sales route to restore access to invoice creation
- Add customer dropdown in invoice form showing pre-registered customers from the backend
- Enable inline entry of new customer names directly in the invoice form
- Display all available recipes with search and filter functionality in item selection
- Show recipe prices alongside recipe names in the item selection interface
- Allow adding multiple recipe items with quantities to a single invoice
- Capture comprehensive invoice details including customer info, items, quantities, pricing, invoice date, payment method, notes, and tax calculations
- Implement automatic ingredient deduction from inventory when an invoice is saved, based on recipes and quantities
- Calculate and display subtotal, discount, tax, and total amount in real-time as items are added or modified

**User-visible outcome:** Users can access the /sales route without errors, create invoices by selecting pre-registered customers or entering new customer names, add multiple recipe items with quantities, see prices and totals calculated in real-time, and have ingredient quantities automatically deducted from inventory when the invoice is saved.
