package com.spreetail.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for create group request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateGroupRequest {
    private String name;
    private String description;
    private List<Long> memberIds;
}