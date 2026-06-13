# Spreetail - Splitwise Feature Implementation Plan

Based on comprehensive analysis of Splitwise, here's the complete feature breakdown to implement.

---

## Summary of Splitwise Features Analyzed

### Core Features
1. Groups - Create unlimited groups with separate expense ledgers
2. Expenses - Add with details, attachments, multiple items
3. Settlements - Settle up with direct payments or apps (PayPal, Venmo, etc.)
4. Balances - Real-time calculation of who owes whom

### Communication Features
1. Email Notifications - Groups, expenses, settlements, invitations
2. Comments & Activity Feed - Discuss expenses, tag members

### Social Features
1. Friends System - Add friends via email, shared groups
2. Invitations - Email invites with tracking

### Advanced Features
1. QR Codes & Sharing - Shareable links (currently via 3rd party, will implement native)
2. Multi-Currency - 100+ currencies with conversion
3. Receipt Management - Photos, OCR scanning (PRO feature)
4. Recurring Expenses - Regular bills (rent, utilities)

### Custom Splits
1. Equal - Divide evenly
2. Unequal - Exact amounts
3. Percentage - Custom percentages
4. Share - Ratio-based
5. Mixed - Combine different methods
6. Partial participation - Opt-out options

---

## Implementation Priority & Phases

### Phase 1: Enhanced Core Features ⭐ HIGH PRIORITY
**Status**: Ready to start

#### 1.1 Friends System
- `User` entity: Add `friend_ids` field
- Create `Friend` table or relationship table
- API to add friend via email
- API to list friends
- Show friends on dashboard
- Friend activity view

#### 1.2 Group Invitations
- `Invitation` table (code, group_id, invited_by, status, expires_at)
- Generate random invitation codes
- Send email invites
- Track invitation status (pending, accepted, expired)
- Accept invitation via code
- Link invite (alternative to code)

#### 1.3 Comment System
- `Comment` entity (expense_id, user_id, text, created_at)
- API: Add comment to expense
- API: Get comments for expense
- UI: Show comments under each expense
- Notification on comment replies
- Tag members in comments (@username)

#### 1.4 Activity Feed
- `Activity` table (user_id, action, entity_type, entity_id, created_at)
- Track all important actions
- Personal activity feed for user
- Group activity feed
- Real-time activity updates

### Phase 2: Email Notifications ⭐ HIGH PRIORITY
**Status**: After Phase 1

#### 2.1 Email Service Setup
- JavaMail for sending emails
- Email templates (HTML formatted)
- Environment variables for SMTP config

#### 2.2 Notification Types
**Group notifications:**
- New group created
- Added to group
- Removed from group
- Group settings changed

**Expense notifications:**
- New expense added
- Expense edited/deleted
- Someone owes you money
- You owe someone money

**Settlement notifications:**
- Payment request received
- Settlement recorded
- Payment confirmed

**Friend notifications:**
- Friend request received
- Friend accepted/rejected

#### 2.3 Notification Preferences
- User notification settings table
- Toggle each notification type
- Frequency options (instant, daily, weekly)
- Email digest option

### Phase 3: QR Codes & Sharing ⭐ HIGH PRIORITY
**Status**: After Phase 2

#### 3.1 QR Code Generation
- Generate unique QR codes for:
  - Group join links
  - Expense share links
  - Settlement request links
- QR code entity (code, type, entity_id, expires_at)

#### 3.2 Sharing Links
- Generate shareable URLs
- Copy to clipboard functionality
- Social sharing buttons (WhatsApp, Telegram, etc.)
- Track link usage statistics

#### 3.3 QR Code Scanning
- Mobile camera integration
- Scan to view expense
- Scan to add member to group
- Scan to record settlement

### Phase 4: Multi-Currency Support ⭐ MEDIUM PRIORITY
**Status**: After Phase 3

#### 4.1 Currency Entity
- `Currency` table (code, name, symbol, rate, updated_at)
- Pre-populate with 100+ currencies
- Support CRUD operations

#### 4.2 Exchange Rates
- Fetch rates periodically (e.g., from exchangerate-api)
- Update rates daily
- Keep historical rate history
- Convert amounts on the fly

#### 4.3 Currency Conversion in UI
- Show all amounts in user's preferred currency
- Show original currency alongside
- Conversion rate tooltip

### Phase 5: Advanced Expense Features ⭐ MEDIUM PRIORITY
**Status**: After Phase 4

#### 5.1 Recurring Expenses
- `RecurringExpense` entity
- Schedule (daily, weekly, monthly)
- Auto-create expenses on schedule
- Skip/override options

#### 5.2 Expense Categories
- `Category` entity (name, icon, color, created_by)
- Pre-populate common categories
- Category filtering in expenses
- Category-wise statistics

