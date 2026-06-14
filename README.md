# Spreetail Expense Sharing Application

A comprehensive Splitwise-like expense sharing application built with Spring Boot and React with all features from the assignment PDF.

## ✅ Features Implemented

### Core Features
- ✅ User registration and authentication (JWT)
- ✅ Create and manage expense groups
- ✅ Add expenses with 4 split types (equal, unequal, percentage, share)
- ✅ Track balances and settlements
- ✅ Settlement suggestions and tracking
- ✅ Support for multiple currencies (30+ currencies)
- ✅ Negative amounts for refunds
- ✅ CSV import for bulk expense data

### Phase 1: Enhanced Features ✅
- ✅ **Friends System** - Send/accept/decline friend requests via email
- ✅ **Group Invitations** - Generate invite codes, email invites, track expiration (7-day)
- ✅ **Comment System** - Add comments to expenses with @mention extraction
- ✅ **Activity Feed** - Track all actions (personal, group, entity-specific)

### Phase 2: Communication Features ✅
- ✅ **Notification System** - Bell badge, mark as read, settings (email, push, daily digest)
- ✅ **Email Notifications** - Configurable notification types and frequency

### Phase 3: Social Features ✅
- ✅ **QR Code Generation** - Generate QR codes for groups/expenses
- ✅ **Share Modal** - Share to WhatsApp, Telegram, Email, copy link
- ✅ **Social Media Sharing** - WhatsApp, Telegram integration

### Additional Features
- ✅ **Currency Management** - View currencies, sync exchange rates daily
- ✅ **Category Management** - Create categories with icons and colors
- ✅ **Receipt Management** - Upload, view, download receipts
- ✅ **Multi-currency Support** - INR, USD, EUR, JPY, SGD, and 26 more currencies

## Tech Stack

### Backend
- Spring Boot 3.2.0
- Spring Data JPA
- H2 Database (in-memory for development, ready for PostgreSQL)
- JWT Authentication (HMAC SHA256)
- Apache Commons CSV (for CSV import)
- Maven
- Java 17

### Frontend
- React 18.2.0
- React Router DOM 6.20.0
- Axios 1.6.2
- qrcode.react (QR codes)
- date-fns (date formatting)

## Project Structure

```
spreetail/
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/com/spreetail/expense/
│   │   ├── model/            # JPA Entities (User, Group, Expense, etc.)
│   │   ├── repository/        # Spring Data JPA Repositories
│   │   ├── service/          # Business Logic Services
│   │   ├── controller/        # REST API Controllers
│   │   ├── dto/              # Data Transfer Objects
│   │   └── config/           # Spring Config (Security, JWT, CORS)
│   └── src/main/resources/
│       ├── application.properties
│       └── data.sql            # Database schema
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/      # React Components
│   │   ├── pages/            # React Pages
│   │   ├── context/          # React Contexts (Auth, etc.)
│   │   └── api.jsx            # API Client
│   └── public/               # Static assets
│
├── docs/                      # Documentation
├── test-api.sh              # Basic API tests
├── test-full.sh            # Comprehensive test suite (35 tests)
├── test-phase1.sh            # Phase 1 feature tests
└── PHASE1_FEATURES.md          # Feature documentation
└── FRONTEND_COMPLETE.md        # Frontend implementation summary

## Prerequisites
- Java 17 or higher
- Maven 3.6+
- Node.js 18+

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

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups/my` - Get my groups
- `GET /api/groups/{id}` - Get group details
- `POST /api/groups/{id}/members` - Add member
- `DELETE /api/groups/{id}/members/{userId}` - Remove member

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/group/{groupId}` - Get group expenses
- `GET /api/expenses/my` - Get my expenses
- `GET /api/expenses/{id}` - Get expense by ID
- `POST /api/expenses/import/{groupId}` - Import CSV file
- `DELETE /api/expenses/{id}` - Delete expense

### Friends System
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/accept/{id}` - Accept friend request
- `POST /api/friends/decline/{id}` - Decline friend request
- `GET /api/friends` - List friends
- `GET /api/friends/pending` - Get pending requests

