package com.spreetail.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvitationResponse {
    private Long id;
    private String code;
    private Long groupId;
    private String groupName;
    private Long invitedBy;
    private String invitedByUser;
    private String invitedEmail;
    private String status;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}