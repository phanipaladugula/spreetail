package com.spreetail.expense.repository;

import com.spreetail.expense.model.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for ExpenseSplit entity
 */
@Repository
public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {

    // Find splits by expense
    List<ExpenseSplit> findByExpenseId(Long expenseId);

    // Find splits by user
    List<ExpenseSplit> findByUserId(Long userId);

    // Find split by expense and user
    Optional<ExpenseSplit> findByExpenseIdAndUserId(Long expenseId, Long userId);

    // Find all splits for a user in a group
    @Query("SELECT es FROM ExpenseSplit es JOIN Expense e ON es.expenseId = e.id WHERE e.groupId = :groupId AND es.userId = :userId")
    List<ExpenseSplit> findByGroupIdAndUserId(Long groupId, Long userId);
}