# Spreetail - API Documentation

## Base URL

- Development: `http://localhost:8080/api`
- Production: `https://spreetail-production.railway.app/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {jwt_token}
```

Get a token by logging in with the `/auth/login` endpoint.

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00"
}
```

**Error Responses:**
- `400 Bad Request`: Email or username already exists

---

### Login
**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNjQyMjQyNjAwLCJleHAiOjE2NDIzMzAwMDB9.abc123xyz",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid email or password

---

### Get Current User
**GET** `/auth/me`

Get the currently authenticated user's profile.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token

---

## Group Endpoints

### Create Group
**POST** `/groups`

Create a new expense group.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "name": "Apartment Expenses",
  "description": "Monthly rent and utilities",
  "memberIds": [2, 3]
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Apartment Expenses",
  "description": "Monthly rent and utilities",
  "createdBy": 1,
  "members": [
    {
      "id": 1,
      "userId": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "status": "active",
      "joinedAt": "2024-01-15T10:30:00"
    },
    {
      "id": 2,
      "userId": 2,
      "username": "janedoe",
      "email": "jane@example.com",
      "status": "active",
      "joinedAt": "2024-01-15T10:30:00"
    }
  ],
  "createdAt": "2024-01-15T10:30:00"
}
```

---

### Get Group by ID
**GET** `/groups/{groupId}`

Get details of a specific group.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Apartment Expenses",
  "description": "Monthly rent and utilities",
  "createdBy": 1,
  "members": [...],
  "createdAt": "2024-01-15T10:30:00"
}
```

---

### Get My Groups
**GET** `/groups/my`

Get all groups where the current user is a member.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Apartment Expenses",
    "description": "Monthly rent and utilities",
    "createdBy": 1,
    "members": [...],
    "createdAt": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "name": "Trip to Goa",
    "description": "February 2026",
    "createdBy": 1,
    "members": [...],
    "createdAt": "2024-02-01T10:00:00"
  }
]
```

---

### Add Member to Group
**POST** `/groups/{groupId}/members`

Add a new member to an existing group.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "userId": 3
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Apartment Expenses",
  "description": "Monthly rent and utilities",
  "createdBy": 1,
  "members": [...],
  "createdAt": "2024-01-15T10:30:00"
}
```

---

### Remove Member from Group
**DELETE** `/groups/{groupId}/members/{userId}`

Remove a member from a group.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Apartment Expenses",
  "description": "Monthly rent and utilities",
  "createdBy": 1,
  "members": [...],
  "createdAt": "2024-01-15T10:30:00"
}
```

---

## Expense Endpoints

### Create Expense
**POST** `/expenses`

Add a new expense to a group.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "groupId": 1,
  "description": "Groceries from BigBasket",
  "amount": 2340,
  "currency": "INR",
  "splitType": "equal",
  "splitWith": [1, 2, 3],
  "splitDetails": {},
  "notes": "Weekly groceries"
}
```

**Parameters:**
- `splitType`: `"equal"`, `"unequal"`, `"percentage"`, or `"share"`
- `splitWith`: Array of user IDs to split with
- `splitDetails`: Object mapping user IDs to values (required for unequal, percentage, share)
- `currency`: `"INR"` or `"USD"` (default: `"INR"`)

**Response (201 Created):**
```json
{
  "id": 1,
  "groupId": 1,
  "groupName": "Apartment Expenses",
  "paidBy": 1,
  "paidByUsername": "johndoe",
  "description": "Groceries from BigBasket",
  "amount": 2340,
  "currency": "INR",
  "splitType": "equal",
  "notes": "Weekly groceries",
  "createdAt": "2024-02-03T10:30:00",
  "splits": [
    {
      "id": 1,
      "userId": 1,
      "username": "johndoe",
      "shareAmount": 780,
      "sharePercentage": 33.33,
      "shares": null
    },
    {
      "id": 2,
      "userId": 2,
      "username": "janedoe",
      "shareAmount": 780,
      "sharePercentage": 33.33,
      "shares": null
    },
    {
      "id": 3,
      "userId": 3,
      "username": "bobsmith",
      "shareAmount": 780,
      "sharePercentage": 33.33,
      "shares": null
    }
  ]
}
```

---

### Get Expense by ID
**GET** `/expenses/{expenseId}`

Get details of a specific expense.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "groupId": 1,
  "groupName": "Apartment Expenses",
  "paidBy": 1,
  "paidByUsername": "johndoe",
  "description": "Groceries from BigBasket",
  "amount": 2340,
  "currency": "INR",
  "splitType": "equal",
  "notes": "Weekly groceries",
  "createdAt": "2024-02-03T10:30:00",
  "splits": [...]
}
```

---

### Get Group Expenses
**GET** `/expenses/group/{groupId}`

