# Spreetail - Frontend Improvements

Based on comprehensive Splitwise analysis, here's what will be added to the Spreetail frontend to make it feature-complete with Splitwise functionality.

## New Pages to Create

### 1. Friends Page (`/friends`)
- Friend cards with shared groups
- Send friend requests via email
- Accept/decline friend requests
- View friend activity
- Search friends by name/email

### 2. Activity Feed (`/activity`)
- Personal activity feed
- Group activity feed
- Filter by activity type
- Mark activities as read

### 3. Notifications Page (`/notifications`)
- Notification bell with badge count
- Notification list with actions
- Mark individual as read or mark all as read
- Notification settings (what to notify, frequency)

### 4. Categories Page (`/categories`)
- Category management (create, edit, delete)
- Category list with icons and colors
- Category-wise expense breakdown

### 5. Receipts Page (`/receipts`)
- Upload receipt images
- Download receipts
- View expense receipt history
- Show receipt on expense card

### 6. Currencies Page (`/currencies`)
- View all supported currencies
- Set default currency for groups
- View exchange rates
- Toggle currency display in UI

### 7. Settlements Enhanced (`/settlements`)
- Settlement suggestions with one-click settle
- Payment method options (if expanded later)
- Settlement history with filter

---

## New Components to Create

### Authentication Components
- `LogoutConfirmModal.jsx` - Confirm logout

### Group Components
- `GroupQRCode.jsx` - Generate and display QR code
- `ShareModal.jsx` - Share group via link or QR code
- `InviteList.jsx` - Show pending invitations

### Expense Components
- `ExpenseCardEnhanced.jsx` - With receipt attachment, comments, share button
- `CategorySelector.jsx` - Choose expense category
- `MultiCurrencyInput.jsx` - Currency selector with conversion
- `SplitTypeSelector.jsx` - Enhanced split type selector with descriptions

### Settlement Components
- `SettlementCardEnhanced.jsx` - With pay button, share options
- `BalanceSummary.jsx` - Visual balance breakdown

### Shared Components
- `NotificationBadge.jsx` - Bell icon with badge
- `NotificationPanel.jsx` - Slide-in notification panel
- `EmptyState.jsx` - Generic empty state component
- `Badge.jsx` - Generic badge component
- `Avatar.jsx` - User avatar component

---

## API Extensions Required

### New API Endpoints to Add

**Friends:**
- `POST /api/friends/request/{email}` - Send friend request
- `PUT /api/friends/{requestId}/accept` - Accept friend
- `PUT /api/friends/{requestId}/decline` - Decline friend
- `GET /api/friends` - List friends
- `GET /api/friends/{id}/activity` - Friend activity

**Invitations:**
- `POST /api/groups/{id}/invite` - Generate invite code
- `POST /api/groups/{id}/invite/send` - Send email invites
- `POST /api/invitations/{code}/accept` - Accept invite
- `GET /api/groups/{id}/invitations` - List invitations
- `GET /api/invitations/{code}/status` - Check status
- `POST /api/groups/{id}/invitations/{code}/resend` - Resend invite

**Comments:**
- `POST /api/expenses/{id}/comments` - Add comment
- `GET /api/expenses/{id}/comments` - Get all comments
- `PUT /api/comments/{id}` - Update comment
- `DELETE /api/comments/{id}` - Delete comment

**Activity:**
- `GET /api/activities` - My activity feed
- `GET /api/groups/{id}/activities` - Group activity
- `POST /api/activities/{id}/mark-read` - Mark read

**Notifications:**
- `GET /api/notifications` - List notifications
- `POST /api/notifications/{id}/read` - Mark as read
- `PUT /api/notifications/settings` - Update settings

**QR Codes:**
- `POST /api/qr-codes/generate` - Generate QR code
- `GET /api/qr-codes/{code}` - Get QR code details
- `POST /api/qr-codes/{code}/scan` - Scan QR code

**Sharing:**
- `POST /api/groups/{id}/share` - Share group link
- `POST /api/expenses/{id}/share` - Share expense
- `POST /api/settlements/{id}/share` - Share settlement

