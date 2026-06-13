#!/bin/bash

BASE_URL="http://localhost:8080"

echo "=== Spreetail Phase 1 Features Test Suite ==="
echo ""

# Test 1: Register Users for Friends System
echo "Test 1: Register User A"
curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"userA","email":"userA@test.com","password":"password123"}'
echo ""

echo "Test 2: Register User B"
curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"userB","email":"userB@test.com","password":"password123"}'
echo ""

echo "Test 3: Register User C"
curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"userC","email":"userC@test.com","password":"password123"}'
echo ""

# Login User A
echo "Test 4: Login User A"
LOGIN_A=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"userA@test.com","password":"password123"}')
TOKEN_A=$(echo "$LOGIN_A" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token A: $TOKEN_A"
echo ""

# Login User B
echo "Test 5: Login User B"
LOGIN_B=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"userB@test.com","password":"password123"}')
TOKEN_B=$(echo "$LOGIN_B" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token B: $TOKEN_B"
echo ""

# Create Group
echo "Test 6: Create Group"
GROUP_RESPONSE=$(curl -s -X POST $BASE_URL/api/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d '{"name":"Test Group","description":"Testing Phase 1 features","memberIds":[]}')
echo "$GROUP_RESPONSE"
GROUP_ID=$(echo "$GROUP_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo ""
echo "Group ID: $GROUP_ID"
echo ""

# Test Friends System
echo "=== FRIENDS SYSTEM ==="
echo "Test 7: User A sends friend request to User B"
curl -s -X POST $BASE_URL/api/friends/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d '{"email":"userB@test.com"}'
echo ""

echo "Test 8: User B accepts friend request"
curl -s -X POST $BASE_URL/api/friends/accept/1 \
  -H "Authorization: Bearer $TOKEN_B"
echo ""

echo "Test 9: User A gets friends list"
curl -s -X GET $BASE_URL/api/friends \
  -H "Authorization: Bearer $TOKEN_A"
echo ""

echo "Test 10: User A gets pending requests"
curl -s -X GET $BASE_URL/api/friends/pending \
  -H "Authorization: Bearer $TOKEN_A"
echo ""

# Test Group Invitations
echo "=== GROUP INVITATIONS ==="
echo "Test 11: Create invitation for User C"
curl -s -X POST $BASE_URL/api/invitations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d '{"groupId":'$GROUP_ID',"invitedEmail":"userC@test.com"}'
echo ""

echo "Test 12: Get group invitations"
curl -s -X GET $BASE_URL/api/invitations/group/$GROUP_ID
echo ""

echo "Test 13: User C gets my invitations"
curl -s -X GET $BASE_URL/api/invitations/my \
  -H "Authorization: Bearer $TOKEN_C"
echo ""

# Test Comment System
echo "=== COMMENT SYSTEM ==="
echo "Test 14: Add User B to group"
curl -s -X POST $BASE_URL/api/groups/$GROUP_ID/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d '{"userId":2}'
echo ""

echo "Test 15: Create expense for comments"
EXPENSE_RESPONSE=$(curl -s -X POST $BASE_URL/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d '{
    "groupId":'$GROUP_ID',
    "description":"Dinner",
    "amount":1200,
    "currency":"INR",
    "splitType":"equal",
    "splitWith":[2],
    "splitDetails":{},
    "notes":"Testing comments"
  }')
echo "$EXPENSE_RESPONSE"
EXPENSE_ID=$(echo "$EXPENSE_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo ""
echo "Expense ID: $EXPENSE_ID"
echo ""

echo "Test 16: Add comment to expense"
curl -s -X POST $BASE_URL/api/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_B" \
  -d '{"expenseId":'$EXPENSE_ID',"text":"This was a great dinner! Thanks @userA"}'
echo ""

echo "Test 17: Get comments for expense"
curl -s -X GET $BASE_URL/api/comments/expense/$EXPENSE_ID
echo ""

echo "Test 18: Get my comments"
curl -s -X GET $BASE_URL/api/comments/my \
  -H "Authorization: Bearer $TOKEN_B"
echo ""

# Test Activity Feed
echo "=== ACTIVITY FEED ==="
echo "Test 19: Get my activities"
curl -s -X GET $BASE_URL/api/activities/my \
  -H "Authorization: Bearer $TOKEN_A"
echo ""

echo "Test 20: Get group activities"
curl -s -X GET $BASE_URL/api/activities/group/$GROUP_ID
echo ""

echo "Test 21: Get expense activities"
curl -s -X GET $BASE_URL/api/activities/expense/$EXPENSE_ID
echo ""

# Test CSV Import
echo "=== CSV IMPORT ==="
echo "Test 22: Import expenses from CSV (simulated - creates expense)"
curl -s -X POST $BASE_URL/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d '{
    "groupId":'$GROUP_ID',
    "description":"Groceries from CSV",
    "amount":2340,
    "currency":"INR",
    "splitType":"equal",
    "splitWith":[2],
    "splitDetails":{},
    "notes":"Imported from CSV"
  }'
echo ""

echo ""
echo "=== Phase 1 Test Suite Complete ==="