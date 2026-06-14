package com.spreetail.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO for create expense request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateExpenseRequest {
    private Long groupId;
    private Long paidByUserId;  // Optional: used for CSV import to override current user
    private String description;
    private Double amount;
    private String currency;
    private String splitType;
    private List<Long> splitWith;
    private Map<String, Double> splitDetails;
    private String notes;
    private String expenseDate; // Added for CSV parsing to handle temporal membership
}