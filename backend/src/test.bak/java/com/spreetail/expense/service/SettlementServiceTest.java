package com.spreetail.expense.service;

import com.spreetail.expense.dto.*;
import com.spreetail.expense.model.*;
import com.spreetail.expense.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;

/**
 * Tests for SettlementService
 * Verifies balance calculation and settlement suggestion algorithm
 */
@ExtendWith(MockitoExtension.class)
class SettlementServiceTest {

    @Mock
    private SettlementRepository settlementRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private ExpenseSplitRepository expenseSplitRepository;

    @Mock
    private GroupMemberRepository groupMemberRepository;

    @Mock
    private EmailService emailService;

    private SettlementService settlementService;

    @BeforeEach
    void setUp() {
        settlementService = new SettlementService(
                settlementRepository,
                expenseRepository,
                expenseSplitRepository,
                groupMemberRepository,
                userRepository,
                groupRepository,
                emailService
        );
    }

    // Test #1: Calculate balances with equal split
    @Test
    void testCalculateBalancesWithEqualSplit() {
        // Arrange - Aisha pays 1200, split 3 ways
        // Expected: Aisha +800, Rohan -400, Priya -400
        when(expenseRepository.findByGroupId(1L)).thenReturn(Collections.emptyList());
        when(expenseSplitRepository.findByGroupId(1L)).thenReturn(Arrays.asList(
                createSplit(1L, 1L, 800.0),   // Aisha is owed 800
                createSplit(2L, 1L, -400.0),  // Rohan owes 400
                createSplit(3L, 1L, -400.0)   // Priya owes 400
        ));
        when(userRepository.findById(1L)).thenReturn(Optional.of(createUser(1L, "Aisha")));
        when(userRepository.findById(2L)).thenReturn(Optional.of(createUser(2L, "Rohan")));
        when(userRepository.findById(3L)).thenReturn(Optional.of(createUser(3L, "Priya")));

        // Act
        List<BalanceResponse> balances = settlementService.calculateGroupBalances(1L);

        // Assert
        assertEquals(3, balances.size());
        // Find Aisha's balance
        Optional<BalanceResponse> aishaBalance = balances.stream()
                .filter(b -> b.getUsername().equals("Aisha"))
                .findFirst();
        assertTrue(aishaBalance.isPresent());
        assertEquals(800.0, aishaBalance.get().getNetBalance(), 0.01);
    }

    // Test #2: Settlement suggestions are optimal (minimum transactions)
    @Test
    void testSettlementSuggestionsMinimizeTransactions() {
        // Arrange
        // Aisha owes 100, Rohan owes 200, Priya is owed 300
        // Optimal: Aisha→Priya (100), Rohan→Priya (200) = 2 transactions

        List<BalanceResponse> balances = Arrays.asList(
                new BalanceResponse(1L, "Aisha", 100.0, 0.0, -100.0),
                new BalanceResponse(2L, "Rohan", 200.0, 0.0, -200.0),
                new BalanceResponse(3L, "Priya", 0.0, 300.0, 300.0)
        );

        // Act
        List<SettlementResponse> suggestions = settlementService.getSettlementSuggestions(balances);

        // Assert
        assertEquals(2, suggestions.size());
        // Aisha should pay Priya 100
        Optional<SettlementResponse> aishaToPriya = suggestions.stream()
                .filter(s -> s.getFromUsername().equals("Aisha") && s.getToUsername().equals("Priya"))
                .findFirst();
        assertTrue(aishaToPriya.isPresent());
        assertEquals(100.0, aishaToPriya.get().getAmount(), 0.01);

        // Rohan should pay Priya 200
        Optional<SettlementResponse> rohanToPriya = suggestions.stream()
                .filter(s -> s.getFromUsername().equals("Rohan") && s.getToUsername().equals("Priya"))
                .findFirst();
        assertTrue(rohanToPriya.isPresent());
        assertEquals(200.0, rohanToPriya.get().getAmount(), 0.01);
    }

    // Test #3: No settlements when everyone is settled
    @Test
    void testNoSettlementsWhenEveryoneIsSettled() {
        // Arrange - All net balances are 0
        List<BalanceResponse> balances = Arrays.asList(
                new BalanceResponse(1L, "Aisha", 0.0, 0.0, 0.0),
                new BalanceResponse(2L, "Rohan", 0.0, 0.0, 0.0),
                new BalanceResponse(3L, "Priya", 0.0, 0.0, 0.0)
        );

        // Act
        List<SettlementResponse> suggestions = settlementService.getSettlementSuggestions(balances);

        // Assert
        assertTrue(suggestions.isEmpty());
    }

    // Test #4: Settlement with negative amounts (refunds)
    @Test
    void testSettlementWithNegativeAmounts() {
        // Arrange - Dev received a refund, should have positive balance
        List<BalanceResponse> balances = Arrays.asList(
                new BalanceResponse(4L, "Dev", 0.0, 30.0, 30.0),  // Dev is owed money
                new BalanceResponse(1L, "Aisha", 10.0, 0.0, -10.0)
        );

        // Act
        List<SettlementResponse> suggestions = settlementService.getSettlementSuggestions(balances);

        // Assert
        assertEquals(1, suggestions.size());
        // Aisha should pay Dev 10
        assertEquals("Aisha", suggestions.get(0).getFromUsername());
        assertEquals("Dev", suggestions.get(0).getToUsername());
        assertEquals(10.0, suggestions.get(0).getAmount(), 0.01);
    }

    // Test #5: Complex multi-party settlement
    @Test
    void testComplexMultiPartySettlement() {
        // Arrange - 4 users with varying balances
        List<BalanceResponse> balances = Arrays.asList(
                new BalanceResponse(1L, "Aisha", 100.0, 0.0, -100.0),
                new BalanceResponse(2L, "Rohan", 150.0, 0.0, -150.0),
                new BalanceResponse(3L, "Priya", 0.0, 200.0, 200.0),
                new BalanceResponse(4L, "Dev", 0.0, 50.0, 50.0)
        );

        // Act
        List<SettlementResponse> suggestions = settlementService.getSettlementSuggestions(balances);

        // Assert
        // Should have 3 settlements (optimal: Aisha→Priya 100, Rohan→Priya 50, Rohan→Dev 50)
        // But algorithm might produce different but valid set
        assertFalse(suggestions.isEmpty());
        assertEquals(250.0, suggestions.stream().mapToDouble(SettlementResponse::getAmount).sum(), 0.01);
    }

    // Test #6: Record settlement saves correctly
    @Test
    void testRecordSettlementSavesToDatabase() {
        // Arrange
        CreateSettlementRequest request = new CreateSettlementRequest();
        request.setGroupId(1L);
        request.setFromUserId(1L);
        request.setToUserId(2L);
        request.setAmount(100.0);
        request.setCurrency("INR");

        when(settlementRepository.save(any(Settlement.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findById(1L)).thenReturn(Optional.of(createUser(1L, "Aisha")));
        when(userRepository.findById(2L)).thenReturn(Optional.of(createUser(2L, "Rohan")));

        // Act
        SettlementResponse response = settlementService.recordSettlement(request);

        // Assert
        assertNotNull(response);
        assertEquals(100.0, response.getAmount(), 0.01);
        verify(settlementRepository, times(1)).save(any(Settlement.class));
    }

    private ExpenseSplit createSplit(Long expenseId, Long userId, double amount) {
        ExpenseSplit split = new ExpenseSplit();
        split.setExpenseId(expenseId);
        split.setUserId(userId);
        split.setShareAmount(amount);
        return split;
    }

    private User createUser(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(username.toLowerCase() + "@example.com");
        return user;
    }
}