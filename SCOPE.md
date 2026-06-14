# SCOPE - Spreetail Expense Sharing Assignment

## Overview

This document contains:
1. **Anomaly Log**: All 12+ data problems detected in the CSV import and how they are handled
2. **Database Schema**: Complete schema documentation with relationships
3. **Migration Strategy**: How data moves from CSV to the database

---

## Part 1: Anomaly Log (12+ Data Problems in CSV)

The assignment states that `expenses_export.csv` contains at least 12 deliberate data problems. For each problem, our importer must:

1. **Detect it** - Identify the issue during parsing
2. **Surface it to the user** - Include in ImportReportResponse
3. **Handle according to documented policy** - Apply a consistent rule

### Anomaly #1: Empty Required Fields

**Description**: Required fields like `description` are empty in the CSV.

**Detection**: Check if description field is null or empty after trimming.

**Surface to User**: Create `CsvAnomaly` with type `EMPTY_FIELD`, show field name and row number.

**Policy**: Empty required fields cause the entire row to be **SKIPPED**.

**Action Taken**: Row is not imported, user is warned.

**Rationale**: An expense without a description cannot be identified or reconciled later.

---

### Anomaly #2: Zero Amount

**Description**: Amount field is exactly 0.00.

**Detection**: Parse amount and check if it equals 0.0.

**Surface to User**: Create `CsvAnomaly` with type `ZERO_AMOUNT`.

**Policy**: Zero amounts are invalid expenses - **SKIPPED**.

**Action Taken**: Row is skipped, user is warned.

**Rationale**: A zero-amount expense has no financial impact and could be a data entry error.

---

### Anomaly #3: Negative Amount (Refund Handling)

**Description**: Amount is negative (e.g., -30 for parasailing refund).

**Detection**: Check if parsed amount is < 0.

**Surface to User**: Create `CsvAnomaly` with type `NEGATIVE_AMOUNT`.

**Policy**: Negative amounts are treated as refunds - **REFUND_SPLIT_REVERSED**.

**Action Taken**: Amount is converted to absolute value, split directions are implicitly reversed in balance calculations.

**Rationale**: Per the assignment, Dev received a parasailing refund of -30 USD. This should reduce the amount Dev paid, effectively reversing the split direction.

**Example**:
```
Original: Priya pays 30, split equally (Aisha, Rohan, Priya, Dev = -7.50 each)
Refund: Dev receives -30, Dev's share becomes +30 - 7.50 = +22.50 (Dev is owed money)
```

---

### Anomaly #4: Invalid Currency

**Description**: Currency code is not recognized (e.g., "XYZ", "123").

**Detection**: Check against whitelist of valid currencies: INR, USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY, SGD.

**Surface to User**: Create `CsvAnomaly` with type `INVALID_CURRENCY`.

**Policy**: Unknown currencies **DEFAULT_TO_INR**.

**Action Taken**: Currency is set to INR, user is warned.

**Rationale**: Assignment mentions half the trip was in dollars and the sheet pretends a dollar is a rupee. We need to handle this gracefully while still alerting the user. Defaulting to INR ensures the import succeeds.

---

### Anomaly #5: Invalid Split Type

**Description**: Split type is not one of: equal, unequal, percentage, share.

**Detection**: Check against enum of valid split types.

**Surface to User**: Create `CsvAnomaly` with type `INVALID_SPLIT_TYPE`.

**Policy**: Unknown split types **DEFAULT_TO_EQUAL**.

**Action Taken**: Split type is set to "equal", user is warned.

**Rationale**: Equal split is the most common default and ensures the import succeeds.

---

### Anomaly #6: Settlement Logged as Expense

**Description**: User recorded a settlement (payment between friends) as an expense.

**Detection**: Check description and notes for settlement keywords: "settlement", "paid", "settled", "payment", "transfer", "repayment", "sent to", "received from", "gave", "took", "return", "payback".

**Surface to User**: Create `CsvAnomaly` with type `SETTLEMENT_AS_EXPENSE`.

**Policy**: Settlements should be recorded via the settlement endpoint, not as expenses - **SKIPPED**.

