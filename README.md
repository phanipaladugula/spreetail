# Spreetail Expense Sharing Application

A Splitwise-like expense sharing application built with Spring Boot and React.

## Features
- User registration and authentication (JWT)
- Create and manage expense groups
- Add expenses with different split types (equal, unequal, percentage, share)
- Track balances and settlements
- Support for multiple currencies

## Tech Stack

### Backend
- Spring Boot 3.2.0
- Spring Data JPA
- PostgreSQL
- JWT Authentication
- Maven

### Frontend
- React.js
- React Router
- Axios

## Prerequisites
- Java 17 or higher
- Maven 3.6+
- Node.js 18+
- PostgreSQL 14+

## Database Setup

```sql
CREATE DATABASE spreetail_db;
```

## Running the Application

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend will run on `http://localhost:8080`

### Frontend (coming soon)
```bash
cd frontend
npm install
npm start
```

Frontend will run on `http://localhost:3000`

## API Documentation

API endpoints will be documented here after implementation.

## License
This project is for educational purposes.