package com.spreetail.expense.service;

import com.spreetail.expense.dto.ActivityResponse;
import com.spreetail.expense.model.Activity;
import com.spreetail.expense.model.GroupMember;
import com.spreetail.expense.model.User;
import com.spreetail.expense.repository.ActivityRepository;
import com.spreetail.expense.repository.GroupMemberRepository;
import com.spreetail.expense.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;

    public ActivityService(ActivityRepository activityRepository,
                            UserRepository userRepository,
                            GroupMemberRepository groupMemberRepository) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.groupMemberRepository = groupMemberRepository;
    }

    public ActivityResponse createActivity(Long userId, String action, String entityType,
                                             Long entityId, String description) {
        Activity activity = new Activity(userId, action, entityType, entityId, description);
        activity = activityRepository.save(activity);
        return convertToResponse(activity);
    }

    public List<ActivityResponse> getUserActivities(Long userId) {
        List<Activity> activities = activityRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<ActivityResponse> responses = new ArrayList<>();

        for (Activity activity : activities) {
            responses.add(convertToResponse(activity));
        }

        return responses;
    }

    public List<ActivityResponse> getGroupActivities(Long groupId) {
        // Get all group member IDs
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        List<Long> userIds = new ArrayList<>();

        for (GroupMember member : members) {
            userIds.add(member.getUserId());
        }

        // Get activities from all group members
        List<Activity> activities = activityRepository.findByUserIdsOrderByCreatedAtDesc(userIds);
        List<ActivityResponse> responses = new ArrayList<>();

        for (Activity activity : activities) {
            responses.add(convertToResponse(activity));
        }

        return responses;
    }

    public List<ActivityResponse> getEntityActivities(String entityType, Long entityId) {
        List<Activity> activities = activityRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
        List<ActivityResponse> responses = new ArrayList<>();

        for (Activity activity : activities) {
            responses.add(convertToResponse(activity));
        }

        return responses;
    }

    private ActivityResponse convertToResponse(Activity activity) {
        User user = userRepository.findById(activity.getUserId()).orElse(null);
        String username = user != null ? user.getUsername() : "Unknown";

        return new ActivityResponse(
                activity.getId(),
                activity.getUserId(),
                username,
                activity.getAction(),
                activity.getEntityType(),
                activity.getEntityId(),
                activity.getDescription(),
                activity.getCreatedAt()
        );
    }
}