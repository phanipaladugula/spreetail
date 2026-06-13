package com.spreetail.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for balance response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BalanceResponse {
    private Long userId;
    private String username;
    private Double totalOwed;
    private Double totalToReceive;
    private Double netBalance;
}