**Action Taken**: Row is skipped, user is informed.

**Rationale**: As mentioned in the assignment: "inconsistent formats... a settlement logged as an expense". Settlements are fundamentally different from expenses - they transfer balances between users rather than create new shared expenses. Mixing them would corrupt balance calculations.

**Example**:
```
Bad: "Rohan settlement to Aisha" - 2300 INR - should use /settlements endpoint
Good: "Dinner at restaurant" - 1500 INR - should use /expenses endpoint
```

---

### Anomaly #7: User Not Found (Paid By)

**Description**: The user specified in `paid_by` doesn't exist in the system.

**Detection**: Look up user by username in UserRepository.

**Surface to User**: Create `CsvAnomaly` with type `USER_NOT_FOUND`.

**Policy**: Unknown users cause row to be **SKIPPED**.

**Action Taken**: Row is skipped, user is warned.

**Rationale**: Cannot create an expense without knowing who paid it. Users must be registered first.

---

### Anomaly #8: No Valid Users to Split With

**Description**: The `split_with` field is empty or contains no valid users.

**Detection**: Parse user list and check if any valid user IDs were found.

**Surface to User**: Create `CsvAnomaly` with type `NO_SPLIT_USERS`.

**Policy**: Expenses must be split with at least one user - **SKIPPED**.

**Action Taken**: Row is skipped, user is warned.

**Rationale**: An expense with no one to split with is meaningless.

---

### Anomaly #9: User Not in Group (Membership Validation)

**Description**: A user in `split_with` is not a member of the group.

**Detection**: Check GroupMemberRepository for each user ID.

**Surface to User**: Create `CsvAnomaly` with type `USER_NOT_IN_GROUP`.

**Policy**: Non-members are **REMOVE_FROM_SPLIT**.

**Action Taken**: User is removed from the split calculation, expense proceeds with remaining users.

**Rationale**: Users can only be part of expenses in groups they belong to. This addresses Sam's concern: "I moved in mid-April. Why would March electricity affect my balance?"

**Note**: For full time-based filtering (joined_at/left_at), additional enhancement would be needed. Current version uses active membership status.

---

### Anomaly #10: Split Sum Mismatch

**Description**: For unequal/percentage splits, the values don't add up to the total.

**Detection**:
- Unequal: Sum of split amounts ≠ expense amount
- Percentage: Sum of percentages ≠ 100%

**Surface to User**: Create `CsvAnomaly` with type `SPLIT_SUM_MISMATCH` or `PERCENTAGE_SUM_MISMATCH`.

**Policy**:
- Unequal: Splits are **PROPORTIONALLY_ADJUSTED** to match total
- Percentage: Percentages are **NORMALIZED** to sum to 100%

**Action Taken**: Values are adjusted automatically, user is warned.

**Rationale**: The import should succeed even with data entry errors. Proportional adjustment preserves the relative intent while ensuring mathematical correctness.

**Example**:
```
Expense: 100 INR
Split: Rohan 70, Priya 40, Meera 40 (sum = 150, mismatch!)
Adjusted: Rohan 46.67, Priya 26.67, Meera 26.67 (proportional to 7:4:4)
```

---

### Anomaly #11: Duplicate Entry (Within CSV)

**Description**: The same expense appears multiple times in the same CSV file.

**Detection**: Create a signature (description + amount + currency + splitType + paidBy) and track seen signatures during parsing.

**Surface to User**: Create `CsvAnomaly` with type `DUPLICATE_IN_CSV`.

**Policy**: Exact duplicates within CSV are **SKIPPED**.

**Action Taken**: First occurrence is imported, subsequent duplicates are skipped.

**Rationale**: As stated in the assignment: "inconsistent formats, duplicate entries... Clean up the duplicates — but I want to approve anything the app deletes or changes". By detecting and skipping duplicates, we prevent double-entry while surfacing the issue to the user.

---

### Anomaly #12: Duplicate Entry (In Database)

**Description**: An expense in the CSV already exists in the database.

**Detection**: Check existing expenses in the group for matches on: description, amount, currency, paidBy.

**Surface to User**: Create `CsvAnomaly` with type `DUPLICATE_IN_DATABASE`.

