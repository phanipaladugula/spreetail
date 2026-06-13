package com.spreetail.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for expense response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private Long id;
    private Long groupId;
    private String groupName;
    private Long paidBy;
    private String paidByUsername;
    private String description;
    private Double amount;
    private String currency;
    private String splitType;
    private String notes;
    private String createdAt;
    private List<ExpenseSplitResponse> splits;
}