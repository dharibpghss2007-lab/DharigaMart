# DHARIGA MART - Full-Stack E-Commerce (Fashion & Beauty)

**Tagline:** *Style. Beauty. Confidence. Easy Shopping.*

A complete online fashion and beauty store.

- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5 (served as static files by Spring Boot)
- **Backend:** Java 17, Spring Boot 3.2.x (Web, Data JPA, Security), Maven
- **Database:** MySQL 8 (`dhariga_mart`)
- **Auth:** JWT (jjwt) + BCrypt password hashing
- **APIs:** REST + JavaScript `fetch()` with `Authorization: Bearer <token>`

---

## 1. Folder Structure

```
DHARIGA MART/
├── pom.xml
├── database/
│   └── schema.sql                      # manual MySQL setup (optional)
├── src/main/
│   ├── java/com/dharigamart/
│   │   ├── DharigaMartApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java     # Spring Security + CORS + JWT filter
│   │   │   └── (entities auto-create tables via ddl-auto=update)
│   │   ├── controller/
│   │   │   ├── AuthController.java     # /api/auth/register, /api/auth/login
│   │   │   ├── ProductController.java  # /api/products CRUD, /api/categories
│   │   │   ├── CartController.java     # /api/cart CRUD
│   │   │   ├── OrderController.java    # /api/orders create + list
│   │   │   ├── UserController.java     # /api/users/me
│   │   │   └── HomeController.java     # redirects "/" → login.html (login first page)
│   │   ├── dto/
│   │   │   ├── RegisterRequest.java, LoginRequest.java, AuthResponse.java
│   │   │   ├── UserDto.java, ProductDto.java
│   │   │   ├── CartRequest.java, CartItemDto.java
│   │   │   └── OrderRequest.java, OrderItemRequest.java,
│   │   │       OrderItemResponse.java, OrderResponse.java
│   │   └── entity/
│   │       ├── User.java, Product.java, Order.java,
│   │       ├── OrderItem.java, CartItem.java
│   │   ├── exception/
│   │   │   ├── ApiException.java
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java, ProductRepository.java
│   │   │   ├── OrderRepository.java, OrderItemRepository.java
│   │   │   └── CartItemRepository.java
│   │   ├── security/
│   │   │   ├── JwtService.java
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   └── RestAuthenticationEntryPoint.java
│   │   └── service/
│   │       ├── AuthService.java, ProductService.java,
│   │       ├── CartService.java, OrderService.java
│   │       └── (profile via AuthService.getProfile)
│   └── resources/
│       ├── application.properties
│       ├── data.sql                     # 22 sample products (auto-seeded)
│       └── static/                      # ← FRONTEND (no separate server needed)
│           ├── login.html               # FIRST PAGE
│           ├── register.html
│           ├── index.html               # Home (hero, categories, featured)
│           ├── products.html            # search + category filter + sort
│           ├── product-details.html
│           ├── cart.html
│           ├── checkout.html
│           ├── my-account.html
│           └── assets/
│               ├── css/style.css
│               ├── js/ common.js login.js register.js home.js
│                   products.js product-details.js cart.js checkout.js my-account.js
│               └── images/products/*.svg  # generated placeholders
└── README.md
```

---

## 2. Prerequisites

| Tool | Version | Check with |
|---|---|---|
| JDK (not just JRE) | **17+** | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| MySQL Server | 8.x | `mysql --version` |

> **This machine:** JDK 17 (Temurin 17.0.20.1) is installed at
> `C:\Users\acer\jdk-17\jdk-17.0.20.1+1`, `JAVA_HOME` and `PATH` are set (user level).
> Maven 3.9.16 and MySQL Server 26.7 (service `MySQL267`) are ready.

---

## 3. MySQL Setup

1. Make sure the MySQL Windows service is running:
   ```bat
   net start MySQL267        & REM or use the service name shown in services.msc
   ```
2. Create the database (the app can also auto-create it):
   ```bat
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS dhariga_mart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```
3. (Optional) Manual tables via schema file ing MySQL CLI:
   ```sql
   SOURCE C:/Users/acer/OneDrive/New folder/DHARIGA MART/database/schema.sql;
   ```
4. Credentials on this machine (already configured in `application.properties`):
   - App user: `dhariga` / `dhariga123` (has full rights on `dhariga_mart`)
   - The root password was reset during setup, but the app never needs it.

Tables: `users`, `products`, `orders`, `order_items`.
22 sample products are auto-seeded by `data.sql` on first run.

---

## 4. Run from VS Code

### Extensions to install
1. **Extension Pack for Java** (Microsoft)
2. **Spring Boot Extension Pack** (VMware/Spring) — includes Spring Boot Dashboard
3. **MySQL** extension (cweijan) or **Database Client (JDBC)** for browsing tables
4. (Optional) **REST Client** (humao) to test APIs from `.http` files

