package com.spreetail.expense.controller;

import com.spreetail.expense.dto.CommentResponse;
import com.spreetail.expense.dto.CreateCommentRequest;
import com.spreetail.expense.dto.UserResponse;
import com.spreetail.expense.service.CommentService;
import com.spreetail.expense.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;

    public CommentController(CommentService commentService,
                               UserService userService) {
        this.commentService = commentService;
        this.userService = userService;
    }

    /**
     * Add comment to expense
     * POST /api/comments
     */
    @PostMapping
    public ResponseEntity<?> addComment(@RequestBody CreateCommentRequest request,
                                          @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            CommentResponse response = commentService.addComment(request, user.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get comments for expense
     * GET /api/comments/expense/{expenseId}
     */
    @GetMapping("/expense/{expenseId}")
    public ResponseEntity<?> getCommentsByExpense(@PathVariable Long expenseId) {
        try {
            List<CommentResponse> comments = commentService.getCommentsByExpense(expenseId);
            return ResponseEntity.ok(comments);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get my comments
     * GET /api/comments/my
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyComments(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            List<CommentResponse> comments = commentService.getCommentsByUser(user.getId());
            return ResponseEntity.ok(comments);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Delete comment
     * DELETE /api/comments/{commentId}
     */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId,
                                             @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);
            UserResponse user = userService.getUserByEmail(email);

            commentService.deleteComment(commentId, user.getId());
            return ResponseEntity.ok("Comment deleted");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}