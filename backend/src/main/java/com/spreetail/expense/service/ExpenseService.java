package com.spreetail.expense.service;

import com.spreetail.expense.dto.*;
import com.spreetail.expense.model.*;
import com.spreetail.expense.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service class for Expense operations
 */
@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    public ExpenseService(ExpenseRepository expenseRepository,
                          ExpenseSplitRepository expenseSplitRepository,
                          GroupRepository groupRepository,
                          GroupMemberRepository groupMemberRepository,
                          UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.expenseSplitRepository = expenseSplitRepository;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new expense
     */
    @Transactional
    public ExpenseResponse createExpense(CreateExpenseRequest request, Long paidByUserId) {
        // Use paidByUserId from request if provided (for CSV import), otherwise use the passed user
        Long actualPaidByUserId = request.getPaidByUserId() != null ? request.getPaidByUserId() : paidByUserId;

        // Validate group exists
        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Validate user is member of group
        if (!groupMemberRepository.findByGroupIdAndUserId(request.getGroupId(), actualPaidByUserId).isPresent()) {
            throw new RuntimeException("User is not a member of this group");
        }

        // Validate split type
        String splitType = request.getSplitType();
        if (!splitType.equals("equal") && !splitType.equals("unequal") &&
            !splitType.equals("percentage") && !splitType.equals("share")) {
            throw new RuntimeException("Invalid split type. Must be equal, unequal, percentage, or share");
        }

        // Create expense
        Expense expense = new Expense();
        expense.setGroup(group);
        expense.setGroupId(request.getGroupId());
        expense.setPaidBy(actualPaidByUserId);
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setCurrency(request.getCurrency() != null ? request.getCurrency() : "INR");
        expense.setSplitType(splitType);
        expense.setNotes(request.getNotes());

        // Save expense
        Expense savedExpense = expenseRepository.save(expense);

        // Create splits based on split type
        List<ExpenseSplit> splits = createSplits(savedExpense, request);
        savedExpense.setSplits(splits);

        return convertToExpenseResponse(savedExpense);
    }

    /**
     * Create expense splits based on split type
     */
    private List<ExpenseSplit> createSplits(Expense expense, CreateExpenseRequest request) {
        List<ExpenseSplit> splits = new ArrayList<>();
        String splitType = request.getSplitType();
        Double amount = expense.getAmount();

        // Get users to split with
        List<Long> splitWithUsers = request.getSplitWith();

        if (splitWithUsers == null || splitWithUsers.isEmpty()) {
            // If no users specified, split with all active group members
            List<GroupMember> members = groupMemberRepository.findByGroupId(expense.getGroupId());
            splitWithUsers = new ArrayList<>();
            for (GroupMember member : members) {
                if (member.getStatus().equals("active")) {
                    splitWithUsers.add(member.getUserId());
                }
            }
        }

        int numUsers = splitWithUsers.size();

        if (splitType.equals("equal")) {
            // Equal split: divide amount equally among all users
            Double shareAmount = amount / numUsers;

            for (Long userId : splitWithUsers) {
                ExpenseSplit split = new ExpenseSplit(expense, userId);
                split.setShareAmount(shareAmount);
                split.setSharePercentage(100.0 / numUsers);
                expenseSplitRepository.save(split);
                splits.add(split);
            }

        } else if (splitType.equals("unequal")) {
            // Unequal split: use specific amounts from splitDetails
            Map<String, Double> splitDetails = request.getSplitDetails();

            if (splitDetails == null || splitDetails.isEmpty()) {
                throw new RuntimeException("Split details required for unequal split");
            }

            for (Long userId : splitWithUsers) {
                String key = userId.toString();
                if (splitDetails.containsKey(key)) {
                    Double shareAmount = splitDetails.get(key);
                    ExpenseSplit split = new ExpenseSplit(expense, userId);
                    split.setShareAmount(shareAmount);
                    split.setSharePercentage((shareAmount / amount) * 100);
                    expenseSplitRepository.save(split);
                    splits.add(split);
                }
            }

        } else if (splitType.equals("percentage")) {
            // Percentage split: use percentages from splitDetails
            Map<String, Double> splitDetails = request.getSplitDetails();

            if (splitDetails == null || splitDetails.isEmpty()) {
                throw new RuntimeException("Split details required for percentage split");
            }

            for (Long userId : splitWithUsers) {
                String key = userId.toString();
                if (splitDetails.containsKey(key)) {
                    Double percentage = splitDetails.get(key);
                    Double shareAmount = (percentage / 100) * amount;
                    ExpenseSplit split = new ExpenseSplit(expense, userId);
                    split.setShareAmount(shareAmount);
                    split.setSharePercentage(percentage);
                    expenseSplitRepository.save(split);
                    splits.add(split);
                }
            }

        } else if (splitType.equals("share")) {
            // Share split: use shares from splitDetails
            Map<String, Double> splitDetails = request.getSplitDetails();

            if (splitDetails == null || splitDetails.isEmpty()) {
                throw new RuntimeException("Split details required for share split");
            }

            // Calculate total shares
            Double totalShares = 0.0;
            for (Long userId : splitWithUsers) {
                String key = userId.toString();
                if (splitDetails.containsKey(key)) {
                    totalShares += splitDetails.get(key);
                }
            }

            // Calculate share per unit
            Double amountPerShare = amount / totalShares;

            for (Long userId : splitWithUsers) {
                String key = userId.toString();
                if (splitDetails.containsKey(key)) {
                    Double shares = splitDetails.get(key);
                    Double shareAmount = amountPerShare * shares;
                    ExpenseSplit split = new ExpenseSplit(expense, userId);
                    split.setShareAmount(shareAmount);
                    split.setShares(shares.intValue());
                    split.setSharePercentage((shares / totalShares) * 100);
                    expenseSplitRepository.save(split);
                    splits.add(split);
                }
            }
        }

        return splits;
    }

    /**
     * Get expense by ID
     */
    public ExpenseResponse getExpenseById(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        return convertToExpenseResponse(expense);
    }

    /**
     * Get all expenses for a group
     */
    public List<ExpenseResponse> getExpensesByGroup(Long groupId) {
        // Validate group exists
        if (!groupRepository.existsById(groupId)) {
            throw new RuntimeException("Group not found");
        }

        List<Expense> expenses = expenseRepository.findByGroupId(groupId);
        List<ExpenseResponse> responses = new ArrayList<>();

        for (Expense expense : expenses) {
            responses.add(convertToExpenseResponse(expense));
        }

        return responses;
    }

    /**
     * Get all expenses for a user
     */
    public List<ExpenseResponse> getExpensesByUser(Long userId) {
        List<Expense> expenses = expenseRepository.findByPaidBy(userId);
        List<ExpenseResponse> responses = new ArrayList<>();

        for (Expense expense : expenses) {
            responses.add(convertToExpenseResponse(expense));
        }

        return responses;
    }

    /**
     * Convert Expense to ExpenseResponse
     */
    private ExpenseResponse convertToExpenseResponse(Expense expense) {
        // Get splits
        List<ExpenseSplit> splits = expenseSplitRepository.findByExpenseId(expense.getId());
        List<ExpenseSplitResponse> splitResponses = new ArrayList<>();

        for (ExpenseSplit split : splits) {
            User user = userRepository.findById(split.getUserId()).orElse(null);
            String username = user != null ? user.getUsername() : "Unknown";
            splitResponses.add(new ExpenseSplitResponse(
                    split.getId(),
                    split.getUserId(),
                    username,
                    split.getShareAmount(),
                    split.getSharePercentage(),
                    split.getShares()
            ));
        }

        // Get paid by username
        User paidByUser = userRepository.findById(expense.getPaidBy()).orElse(null);
        String paidByUsername = paidByUser != null ? paidByUser.getUsername() : "Unknown";

        // Get group name
        Group group = groupRepository.findById(expense.getGroupId()).orElse(null);
        String groupName = group != null ? group.getName() : "Unknown";

        return new ExpenseResponse(
                expense.getId(),
                expense.getGroupId(),
                groupName,
                expense.getPaidBy(),
                paidByUsername,
                expense.getDescription(),
                expense.getAmount(),
                expense.getCurrency(),
                expense.getSplitType(),
                expense.getNotes(),
                expense.getCreatedAt().toString(),
                splitResponses
        );
    }
}