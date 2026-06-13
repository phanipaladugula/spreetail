package com.spreetail.expense.controller;

import com.spreetail.expense.dto.*;
import com.spreetail.expense.service.GroupService;
import com.spreetail.expense.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller class for Group operations
 */
@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;
    private final UserService userService;

    public GroupController(GroupService groupService, UserService userService) {
        this.groupService = groupService;
        this.userService = userService;
    }

    /**
     * Create a new group
     * POST /api/groups
     */
    @PostMapping
    public ResponseEntity<?> createGroup(@Valid @RequestBody CreateGroupRequest request,
                                           @RequestHeader("Authorization") String authHeader) {
        try {
            // Get user ID from token
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);

            // For now, we'll get user ID from email
            // In production, you might want to cache user details
            UserResponse user = userService.getUserByEmail(email);

            GroupResponse response = groupService.createGroup(request, user.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get group by ID
     * GET /api/groups/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getGroupById(@PathVariable Long id) {
        try {
            GroupResponse response = groupService.getGroupById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Get all groups for current user
     * GET /api/groups/my
     */
    @GetMapping("/my")
    public ResponseEntity<?> getUserGroups(@RequestHeader("Authorization") String authHeader) {
        try {
            // Get user ID from token
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);

            UserResponse user = userService.getUserByEmail(email);
            List<GroupResponse> responses = groupService.getUserGroups(user.getId());
            return ResponseEntity.ok(responses);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Add member to group
     * POST /api/groups/{id}/members
     */
    @PostMapping("/{id}/members")
    public ResponseEntity<?> addMember(@PathVariable Long id,
                                       @Valid @RequestBody AddMemberRequest request) {
        try {
            GroupResponse response = groupService.addMember(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Remove member from group
     * DELETE /api/groups/{id}/members/{userId}
     */
    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        try {
            GroupResponse response = groupService.removeMember(id, userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}