Get all expenses for a specific group.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "groupId": 1,
    "groupName": "Apartment Expenses",
    "paidBy": 1,
    "paidByUsername": "johndoe",
    "description": "Groceries from BigBasket",
    "amount": 2340,
    "currency": "INR",
    "splitType": "equal",
    "notes": "Weekly groceries",
    "createdAt": "2024-02-03T10:30:00",
    "splits": [...]
  },
  {
    "id": 2,
    "groupId": 1,
    "groupName": "Apartment Expenses",
    "paidBy": 2,
    "paidByUsername": "janedoe",
    "description": "Wifi Bill",
    "amount": 1199,
    "currency": "INR",
    "splitType": "equal",
    "notes": "February 2026",
    "createdAt": "2024-02-05T10:00:00",
    "splits": [...]
  }
]
```

---

### Get My Expenses
**GET** `/expenses/my`

Get all expenses paid by the current user.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "groupId": 1,
    "groupName": "Apartment Expenses",
    "paidBy": 1,
    "paidByUsername": "johndoe",
    "description": "Groceries from BigBasket",
    "amount": 2340,
    "currency": "INR",
    "splitType": "equal",
    "notes": "Weekly groceries",
    "createdAt": "2024-02-03T10:30:00",
    "splits": [...]
  }
]
```

---

## Settlement & Balance Endpoints

### Get Group Balances
**GET** `/settlements/balances/{groupId}`

Get balance summary for all users in a group.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
[
  {
    "userId": 1,
    "username": "johndoe",
    "totalOwed": 0,
    "totalToReceive": 780,
    "netBalance": 780
  },
  {
    "userId": 2,
    "username": "janedoe",
    "totalOwed": 780,
    "totalToReceive": 0,
    "netBalance": -780
  },
  {
    "userId": 3,
    "username": "bobsmith",
    "totalOwed": 780,
    "totalToReceive": 0,
    "netBalance": -780
  }
]
```

**Balance Interpretation:**
- `netBalance > 0`: User is owed money
- `netBalance < 0`: User owes money
- `netBalance = 0`: User is settled up

---

### Get Settlement Suggestions
**GET** `/settlements/suggestions/{groupId}`

Get suggested settlements to minimize transactions.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
[
  {
    "fromUserId": 2,
    "fromUsername": "janedoe",
    "toUserId": 1,
    "toUsername": "johndoe",
    "amount": 780,
    "currency": "INR",
    "settledAt": null
  },
  {
    "fromUserId": 3,
    "fromUsername": "bobsmith",
    "toUserId": 1,
    "toUsername": "johndoe",
    "amount": 780,
    "currency": "INR",
    "settledAt": null
  }
]
```

---

### Record Settlement
**POST** `/settlements`

Record a payment/settlement between users.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "groupId": 1,
  "fromUserId": 2,
  "toUserId": 1,
  "amount": 780,
  "currency": "INR"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "fromUserId": 2,
  "fromUsername": "janedoe",
  "toUserId": 1,
  "toUsername": "johndoe",
  "amount": 780,
  "currency": "INR",
  "settledAt": "2024-02-10T15:30:00"
}
```

---

### Get Group Settlements
**GET** `/settlements/group/{groupId}`

Get all recorded settlements for a group.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "fromUserId": 2,
    "fromUsername": "janedoe",
    "toUserId": 1,
    "toUsername": "johndoe",
    "amount": 780,
    "currency": "INR",
    "settledAt": "2024-02-10T15:30:00"
  }
]
```

---

## Split Types Examples

### 1. Equal Split
```json
{
  "groupId": 1,
  "description": "Rent",
  "amount": 48000,
  "currency": "INR",
  "splitType": "equal",
  "splitWith": [1, 2, 3, 4],
  "splitDetails": {},
  "notes": "February 2026 rent"
}
```
Each user pays: 12,000

---

### 2. Unequal Split
```json
{
  "groupId": 1,
  "description": "Birthday Cake",
  "amount": 1500,
  "currency": "INR",
  "splitType": "unequal",
  "splitWith": [2, 3, 4],
  "splitDetails": {
    "2": 700,
    "3": 400,
    "4": 400
  },
  "notes": "Aisha's birthday"
}
```

---

### 3. Percentage Split
```json
{
  "groupId": 1,
  "description": "Pizza Friday",
  "amount": 1440,
  "currency": "INR",
  "splitType": "percentage",
  "splitWith": [1, 2, 3, 4],
  "splitDetails": {
    "1": 30,
    "2": 30,
    "3": 30,
    "4": 20
  },
  "notes": "Weekly pizza"
}
```
User 1, 2, 3 pay: 432 each
User 4 pays: 288

---

### 4. Share Split
```json
{
  "groupId": 1,
  "description": "Scooter Rentals",
  "amount": 3600,
  "currency": "INR",
  "splitType": "share",
  "splitWith": [1, 2, 3, 4],
  "splitDetails": {
    "1": 1,
    "2": 2,
    "3": 1,
    "4": 2
  },
  "notes": "Goa trip"
}
```
Total shares: 6
Amount per share: 600
User 1, 3 pay: 600 each
User 2, 4 pay: 1200 each

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Invalid input",
  "details": "Email already exists"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "message": "Group not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Add this in production if needed.

---

## Version

API Version: 1.0.0
Last Updated: February 2026