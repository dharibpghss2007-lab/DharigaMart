-- ============================================================
-- DHARIGA MART - MySQL schema (manual setup, optional)
-- The Spring Boot app auto-creates the database via
-- createDatabaseIfNotExist=true and tables via ddl-auto=update.
-- Run this file first only if you prefer manual creation:
--
--   mysql -u root -p < database/schema.sql
--
-- OR inside the MySQL CLI:
--   SOURCE C:/Users/acer/OneDrive/New folder/DHARIGA MART/database/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS dhariga_mart
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dhariga_mart;

-- If you do NOT want to use your root password in the app,
-- create a dedicated user (change 'your_root_password' to your own):
--   CREATE USER IF NOT EXISTS 'dhariga'@'localhost' IDENTIFIED BY 'dhariga123';
--   GRANT ALL PRIVILEGES ON dhariga_mart.* TO 'dhariga'@'localhost';
--   FLUSH PRIVILEGES;
-- Then set these in application.properties:
--   spring.datasource.username=dhariga
--   spring.datasource.password=dhariga123

-- ---------- users ----------
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    phone       VARCHAR(20)  NOT NULL,
    email       VARCHAR(120) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB;

-- ---------- products ----------
CREATE TABLE IF NOT EXISTS products (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    name        VARCHAR(150)  NOT NULL,
    description TEXT,
    category    VARCHAR(50)   NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    stock       INT           NOT NULL DEFAULT 0,
    rating      DECIMAL(3,1)  DEFAULT 4.0,
    image_url   VARCHAR(255),
    created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ---------- orders ----------
CREATE TABLE IF NOT EXISTS orders (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    order_number  VARCHAR(50)   NOT NULL,
    user_id       BIGINT        NOT NULL,
    customer_name VARCHAR(100)  NOT NULL,
    phone         VARCHAR(20)   NOT NULL,
    email         VARCHAR(120)  NOT NULL,
    address       VARCHAR(255)  NOT NULL,
    city          VARCHAR(100)  NOT NULL,
    state         VARCHAR(100)  NOT NULL,
    pincode       VARCHAR(10)   NOT NULL,
    subtotal      DECIMAL(10,2) NOT NULL,
    shipping      DECIMAL(10,2) NOT NULL DEFAULT 0,
    total         DECIMAL(10,2) NOT NULL,
    status        VARCHAR(30)   DEFAULT 'PLACED',
    created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_orders_order_number (order_number),
    KEY idx_orders_user_id (user_id),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- order_items ----------
CREATE TABLE IF NOT EXISTS order_items (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    order_id     BIGINT        NOT NULL,
    product_id   BIGINT        NOT NULL,
    product_name VARCHAR(150)  NOT NULL,
    price        DECIMAL(10,2) NOT NULL,
    quantity     INT           NOT NULL,
    subtotal     DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_order_items_order_id (order_id),
    KEY idx_order_items_product_id (product_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id)
        REFERENCES products (id)
) ENGINE=InnoDB;

-- ---------- cart_items (persistent shopping cart) ----------
CREATE TABLE IF NOT EXISTS cart_items (
    id         BIGINT NOT NULL AUTO_INCREMENT,
    user_id    BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity   INT    NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_cart_items_user_product (user_id, product_id),
    KEY idx_cart_items_product_id (product_id),
    CONSTRAINT fk_cart_items_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id)
        REFERENCES products (id)
) ENGINE=InnoDB;

-- ---------- Verify ----------
SHOW TABLES FROM dhariga_mart;