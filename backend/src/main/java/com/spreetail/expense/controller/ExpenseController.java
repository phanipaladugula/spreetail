package com.spreetail.expense.controller;

import com.spreetail.expense.dto.*;
import com.spreetail.expense.service.CsvImportService;
import com.spreetail.expense.service.ExpenseService;
import com.spreetail.expense.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller class for Expense operations
 */
@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserService userService;
    private final CsvImportService csvImportService;

    public ExpenseController(ExpenseService expenseService, UserService userService,
                            CsvImportService csvImportService) {
        this.expenseService = expenseService;
        this.userService = userService;
        this.csvImportService = csvImportService;
    }

    /**
     * Create a new expense
     * POST /api/expenses
     */
    @PostMapping
    public ResponseEntity<?> createExpense(@Valid @RequestBody CreateExpenseRequest request,
                                            @RequestHeader("Authorization") String authHeader) {
        try {
            // Get user ID from token
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);

            UserResponse user = userService.getUserByEmail(email);
            ExpenseResponse response = expenseService.createExpense(request, user.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get expense by ID
     * GET /api/expenses/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getExpenseById(@PathVariable Long id) {
        try {
            ExpenseResponse response = expenseService.getExpenseById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Get all expenses for a group
     * GET /api/expenses/group/{groupId}
     */
    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getExpensesByGroup(@PathVariable Long groupId) {
        try {
            List<ExpenseResponse> responses = expenseService.getExpensesByGroup(groupId);
            return ResponseEntity.ok(responses);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get all expenses for current user
     * GET /api/expenses/my
     */
    @GetMapping("/my")
    public ResponseEntity<?> getUserExpenses(@RequestHeader("Authorization") String authHeader) {
        try {
            // Get user ID from token
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);

            UserResponse user = userService.getUserByEmail(email);
            List<ExpenseResponse> responses = expenseService.getExpensesByUser(user.getId());
            return ResponseEntity.ok(responses);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Import expenses from CSV file
     * POST /api/expenses/import/{groupId}
     */
    @PostMapping("/import/{groupId}")
    public ResponseEntity<?> importExpensesFromCsv(
            @PathVariable Long groupId,
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Get user ID from token
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);

            UserResponse user = userService.getUserByEmail(email);
            List<ExpenseResponse> imported = csvImportService.importExpensesFromCsv(file, groupId, user.getId());
            return ResponseEntity.ok(imported);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to import CSV: " + e.getMessage());
        }
    }
}