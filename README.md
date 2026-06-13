# Spreetail Expense Sharing Application

A Splitwise-like expense sharing application built with Spring Boot and React.

## Features
- User registration and authentication (JWT)
- Create and manage expense groups
- Add expenses with different split types (equal, unequal, percentage, share)
- Track balances and settlements
- Support for multiple currencies
- Settlement suggestions and tracking

## Tech Stack

### Backend
- Spring Boot 3.2.0
- Spring Data JPA
- PostgreSQL
- JWT Authentication
- Maven

### Frontend
- React.js 18
- React Router DOM
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

### Frontend
```bash
cd frontend
npm install
npm start
```

Frontend will run on `http://localhost:3000`

## API Documentation

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T10:00:00"
  }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}
```

### Groups

#### Create Group
```
POST /api/groups
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Apartment",
  "description": "Monthly expenses",
  "memberIds": []
}
```

#### Get All User Groups
```
GET /api/groups/my
Authorization: Bearer {token}
```

#### Get Group by ID
```
GET /api/groups/{id}
Authorization: Bearer {token}
```

#### Add Member to Group
```
POST /api/groups/{id}/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 2
}
```

#### Remove Member from Group
```
DELETE /api/groups/{id}/members/{userId}
Authorization: Bearer {token}
```

### Expenses

#### Create Expense
```
POST /api/expenses
Authorization: Bearer {token}
Content-Type: application/json

{
  "groupId": 1,
  "description": "Groceries",
  "amount": 1000,
  "currency": "INR",
  "splitType": "equal",
  "splitWith": [1, 2, 3],
  "splitDetails": {},
  "notes": "Weekly groceries"
}
```

#### Get Group Expenses
```
GET /api/expenses/group/{groupId}
Authorization: Bearer {token}
```

#### Get User Expenses
```
GET /api/expenses/my
Authorization: Bearer {token}
```

#### Get Expense by ID
```
GET /api/expenses/{id}
Authorization: Bearer {token}
```

### Settlements & Balances

#### Get Group Balances
```
GET /api/settlements/balances/{groupId}
Authorization: Bearer {token}

Response:
[
  {
    "userId": 1,
    "username": "Alice",
    "totalOwed": 500,
    "totalToReceive": 1000,
    "netBalance": 500
  }
]
```

#### Get Settlement Suggestions
```
GET /api/settlements/suggestions/{groupId}
Authorization: Bearer {token}

Response:
[
  {
    "fromUserId": 2,
    "fromUsername": "Bob",
    "toUserId": 1,
    "toUsername": "Alice",
    "amount": 500,
    "currency": "INR"
  }
]
```

#### Record Settlement
```
POST /api/settlements
Authorization: Bearer {token}
Content-Type: application/json

{
  "groupId": 1,
  "fromUserId": 2,
  "toUserId": 1,
  "amount": 500,
  "currency": "INR"
}
```

#### Get Group Settlements
```
GET /api/settlements/group/{groupId}
Authorization: Bearer {token}
```

## Split Types

### Equal Split
Divide expense equally among all members.
```json
{
  "splitType": "equal",
  "splitWith": [1, 2, 3]
}
```

### Unequal Split
Specify exact amounts for each member.
```json
{
  "splitType": "unequal",
  "splitWith": [1, 2, 3],
  "splitDetails": {
    "1": 500,
    "2": 300,
    "3": 200
  }
}
```

### Percentage Split
Specify percentage for each member.
```json
{
  "splitType": "percentage",
  "splitWith": [1, 2, 3],
  "splitDetails": {
    "1": 50,
    "2": 30,
    "3": 20
  }
}
```

### Share Split
Specify number of shares for each member.
```json
{
  "splitType": "share",
  "splitWith": [1, 2, 3],
  "splitDetails": {
    "1": 1,
    "2": 2,
    "3": 1
  }
}
```

## Testing Scenarios

Based on the assignment PDF, the following scenarios are supported:

1. **Equal splits** - Rent, groceries, wifi bills
2. **Unequal splits** - Birthday cake (different amounts)
3. **Percentage splits** - Pizza Friday (percentage-based)
4. **Share splits** - Scooter rentals (shares-based)
5. **Negative amounts** - Refunds (parasailing refund)
6. **Multiple currencies** - INR, USD (Goa trip)
7. **Settlements** - Recording payments between users
8. **Group member changes** - Users joining/leaving groups

## Architecture

The backend follows **MCSA (Model-Controller-Service-Repository)** architecture:

- **Model**: JPA Entities (User, Group, GroupMember, Expense, ExpenseSplit, Settlement)
- **Repository**: Spring Data JPA repositories
- **Service**: Business logic layer
- **Controller**: REST API endpoints

## License
This project is for educational purposes.