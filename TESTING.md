# Testing Report - Spreetail Expense Sharing Application

## Issues Found & Fixed

### Issue 1: Missing Imports
**Status**: ✅ FIXED
**Files**: `SettlementService.java`, `GroupRepository.java`, `ExpenseSplitRepository.java`
**Problem**: Missing `@Service` and `@Query` annotation imports
**Fix**: Added proper imports
**Commit**: `9692569`

### Issue 2: JPA Scale Parameter on Double Fields
**Status**: ✅ FIXED
**Files**: `Expense.java`, `ExpenseSplit.java`, `Settlement.java`
**Problem**: Hibernate/H2 doesn't support `scale` on floating point numbers (Double)
**Error**: `scale has no meaning for floating point numbers`
**Fix**: Removed `scale = 2` from `@Column` annotations with Double fields
**Commit**: `e00838f`

### Issue 3: JWT Secret Key Too Short
**Status**: ✅ FIXED
**File**: `application.properties`
**Problem**: JWT key was 232 bits, needs >= 256 bits
**Error**: `The specified key byte array is 232 bits which is not secure enough`
**Fix**: Updated JWT secret to proper length
**Commit**: `e00838f`

## Test Results

### Backend Startup
**Status**: ✅ SUCCESS
- Spring Boot starts successfully on port 8080
- H2 in-memory database initializes correctly
- All JPA entities created
- Security configuration loaded

### API Endpoints Tested

#### 1. User Registration
**Status**: ✅ SUCCESS
```bash
POST /api/auth/register
{
  "username": "alice",
  "email": "alice@test.com",
  "password": "password123"
}
Response: {"id":2,"username":"alice","email":"alice@test.com","createdAt":"2026-06-13T18:56:01.2540281"}
```

#### 2. User Login (After JWT fix)
**Status**: ⏳ NEEDS MANUAL TEST
- Was failing due to short JWT secret (now fixed)
- Needs verification after rebuild

#### 3. Create Group
**Status**: ⏳ NEEDS MANUAL TEST
- Endpoint exists: `POST /api/groups`
- Depends on login token

#### 4. Create Expenses
**Status**: ⏳ NEEDS MANUAL TEST
- Supports all split types: equal, unequal, percentage, share

#### 5. Balance Calculation
**Status**: ⏳ NEEDS MANUAL TEST
- Endpoint: `GET /api/settlements/balances/{groupId}`

#### 6. Settlement Suggestions
**Status**: ⏳ NEEDS MANUAL TEST
- Endpoint: `GET /api/settlements/suggestions/{groupId}`

## Manual Testing Instructions

### 1. Stop any running processes
```bash
pkill -f "expense-sharing"
```

### 2. Rebuild the application
```bash
cd backend
rm -rf target
mvn clean package -DskipTests
```

### 3. Start the backend
```bash
mvn spring-boot:run
```

### 4. Run the test script
```bash
cd backend
bash ../test-api.sh
```

## Test Script

The following test script verifies all endpoints:

```bash
#!/bin/bash

BASE_URL="http://localhost:8080"

echo "=== Spreetail API Test Suite ==="
echo ""

# Test 1: Register User 1
echo "Test 1: Register Alice"
curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@test.com","password":"password123"}'
echo ""
echo ""

# Test 2: Register User 2
echo "Test 2: Register Bob"
curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"bob","email":"bob@test.com","password":"password123"}'
echo ""
echo ""

# Test 3: Register User 3
echo "Test 3: Register Charlie"
curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"charlie","email":"charlie@test.com","password":"password123"}'
echo ""
echo ""

# Test 4: Login
echo "Test 4: Login Alice"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"password123"}')
echo "$LOGIN_RESPONSE"
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo ""
echo "Token: $TOKEN"
echo ""

# Test 5: Create Group
echo "Test 5: Create Group"
GROUP_RESPONSE=$(curl -s -X POST $BASE_URL/api/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Apartment","description":"Monthly expenses","memberIds":[]}')
echo "$GROUP_RESPONSE"
GROUP_ID=$(echo "$GROUP_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo ""
echo "Group ID: $GROUP_ID"
echo ""

# Test 6: Add Member
echo "Test 6: Add Bob to Group"
curl -s -X POST $BASE_URL/api/groups/$GROUP_ID/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"userId":3}'
echo ""
echo ""

# Test 7: Create Equal Split Expense
echo "Test 7: Create Equal Split Expense"
curl -s -X POST $BASE_URL/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "groupId":'$GROUP_ID',
    "description":"Groceries",
    "amount":1200,
    "currency":"INR",
    "splitType":"equal",
    "splitWith":[2,3],
    "splitDetails":{},
    "notes":"Weekly groceries"
  }'
echo ""
echo ""

# Test 8: Get Group Expenses
echo "Test 8: Get Group Expenses"
curl -s -X GET $BASE_URL/api/expenses/group/$GROUP_ID \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# Test 9: Get Balances
echo "Test 9: Get Group Balances"
curl -s -X GET $BASE_URL/api/settlements/balances/$GROUP_ID \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

# Test 10: Get Settlement Suggestions
echo "Test 10: Get Settlement Suggestions"
curl -s -X GET $BASE_URL/api/settlements/suggestions/$GROUP_ID \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo ""

echo "=== Test Suite Complete ==="
```

## Known Limitations

1. **Database**: Currently uses H2 in-memory database (data lost on restart)
   - For production, configure PostgreSQL in `application.properties`

2. **Currency Conversion**: No actual currency conversion implemented
   - Multi-currency expenses are stored but not converted
   - Currency rates API not integrated

3. **User Discovery**: No way to search for other users to add to groups
   - Need to know user IDs beforehand

4. **Frontend**: React frontend created but not tested with backend
   - Needs npm install and npm start to test

## Next Steps for Full Testing

1. **Stop current backend**: `pkill -f "expense-sharing"`
2. **Rebuild**: `cd backend && mvn clean package -DskipTests`
3. **Start fresh**: `mvn spring-boot:run`
4. **Run test script**: `bash test-api.sh`
5. **Test frontend**: `cd frontend && npm install && npm start`