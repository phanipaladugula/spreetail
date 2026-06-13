package com.spreetail.expense.repository;

import com.spreetail.expense.model.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Settlement entity
 */
@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    // Find settlements by group
    List<Settlement> findByGroupId(Long groupId);

    // Find settlements where user owes money
    List<Settlement> findByFromUser(Long userId);

    // Find settlements where user is owed money
    List<Settlement> findByToUser(Long userId);

    // Find settlement between two users in a group
    List<Settlement> findByGroupIdAndFromUserAndToUser(Long groupId, Long fromUser, Long toUser);
}