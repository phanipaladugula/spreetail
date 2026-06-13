package com.spreetail.expense.repository;

import com.spreetail.expense.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for GroupMember entity
 */
@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    // Find all members of a group
    List<GroupMember> findByGroupId(Long groupId);

    // Find all groups for a user
    List<GroupMember> findByUserId(Long userId);

    // Check if user is member of group
    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);

    // Delete member by group and user
    void deleteByGroupIdAndUserId(Long groupId, Long userId);
}