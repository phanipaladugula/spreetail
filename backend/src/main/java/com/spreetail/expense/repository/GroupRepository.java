package com.spreetail.expense.repository;

import com.spreetail.expense.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Group entity
 */
@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    // Find groups created by a user
    List<Group> findByCreatedBy(Long userId);

    // Find groups where user is a member
    @Query("SELECT DISTINCT g FROM Group g JOIN GroupMember gm ON g.id = gm.groupId WHERE gm.userId = :userId")
    List<Group> findGroupsByMemberId(Long userId);
}