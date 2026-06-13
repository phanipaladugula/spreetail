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

if [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to get token. Login failed."
  exit 1
fi

# Test 5: Create Group
echo "Test 5: Create Group"
GROUP_RESPONSE=$(curl -s -X POST $BASE_URL/api/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Apartment","description":"Monthly expenses","memberIds":[]}')
echo "$GROUP_RESPONSE"
GROUP_ID=$(echo "$GROUP_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
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