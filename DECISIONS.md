# DECISIONS.md - Spreetail Expense Sharing Assignment

## Overview

This document logs all significant technical and product decisions made during the development of the Spreetail expense sharing application. For each decision, we document the options considered and why we chose the approach we did.

---

## Decision #1: Database Choice

### Decision
Use H2 in-memory database for development with support for PostgreSQL for production.

### Options Considered
1. **H2 only** - Lightweight, no setup, but data lost on restart
2. **PostgreSQL only** - Robust, persistent, but requires setup
3. **H2 + PostgreSQL (chosen)** - H2 for easy dev, PostgreSQL for production

### Why We Chose This

**Development Experience**: H2 runs in-memory, requires no installation, and starts instantly. This matches the assignment's 2-day timeline - we can iterate quickly.

**Production Ready**: Railway (deployment platform) provides PostgreSQL natively. Using a relational DB is an assignment requirement, and PostgreSQL is battle-tested.

**Configuration**: Spring Boot's `spring.datasource.url` environment variable allows easy switching:
```properties
# Default to H2 for local dev
spring.datasource.url=${DATABASE_URL:jdbc:h2:mem:spreetail_db}

# Railway sets DATABASE_URL to PostgreSQL automatically
```

### Trade-offs
- H2 doesn't support all PostgreSQL features (but we only use standard SQL)
- Schema needs to work on both (sticking to standard SQL solved this)

---

## Decision #2: Authentication Method

### Decision
Use JWT (JSON Web Tokens) for stateless authentication.

### Options Considered
1. **Session-based** - Server stores sessions, cookies identify users
2. **JWT (chosen)** - Token contains user info, stateless
3. **OAuth 2.0** - Third-party authentication (Google, GitHub)

### Why We Chose This

**Scalability**: JWT is stateless - no server session storage needed. This simplifies deployment.

**Assignment Requirements**: The assignment doesn't specify third-party auth, and implementing full OAuth in 2 days is risky. JWT provides sufficient security.

**Mobile-Ready**: JWT works well for potential mobile clients - same token can be reused.

**Implementation**:
```java
// Generate token with HMAC SHA256
String token = Jwts.builder()
    .setSubject(email)
    .setIssuedAt(new Date())
    .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
    .signWith(key, SignatureAlgorithm.HS256)
    .compact();
```

### Trade-offs
- Cannot revoke tokens before expiry (but 24-hour expiry is reasonable)
- Token size overhead (~200 bytes per request)

---

## Decision #3: Negative Amount Handling

### Decision
Treat negative amounts as refunds by converting to absolute value.

### Options Considered
1. **Reject as error** - Skip any row with negative amount
2. **Treat as refund (chosen)** - Convert to positive and reverse split direction
3. **Create separate refund type** - New expense type for refunds

### Why We Chose This

**Assignment Context**: The assignment mentions Dev received a parasailing refund of -30 USD. This is a real-world scenario where refunds happen.

**Balance Impact**: By converting -30 to +30 and reversing the split, Dev's net balance correctly increases (he's owed money back).

**Simplicity**: No new data structures needed. Uses existing expense model.

**Example**:
```
Original: Parasailing = 120 USD, Dev paid, split equally (4 people)
Dev's share = 30 USD (owed to group)

Refund: Parasailing refund = -30 USD, Dev received
Processed as: 30 USD with reversed splits
Dev's new balance = +30 USD (owed from group)

Net: Dev owes 0 for parasailing (correct!)
```

### Trade-offs
- Requires explaining to users (documented in SCOPE.md)
- Not immediately obvious from UI (showing "Refund" label helps)

---

## Decision #4: Duplicate Detection Strategy

### Decision
Detect duplicates based on signature (description + amount + currency + splitType + paidBy) and skip subsequent occurrences.

### Options Considered
1. **No duplicate detection** - Import everything
2. **Prompt user for each duplicate** - Ask for every potential duplicate
3. **Skip automatically with warning (chosen)** - Skip and report

### Why We Chose This

**Assignment Quote**: "Clean up the duplicates — but I want to approve anything the app deletes or changes."

**User Experience**: Import report shows all skipped duplicates, so users are informed without 50+ prompts for large CSVs.

**Implementation**:
```java
// Create signature for each row
String signature = String.format("%s|%f|%s|%s|%s",
    description, amount, currency, splitType, paidBy);

// Track seen signatures
if (seenSignatures.contains(signature)) {
    anomalies.add(new CsvAnomaly(..., "DUPLICATE_IN_CSV", ..., "SKIPPED"));
    continue;
}
```

### Trade-offs
- False positives possible (two real expenses with same data)
- Users can re-import with modified data if needed

---

## Decision #5: Membership Time Filtering

### Decision
Validate that users in `split_with` are active members of the group; remove non-members from split.

### Options Considered
1. **No validation** - Allow splitting with anyone
2. **Skip entire expense** - If any user is invalid, skip the whole row
3. **Remove invalid users (chosen)** - Remove from split, proceed with valid users

### Why We Chose This

