# Changelog

All notable changes to DHARIGA MART are documented in this file.

## [1.0.0] - 2026

Initial release of DHARIGA MART, the full-stack fashion & beauty store.

### Added
- Spring Boot 3 REST backend with JWT authentication + BCrypt hashing
- MySQL 8 persistence (`dhariga_mart`) with auto-seeding of 22 products
- Static Bootstrap 5 frontend served by the same app
- Product catalog, search, category filter & sort
- Cart management, checkout & order history
- User registration, login & profile APIs
- REST API reference + sample `.http` test file

### Tech
- Java 17, Spring Boot 3.2.x, Spring Security, Spring Data JPA
- jjwt + BCrypt, Maven build