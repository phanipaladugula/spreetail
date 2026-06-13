package com.spreetail.expense.controller;

import com.spreetail.expense.dto.CreateInvitationRequest;
import com.spreetail.expense.dto.InvitationResponse;
import com.spreetail.expense.dto.UserResponse;
import com.spreetail.expense.service.InvitationService;
import com.spreetail.expense.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitations")
public class InvitationController {

    private final InvitationService invitationService;
    private final UserService userService;

    public InvitationController(InvitationService invitationService,
                                 UserService userService) {
        this.invitationService = invitationService;
        this.userService = userService;
    }

    /**
     * Create invitation
     * POST /api/invitations
     */
    @PostMapping
    public ResponseEntity<?> createInvitation(@RequestBody CreateInvitationRequest request,
                                               @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            InvitationResponse response = invitationService.createInvitation(request, user.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Accept invitation
     * POST /api/invitations/accept/{code}
     */
    @PostMapping("/accept/{code}")
    public ResponseEntity<?> acceptInvitation(@PathVariable String code,
                                               @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            InvitationResponse response = invitationService.acceptInvitation(code, user.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get group invitations
     * GET /api/invitations/group/{groupId}
     */
    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupInvitations(@PathVariable Long groupId) {
        try {
            List<InvitationResponse> invitations = invitationService.getGroupInvitations(groupId);
            return ResponseEntity.ok(invitations);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get my invitations
     * GET /api/invitations/my
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyInvitations(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            List<InvitationResponse> invitations = invitationService.getMyInvitations(user.getId());
            return ResponseEntity.ok(invitations);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}