package com.spreetail.expense.controller;

import com.spreetail.expense.dto.FriendRequest;
import com.spreetail.expense.dto.FriendResponse;
import com.spreetail.expense.dto.UserResponse;
import com.spreetail.expense.service.FriendshipService;
import com.spreetail.expense.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            FriendResponse response = friendshipService.sendFriendRequest(user.getId(), request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
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
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            FriendResponse response = friendshipService.acceptFriendRequest(user.getId(), requestId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
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
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            friendshipService.declineFriendRequest(user.getId(), requestId);
            return ResponseEntity.ok("Friend request declined");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get all friends
     * GET /api/friends
     */
    @GetMapping
    public ResponseEntity<?> getFriends(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            List<FriendResponse> friends = friendshipService.getFriends(user.getId());
            return ResponseEntity.ok(friends);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get pending friend requests
     * GET /api/friends/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRequests(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            List<FriendResponse> requests = friendshipService.getPendingRequests(user.getId());
            return ResponseEntity.ok(requests);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}