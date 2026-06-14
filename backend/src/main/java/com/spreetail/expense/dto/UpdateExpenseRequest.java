package com.spreetail.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO for update expense request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateExpenseRequest {
    private String description;
    private Double amount;
    private String currency;
    private String splitType;
    private List<Long> splitWith;
    private Map<String, Double> splitDetails;
    private String notes;
}