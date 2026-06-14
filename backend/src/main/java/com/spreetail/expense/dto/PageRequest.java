package com.spreetail.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for page request parameters
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageRequest {
    private int page;
    private int size;
    private String sortBy;
    private String sortDirection; // ASC or DESC
}