package com.spreetail.expense.controller;

import com.spreetail.expense.dto.*;
import com.spreetail.expense.model.Group;
import com.spreetail.expense.repository.GroupRepository;
import com.spreetail.expense.service.GroupService;
import com.spreetail.expense.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Sort;

/**
 * Controller class for Group operations
 * Handles group creation, member management, and group retrieval
 */
@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;
    private final UserService userService;
    private final GroupRepository groupRepository;

    public GroupController(GroupService groupService, UserService userService, GroupRepository groupRepository) {
        this.groupService = groupService;
        this.userService = userService;
        this.groupRepository = groupRepository;
    }

    /**
     * Create a new group
     * POST /api/groups
     */
    @PostMapping
    public ResponseEntity<?> createGroup(@Valid @RequestBody CreateGroupRequest request,
                                           @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate auth header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Missing or invalid authorization header"));
            }

            // Get user ID from token
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            // Create group
            GroupResponse response = groupService.createGroup(request, user.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createSuccessResponse(
                "Group created successfully", response));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("An unexpected error occurred: " + e.getMessage()));
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
            return ResponseEntity.ok(createSuccessResponse(
                "Group retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get all groups for current user
     * GET /api/groups/my
     */
    @GetMapping("/my")
    public ResponseEntity<?> getUserGroups(@RequestHeader("Authorization") String authHeader,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size) {
        try {
            // Validate auth header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Missing or invalid authorization header"));
            }

            // Get user ID from token
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            // Get paginated groups
            PaginatedResponse<GroupResponse> response = groupService.getUserGroupsPaginated(user.getId(), page, size);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get all groups (paginated) - Admin endpoint
     * GET /api/groups/all
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllGroups(@RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "10") int size) {
        try {
            int totalElements = (int) groupRepository.count();

            List<Group> groups;
            int totalPages;
            boolean first, last;

            if (size == -1) {
                // Get all groups
                groups = groupRepository.findAll();
                totalPages = 1;
                first = true;
                last = true;
            } else {
                // Get paginated groups
                int skip = page * size;
                totalPages = (int) Math.ceil((double) totalElements / size);
                Page<Group> groupPage = groupRepository.findAll(PageRequest.of(page, size));
                groups = groupPage.getContent();
                first = page == 0;
                last = (page + 1) >= totalPages;
            }

            List<GroupResponse> responses = new ArrayList<>();
            for (Group group : groups) {
                responses.add(groupService.convertToGroupResponse(group));
            }

            return ResponseEntity.ok(new PaginatedResponse<>(
                    responses,
                    page,
                    size,
                    totalElements,
                    totalPages,
                    first,
                    last
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Add member to group by user ID
     * POST /api/groups/{id}/members
     */
    @PostMapping("/{id}/members")
    public ResponseEntity<?> addMember(@PathVariable Long id,
                                       @Valid @RequestBody AddMemberRequest request) {
        try {
            GroupResponse response = groupService.addMember(id, request);
            return ResponseEntity.ok(createSuccessResponse(
                "Member added successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Add member to group by email
     * POST /api/groups/{id}/members/email
     */
    @PostMapping("/{id}/members/email")
    public ResponseEntity<?> addMemberByEmail(@PathVariable Long id,
                                              @RequestBody Map<String, String> request,
                                              @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate auth header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Missing or invalid authorization header"));
            }

            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Email is required"));
            }

            GroupMemberResponse response = groupService.addMemberByEmail(id, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(createSuccessResponse(
                "Member added successfully", response));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Update a group
     * PUT /api/groups/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateGroup(@PathVariable Long id,
                                        @RequestBody UpdateGroupRequest request,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate auth header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Missing or invalid authorization header"));
            }

            // Get user ID from token
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            GroupResponse response = groupService.updateGroup(id, request, user.getId());
            return ResponseEntity.ok(createSuccessResponse(
                "Group updated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Delete a group
     * DELETE /api/groups/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable Long id,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate auth header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Missing or invalid authorization header"));
            }

            // Get user ID from token
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            groupService.deleteGroup(id, user.getId());
            return ResponseEntity.ok(createSuccessResponse(
                "Group deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
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
            return ResponseEntity.ok(createSuccessResponse(
                "Member removed successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Leave a group voluntarily
     * POST /api/groups/{id}/leave
     */
    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveGroup(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        try {
            // Extract token and user email
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            groupService.leaveGroup(id, user.getId());
            return ResponseEntity.ok(createSuccessResponse("You have successfully left the group", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Create a standardized error response
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }

    /**
     * Create a standardized success response
     */
    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        if (data != null) {
            response.put("data", data);
        }
        return response;
    }

    /**
     * Make convertToGroupResponse public
     */
    private Map<String, Object> convertToGroupResponseToMap(GroupResponse response) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", response.getId());
        result.put("name", response.getName());
        result.put("description", response.getDescription());
        result.put("createdBy", response.getCreatedBy());
        result.put("members", response.getMembers());
        result.put("createdAt", response.getCreatedAt());
        return result;
    }
}