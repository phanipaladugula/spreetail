package com.spreetail.expense.service;

import com.spreetail.expense.dto.CreateInvitationRequest;
import com.spreetail.expense.dto.InvitationResponse;
import com.spreetail.expense.model.Group;
import com.spreetail.expense.model.GroupMember;
import com.spreetail.expense.model.Invitation;
import com.spreetail.expense.model.User;
import com.spreetail.expense.repository.GroupMemberRepository;
import com.spreetail.expense.repository.GroupRepository;
import com.spreetail.expense.repository.InvitationRepository;
import com.spreetail.expense.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;

    public InvitationService(InvitationRepository invitationRepository,
                             GroupRepository groupRepository,
                             UserRepository userRepository,
                             GroupMemberRepository groupMemberRepository) {
        this.invitationRepository = invitationRepository;
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.groupMemberRepository = groupMemberRepository;
    }

    @Transactional
    public InvitationResponse createInvitation(CreateInvitationRequest request, Long currentUserId) {
        // Validate group exists and user is a member
        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!groupMemberRepository.findByGroupIdAndUserId(request.getGroupId(), currentUserId).isPresent()) {
            throw new RuntimeException("You must be a member of this group to send invitations");
        }

        // Check if email is already a member
        User invitedUser = userRepository.findByEmail(request.getInvitedEmail()).orElse(null);
        if (invitedUser != null && groupMemberRepository.findByGroupIdAndUserId(request.getGroupId(), invitedUser.getId()).isPresent()) {
            throw new RuntimeException("This user is already a member of the group");
        }

        // Generate unique invite code
        String code = generateInviteCode();

        // Create invitation (expires in 7 days)
        Invitation invitation = new Invitation(code, request.getGroupId(), currentUserId, request.getInvitedEmail());
        invitation.setExpiresAt(LocalDateTime.now().plusDays(7));
        invitation = invitationRepository.save(invitation);

        return convertToResponse(invitation, group);
    }

    @Transactional
    public InvitationResponse acceptInvitation(String code, Long currentUserId) {
        Invitation invitation = invitationRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Invalid invitation code"));

        if (!invitation.getStatus().equals("pending")) {
            throw new RuntimeException("This invitation is no longer valid");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus("expired");
            invitationRepository.save(invitation);
            throw new RuntimeException("This invitation has expired");
        }

        // Check if user is already a member
        if (groupMemberRepository.findByGroupIdAndUserId(invitation.getGroupId(), currentUserId).isPresent()) {
            throw new RuntimeException("You are already a member of this group");
        }

        // Add user to group
        GroupMember groupMember = new GroupMember();
        groupMember.setGroupId(invitation.getGroupId());
        groupMember.setUserId(currentUserId);
        groupMember.setStatus("active");
        groupMember.setJoinedAt(LocalDateTime.now());
        groupMemberRepository.save(groupMember);

        // Update invitation status
        invitation.setStatus("accepted");
        invitationRepository.save(invitation);

        return convertToResponse(invitation, null);
    }

    public List<InvitationResponse> getGroupInvitations(Long groupId) {
        List<InvitationResponse> responses = new ArrayList<>();
        List<Invitation> invitations = invitationRepository.findByGroupId(groupId);

        for (Invitation invitation : invitations) {
            responses.add(convertToResponse(invitation, null));
        }

        return responses;
    }

    public List<InvitationResponse> getMyInvitations(Long userId) {
        List<InvitationResponse> responses = new ArrayList();

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return responses;
        }

        List<Invitation> invitations = invitationRepository.findByInvitedEmail(user.getEmail());

        for (Invitation invitation : invitations) {
            responses.add(convertToResponse(invitation, null));
        }

        return responses;
    }

    private String generateInviteCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder code = new StringBuilder();

        for (int i = 0; i < 8; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }

        // Ensure uniqueness
        while (invitationRepository.findByCode(code.toString()).isPresent()) {
            for (int i = 0; i < 8; i++) {
                code.append(chars.charAt(random.nextInt(chars.length())));
            }
        }

        return code.toString();
    }

    private InvitationResponse convertToResponse(Invitation invitation, Group group) {
        if (group == null && invitation != null) {
            group = groupRepository.findById(invitation.getGroupId()).orElse(null);
        }

        User user = userRepository.findById(invitation.getInvitedBy()).orElse(null);
        String invitedByUserName = user != null ? user.getUsername() : "Unknown";

        return new InvitationResponse(
                invitation.getId(),
                invitation.getCode(),
                invitation.getGroupId(),
                group != null ? group.getName() : "Unknown",
                invitation.getInvitedBy(),
                invitedByUserName,
                invitation.getInvitedEmail(),
                invitation.getStatus(),
                invitation.getExpiresAt(),
                invitation.getCreatedAt()
        );
    }
}