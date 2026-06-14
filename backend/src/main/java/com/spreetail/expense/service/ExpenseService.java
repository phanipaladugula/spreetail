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
    private final EmailService emailService;

    public ExpenseService(ExpenseRepository expenseRepository,
                          ExpenseSplitRepository expenseSplitRepository,
                          GroupRepository groupRepository,
                          GroupMemberRepository groupMemberRepository,
                          UserRepository userRepository,
                          EmailService emailService) {
        this.expenseRepository = expenseRepository;
        this.expenseSplitRepository = expenseSplitRepository;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
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
        GroupMember paidByMember = groupMemberRepository.findByGroupIdAndUserId(request.getGroupId(), actualPaidByUserId)
                .orElseThrow(() -> new RuntimeException("User is not a member of this group"));

        if (!"active".equals(paidByMember.getStatus())) {
            throw new RuntimeException("Inactive members cannot create new expenses in this group");
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

        // Send email notifications to all members except the one who paid
        User paidByUser = userRepository.findById(actualPaidByUserId).orElse(null);
        String paidByUsername = paidByUser != null ? paidByUser.getUsername() : "Someone";
        
        List<GroupMember> members = groupMemberRepository.findByGroupId(group.getId());
        for (GroupMember member : members) {
            if (!member.getUserId().equals(actualPaidByUserId) && member.getStatus().equals("active")) {
                User memberUser = userRepository.findById(member.getUserId()).orElse(null);
                if (memberUser != null) {
                    emailService.sendExpenseAddedEmail(
                            memberUser.getEmail(), 
                            memberUser.getUsername(), 
                            group.getName(), 
                            savedExpense.getDescription(), 
                            savedExpense.getAmount(), 
                            savedExpense.getCurrency(), 
                            paidByUsername, 
                            group.getId()
                    );
                }
            }
        }

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
     * Update an existing expense
     */
    @Transactional
    public ExpenseResponse updateExpense(Long expenseId, UpdateExpenseRequest request, Long currentUserId) {
        // Validate expense exists
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Validate user is member of group
        if (!groupMemberRepository.findByGroupIdAndUserId(expense.getGroupId(), currentUserId).isPresent()) {
            throw new RuntimeException("User is not a member of this group");
        }

        // Validate split type if provided
        if (request.getSplitType() != null) {
            String splitType = request.getSplitType();
            if (!splitType.equals("equal") && !splitType.equals("unequal") &&
                !splitType.equals("percentage") && !splitType.equals("share")) {
                throw new RuntimeException("Invalid split type. Must be equal, unequal, percentage, or share");
            }
        }

        // Update expense fields
        if (request.getDescription() != null) {
            expense.setDescription(request.getDescription());
        }
        if (request.getAmount() != null) {
            expense.setAmount(request.getAmount());
        }
        if (request.getCurrency() != null) {
            expense.setCurrency(request.getCurrency());
        }
        if (request.getSplitType() != null) {
            expense.setSplitType(request.getSplitType());
        }
        if (request.getNotes() != null) {
            expense.setNotes(request.getNotes());
        }

        // Save updated expense
        Expense savedExpense = expenseRepository.save(expense);

        // If split type or splitWith changed, recreate splits
        if (request.getSplitType() != null || request.getSplitWith() != null ||
            request.getSplitDetails() != null) {

            // Delete old splits individually
            List<ExpenseSplit> oldSplits = expenseSplitRepository.findByExpenseId(expenseId);
            for (ExpenseSplit split : oldSplits) {
                expenseSplitRepository.delete(split);
            }

            // Create new splits
            CreateExpenseRequest splitRequest = new CreateExpenseRequest();
            splitRequest.setGroupId(expense.getGroupId());
            splitRequest.setPaidByUserId(expense.getPaidBy());
            splitRequest.setDescription(expense.getDescription());
            splitRequest.setAmount(expense.getAmount());
            splitRequest.setCurrency(expense.getCurrency());
            splitRequest.setSplitType(expense.getSplitType());
            splitRequest.setNotes(expense.getNotes());

            if (request.getSplitWith() != null) {
                splitRequest.setSplitWith(request.getSplitWith());
            } else {
                // Use original splitWith
                splitRequest.setSplitWith(getOriginalSplitWithUsers(savedExpense));
            }

            if (request.getSplitDetails() != null) {
                splitRequest.setSplitDetails(request.getSplitDetails());
            }

            List<ExpenseSplit> newSplits = createSplits(savedExpense, splitRequest);
            savedExpense.setSplits(newSplits);
        }

        return convertToExpenseResponse(savedExpense);
    }

    /**
     * Delete an expense
     */
    @Transactional
    public void deleteExpense(Long expenseId, Long currentUserId) {
        // Validate expense exists
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Validate user is member of group
        if (!groupMemberRepository.findByGroupIdAndUserId(expense.getGroupId(), currentUserId).isPresent()) {
            throw new RuntimeException("User is not a member of this group");
        }

        // Delete expense (splits will be deleted by cascade)
        expenseRepository.deleteById(expenseId);
    }

    /**
     * Get original splitWith users from expense
     */
    private List<Long> getOriginalSplitWithUsers(Expense expense) {
        List<ExpenseSplit> splits = expenseSplitRepository.findByExpenseId(expense.getId());
        List<Long> userIds = new ArrayList<>();
        for (ExpenseSplit split : splits) {
            userIds.add(split.getUserId());
        }
        return userIds;
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