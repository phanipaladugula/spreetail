# Spreetail - Architecture Documentation

## Overview

Spreetail is a Splitwise-like expense sharing application built with **MCSA (Model-Controller-Service-Repository)** architecture pattern. The application allows users to create groups, add expenses with various split types, track balances, and settle payments.

## System Architecture

```
┌─────────────────┐
│   React Frontend │
│  (Port 3000)     │
└────────┬────────┘
         │ HTTP/JSON
         │
┌────────▼────────┐
│ Spring Boot API │
│  (Port 8080)     │
└────────┬────────┘
         │ JPA/Hibernate
         │
┌────────▼────────┐
│   PostgreSQL    │
│   Database      │
└─────────────────┘
```

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **ORM**: Spring Data JPA with Hibernate
- **Security**: Spring Security with JWT
- **Build Tool**: Maven
- **Database**: PostgreSQL (H2 for testing)

### Frontend
- **Framework**: React 18
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios
- **Styling**: CSS

## MCSA Architecture Pattern

### 1. Model Layer (Entity)
Location: `backend/src/main/java/com/spreetail/expense/model/`

| Entity | Purpose |
|--------|---------|
| `User` | User account information |
| `Group` | Expense group |
| `GroupMember` | Group membership |
| `Expense` | Expense record |
| `ExpenseSplit` | How expense is split |
| `Settlement` | Payment settlements |

### 2. Repository Layer (Data Access)
Location: `backend/src/main/java/com/spreetail/expense/repository/`

| Repository | Methods |
|------------|---------|
| `UserRepository` | findByEmail, findByUsername, existsByEmail |
| `GroupRepository` | findByCreatedBy, findGroupsByMemberId |
| `GroupMemberRepository` | findByGroupId, findByUserId |
| `ExpenseRepository` | findByGroupId, findByPaidBy |
| `ExpenseSplitRepository` | findByExpenseId, findByGroupIdAndUserId |
| `SettlementRepository` | findByGroupId, findByFromUser, findByToUser |

### 3. Service Layer (Business Logic)
Location: `backend/src/main/java/com/spreetail/expense/service/`

| Service | Key Methods |
|---------|-------------|
| `UserService` | registerUser, loginUser, getUserById |
| `GroupService` | createGroup, addMember, removeMember, getUserGroups |
| `ExpenseService` | createExpense, getExpensesByGroup (handles all split types) |
| `SettlementService` | calculateGroupBalances, getSettlementSuggestions, recordSettlement |
| `JwtService` | generateToken, extractEmail, validateToken |

### 4. Controller Layer (REST API)
Location: `backend/src/main/java/com/spreetail/expense/controller/`

| Controller | Endpoints |
|------------|-----------|
| `UserController` | `/api/auth/register`, `/api/auth/login`, `/api/auth/me` |
| `GroupController` | `/api/groups`, `/api/groups/{id}`, `/api/groups/my` |
| `ExpenseController` | `/api/expenses`, `/api/expenses/group/{id}`, `/api/expenses/my` |
| `SettlementController` | `/api/settlements/balances/{id}`, `/api/settlements/suggestions/{id}` |

### 5. DTO Layer (Data Transfer Objects)
Location: `backend/src/main/java/com/spreetail/expense/dto/`

| DTO | Purpose |
|-----|---------|
| `UserRegisterRequest` | User registration input |
| `UserLoginRequest` | User login input |
| `UserResponse` | User data output |
| `LoginResponse` | Login response with token |
| `CreateGroupRequest` | Group creation input |
| `GroupResponse` | Group data output |
| `GroupMemberResponse` | Group member data output |
| `CreateExpenseRequest` | Expense creation input |
| `ExpenseResponse` | Expense data output |
| `ExpenseSplitResponse` | Expense split data output |
| `BalanceResponse` | User balance data |
| `SettlementResponse` | Settlement data |
| `CreateSettlementRequest` | Settlement creation input |

### 6. Configuration Layer
Location: `backend/src/main/java/com/spreetail/expense/config/`