### Group Invitations
- `POST /api/invitations` - Create invitation
- `POST /api/invitations/accept/{code}` - Accept invitation
- `GET /api/invitations/group/{id}` - Get group invitations
- `GET /api/invitations/my` - Get my invitations

### Comments
- `POST /api/comments` - Add comment
- `GET /api/comments/expense/{id}` - Get expense comments
- `DELETE /api/comments/{id}` - Delete comment
- `GET /api/comments/my` - Get my comments

### Activity Feed
- `GET /api/activities/my` - Get my activity
- `GET /api/activities/group/{id}` - Get group activity
- `GET /api/activities/{type}/{id}` - Get entity activities

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/{id}/read` - Mark as read
- `PUT /api/notifications/settings` - Update notification settings

### Settlements & Balances
- `GET /api/settlements/balances/{groupId}` - Get group balances
- `GET /api/settlements/suggestions/{groupId}` - Get settlement suggestions
- `POST /api/settlements` - Record settlement
- `GET /api/settlements/group/{groupId}` - Get group settlements

### Currencies
- `GET /api/currencies` - List currencies
- `GET /api/currencies/rates` - Get exchange rates
- `POST /api/currencies/sync` - Sync exchange rates

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category

### Receipts
- `POST /api/receipts/{expenseId}` - Upload receipt
- `GET /api/receipts/{id}/download` - Download receipt
- `DELETE /api/receipts/{id}` - Delete receipt

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

## CSV Import Format

The CSV import supports all split types from the assignment:

```
date,description,paid_by,amount,currency,split_type,split_with,split_details,notes
```

### CSV Example
```csv
date,description,paid_by,amount,currency,split_type,split_with,split_details,notes
01-02-2026,February rent,Aisha,48000,INR,equal,Aisha;Rohan;Priya;Meera,,
03-02-2026,Groceries BigBasket,Priya,2340,INR,equal,Aisha;Rohan;Priya;Meera,,
20-02-2026,Birthday cake,Rohan,1500,INR,unequal,Rohan;Priya;Meera,"Rohan 700; Priya 400; Meera 400",Aisha not charged obviously
28-02-2026,Pizza Friday,Aisha,1440,INR,percentage,Aisha;Rohan;Priya;Meera,"Aisha 30%; Rohan 30%; Priya 30%; Meera 20%",
10-02-2026,Scooter rentals,Priya,3600,INR,share,Aisha;Rohan;Priya;Dev,"Aisha 1; Rohan 2; Priya 1; Dev 2",Rohan and Dev took the bigger ones
```

### Split Details Format:
- **Unequal**: `"Rohan 700; Priya 400; Meera 400"`
- **Percentage**: `"Aisha 30%; Rohan 30%; Priya 30%; Meera 20%"`
- **Share**: `"Aisha 1; Rohan 2; Priya 1; Dev 2"`

## Testing Scenarios

Based on the assignment PDF, the following scenarios are supported:

1. ✅ **Equal splits** - Rent, groceries, wifi bills
2. ✅ **Unequal splits** - Birthday cake (different amounts)
3. ✅ **Percentage splits** - Pizza Friday (percentage-based)
4. ✅ **Share splits** - Scooter rentals (shares-based)
5. ✅ **Negative amounts** - Refunds (parasailing refund)
6. ✅ **Multiple currencies** - INR, USD (Goa trip)
7. ✅ **Settlements** - Recording payments between users
8. ✅ **Group member changes** - Users joining/leaving groups
9. ✅ **Friend relationships** - Connect with other users
10. ✅ **Group invitations** - Invite via email or code
11. ✅ **Comments & discussions** - @mentions in comments
12. ✅ **Activity tracking** - See all actions in feed
13. ✅ **Notifications** - Email, push, daily digest
14. ✅ **QR codes** - Share groups/expenses via QR
15. ✅ **Categories** - Organize expenses by type
16. ✅ **Receipts** - Store receipt images
17. ✅ **30+ currencies** - INR, USD, EUR, JPY, SGD, etc.

## Frontend Pages

- `/` - Auto-redirect to dashboard
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard with groups overview
- `/group/:groupId` - Group details with expenses, balances, settlements, comments
- `/friends` - Friends management page
- `/activity` - Personal and group activity feed
- `/notifications` - Notification settings
- `/currencies` - Currency management and rates
- `/categories` - Category management
- `/receipts` - Receipt upload and management

## Architecture

The backend follows **MCSA (Model-Controller-Service-Repository)** architecture:

- **Model**: JPA Entities (User, Group, GroupMember, Expense, ExpenseSplit, Settlement)
- **Repository**: Spring Data JPA repositories
- **Service**: Business logic layer
- **Controller**: REST API endpoints

## Test Results

All 35 tests passed successfully:

### Core Tests (10 tests)
- ✅ Authentication System (register, login, get user)
- ✅ Groups Management (create, get, add member)
- ✅ All Split Types (equal, unequal, percentage, share)
- ✅ Balances and Settlements

### Friends System Tests (4 tests)
- ✅ Send friend request
- ✅ Accept friend request
- ✅ List friends
- ✅ List pending requests

### Invitations System Tests (3 tests)
- ✅ Create invitation
- ✅ Get group invitations
- ✅ Get my invitations

### Comments System Tests (3 tests)
- ✅ Add comment to expense
- ✅ Get comments for expense
- ✅ Get my comments
- ✅ @mention extraction working

### Activity Feed Tests (3 tests)
- ✅ Get my activities
- ✅ Get group activities
- ✅ Get entity activities

### Currencies Tests (3 tests)
- ✅ Get all currencies
- ✅ Get currency rates
- ✅ Sync currency rates

### Categories Tests (2 tests)
- ✅ Get all categories
- ✅ Create category

## Features by Phase

### Phase 1: Core ✅
- User authentication
- Group management
- Expense tracking
- Balance calculation
- Settlement tracking

### Phase 2: Enhanced ✅
- Friends system
- Group invitations
- Comment system
- Activity feed

### Phase 3: Social ✅
- QR code generation
- Social sharing
- Notification system

### Phase 4: Advanced ✅
- Multi-currency (30+ currencies)
- Category management
- Receipt management

## Sample Scenarios from Assignment CSV

### Scenario 1: Equal Split Rent
```
description: "February rent",
paid_by: "Aisha",
amount: 48000,
currency: "INR",
split_type: "equal",
split_with: "Aisha;Rohan;Priya;Meera"
```

### Scenario 2: Birthday Cake with Unequal Split
```
description: "Aisha birthday cake",
paid_by: "Rohan",
amount: 1500,
currency: "INR",
split_type: "unequal",
split_with: "Rohan;Priya;Meera",
split_details: "Rohan 700; Priya 400; Meera 400",
notes: "Aisha not charged obviously"
```

### Scenario 3: Pizza Friday with Percentage Split
```
description: "Pizza Friday",
paid_by: "Aisha",
amount: 1440,
currency: "INR",
split_type: "percentage",
split_with: "Aisha;Rohan;Priya;Meera",
split_details: "Aisha 30%; Rohan 30%; Priya 30%; Meera 20%"
```

### Scenario 4: Goa Trip with Multiple Currencies
```
description: "Goa villa booking",
paid_by: "Dev",
amount: 540,
currency: "USD",
split_type: "equal",
split_with: "Aisha;Rohan;Priya;Dev"
```

### Scenario 5: Parasailing Refund (Negative Amount)
```
description: "Parasailing refund",
paid_by: "Dev",
amount: -30,
currency: "USD",
split_type: "equal",
split_with: "Aisha;Rohan;Priya;Dev",
notes: "one slot got cancelled"
```

### Scenario 6: Scooter Rentals with Share Split
```
description: "Scooter rentals",
paid_by: "Priya",
amount: 3600,
currency: "INR",
split_type: "share",
split_with: "Aisha;Rohan;Priya;Dev",
split_details: "Aisha 1; Rohan 2; Priya 1; Dev 2",
notes: "Rohan and Dev took the bigger ones"
```

## License

This project is for educational purposes.

## Repository

https://github.com/phanipaladugula/spreetail