package com.spreetail.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating user profile
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileUpdateRequest {
    private String username;
    private String email;
    private String currentPassword; // For email change
    private String newPassword;
    private String confirmPassword;
}