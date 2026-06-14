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
     * Update an existing expense
     * PUT /api/expenses/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(@PathVariable Long id,
                                           @RequestBody UpdateExpenseRequest request,
                                           @RequestHeader("Authorization") String authHeader) {
        try {
            // Get user ID from token
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);

            UserResponse user = userService.getUserByEmail(email);
            ExpenseResponse response = expenseService.updateExpense(id, request, user.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Delete an expense
     * DELETE /api/expenses/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id,
                                           @RequestHeader("Authorization") String authHeader) {
        try {
            // Get user ID from token
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);

            UserResponse user = userService.getUserByEmail(email);
            expenseService.deleteExpense(id, user.getId());
            return ResponseEntity.ok("Expense deleted successfully");
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
     * Preview CSV import without actually importing
     * POST /api/expenses/import/{groupId}/preview
     */
    @PostMapping("/import/{groupId}/preview")
    public ResponseEntity<?> previewCsvImport(
            @PathVariable Long groupId,
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = userService.getUserEmailFromToken(token);

            UserResponse user = userService.getUserByEmail(email);
            ImportReportResponse report = csvImportService.previewCsvImport(file, groupId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to preview CSV: " + e.getMessage());
        }
    }

    /**
     * Import expenses from CSV file with full anomaly detection and reporting
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
            ImportReportResponse report = csvImportService.importExpensesFromCsv(file, groupId, user.getId());
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to import CSV: " + e.getMessage());
        }
    }
}