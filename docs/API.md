# DHARIGA MART - REST API Reference

Base URL: `http://localhost:8080`

## Public endpoints (no token)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | `{name, phone, email, password, confirmPassword}` |
| POST | `/api/auth/login` | `{email, password}` -> returns JWT + user |
| GET | `/api/products` | `?search=&category=&sort=asc\|desc` |
| GET | `/api/products/{id}` | product details |
| GET | `/api/categories` | distinct categories |

## Authenticated endpoints (header: `Authorization: Bearer <token>`)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/users/me` | profile |
| GET/POST | `/api/cart` | view / add `{productId, quantity}` |
| PUT | `/api/cart/{productId}` | update quantity |
| DELETE | `/api/cart/{productId}` | remove item |
| DELETE | `/api/cart` | clear cart |
| POST | `/api/orders` | `{customerName, phone, email, address, city, state, pincode}` |
| GET | `/api/orders` | my order history |
| POST/PUT/DELETE | `/api/products` | product admin CRUD |

## Sample request (cURL)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "priya@example.com", "password": "secret123" }'
```