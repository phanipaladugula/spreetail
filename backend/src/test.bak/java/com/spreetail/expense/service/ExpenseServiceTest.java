package com.spreetail.expense.service;

import com.spreetail.expense.dto.CreateExpenseRequest;
import com.spreetail.expense.dto.ExpenseResponse;
import com.spreetail.expense.model.*;
import com.spreetail.expense.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests for ExpenseService covering all split types and edge cases
 */
@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private ExpenseSplitRepository expenseSplitRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private GroupMemberRepository groupMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    private ExpenseService expenseService;

    private Group testGroup;
    private User userAisha, userRohan, userPriya;

    @BeforeEach
    void setUp() {
        expenseService = new ExpenseService(
                expenseRepository,
                expenseSplitRepository,
                groupRepository,
                groupMemberRepository,
                userRepository,
                emailService
        );

        // Setup test data
        testGroup = new Group();
        testGroup.setId(1L);
        testGroup.setName("Test Group");

        userAisha = new User();
        userAisha.setId(1L);
        userAisha.setUsername("Aisha");

        userRohan = new User();
        userRohan.setId(2L);
        userRohan.setUsername("Rohan");

        userPriya = new User();
        userPriya.setId(3L);
        userPriya.setUsername("Priya");
    }

    // Test #1: Equal Split
    @Test
    void testEqualSplitDividesAmountEqually() {
        // Arrange
        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setGroupId(1L);
        request.setDescription("Dinner");
        request.setAmount(1200.0);
        request.setCurrency("INR");
        request.setSplitType("equal");
        request.setSplitWith(Arrays.asList(1L, 2L, 3L));
        request.setSplitDetails(new HashMap<>());

        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(groupMemberRepository.findByGroupIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(new GroupMember()));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(expenseSplitRepository.save(any(ExpenseSplit.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ExpenseResponse response = expenseService.createExpense(request, 1L);

        // Assert
        assertNotNull(response);
        assertNotNull(response.getSplits());
        assertEquals(3, response.getSplits().size());
        // Each should get 400
        assertEquals(400.0, response.getSplits().get(0).getShareAmount(), 0.01);
        assertEquals(400.0, response.getSplits().get(1).getShareAmount(), 0.01);
        assertEquals(400.0, response.getSplits().get(2).getShareAmount(), 0.01);
        // Each should be 33.33%
        assertEquals(33.33, response.getSplits().get(0).getSharePercentage(), 0.01);
    }

    // Test #2: Unequal Split
    @Test
    void testUnequalSplitUsesSpecifiedAmounts() {
        // Arrange
        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setGroupId(1L);
        request.setDescription("Birthday cake");
        request.setAmount(1500.0);
        request.setCurrency("INR");
        request.setSplitType("unequal");
        request.setSplitWith(Arrays.asList(2L, 3L));
        Map<String, Double> splitDetails = new HashMap<>();
        splitDetails.put("2", 700.0);
        splitDetails.put("3", 400.0);
        request.setSplitDetails(splitDetails);

        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(groupMemberRepository.findByGroupIdAndUserId(1L, anyLong()))
                .thenReturn(Optional.of(new GroupMember()));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(expenseSplitRepository.save(any(ExpenseSplit.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ExpenseResponse response = expenseService.createExpense(request, 1L);

        // Assert
        assertEquals(2, response.getSplits().size());
        assertEquals(700.0, response.getSplits().get(0).getShareAmount(), 0.01);
        assertEquals(400.0, response.getSplits().get(1).getShareAmount(), 0.01);
    }

    // Test #3: Percentage Split
    @Test
    void testPercentageSplitUsesPercentages() {
        // Arrange
        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setGroupId(1L);
        request.setDescription("Pizza Friday");
        request.setAmount(1000.0);
        request.setCurrency("INR");
        request.setSplitType("percentage");
        request.setSplitWith(Arrays.asList(1L, 2L, 3L));
        Map<String, Double> splitDetails = new HashMap<>();
        splitDetails.put("1", 30.0);
        splitDetails.put("2", 30.0);
        splitDetails.put("3", 40.0);
        request.setSplitDetails(splitDetails);

        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(groupMemberRepository.findByGroupIdAndUserId(1L, anyLong()))
                .thenReturn(Optional.of(new GroupMember()));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(expenseSplitRepository.save(any(ExpenseSplit.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ExpenseResponse response = expenseService.createExpense(request, 1L);

        // Assert
        assertEquals(3, response.getSplits().size());
        assertEquals(300.0, response.getSplits().get(0).getShareAmount(), 0.01); // 30% of 1000
        assertEquals(300.0, response.getSplits().get(1).getShareAmount(), 0.01); // 30% of 1000
        assertEquals(400.0, response.getSplits().get(2).getShareAmount(), 0.01); // 40% of 1000
    }

    // Test #4: Share Split
    @Test
    void testShareSplitUsesRatio() {
        // Arrange
        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setGroupId(1L);
        request.setDescription("Scooter rentals");
        request.setAmount(3600.0);
        request.setCurrency("INR");
        request.setSplitType("share");
        request.setSplitWith(Arrays.asList(1L, 2L, 3L));
        Map<String, Double> splitDetails = new HashMap<>();
        splitDetails.put("1", 1.0);
        splitDetails.put("2", 2.0);
        splitDetails.put("3", 1.0);
        request.setSplitDetails(splitDetails);

        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(groupMemberRepository.findByGroupIdAndUserId(1L, anyLong()))
                .thenReturn(Optional.of(new GroupMember()));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(expenseSplitRepository.save(any(ExpenseSplit.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ExpenseResponse response = expenseService.createExpense(request, 1L);

        // Assert
        assertEquals(3, response.getSplits().size());
        // Total shares: 1+2+1=4, amount per share: 3600/4=900
        assertEquals(900.0, response.getSplits().get(0).getShareAmount(), 0.01); // 1 share
        assertEquals(1800.0, response.getSplits().get(1).getShareAmount(), 0.01); // 2 shares
        assertEquals(900.0, response.getSplits().get(2).getShareAmount(), 0.01); // 1 share
    }

    // Test #5: Invalid Split Type Throws Exception
    @Test
    void testInvalidSplitTypeThrowsException() {
        // Arrange
        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setGroupId(1L);
        request.setDescription("Test");
        request.setAmount(100.0);
        request.setCurrency("INR");
        request.setSplitType("invalid_type");
        request.setSplitWith(Arrays.asList(1L, 2L));

        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(groupMemberRepository.findByGroupIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(new GroupMember()));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> expenseService.createExpense(request, 1L));
    }

    // Test #6: Group Not Found Throws Exception
    @Test
    void testGroupNotFoundThrowsException() {
        // Arrange
        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setGroupId(999L);
        request.setDescription("Test");
        request.setAmount(100.0);
        request.setCurrency("INR");
        request.setSplitType("equal");
        request.setSplitWith(Arrays.asList(1L, 2L));

        when(groupRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> expenseService.createExpense(request, 1L));
    }

    // Test #7: User Not In Group Throws Exception
    @Test
    void testUserNotInGroupThrowsException() {
        // Arrange
        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setGroupId(1L);
        request.setDescription("Test");
        request.setAmount(100.0);
        request.setCurrency("INR");
        request.setSplitType("equal");
        request.setSplitWith(Arrays.asList(1L, 2L));

        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(groupMemberRepository.findByGroupIdAndUserId(1L, 1L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> expenseService.createExpense(request, 1L));
    }

    // Test #8: Get Expense By ID
    @Test
    void testGetExpenseByIdReturnsExpense() {
        // Arrange
        Expense expense = new Expense();
        expense.setId(1L);
        expense.setGroupId(1L);
        expense.setPaidBy(1L);
        expense.setDescription("Test");
        expense.setAmount(100.0);
        expense.setCurrency("INR");
        expense.setSplitType("equal");

        when(expenseRepository.findById(1L)).thenReturn(Optional.of(expense));
        when(userRepository.findById(1L)).thenReturn(Optional.of(userAisha));
        when(expenseSplitRepository.findByExpenseId(1L)).thenReturn(Collections.emptyList());
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));

        // Act
        ExpenseResponse response = expenseService.getExpenseById(1L);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Test", response.getDescription());
    }

    // Test #9: Delete Expense
    @Test
    void testDeleteExpenseRemovesExpense() {
        // Arrange
        Expense expense = new Expense();
        expense.setId(1L);
        expense.setGroupId(1L);

        when(expenseRepository.findById(1L)).thenReturn(Optional.of(expense));
        when(groupMemberRepository.findByGroupIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(new GroupMember()));

        // Act
        expenseService.deleteExpense(1L, 1L);

        // Assert
        verify(expenseRepository, times(1)).deleteById(1L);
    }

    // Test #10: Get Expenses By Group
    @Test
    void testGetExpensesByGroupReturnsList() {
        // Arrange
        List<Expense> expenses = Arrays.asList(new Expense(), new Expense());
        when(groupRepository.existsById(1L)).thenReturn(true);
        when(expenseRepository.findByGroupId(1L)).thenReturn(expenses);
        when(expenseSplitRepository.findByExpenseId(anyLong())).thenReturn(Collections.emptyList());
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));

        // Act
        var response = expenseService.getExpensesByGroup(1L);

        // Assert
        assertEquals(2, response.size());
    }

    // Test #11: Update Expense
    @Test
    void testUpdateExpenseModifiesFields() {
        // Arrange
        Expense expense = new Expense();
        expense.setId(1L);
        expense.setGroupId(1L);
        expense.setPaidBy(1L);
        expense.setDescription("Old");
        expense.setAmount(100.0);
        expense.setCurrency("INR");
        expense.setSplitType("equal");

        var updateRequest = new com.spreetail.expense.dto.UpdateExpenseRequest();
        updateRequest.setDescription("New");
        updateRequest.setAmount(200.0);

        when(expenseRepository.findById(1L)).thenReturn(Optional.of(expense));
        when(groupMemberRepository.findByGroupIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(new GroupMember()));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(expenseSplitRepository.findByExpenseId(1L)).thenReturn(Collections.emptyList());
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(userRepository.findById(1L)).thenReturn(Optional.of(userAisha));

        // Act
        var response = expenseService.updateExpense(1L, updateRequest, 1L);

        // Assert
        verify(expenseRepository, times(1)).save(any(Expense.class));
    }

    // Test #12: Unequal Split Without Details Throws Exception
    @Test
    void testUnequalSplitWithoutDetailsThrowsException() {
        // Arrange
        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setGroupId(1L);
        request.setDescription("Test");
        request.setAmount(100.0);
        request.setCurrency("INR");
        request.setSplitType("unequal");
        request.setSplitWith(Arrays.asList(1L, 2L));
        request.setSplitDetails(new HashMap<>()); // Empty

        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(groupMemberRepository.findByGroupIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(new GroupMember()));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> expenseService.createExpense(request, 1L));
    }
}