**Currencies:**
- `GET /api/currencies` - List currencies
- `POST /api/currencies/sync` - Sync rates
- `GET /api/currencies/rates` - Get current rates
- `PUT /api/users/{id}/currency` - Set preferred currency

**Categories:**
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET /api/expenses/{id}/items` - Get expense items

**Recurring:**
- `GET /api/recurring/{groupId}` - List recurring expenses
- `POST /api/recurring` - Create recurring
- `PUT /api/recurring/{id}` - Update recurring
- `DELETE /api/recurring/{id}` - Delete recurring

**Receipts:**
- `POST /api/expenses/{id}/receipts` - Upload receipt
- `GET /api/receipts/{id}/download` - Download receipt
- `DELETE /api/receipts/{id}` - Delete receipt

---

## Component Structure

```
src/
├── components/
│   ├── Logo.jsx                # ✅ Already exists
│   ├── QRCodeGenerator.jsx    # NEW - Generate/display QR codes
│   ├── ShareModal.jsx          # NEW - Share with options
│   ├── InviteList.jsx        # NEW - Show pending invites
│   ├── NotificationBadge.jsx    # NEW - Bell icon with badge
│   ├── NotificationPanel.jsx   # NEW - Slide-in panel
│   ├── EmptyState.jsx          # NEW - Generic empty state
│   ├── Badge.jsx               # NEW - Generic badge
│   ├── Avatar.jsx               # NEW - User avatar
│   ├── FriendCard.jsx          # NEW - Friend card
│   ├── AddFriendModal.jsx       # NEW - Add friend dialog
│   └── FriendList.jsx            # NEW - Friends list
├── context/
│   ├── AuthContext.js         # ✅ Already exists
│   └── NotificationContext.js   # NEW - Notifications state
├── services/
│   ├── api.js                # ✅ Updated with API_BASE_URL
│   ├── emailService.js       # NEW - Email utilities
│   ├── qrCodeService.js     # NEW - QR code utilities
│   └── balanceService.js     # NEW - Balance calculations
└── pages/
    ├── Login.js                 # ✅ Updated with Logo
    ├── Register.js              # ✅ Updated with Logo
    ├── Dashboard.js            # ✅ Updated with Logo
    ├── GroupDetails.js         # ✅ Updated (needs expansion)
    ├── Friends.js              # NEW - Friends management
    ├── Activity.js             # NEW - Activity feed
    ├── Notifications.js         # NEW - Notifications settings
    ├── Currencies.js          # NEW - Currency management
    ├── Categories.js          # NEW - Category management
    └── Receipts.js            # NEW - Receipts management
```

---

## Frontend Dependencies to Add

```json
{
  "dependencies": {
    "react-qr-code": "^1.5.1",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "react-icons": "^4.12.0",
    "date-fns": "^4.1.0",
    "@heroicons/react": "^2.1.0",
    "recharts": "^2.10.0",
    "react-hot-toast": "^2.4.0",
    "react-qr-scanner": "^1.1.0"
  }
}
```

---

## Priority Implementation Order

1. **Week 1** - Core Social Features
   - Friends system (add, accept/decline, list)
   - Group invitations (generate code, send email, accept)
   - Activity feed (track actions, mark as read)

2. **Week 2** - Communication Features
   - Email notification service setup
   - Notification preferences
   - Mark as read functionality

3. **Week 3** - Social & Sharing
   - QR code generation
   - Share links generation
   - Copy to clipboard functionality

4. **Week 4** - Advanced Features
   - Multi-currency support
   - Category management
   - Receipt management

5. **Week 5** - Polish & Complete
   - Enhanced UI components
   - Comprehensive testing
   - Documentation updates

---

## Estimated Total Commits: ~45-50 commits

Each major feature will be split into smaller commits for:
- Entity/Repository layer
- Service layer with business logic
- Controller layer with endpoints
- Frontend components
- Styling and integration

---

Ready to start implementing!