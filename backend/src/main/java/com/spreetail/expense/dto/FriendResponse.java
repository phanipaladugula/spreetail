package com.spreetail.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendResponse {
    private Long id;
    private Long userId;
    private Long friendId;
    private String friendUsername;
    private String friendEmail;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime acceptedAt;
}