package com.spreetail.expense.repository;

import com.spreetail.expense.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Expense entity
 */
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // Find expenses by group
    List<Expense> findByGroupId(Long groupId);

    // Find expenses paid by a user
    List<Expense> findByPaidBy(Long userId);

    // Find expenses by group and user
    List<Expense> findByGroupIdAndPaidBy(Long groupId, Long userId);
}