| Class | Purpose |
|-------|---------|
| `SecurityConfig` | Spring Security configuration |
| `JwtAuthenticationFilter` | JWT token validation filter |
| `CorsConfig` | CORS configuration for frontend |

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Groups Table
```sql
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Group Members Table
```sql
CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    UNIQUE(group_id, user_id)
);
```

### Expenses Table
```sql
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    paid_by INTEGER NOT NULL REFERENCES users(id),
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    split_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(500)
);
```

### Expense Splits Table
```sql
CREATE TABLE expense_splits (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER NOT NULL REFERENCES expenses(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    share_amount DECIMAL(12, 2),
    share_percentage DECIMAL(5, 2),
    shares INTEGER,
    UNIQUE(expense_id, user_id)
);
```

### Settlements Table
```sql
CREATE TABLE settlements (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    from_user INTEGER NOT NULL REFERENCES users(id),
    to_user INTEGER NOT NULL REFERENCES users(id),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    settled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Split Types Logic

### 1. Equal Split
Amount is divided equally among all members.
```
share_amount = total_amount / number_of_members
share_percentage = 100 / number_of_members
```

### 2. Unequal Split
Specific amounts are assigned to each member.
```
share_amount = specified_amount
share_percentage = (specified_amount / total_amount) * 100
```

### 3. Percentage Split
Each member pays based on specified percentage.
```
share_amount = (percentage / 100) * total_amount
share_percentage = specified_percentage
```

### 4. Share Split
Each member gets a number of shares, and amount is proportionally divided.
```
share_amount = (shares / total_shares) * total_amount
share_percentage = (shares / total_shares) * 100
```

## Balance Calculation Algorithm

1. For each user, calculate:
   - **Total Paid**: Sum of expenses paid by the user
   - **Total Owed**: Sum of expenses the user participated in (excluding their own payments)
   - **Total to Receive**: What others owe them
   - **Settled Amount**: Subtracted from calculations

2. Net Balance = Total to Receive - Total Owed

3. Settlement Suggestions:
   - Users with positive balance (receivers) are matched with users with negative balance (payers)
   - Uses greedy algorithm to minimize number of transactions

## Security Features

1. **JWT Authentication**: Stateless token-based authentication
2. **Password Hashing**: BCrypt encryption for stored passwords
3. **CORS**: Cross-Origin Resource Sharing enabled for frontend
4. **Authorization**: Protected endpoints require valid JWT token

## Deployment Architecture

### Development
```
Frontend (localhost:3000) → Backend (localhost:8080) → H2 (in-memory)
```

### Production (Railway)
```
Frontend (Railway Static Site) → Backend (Railway Service) → PostgreSQL (Railway Database)
```

## File Structure

```
spreetail/
├── backend/
│   ├── src/main/java/com/spreetail/expense/
│   │   ├── model/           # Entities
│   │   ├── repository/      # Data Access
│   │   ├── service/         # Business Logic
│   │   ├── controller/      # REST API
│   │   ├── dto/             # Data Transfer Objects
│   │   └── config/          # Configuration
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── schema.sql
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── railway.json
└── README.md
```

## Key Design Decisions

1. **MCSA Pattern**: Chosen for simplicity and maintainability, matching student-level code requirements
2. **No Complex Logic**: Avoided streams, lambdas, and complex algorithms
3. **Basic Data Structures**: Used Lists and Maps without advanced features
4. **Simple Authentication**: JWT-based without OAuth integration
5. **In-Memory Testing**: H2 database for quick testing
6. **Docker Support**: Containerized for easy deployment
7. **Railway Ready**: Configuration for Railway cloud platform

## Known Limitations

1. **Currency Conversion**: No real-time conversion (only storage of multiple currencies)
2. **User Discovery**: No search functionality to find other users
3. **File Uploads**: No receipt/image upload feature
4. **Email Notifications**: No email notifications for settlements
5. **Recurring Expenses**: No automatic recurring expense feature

## Future Enhancements

1. Real-time WebSocket updates for live balance tracking
2. Email notifications for expense additions and settlements
3. Currency conversion API integration
4. Expense categories and analytics
5. Mobile app (React Native)
6. Export to CSV/PDF
7. Receipt scanning using OCR