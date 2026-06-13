package com.spreetail.expense.controller;

import com.spreetail.expense.dto.ActivityResponse;
import com.spreetail.expense.dto.UserResponse;
import com.spreetail.expense.service.ActivityService;
import com.spreetail.expense.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService activityService;
    private final UserService userService;

    public ActivityController(ActivityService activityService,
                                UserService userService) {
        this.activityService = activityService;
        this.userService = userService;
    }

    /**
     * Get my activity feed
     * GET /api/activities/my
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyActivities(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            List<ActivityResponse> activities = activityService.getUserActivities(user.getId());
            return ResponseEntity.ok(activities);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get group activity feed
     * GET /api/activities/group/{groupId}
     */
    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupActivities(@PathVariable Long groupId) {
        try {
            List<ActivityResponse> activities = activityService.getGroupActivities(groupId);
            return ResponseEntity.ok(activities);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get entity activities
     * GET /api/activities/{entityType}/{entityId}
     */
    @GetMapping("/{entityType}/{entityId}")
    public ResponseEntity<?> getEntityActivities(@PathVariable String entityType,
                                                   @PathVariable Long entityId) {
        try {
            List<ActivityResponse> activities = activityService.getEntityActivities(entityType, entityId);
            return ResponseEntity.ok(activities);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}