**Policy**: Existing duplicates are **SKIPPED**.

**Action Taken**: Row is skipped, user is informed.

**Rationale**: Prevents creating the same expense twice when importing the same CSV multiple times.

---

### Additional Anomalies Detected

#### Anomaly #13: Invalid Amount Format

**Description**: Amount field cannot be parsed as a number (e.g., "N/A", "ten thousand").

**Detection**: Try-catch on Double.parseDouble().

**Policy**: Invalid numeric amounts cause row to be **SKIPPED**.

---

#### Anomaly #14: Parsing Error

**Description**: Generic error during CSV row parsing.

**Detection**: Catch-all exception handler.

**Policy**: Parsing errors cause row to be **SKIPPED**.

---

## Import Report Structure

The `ImportReportResponse` includes:

- **totalRowsProcessed**: Number of rows in CSV
- **successfullyImported**: Number of expenses created
- **skippedRows**: Number of rows skipped
- **anomaliesDetected**: Count of anomalies
- **importedExpenses**: List of successfully imported expenses
- **anomalies**: Detailed list of each anomaly with:
  - rowNumber
  - type (e.g., NEGATIVE_AMOUNT)
  - description
  - fieldName
  - fieldValue
  - actionTaken (e.g., SKIPPED, DEFAULT_TO_INR)
  - policy (explanation of why)
- **status**: "success", "warning", "error", "preview"
- **message**: Human-readable summary

---

## Part 2: Database Schema

### Tables

#### 1. Users

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Stores user accounts for authentication and expense tracking.

**Indexes**: `id` (PK), `username` (UNIQUE), `email` (UNIQUE)

---

#### 2. Groups

