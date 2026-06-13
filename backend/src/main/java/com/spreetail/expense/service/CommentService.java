package com.spreetail.expense.service;

import com.spreetail.expense.dto.CreateCommentRequest;
import com.spreetail.expense.dto.CommentResponse;
import com.spreetail.expense.model.Comment;
import com.spreetail.expense.model.Expense;
import com.spreetail.expense.model.User;
import com.spreetail.expense.repository.CommentRepository;
import com.spreetail.expense.repository.ExpenseRepository;
import com.spreetail.expense.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository,
                          ExpenseRepository expenseRepository,
                          UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    public CommentResponse addComment(CreateCommentRequest request, Long userId) {
        // Validate expense exists
        Expense expense = expenseRepository.findById(request.getExpenseId())
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Extract mentions
        String mentions = extractMentions(request.getText());

        // Create comment
        Comment comment = new Comment(request.getExpenseId(), userId, request.getText());
        comment.setMentions(mentions);
        comment = commentRepository.save(comment);

        return convertToResponse(comment);
    }

    public List<CommentResponse> getCommentsByExpense(Long expenseId) {
        List<Comment> comments = commentRepository.findByExpenseIdOrderByCreatedAtAsc(expenseId);
        List<CommentResponse> responses = new ArrayList<>();

        for (Comment comment : comments) {
            responses.add(convertToResponse(comment));
        }

        return responses;
    }

    public List<CommentResponse> getCommentsByUser(Long userId) {
        List<Comment> comments = commentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<CommentResponse> responses = new ArrayList<>();

        for (Comment comment : comments) {
            responses.add(convertToResponse(comment));
        }

        return responses;
    }

    public void deleteComment(Long commentId, Long currentUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(currentUserId)) {
            throw new RuntimeException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    private CommentResponse convertToResponse(Comment comment) {
        User user = userRepository.findById(comment.getUserId()).orElse(null);
        String username = user != null ? user.getUsername() : "Unknown";

        return new CommentResponse(
                comment.getId(),
                comment.getExpenseId(),
                comment.getUserId(),
                username,
                comment.getText(),
                comment.getMentions(),
                comment.getCreatedAt()
        );
    }

    private String extractMentions(String text) {
        if (text == null) {
            return "";
        }

        // Pattern to match @username
        Pattern pattern = Pattern.compile("@(\\w+)");
        Matcher matcher = pattern.matcher(text);

        StringBuilder mentions = new StringBuilder();
        while (matcher.find()) {
            String username = matcher.group(1);
            if (mentions.length() > 0) {
                mentions.append(",");
            }
            mentions.append(username);
        }

        return mentions.toString();
    }
}