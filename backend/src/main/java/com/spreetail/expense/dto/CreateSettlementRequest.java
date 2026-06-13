package com.spreetail.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for create settlement request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSettlementRequest {
    private Long groupId;
    private Long fromUserId;
    private Long toUserId;
    private Double amount;
    private String currency;
}