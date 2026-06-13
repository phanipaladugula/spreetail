package com.spreetail.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for expense split response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSplitResponse {
    private Long id;
    private Long userId;
    private String username;
    private Double shareAmount;
    private Double sharePercentage;
    private Integer shares;
}