package com.spreetail.expense.service;

import com.spreetail.expense.dto.*;
import com.spreetail.expense.model.Group;
import com.spreetail.expense.model.GroupMember;
import com.spreetail.expense.model.User;
import com.spreetail.expense.repository.GroupMemberRepository;
import com.spreetail.expense.repository.GroupRepository;
import com.spreetail.expense.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service class for Group operations
 * Handles group creation, member management, and group retrieval
 */
@Service
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    public GroupService(GroupRepository groupRepository,
                         GroupMemberRepository groupMemberRepository,
                         UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new group
     * @param request Group creation request with name, description, and member IDs
     * @param createdByUserId ID of the user creating the group
     * @return GroupResponse with group details
     * @throws RuntimeException if user not found or validation fails
     */
    @Transactional
    public GroupResponse createGroup(CreateGroupRequest request, Long createdByUserId) {
        // Validate group name
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Group name is required");
        }

        // Validate user exists
        User createdBy = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create group
        Group group = new Group();
        group.setName(request.getName().trim());
        group.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        group.setCreatedBy(createdByUserId);

        // Save group
        Group savedGroup = groupRepository.save(group);

        // Add creator as member with active status
        GroupMember creatorMember = new GroupMember(savedGroup, createdByUserId);
        creatorMember.setStatus("active");
        groupMemberRepository.save(creatorMember);

        // Add additional members if provided
        if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
            for (Long memberId : request.getMemberIds()) {
                addMemberById(savedGroup.getId(), memberId);
            }
        }

        return convertToGroupResponse(savedGroup);
    }

    /**
     * Add member to group by user ID
     * @param groupId ID of the group
     * @param memberId ID of the user to add
     * @throws RuntimeException if group or user not found, or already a member
     */
    private void addMemberById(Long groupId, Long memberId) {
        // Check if user exists
        if (!userRepository.existsById(memberId)) {
            throw new RuntimeException("User with ID " + memberId + " not found");
        }

        // Check if already member
        if (groupMemberRepository.findByGroupIdAndUserId(groupId, memberId).isPresent()) {
            throw new RuntimeException("User with ID " + memberId + " is already a member of this group");
        }

        // Add member
        GroupMember member = new GroupMember();
        member.setGroupId(groupId);
        member.setUserId(memberId);
        member.setStatus("active");
        groupMemberRepository.save(member);
    }

    /**
     * Add member to group by email
     * @param groupId ID of the group
     * @param email Email of the user to add
     * @throws RuntimeException if group or user not found, or already a member
     */
    @Transactional
    public GroupMemberResponse addMemberByEmail(Long groupId, String email) {
        // Validate group exists
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Validate email
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        // Find user by email
        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new RuntimeException("User with email '" + email + "' not found. Please ask them to register first."));

        // Check if already member
        if (groupMemberRepository.findByGroupIdAndUserId(groupId, user.getId()).isPresent()) {
            throw new RuntimeException("User with email '" + email + "' is already a member of this group");
        }

        // Add member
        GroupMember member = new GroupMember();
        member.setGroupId(groupId);
        member.setUserId(user.getId());
        member.setStatus("active");
        member = groupMemberRepository.save(member);

        return new GroupMemberResponse(
                member.getId(),
                member.getUserId(),
                user.getUsername(),
                user.getEmail(),
                member.getStatus(),
                member.getJoinedAt().toString()
        );
    }

    /**
     * Get group by ID
     * @param groupId ID of the group
     * @return GroupResponse with group details
     * @throws RuntimeException if group not found
     */
    public GroupResponse getGroupById(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return convertToGroupResponse(group);
    }

    /**
     * Get all groups for a user
     * @param userId ID of the user
     * @return List of GroupResponse objects
     */
    public List<GroupResponse> getUserGroups(Long userId) {
        List<Group> groups = groupRepository.findGroupsByMemberId(userId);
        List<GroupResponse> responses = new ArrayList<>();

        for (Group group : groups) {
            responses.add(convertToGroupResponse(group));
        }

        return responses;
    }

    /**
     * Add member to group
     * @param groupId ID of the group
     * @param request AddMemberRequest with user ID
     * @return GroupResponse with updated group details
     * @throws RuntimeException if group or user not found, or already a member
     */
    public GroupResponse addMember(Long groupId, AddMemberRequest request) {
        // Validate group exists
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Validate user exists
        if (!userRepository.existsById(request.getUserId())) {
            throw new RuntimeException("User not found");
        }

        // Check if already member
        if (groupMemberRepository.findByGroupIdAndUserId(groupId, request.getUserId()).isPresent()) {
            throw new RuntimeException("User is already a member of this group");
        }

        // Add member
        GroupMember member = new GroupMember();
        member.setGroupId(groupId);
        member.setUserId(request.getUserId());
        member.setStatus("active");
        groupMemberRepository.save(member);

        return convertToGroupResponse(group);
    }

    /**
     * Remove member from group
     * @param groupId ID of the group
     * @param userId ID of the user to remove
     * @return GroupResponse with updated group details
     * @throws RuntimeException if group not found or user not a member
     */
    public GroupResponse removeMember(Long groupId, Long userId) {
        // Validate group exists
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Check if member exists
        if (!groupMemberRepository.findByGroupIdAndUserId(groupId, userId).isPresent()) {
            throw new RuntimeException("User is not a member of this group");
        }

        // Remove member
        groupMemberRepository.deleteByGroupIdAndUserId(groupId, userId);

        return convertToGroupResponse(group);
    }

    /**
     * Convert Group entity to GroupResponse DTO
     * @param group The group entity
     * @return GroupResponse DTO with members list
     */
    private GroupResponse convertToGroupResponse(Group group) {
        // Get all members
        List<GroupMember> members = groupMemberRepository.findByGroupId(group.getId());
        List<GroupMemberResponse> memberResponses = new ArrayList<>();

        for (GroupMember member : members) {
            User user = userRepository.findById(member.getUserId()).orElse(null);
            if (user != null) {
                GroupMemberResponse memberResponse = new GroupMemberResponse(
                        member.getId(),
                        member.getUserId(),
                        user.getUsername(),
                        user.getEmail(),
                        member.getStatus(),
                        member.getJoinedAt() != null ? member.getJoinedAt().toString() : null
                );
                memberResponses.add(memberResponse);
            }
        }

        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getCreatedBy(),
                memberResponses,
                group.getCreatedAt() != null ? group.getCreatedAt().toString() : null
        );
    }
}