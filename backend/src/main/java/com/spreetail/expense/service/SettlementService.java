package com.spreetail.expense.service;

import com.spreetail.expense.dto.*;
import com.spreetail.expense.model.*;
import com.spreetail.expense.repository.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service class for Settlement and Balance operations
 */
@Service
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    public SettlementService(SettlementRepository settlementRepository,
                             ExpenseRepository expenseRepository,
                             ExpenseSplitRepository expenseSplitRepository,
                             GroupMemberRepository groupMemberRepository,
                             UserRepository userRepository) {
        this.settlementRepository = settlementRepository;
        this.expenseRepository = expenseRepository;
        this.expenseSplitRepository = expenseSplitRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
    }

    /**
     * Calculate balances for all users in a group
     */
    public List<BalanceResponse> calculateGroupBalances(Long groupId) {
        // Get all active members of the group
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        List<BalanceResponse> balances = new ArrayList<>();

        for (GroupMember member : members) {
            if (!member.getStatus().equals("active")) {
                continue;
            }

            Long userId = member.getUserId();
            Double totalOwed = 0.0;
            Double totalToReceive = 0.0;

            // Calculate what this user paid for others
            List<Expense> paidExpenses = expenseRepository.findByGroupIdAndPaidBy(groupId, userId);
            for (Expense expense : paidExpenses) {
                List<ExpenseSplit> splits = expenseSplitRepository.findByExpenseId(expense.getId());
                for (ExpenseSplit split : splits) {
                    if (!split.getUserId().equals(userId)) {
                        totalToReceive += split.getShareAmount();
                    }
                }
            }

            // Calculate what others paid for this user
            List<Expense> groupExpenses = expenseRepository.findByGroupId(groupId);
            for (Expense expense : groupExpenses) {
                if (!expense.getPaidBy().equals(userId)) {
                    List<ExpenseSplit> splits = expenseSplitRepository.findByExpenseId(expense.getId());
                    for (ExpenseSplit split : splits) {
                        if (split.getUserId().equals(userId)) {
                            totalOwed += split.getShareAmount();
                        }
                    }
                }
            }

            // Subtract already settled amounts
            List<Settlement> settledFromUser = settlementRepository.findByFromUser(userId);
            for (Settlement settlement : settledFromUser) {
                if (settlement.getGroupId().equals(groupId)) {
                    totalOwed -= settlement.getAmount();
                }
            }

            List<Settlement> settledToUser = settlementRepository.findByToUser(userId);
            for (Settlement settlement : settledToUser) {
                if (settlement.getGroupId().equals(groupId)) {
                    totalToReceive -= settlement.getAmount();
                }
            }

            Double netBalance = totalToReceive - totalOwed;

            // Get user details
            User user = userRepository.findById(userId).orElse(null);
            String username = user != null ? user.getUsername() : "Unknown";

            balances.add(new BalanceResponse(userId, username, totalOwed, totalToReceive, netBalance));
        }

        return balances;
    }

    /**
     * Get settlement suggestions for a group
     * This suggests who should pay whom to settle up
     */
    public List<SettlementResponse> getSettlementSuggestions(Long groupId) {
        List<BalanceResponse> balances = calculateGroupBalances(groupId);
        List<SettlementResponse> suggestions = new ArrayList<>();

        // Separate users who owe (negative balance) and users who are owed (positive balance)
        List<BalanceResponse> oweList = new ArrayList<>();
        List<BalanceResponse> receiveList = new ArrayList<>();

        for (BalanceResponse balance : balances) {
            if (balance.getNetBalance() < -0.01) {
                oweList.add(balance);
            } else if (balance.getNetBalance() > 0.01) {
                receiveList.add(balance);
            }
        }

        // Match owe list with receive list (simplified greedy algorithm)
        int i = 0;
        int j = 0;

        while (i < oweList.size() && j < receiveList.size()) {
            BalanceResponse owe = oweList.get(i);
            BalanceResponse receive = receiveList.get(j);

            Double oweAmount = Math.abs(owe.getNetBalance());
            Double receiveAmount = receive.getNetBalance();

            if (oweAmount < receiveAmount) {
                // This person owes less, so they can fully pay
                suggestions.add(new SettlementResponse(
                        null,
                        owe.getUserId(),
                        owe.getUsername(),
                        receive.getUserId(),
                        receive.getUsername(),
                        oweAmount,
                        "INR",
                        null
                ));

                // Update receive amount
                receiveList.get(j).setNetBalance(receiveAmount - oweAmount);
                i++;

            } else if (oweAmount > receiveAmount) {
                // This person owes more, so they can only partially pay
                suggestions.add(new SettlementResponse(
                        null,
                        owe.getUserId(),
                        owe.getUsername(),
                        receive.getUserId(),
                        receive.getUsername(),
                        receiveAmount,
                        "INR",
                        null
                ));

                // Update owe amount
                oweList.get(i).setNetBalance(oweAmount - receiveAmount);
                j++;

            } else {
                // Exact match
                suggestions.add(new SettlementResponse(
                        null,
                        owe.getUserId(),
                        owe.getUsername(),
                        receive.getUserId(),
                        receive.getUsername(),
                        oweAmount,
                        "INR",
                        null
                ));

                i++;
                j++;
            }
        }

        return suggestions;
    }

    /**
     * Record a settlement
     */
    public SettlementResponse recordSettlement(CreateSettlementRequest request) {
        // Validate from and to users are different
        if (request.getFromUserId().equals(request.getToUserId())) {
            throw new RuntimeException("From and to users cannot be the same");
        }

        // Validate amount is positive
        if (request.getAmount() <= 0) {
            throw new RuntimeException("Amount must be positive");
        }

        // Create settlement
        Settlement settlement = new Settlement();
        settlement.setGroupId(request.getGroupId());
        settlement.setFromUser(request.getFromUserId());
        settlement.setToUser(request.getToUserId());
        settlement.setAmount(request.getAmount());
        settlement.setCurrency(request.getCurrency() != null ? request.getCurrency() : "INR");

        // Save settlement
        Settlement savedSettlement = settlementRepository.save(settlement);

        // Get user details
        User fromUser = userRepository.findById(request.getFromUserId()).orElse(null);
        User toUser = userRepository.findById(request.getToUserId()).orElse(null);

        return new SettlementResponse(
                savedSettlement.getId(),
                savedSettlement.getFromUser(),
                fromUser != null ? fromUser.getUsername() : "Unknown",
                savedSettlement.getToUser(),
                toUser != null ? toUser.getUsername() : "Unknown",
                savedSettlement.getAmount(),
                savedSettlement.getCurrency(),
                savedSettlement.getSettledAt().toString()
        );
    }

    /**
     * Get all settlements for a group
     */
    public List<SettlementResponse> getGroupSettlements(Long groupId) {
        List<Settlement> settlements = settlementRepository.findByGroupId(groupId);
        List<SettlementResponse> responses = new ArrayList<>();

        for (Settlement settlement : settlements) {
            User fromUser = userRepository.findById(settlement.getFromUser()).orElse(null);
            User toUser = userRepository.findById(settlement.getToUser()).orElse(null);

            responses.add(new SettlementResponse(
                    settlement.getId(),
                    settlement.getFromUser(),
                    fromUser != null ? fromUser.getUsername() : "Unknown",
                    settlement.getToUser(),
                    toUser != null ? toUser.getUsername() : "Unknown",
                    settlement.getAmount(),
                    settlement.getCurrency(),
                    settlement.getSettledAt().toString()
            ));
        }

        return responses;
    }
}