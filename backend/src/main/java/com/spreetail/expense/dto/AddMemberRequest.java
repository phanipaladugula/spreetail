package com.spreetail.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for add member request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddMemberRequest {
    private Long userId;
}