package com.spreetail.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for group member response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberResponse {
    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String status;
    private String joinedAt;
}