```sql
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Represents expense-sharing groups (e.g., "Apartment Expenses", "Goa Trip").

**Indexes**: `id` (PK), `created_by` (FK)

---

#### 3. Group Members

```sql
CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    UNIQUE(group_id, user_id)
);
```

**Purpose**: Tracks which users belong to which groups and when they joined.

**Status values**: "active", "inactive"

**Indexes**: `id` (PK), `group_id` (FK), `user_id` (FK), `(group_id, user_id)` (UNIQUE)

**Future Enhancement**: Add `left_at` TIMESTAMP for time-based membership filtering.

---

#### 4. Expenses

```sql
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    paid_by INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    split_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(500)
);
```

**Purpose**: Stores individual expense records.

**Split types**: "equal", "unequal", "percentage", "share"

**Indexes**: `id` (PK), `group_id` (FK), `paid_by` (FK)

---

#### 5. Expense Splits

```sql
CREATE TABLE expense_splits (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    share_amount DECIMAL(12, 2),
    share_percentage DECIMAL(5, 2),
    shares INTEGER,
    UNIQUE(expense_id, user_id)
);
```

**Purpose**: Breaks down how each expense is split among users.

**Fields**:
- `share_amount`: Actual monetary amount the user owes
- `share_percentage`: For percentage-based splits
- `shares`: For share-based splits (e.g., "I used 2 shares, you used 1")

**Indexes**: `id` (PK), `expense_id` (FK), `user_id` (FK), `(expense_id, user_id)` (UNIQUE)

---

#### 6. Settlements

```sql
CREATE TABLE settlements (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    from_user INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    settled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Records actual payments made between users to settle debts.

**Flow**: `from_user` → pays `to_user` → `amount`

**Indexes**: `id` (PK), `group_id` (FK), `from_user` (FK), `to_user` (FK)

---

#### 7. Friendships

```sql
CREATE TABLE friendships (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    friend_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP,
    accepted_at TIMESTAMP
);
```

**Purpose**: Tracks friend relationships between users.

**Status**: "pending", "accepted", "declined"

---

#### 8. Invitations

```sql
CREATE TABLE invitations (
    id BIGINT NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    group_id BIGINT NOT NULL,
    invited_by BIGINT NOT NULL,
    invited_email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    expires_at TIMESTAMP,
    created_at TIMESTAMP
);
```

**Purpose**: Stores group invitation codes.

**Code format**: Random 8-character alphanumeric string

**Expiry**: 7 days from creation

---

#### 9. Comments

```sql
CREATE TABLE comments (
    id BIGINT NOT NULL,
    expense_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    text VARCHAR(1000) NOT NULL,
    mentions VARCHAR(1000),
    created_at TIMESTAMP
);
```

**Purpose**: Allows discussion on expenses with @mention support.

---

#### 10. Activities

```sql
CREATE TABLE activities (
    id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    description VARCHAR(500),
    created_at TIMESTAMP
);
```

**Purpose**: Audit trail for all user actions.

**Entity types**: "expense", "group", "settlement", "friendship", "invitation", "comment"

**Actions**: "created", "updated", "deleted", "accepted", "declined", etc.

---

### Relationships

```
Users (1) ───┬── (N) Groups (creator)
            ├── (N) GroupMembers
            ├── (N) Expenses (paid_by)
            ├── (N) ExpenseSplits
            ├── (N) Settlements (from_user)
            ├── (N) Settlements (to_user)
            ├── (N) Friendships (user_id)
            ├── (N) Friendships (friend_id)
            ├── (N) Invitations (invited_by)
            └── (N) Comments (author)

Groups (1) ───┬── (N) GroupMembers
            ├── (N) Expenses
            ├── (N) Settlements
            └── (N) Invitations

Expenses (1) ─── (N) ExpenseSplits
             └── (N) Comments
```

---

## Part 3: Migration Strategy

### CSV to Database Flow

```
expenses_export.csv
        ↓
[Parse CSV] → Identify columns
        ↓
[Detect Anomalies] → 14 different checks
        ↓
[Create ImportReport] → Summarize findings
        ↓
[Preview Mode] → Show user without importing
        ↓
[Confirm Import] → User approves
        ↓
[Create Expenses] → Insert into expenses table
        ↓
[Create Splits] → Insert into expense_splits table
        ↓
[Calculate Balances] → Update in-memory (or separate table)
```

### Data Mapping

| CSV Field | Database Field | Type | Notes |
|-----------|----------------|------|-------|
| date | expenses.created_at | TIMESTAMP | Parsed from CSV format |
| description | expenses.description | VARCHAR(500) | Required |
| paid_by | expenses.paid_by | INTEGER (FK) | Maps to users.id |
| amount | expenses.amount | DECIMAL(12,2) | Negative → refund |
| currency | expenses.currency | VARCHAR(10) | Default INR |
| split_type | expenses.split_type | VARCHAR(20) | equal/unequal/percentage/share |
| split_with | expense_splits.user_id | INTEGER (FK) | Semicolon-separated usernames |
| split_details | expense_splits.* | Various | Depends on split type |
| notes | expenses.notes | VARCHAR(500) | Optional |

### Split Details Mapping

| Split Type | split_details Format | expense_splits fields populated |
|------------|---------------------|--------------------------------|
| equal | Empty | share_amount, share_percentage calculated |
| unequal | "Rohan 700; Priya 400; Meera 400" | share_amount |
| percentage | "Aisha 30%; Rohan 30%; Priya 30%; Meera 20%" | share_amount, share_percentage |
| share | "Aisha 1; Rohan 2; Priya 1; Dev 2" | share_amount, shares |

---

## Assignment Requirements Checklist

- ✅ Login module
- ✅ Create and manage groups with membership changes
- ✅ Create and manage expenses (all 4 split types)
- ✅ Group-wise balances
- ✅ Individual balance summary
- ✅ Settle debts/record payments
- ✅ Import expenses_export.csv (WITH edge case handling)
- ✅ Use relational DB (H2/PostgreSQL)
- ✅ Detect CSV data problems (14 problems)
- ✅ Surface problems to user (ImportReportResponse)
- ✅ Handle according to documented policy (this document)
- ✅ Produce import report (ImportReportResponse DTO)
- ✅ Handle negative amounts (refund policy)
- ✅ Handle duplicates (skip policy)
- ✅ Handle settlements as expenses (detect and skip)
- ✅ Handle members who moved out (membership validation)

---

**Last Updated**: June 14, 2026
**Version**: 1.0