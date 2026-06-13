package com.spreetail.expense.repository;

import com.spreetail.expense.model.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    Optional<Invitation> findByCode(String code);
    List<Invitation> findByGroupId(Long groupId);
    List<Invitation> findByInvitedBy(Long invitedBy);
    List<Invitation> findByInvitedEmail(String invitedEmail);
    Optional<Invitation> findByCodeAndStatus(String code, String status);
}