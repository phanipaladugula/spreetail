package com.spreetail.expense.controller;

import com.spreetail.expense.dto.FriendRequest;
import com.spreetail.expense.dto.FriendResponse;
import com.spreetail.expense.dto.UserResponse;
import com.spreetail.expense.service.FriendshipService;
import com.spreetail.expense.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller class for Friendship operations
 * Handles friend requests, acceptance, declining, and listing friends
 */
@RestController
@RequestMapping("/api/friends")
public class FriendshipController {

    private final FriendshipService friendshipService;
    private final UserService userService;

    public FriendshipController(FriendshipService friendshipService,
                                UserService userService) {
        this.friendshipService = friendshipService;
        this.userService = userService;
    }

    /**
     * Send friend request
     * POST /api/friends/request
     */
    @PostMapping("/request")
    public ResponseEntity<?> sendFriendRequest(@RequestBody FriendRequest request,
                                                @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate auth header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Missing or invalid authorization header"));
            }

            // Get current user
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            // Validate request email
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Friend email is required"));
            }

            // Send friend request
            FriendResponse response = friendshipService.sendFriendRequest(user.getId(), request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(createSuccessResponse(
                "Friend request sent successfully", response));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Accept friend request
     * POST /api/friends/accept/{requestId}
     */
    @PostMapping("/accept/{requestId}")
    public ResponseEntity<?> acceptFriendRequest(@PathVariable Long requestId,
                                                   @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate auth header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Missing or invalid authorization header"));
            }

            // Get current user
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            // Accept friend request
            FriendResponse response = friendshipService.acceptFriendRequest(user.getId(), requestId);
            return ResponseEntity.ok(createSuccessResponse(
                "Friend request accepted", response));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Decline friend request
     * POST /api/friends/decline/{requestId}
     */
    @PostMapping("/decline/{requestId}")
    public ResponseEntity<?> declineFriendRequest(@PathVariable Long requestId,
                                                    @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate auth header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Missing or invalid authorization header"));
            }

            // Get current user
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            // Decline friend request
            friendshipService.declineFriendRequest(user.getId(), requestId);
            return ResponseEntity.ok(createSuccessResponse(
                "Friend request declined", null));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get all friends
     * GET /api/friends
     */
    @GetMapping
    public ResponseEntity<?> getFriends(@RequestHeader("Authorization") String authHeader) {
        try {
            // Validate auth header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Missing or invalid authorization header"));
            }

            // Get current user
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            // Get friends
            List<FriendResponse> friends = friendshipService.getFriends(user.getId());
            return ResponseEntity.ok(createSuccessResponse(
                "Friends retrieved successfully", friends));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get pending friend requests
     * GET /api/friends/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRequests(@RequestHeader("Authorization") String authHeader) {
        try {
            // Validate auth header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Missing or invalid authorization header"));
            }

            // Get current user
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            // Get pending requests
            List<FriendResponse> requests = friendshipService.getPendingRequests(user.getId());
            return ResponseEntity.ok(createSuccessResponse(
                "Pending requests retrieved successfully", requests));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("An unexpected error occurred: " + e.getMessage()));
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
}