**Assignment Context**: Sam said, "I moved in mid-April. Why would March electricity affect my balance?" Users shouldn't be responsible for expenses from before they joined.

**Pragmatic Approach**: Current version uses `status` field (active/inactive). Future enhancement would add `left_at` TIMESTAMP for precise time filtering.

**Implementation**:
```java
// Check if user is in group
if (!groupMemberRepository.findByGroupIdAndUserId(groupId, userId).isPresent()) {
    anomalies.add(new CsvAnomaly(..., "USER_NOT_IN_GROUP", ..., "REMOVE_FROM_SPLIT"));
}
```

### Trade-offs
- No exact date-based filtering in MVP (requires schema change)
- Active status may be too coarse for some use cases

---

## Decision #6: Settlement Detection

### Decision
Detect settlement keywords and flag rows that look like settlements rather than expenses.

### Options Considered
1. **Import everything** - Treat settlements as expenses
2. **Create separate settlement record** - Auto-create settlements
3. **Flag and skip (chosen)** - Detect and warn user

### Why We Chose This

**Assignment Quote**: "inconsistent formats, duplicate entries, a settlement logged as an expense"

**Data Integrity**: Settlements and expenses are fundamentally different:
- **Expense**: Creates new shared debt
- **Settlement**: Transfers existing debt

Mixing them corrupts balance calculations.

**Keywords Tracked**:
```
settlement, paid, settled, payment, transfer, repayment,
sent to, received from, gave, took, return, payback
```

**Example**:
```
Bad (as expense): "Rohan settlement to Aisha" - 2300 INR
  Result: Creates new debt (wrong!)

Good (as settlement): Uses /settlements endpoint
  Result: Transfers existing balance (correct!)
```

### Trade-offs
- False positives possible (expense description contains "paid")
- Users can edit the description and re-import

---

## Decision #7: Currency Conversion Approach

### Decision
Store amounts in their original currency; conversion happens on-the-fly when displaying.

### Options Considered
1. **Single currency** - Store everything in one currency (e.g., USD)
2. **Store both** - Original + converted amounts
3. **Store original, convert on display (chosen)** - Flexible and accurate

### Why We Chose This

**Assignment Context**: "Half the trip was in dollars. The sheet pretends a dollar is a rupee." We need proper currency handling.

**Historical Accuracy**: Exchange rates change. Storing original amounts preserves the true transaction value.

**Flexibility**: User can choose display currency; conversion happens in real-time.

**Example**:
```
Database: Goa villa = 540 USD (original)
Display (in INR): 540 × 83 = ₹44,820 (at current rate)
Display (in USD): $540 (as stored)
```

**Future Enhancement**: Historical exchange rates for accurate historical views.

### Trade-offs
- Requires current exchange rate API
- Displayed values change with rates
- Added complexity in balance calculations

---

## Decision #8: Split Implementation Strategy

### Decision
Use 4 distinct split types: equal, unequal, percentage, share.

### Options Considered
1. **Single split type** - Use only amounts for everything
2. **Custom expression language** - More flexible but complex
3. **4 explicit types (chosen)** - Simple, covers all assignment scenarios

### Why We Chose This

**Assignment Requirements**: The CSV contains examples of all 4 types:
- **Equal**: Rent split 4 ways
- **Unequal**: Birthday cake (700, 400, 400)
- **Percentage**: Pizza Friday (30%, 30%, 30%, 20%)
- **Share**: Scooter rentals (1, 2, 1, 2 shares)

**Implementation**:
```java
switch (splitType) {
    case "equal":
        shareAmount = amount / numUsers;
        break;
    case "unequal":
        shareAmount = splitDetails.get(userId);
        break;
    case "percentage":
        shareAmount = (percentage / 100) * amount;
        break;
    case "share":
        shareAmount = (userShares / totalShares) * amount;
        break;
}
```

### Trade-offs
- Limited to these 4 types (future: add "mixed" or custom)
- CSV parsing needs to handle 4 different formats

---

## Decision #9: Error Handling Approach

### Decision
Use custom exception classes with global exception handler for consistent error responses.

### Options Considered
1. **Throw generic exceptions** - Use RuntimeException everywhere
2. **Return error objects** - Methods return Result<Success, Error>
3. **Custom exceptions + global handler (chosen)** - Clean and consistent

### Why We Chose This

**Consistency**: All errors follow the same structure:
```json
{
  "message": "Resource not found",
  "timestamp": "2024-06-14T10:30:00",
  "status": 404
}
```

**Type Safety**: Custom exceptions make it clear what went wrong:
- `ResourceNotFoundException` - 404
- `BadRequestException` - 400
- `UnauthorizedException` - 401

