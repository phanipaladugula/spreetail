package com.spreetail.expense.repository;

import com.spreetail.expense.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByExpenseIdOrderByCreatedAtAsc(Long expenseId);

    @Query("SELECT c FROM Comment c WHERE c.userId = ?1 ORDER BY c.createdAt DESC")
    List<Comment> findByUserIdOrderByCreatedAtDesc(Long userId);
}