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
 */
@Service
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    public GroupService(GroupRepository groupRepository, GroupMemberRepository groupMemberRepository, UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new group
     */
    @Transactional
    public GroupResponse createGroup(CreateGroupRequest request, Long createdByUserId) {
        // Validate user exists
        User createdBy = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create group
        Group group = new Group();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setCreatedBy(createdByUserId);

        // Save group
        Group savedGroup = groupRepository.save(group);

        // Add creator as member
        GroupMember creatorMember = new GroupMember(savedGroup, createdByUserId);
        groupMemberRepository.save(creatorMember);

        // Add additional members if provided
        if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
            for (Long memberId : request.getMemberIds()) {
                // Check if user exists
                if (userRepository.existsById(memberId)) {
                    // Check if already member
                    if (!groupMemberRepository.findByGroupIdAndUserId(savedGroup.getId(), memberId).isPresent()) {
                        GroupMember member = new GroupMember(savedGroup, memberId);
                        groupMemberRepository.save(member);
                    }
                }
            }
        }

        return convertToGroupResponse(savedGroup);
    }

    /**
     * Get group by ID
     */
    public GroupResponse getGroupById(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return convertToGroupResponse(group);
    }

    /**
     * Get all groups for a user
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
        GroupMember member = new GroupMember(group, request.getUserId());
        groupMemberRepository.save(member);

        return convertToGroupResponse(group);
    }

    /**
     * Remove member from group
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
     * Convert Group to GroupResponse
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
                        member.getJoinedAt().toString()
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
                group.getCreatedAt().toString()
        );
    }
}