### Steps
1. `Ctrl+K Ctrl+O` → open the `DHARIGA MART` folder.
2. Open `src/main/java/com/dharigamart/DharigaMartApplication.java`.
3. Press **F5** (Debug Java) or click **Run** ▶. The Spring Boot Dashboard
   also shows a run button.
4. Wait for the console message:
   ```
   DHARIGA MART is running...
   Open http://localhost:8080  (Login page)
   ```
5. Open **http://localhost:8080** → you land on the **Login** page.
6. Create an account (**Register**) → login → explore the store.

### Verify MySQL connectivity
The app logs errors immediately if it cannot reach MySQL. Quick check from the
MySQL extension: expand `dhariga_mart` → run `SELECT * FROM products;` →
you should see 22 rows.

---

## 5. Run from Command Line

```bat
mvn spring-boot:run
```

Or build & run:
```bat
mvn clean package -DskipTests
java -jar target/dhariga-mart-1.0.0.jar
```

---

## 6. REST API Reference

Public (no token):
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | `{name, phone, email, password, confirmPassword}` |
| POST | `/api/auth/login` | `{email, password}` → returns JWT + user |
| GET | `/api/products` | `?search=&category=&sort=asc\|desc` |
| GET | `/api/products/{id}` | product details |
| GET | `/api/categories` | distinct categories |

Authenticated (header `Authorization: Bearer <token>`):
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/users/me` | profile |
| GET/POST | `/api/cart` | view / add `{productId, quantity}` |
| PUT | `/api/cart/{productId}` | update quantity `{productId, quantity}` |
| DELETE | `/api/cart/{productId}` | remove item |
| DELETE | `/api/cart` | clear cart |
| POST | `/api/orders` | `{customerName, phone, email, address, city, state, pincode}` |
| GET | `/api/orders` | my order history |
| POST/PUT/DELETE | `/api/products` | product admin CRUD |

### Testing with VS Code REST Client
Create `test.http` (add to workspace, then press **Send Request**):

```http
### Register
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{ "name": "Priya Sharma", "phone": "9876543210",
  "email": "priya@example.com", "password": "secret123",
  "confirmPassword": "secret123" }

### Login
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{ "email": "priya@example.com", "password": "secret123" }

### Get products
GET http://localhost:8080/api/products?category=Makeup

### Search
GET http://localhost:8080/api/products?search=lipstick

### Add to cart (token = paste from login response)
POST http://localhost:8080/api/cart
Authorization: Bearer <TOKEN>
Content-Type: application/json

{ "productId": 14, "quantity": 2 }

### Place order
POST http://localhost:8080/api/orders
Authorization: Bearer <TOKEN>
Content-Type: application/json

{ "customerName": "Priya Sharma", "phone": "9876543210",
  "email": "priya@example.com", "address": "12 MG Road",
  "city": "Bengaluru", "state": "Karnataka", "pincode": "560001" }
```

---

## 7. Frontend Notes

- The frontend is served **by Spring Boot itself** (files under
  `src/main/resources/static`) — nothing extra to run.
- Frontend talks to `/api/**` using the Fetch API with the JWT stored in
  `localStorage` (`common.js`).
- Optional: to develop the frontend standalone against the running backend use
  any static server:
  ```bat
  npx serve src/main/resources/static
  ```
  (Note: standalone mode breaks relative `/api` calls unless you also proxy
  `/api` to `localhost:8080`; the built-in option is simplest.)

---

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| `Invalid target release: 17` / `Unsupported major/minor version` | JRE 8 detected. Install **JDK 17** and in VS Code: `Java: Configure Java Runtime` → select JDK 17. Also set `JAVA_HOME`. |
| `Access denied for user 'root'` | Wrong MySQL password in `application.properties`. Use your real root password or create user per `database/schema.sql`. |
| `Communications link failure` / `Connection refused` | MySQL service not running → `net start MySQL267` (or the service name in `services.msc`). |
| `Unknown database 'dhariga_mart'` | Auto-creation needs the user to have `CREATE` privilege. Otherwise run the `CREATE DATABASE` command from section 3. |
| Port 8080 already in use | Change `server.port` in `application.properties`, or stop the other app (`taskkill /F /PID <pid>`). |
| `data.sql` runs but tables missing | Keep `spring.jpa.defer-datasource-initialization=true` and `spring.sql.init.mode=always` (already set). |
| Login works but APIs give 401 | Token missing/expired. Logout and login again. Token lifetime = 24h (`app.jwt.expiration-ms`). |
| 401/403 CORS errors in browser | CORS is already enabled globally; clearing cache usually fixes stale entries. |
| `Elements ... in class path ...` Maven build | Delete `target/` and run `mvn clean`. |
| Can't connect through MySQL Workbench | Server installation already running as Windows service `MySQL267`. |
| Blank pages / missing styles | Open DevTools network tab; Bootstrap 5 loads from CDN — needs internet. Everything else is local. |

---

Happy shopping! **DHARIGA MART** 🛍️