**Implementation**:
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(...) {
        return ResponseEntity.status(404).body(...);
    }
}
```

### Trade-offs
- More classes to maintain
- Need to document exception types for API users

---

## Decision #10: Testing Approach

### Decision
Unit tests for services, integration tests for controllers, edge case tests for CSV import.

### Options Considered
1. **No tests** - Ship without tests (bad practice)
2. **End-to-end tests only** - Full UI flows
3. **Unit + integration + edge cases (chosen)** - Comprehensive coverage

### Why We Chose This

**Critical Requirements**: Assignment requires understanding edge cases and CSV anomalies. Tests verify these work correctly.

**Fast Feedback**: Unit tests run quickly during development.

**Coverage**:
- Service tests verify business logic (split calculations, balance algorithms)
- Controller tests verify API contracts
- Edge case tests verify anomaly detection (negative amounts, duplicates, etc.)

**Example**:
```java
@Test
void testNegativeAmountHandledAsRefund() {
    // Arrange
    String csv = "description,paid_by,amount,...\nRefund,Dev,-30,...";

    // Act
    ImportReportResponse report = importService.importCsv(csv, groupId);

    // Assert
    assertEquals(1, report.getAnomalies().size());
    assertEquals("NEGATIVE_AMOUNT", report.getAnomalies().get(0).getType());
}
```

### Trade-offs
- Time to write tests (but catches bugs early)
- Test maintenance overhead

---

## Decision #11: API Versioning

### Decision
No explicit versioning in URL (use v1 implicitly).

### Options Considered
1. **URL versioning** - /api/v1/expenses
2. **Header versioning** - Accept: application/vnd.api+json;version=1
3. **No versioning (chosen)** - Simple for this scope

### Why We Chose This

**Assignment Scope**: This is a 2-day project. No expectation of multiple API versions.

**Future-Proof**: If needed, can add versioning later via:
- New endpoints (/api/v2/expenses)
- Migration strategy

**Simplicity**: Cleaner URLs: `/api/expenses` vs `/api/v1/expenses`

### Trade-offs
- Breaking changes would affect all clients
- No graceful deprecation path

---

## Decision #12: Frontend Framework

### Decision
React with functional components and hooks.

### Options Considered
1. **Class components** - Traditional React
2. **Functional + hooks (chosen)** - Modern React
3. **Vue.js** - Alternative framework

### Why We Chose This

**Industry Standard**: React is widely used and well-documented.

**Modernity**: Hooks (useState, useEffect) make code cleaner than class components.

**Performance**: Functional components avoid some class component overhead.

**Example**:
```jsx
// Modern (hooks)
function ExpenseCard({ expense }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div onClick={() => setExpanded(!expanded)}>
      {expanded ? <ExpenseDetails expense={expense} /> : <ExpenseSummary expense={expense} />}
    </div>
  );
}
```

### Trade-offs
- Learning curve for developers new to hooks
- Slight performance cost on initial render (negligible)

---

## Decision #13: Pagination Strategy

### Decision
Use offset-based pagination with PageRequest DTO.

### Options Considered
1. **Cursor-based** - More efficient for infinite scroll
2. **Offset-based (chosen)** - Simpler, sufficient for this scope
3. **No pagination** - Return everything (bad for large datasets)

### Why We Chose This

**Simplicity**: Offset (skip, limit) is easy to implement and understand.

**Assignment Data Size**: The CSV has a few dozen rows. Full pagination not needed, but good practice.

**Implementation**:
```java
public Page<Group> getUserGroups(Long userId, PageRequest pageRequest) {
    return groupRepository.findByMemberId(userId, pageRequest);
}

// Usage: GET /api/groups/my?page=0&size=10
```

### Trade-offs
- Offset-based can be slow for very large tables (millions of rows)
- Data inconsistencies if items added/removed during pagination

---

## Decision #14: Import Confirmation Flow

### Decision
Two-step import: preview mode → user confirmation → actual import.

### Options Considered
1. **Immediate import** - Import right away, show report after
2. **Preview first (chosen)** - Show anomalies first, user decides
3. **Background import** - Import asynchronously, notify when done

### Why We Chose This

**User Control**: Users can review anomalies before importing (addresses Meera's request: "I want to approve anything the app deletes or changes").

**Safety**: Catch issues before modifying the database.

**Implementation**:
```java
// Step 1: Preview
POST /api/expenses/import/{groupId}/preview
→ Returns ImportReportResponse with anomalies

// Step 2: Confirm (same endpoint, auto-import=false flag)
POST /api/expenses/import/{groupId}
→ Actually imports, returns final report
```

### Trade-offs
- Extra API call
- Requires user interface for confirmation

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Database | H2 + PostgreSQL | Easy dev + production ready |
| Auth | JWT | Stateless, scalable |
| Negative amounts | Refund (abs value) | Matches assignment scenario |
| Duplicates | Skip with warning | User informed, no spam prompts |
| Membership | Validate + filter | Sam's "moved in mid-April" concern |
| Settlements | Detect + skip | Prevents data corruption |
| Currency | Store original, convert on display | Historical accuracy |
| Splits | 4 explicit types | Covers all assignment cases |
| Error handling | Custom exceptions + global handler | Consistent responses |
| Testing | Unit + integration + edge cases | Verify critical requirements |
| Import flow | Preview → confirm | User control over changes |

---

**Last Updated**: June 14, 2026
**Version**: 1.0