package com.spreetail.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for settlement response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SettlementResponse {
    private Long id;
    private Long fromUserId;
    private String fromUsername;
    private Long toUserId;
    private String toUsername;
    private Double amount;
    private String currency;
    private String settledAt;
}