#### 5.3 Expense Items
- `ExpenseItem` entity (expense_id, name, amount)
- Itemized expense breakdown
- Total = sum of item amounts

#### 5.4 Receipt Management (Basic)
- `Receipt` entity (expense_id, image_url, created_at)
- Upload receipt images
- Display receipt in expense details

#### 5.5 Expense Templates
- Pre-save common expense templates
- Quick-add from templates
- Template library

### Phase 6: PRO Features (Future) ⭐ LOW PRIORITY
**Status**: After Phase 5

#### 6.1 Receipt OCR
- OCR integration
- Auto-extract amounts from receipt images

#### 6.2 Advanced Analytics
- Charts and graphs
- Category spending trends
- Member contribution analysis
- Export to accounting software

#### 6.3 Payment Integrations
- Venmo integration
- PayPal integration
- Stripe for credit cards

#### 6.4 Admin Features
- Group admin permissions
- Group settings management
- Member removal validation
- Expense approval workflow

---

## Database Schema Changes

### New Tables

#### Friends System
```sql
CREATE TABLE friendships (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    friend_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    UNIQUE(user_id, friend_id)
);
```

#### Invitations
```sql
CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    group_id BIGINT NOT NULL REFERENCES groups(id),
    invited_by BIGINT NOT NULL REFERENCES users(id),
    invited_email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Comments
```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    expense_id BIGINT NOT NULL REFERENCES expenses(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mentions TEXT
);
```

#### Activity Feed
```sql
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### QR Codes
```sql
CREATE TABLE qr_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    created_by BIGINT REFERENCES users(id),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Currencies
```sql
CREATE TABLE currencies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    rate DECIMAL(12, 6),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Recurring Expenses
```sql
CREATE TABLE recurring_expenses (
    id SERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES groups(id),
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    split_type VARCHAR(20) NOT NULL,
    split_details TEXT,
    schedule_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    schedule_value INT,
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Categories
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7),
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Expense Items
```sql
CREATE TABLE expense_items (
    id SERIAL PRIMARY KEY,
    expense_id BIGINT NOT NULL REFERENCES expenses(id),
    name VARCHAR(200) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Receipts
```sql
CREATE TABLE receipts (
    id SERIAL PRIMARY KEY,
    expense_id BIGINT NOT NULL REFERENCES expenses(id),
    image_url VARCHAR(500),
    file_name VARCHAR(255),
    mime_type VARCHAR(100),
    file_size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### User Notification Settings
```sql
CREATE TABLE notification_settings (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) UNIQUE,
    email_expense_added BOOLEAN DEFAULT TRUE,
    email_settlement BOOLEAN DEFAULT TRUE,
    email_friend_request BOOLEAN DEFAULT TRUE,
    email_invitation BOOLEAN DEFAULT TRUE,
    email_balance_update BOOLEAN DEFAULT FALSE,
    daily_digest BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Backend API Changes Required

### Friends Endpoints
- `POST /api/friends/request` - Request friendship
- `POST /api/friends/accept/{requestId}` - Accept friend request
- `POST /api/friends/decline/{requestId}` - Decline friend request
- `GET /api/friends` - List friends
- `GET /api/friends/{friendId}/activity` - Friend activity

### Invitations Endpoints
- `POST /api/groups/{groupId}/invite` - Generate invite link/code
- `POST /api/groups/{groupId}/invite/send` - Send email invites
- `GET /api/groups/{groupId}/invitations` - List all invitations
- `POST /api/invitations/{code}/accept` - Accept invitation
- `GET /api/invitations/{code}/status` - Check invite status
- `POST /api/groups/{groupId}/invitations/{code}/resend` - Resend invite

### Comments Endpoints
- `POST /api/expenses/{expenseId}/comments` - Add comment
- `GET /api/expenses/{expenseId}/comments` - Get all comments
- `PUT /api/comments/{commentId}` - Update comment
- `DELETE /api/comments/{commentId}` - Delete comment

### Activity Endpoints
- `GET /api/activities` - Get user's activity feed
- `GET /api/groups/{groupId}/activities` - Get group activity
- `POST /api/activities/mark-read/{activityId}` - Mark as read

### Notifications Endpoints
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/{notificationId}/read` - Mark as read
- `PUT /api/notifications/settings` - Update notification preferences

### QR Codes Endpoints
- `POST /api/qr-codes/generate` - Generate QR code
- `GET /api/qr-codes/{code}` - Get QR code details
- `POST /api/qr-codes/{code}/scan` - Scan QR code

### Sharing Endpoints
- `POST /api/groups/{groupId}/share` - Generate share link
- `GET /api/expenses/{expenseId}/share` - Share expense
- `POST /api/settlements/{settlementId}/share` - Share settlement

### Currencies Endpoints
- `GET /api/currencies` - List all supported currencies
- `POST /api/currencies/sync` - Force exchange rate sync
- `GET /api/currencies/rates` - Get current rates

### Categories Endpoints
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `GET /api/expenses/{expenseId}/items` - Get expense items

### Recurring Endpoints
- `GET /api/recurring/{groupId}` - List recurring expenses
- `POST /api/recurring` - Create recurring expense
- `PUT /api/recurring/{id}` - Update recurring expense
- `DELETE /api/recurring/{id}` - Delete recurring expense

### Receipts Endpoints
- `POST /api/expenses/{expenseId}/receipts` - Upload receipt
- `GET /api/receipts/{receiptId}/download` - Download receipt
- `DELETE /api/receipts/{receiptId}` - Delete receipt

---

## Frontend Components to Add

### New Components
```
components/
├── Logo.jsx                  # ✅ Created
├── QRCodeGenerator.jsx      # Generate/display QR codes
├── ShareModal.jsx          # Share with options
├── FriendList.jsx            # Show friends list
   ├── FriendCard.jsx         # Individual friend card
├── AddFriendModal.jsx     # Add friend modal
├── InvitationList.jsx        # List pending invitations
├── NotificationBadge.jsx     # Notification bell with badge
└── NotificationPanel.jsx    # Notification panel with mark-read
```

### New Pages
```
pages/
├── Friends.jsx              # Friends management page
├── Activity.jsx             # Activity feed page
├── Notifications.jsx         # Notifications settings page
├── Currencies.jsx          # Currency management page
├── Categories.jsx          # Category management page
└── Receipts.jsx            # Receipts management page
```

### Enhanced Components
```
components/
├── ExpenseCard.jsx         # Add receipt, comments
├── GroupCard.jsx           # Add QR code button, invite button
├── BalanceCard.jsx         # Show in user's preferred currency
└── SettlementCard.jsx     # Show payment options
```

---

## Feature-by-Feature Implementation

### 1. Friends System

**Backend:**
- Create `FriendRequest.java` DTO
- Create `Friend.java` entity (relationship table)
- Update `User.java` with friend references
- `FriendService.java` - add, accept, decline, list friends
- `FriendController.java` - endpoints

**Frontend:**
- Add friends list in dashboard
- Add friend modal (search by email)
- Friend cards showing shared groups
- Activity view per friend

---

### 2. Email Notifications

**Backend:**
- Add JavaMail dependency
- Create `EmailService.java`
- Create email templates (HTML)
- Create `Notification.java` entity
- Create `NotificationSettings.java` entity
- `EmailController.java` - manage notification preferences

**Email Templates:**
- `invitation-email.html` - Group invitation
- `expense-added.html` - New expense notification
- `settlement-request.html` - Payment request
- `friend-request.html` - Friend request

**Frontend:**
- Notification bell icon with badge
- Notification panel showing recent notifications
- Mark as read functionality
- Notification settings page

---

### 3. QR Codes & Sharing

**Backend:**
- Create `QRCode.java` entity
- Create `ShareLink.java` entity
- `QRCodeService.java` - generate and validate codes
- `ShareService.java` - create share links
- `QRCodeController.java` - endpoints

**Frontend:**
- QR code generator component
- Share modal with options (WhatsApp, Telegram)
- Copy to clipboard
- QR code scanner (camera integration)

---

### 4. Multi-Currency

**Backend:**
- Create `Currency.java` entity
- Pre-populate 100+ currencies data
- `CurrencyService.java` - CRUD + rate sync
- Update `ExpenseService.java` for currency conversion
- `BalanceService.java` - convert balances

**Frontend:**
- Currency selector in expenses
- Currency preference in user profile
- Show converted amounts in balances
- Add currency toggle

---

### 5. Advanced Expenses

**Backend:**
- `Category.java` entity with icon/color
- `RecurringExpense.java` entity
- `ExpenseItem.java` entity
- `ExpenseService.java` - handle recurring, items
- `ExpenseController.java` - new endpoints

**Frontend:**
- Category selector in expense form
- Recurring expense management page
- Itemized expense breakdown
- Receipt upload component

---

### 6. Comments & Activity

**Backend:**
- `Comment.java` entity
- `Activity.java` entity
- `CommentService.java` - CRUD operations
- `ActivityService.java` - activity tracking
- Controllers for both

**Frontend:**
- Comment section under each expense
- Activity feed page with tabs (personal, group)
- @mention support
- Mark as read functionality

---

## Complete Backend Schema (After All Phases)

```sql
-- Core Tables (existing)
users
groups
group_members
expenses
expense_splits
settlements

-- NEW TABLES
friendships
invitations
comments
activities
qr_codes
currencies
categories
recurring_expenses
expense_items
receipts
notification_settings
```

---

## Implementation Order

### Week 1: Core Enhanced Features
1. Friends system
2. Group invitations
3. Comment system
4. Activity feed

### Week 2: Communication Features
5. Email notification service
6. Notification preferences

### Week 3: Social Features
7. QR code generation
8. Share links

### Week 4: Advanced Features
9. Multi-currency support
10. Receipt management

### Week 5: Polish & Testing
11. Comprehensive testing
12. Performance optimization
13. Documentation updates

---

## Technical Decisions

### Backend
- **Email**: Use JavaMail for simplicity
- **QR Code**: Use `zxing` library for generation
- **Exchange Rates**: Use free exchange rate API (exchangerate-api.com)
- **Receipts**: Store as base64 or image URL

### Frontend
- **QR**: Use `qrcode.react` npm package
- **Email Templates**: Send formatted HTML from backend, frontend just shows UI
- **Real-time Updates**: Polling-based for activity feed
- **Icons**: Use Lucide React icons

---

## API Endpoint Summary

### Friends API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/friends/request/{email}` | Send friend request |
| PUT | `/api/friends/{requestId}/accept` | Accept friend |
| PUT | `/api/friends/{requestId}/decline` | Decline friend |
| GET | `/api/friends` | List friends |
| GET | `/api/friends/{id}/activity` | Friend activity |

### Invitations API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/groups/{id}/invite` | Generate invite code |
| POST | `/api/groups/{id}/invite/send` | Send email invites |
| POST | `/api/invitations/{code}/accept` | Accept invite |
| GET | `/api/groups/{id}/invitations` | List invitations |
| GET | `/api/invitations/{code}/status` | Check status |
| POST | `/api/groups/{id}/invitations/{code}/resend` | Resend invite |

### Comments API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/expenses/{id}/comments` | Add comment |
| GET | `/api/expenses/{id}/comments` | Get comments |
| PUT | `/api/comments/{id}` | Update comment |
| DELETE | `/api/comments/{id}` | Delete comment |

### Activity API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/activities` | My activity feed |
| GET | `/api/groups/{id}/activities` | Group activity |
| POST | `/api/activities/{id}/mark-read` | Mark read |

### Notifications API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/notifications` | List notifications |
| POST | `/api/notifications/{id}/read` | Mark as read |
| PUT | `/api/notifications/settings` | Update settings |

### QR Codes API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/qr-codes/generate` | Generate QR code |
| GET | `/api/qr-codes/{code}` | Get QR code details |
| POST | `/api/qr-codes/{code}/scan` | Scan QR code

### Sharing API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/groups/{id}/share` | Share group link |
| POST | `/api/expenses/{id}/share` | Share expense |
| POST | `/api/settlements/{id}/share` | Share settlement |

### Currencies API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/currencies` | List currencies |
| POST | `/api/currencies/sync` | Sync rates |
| GET | `/api/currencies/rates` | Get current rates |

### Categories API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| GET | `/api/expenses/{id}/items` | Get expense items

### Recurring API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/recurring/{groupId}` | List recurring expenses |
| POST | `/api/recurring` | Create recurring |
| PUT | `/api/recurring/{id}` | Update recurring |
| DELETE | `/api/recurring/{id}` | Delete recurring

### Receipts API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/expenses/{id}/receipts` | Upload receipt |
| GET | `/api/receipts/{id}/download` | Download receipt |
| DELETE | `/api/receipts/{id}` | Delete receipt

---

## Files to Create/Update

### Backend
- `backend/src/main/java/com/spreetail/expense/model/` - Add new entities
- `backend/src/main/java/com/spreetail/expense/dto/` - Add new DTOs
- `backend/src/main/java/com/spreetail/expense/repository/` - Add new repositories
- `backend/src/main/java/com/spreetail/expense/service/` - Add new services
- `backend/src/main/java/com/spreetail/expense/controller/` - Add new controllers
- `backend/src/main/java/com/spreetail/expense/config/` - Add email config, QR code config
- `backend/src/main/resources/` - Add email templates

### Frontend
- `frontend/src/components/` - Add new components
- `frontend/src/pages/` - Add new pages
- `frontend/src/services/` - Add service files
- `frontend/src/context/` - Add notification context

### Configuration
- `backend/src/main/resources/application.properties` - Add email, QR, currency configs
- `backend/pom.xml` - Add new dependencies (JavaMail, zxing)
- `frontend/package.json` - Add new dependencies (qrcode.react, react-icons, date-fns)

---

## Next Steps

This plan is ready for implementation. The user can:
1. Review and approve the plan
2. I can start implementing features in priority order
3. Each feature will be committed with conventional commits
4. All code will follow student-level simplicity (no lambdas, simple logic)

Which phase should I start with?