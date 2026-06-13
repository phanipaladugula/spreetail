package com.spreetail.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for group response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupResponse {
    private Long id;
    private String name;
    private String description;
    private Long createdBy;
    private List<GroupMemberResponse> members;
    private String createdAt;
}