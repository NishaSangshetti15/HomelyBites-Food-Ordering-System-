# HomelyBites — API Reference (Local testing)

This document lists all API endpoints present in the workspace, example requests, headers, and expected responses for local testing.

Notes
- Server base: `http://localhost:4000`
- Auth: endpoints (except signup/signin and `/admin/login`) require header `token: <JWT>` returned by signin/login.
- `server.js` currently mounts: `/customer` and `/admin`. `homechef` and `feedback` routes exist but may not be mounted.

---

## Customer APIs

1) POST /customer/signup
- Body (JSON):
```
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password_hash": "password123",
  "phone_number": "9876543210"
}
```
- Success (201-like MySQL insert):
```
{ "status": "success", "data": { "affectedRows": 1, "insertId": 1 } }
```
- Errors: duplicate email or DB error

2) POST /customer/signin
- Body:
```
{ "email": "john.doe@example.com", "password": "password123" }
```
- Success:
```
{ "status": "success", "data": { "token": "<JWT>", "first_name": "John", ... } }
```
- Errors: Invalid Email / Invalid Password

3) POST /customer/address
- Headers: `token: <JWT>`
- Body:
```
{
  "street":"123 Main St",
  "city":"New York",
  "pincode":"10001",
  "house_no":"123",
  "label":"Home",
  "latitude":"40.7128",
  "longitude":"-74.0060"
}
```
- Server uses `req.user.customer_id` from verified JWT; it inserts into `Addresses` as `entity_type='Customer'`, `entity_id=<customer_id>`.
- Success:
```
{ "status": "success", "data": { "affectedRows":1, "insertId": <id> } }
```
- Error: if token missing/invalid → `{ status: 'error', error: 'Token is Missing' }` or `Invalid Token`; if `entity_id` null means token wasn't present/validated.

4) GET /customer/profile
- Headers: `token: <JWT>`
- Response:
```
{ "status": "success", "data": { "customer_id":1, "first_name":"John", ... } }
```

5) PUT /customer/profile
- Headers: `token: <JWT>`
- Body (example):
```
{ "first_name": "John", "last_name": "Doe", "phone_number": "9999999999" }
```
- Server updates `Customers` where `customer_id` = token user id.
- Success:
```
{ "status": "success", "data": { "affectedRows": 1 } }
```

---

## HomeChef APIs (routes exist; may need mounting)

6) POST /homechef/signup
- Body:
```
{ "business_name":"Chef John's Kitchen", "email":"chef.john@example.com", "password_hash":"chefpass123", "phone_number":"9876543211" }
```
- Success: insert result

7) POST /homechef/signin
- Body:
```
{ "email":"chef.john@example.com", "password":"chefpass123" }
```
- Success: returns `token` and chef info. Note: login blocks if `is_active` is false.

8) POST /homechef/service-area
- Headers: `token: <JWT>` (chef token)
- Body:
```
{ "pincode":"10001", "delivery_fee":"50" }
```
- Inserts into `ServiceAreas` with `chef_id` from token

9) POST /homechef/menu
- Headers: `token: <JWT>`
- Body:
```
{ "name":"Butter Chicken", "base_price":"250", "description":"..." }
```
- Inserts `MenuItems` with `chef_id` from token

10) GET /homechef/menu
- Headers: `token: <JWT>`
- Returns menu items for chef

11) PUT /homechef/menu/:id
- Headers: `token: <JWT>`
- Body:
```
{ "name":"New Name", "base_price":300, "is_available":true }
```
- Updates menu item where `item_id` and `chef_id` match

---

## Feedback API (route exists; may need mounting)

12) POST /feedback
- Headers: `token: <JWT>`
- Body:
```
{ "orderId":"12345", "rating":"5", "comment":"Excellent" }
```
- Note: database does not currently include a `feedback` table in schema. Either create the table or update query to existing table.

---

## Admin APIs (mounted at `/admin`)

13) GET /admin/
- Protected: `token: <JWT>` with `is_admin:true` in payload
- Returns all customers (used as quick admin listing)

14) POST /admin/login
- Body:
```
{ "email":"admin@local", "password":"admin123" }
```
- Success: returns JWT token with payload `{ is_admin:true, email }` (fallback credentials live in `utils/config.js`) or checks `Admins` table if present.

15) GET /admin/chefs
- Protected admin
- Returns all rows from `HomeChefs`

16) PUT /admin/chefs/:chefid/approve
- Protected admin
- Sets `is_active = TRUE` for the chef
- Response: MySQL update result

17) PUT /admin/chefs/:chefid/block
- Protected admin
- Sets `is_active = FALSE` for the chef

18) GET /admin/customers
- Protected admin
- Returns all rows from `Customers`

19) GET /admin/orders
- Protected admin
- Returns all rows from `Orders`

20) GET /admin/feedbacks
- Protected admin
- Attempts to return rows from `feedback` table (table may not exist)

21) POST /admin/service-areas
- Protected admin
- Body:
```
{ "chef_id": 1, "pincode": "10001", "delivery_fee": "50" }
```
- Inserts service area

22) GET /admin/delivery-personnel
- Protected admin
- Returns rows from `DeliveryPersonnel`

---

## Common Error Responses
- Missing token:
```
{ "status": "error", "error": "Token is Missing" }
```
- Invalid token:
```
{ "status": "error", "error": "Invalid Token" }
```
- DB insert/update error (example):
```
{ "status": "error", "error": { "code":"ER_NO_SUCH_TABLE", ... } }
```

---

## Quick test sequence (Postman/Insomnia)
1. POST `/customer/signup`
2. POST `/customer/signin` → save `token`
3. GET `/customer/profile` with `token`
4. POST `/customer/address` with `token`
5. (Optional) POST `/admin/login` (use fallback admin creds in `utils/config.js`) → save admin token
6. GET `/admin/chefs` with admin token
7. PUT `/admin/chefs/:chefid/approve` with admin token

---

If you want, I can:
- Mount `homechef` and `feedback` routers in `server.js`.
- Add missing DB tables (e.g., `feedback`) SQL statements in a migration file.
- Add pagination/filtering and stricter admin auth (hashed password storage).

