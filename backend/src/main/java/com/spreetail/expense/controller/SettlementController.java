package com.spreetail.expense.controller;

import com.spreetail.expense.dto.*;
import com.spreetail.expense.service.SettlementService;
import com.spreetail.expense.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller class for Settlement and Balance operations
 */
@RestController
@RequestMapping("/api/settlements")
public class SettlementController {

    private final SettlementService settlementService;
    private final UserService userService;

    public SettlementController(SettlementService settlementService, UserService userService) {
        this.settlementService = settlementService;
        this.userService = userService;
    }

    /**
     * Get balances for a group
     * GET /api/settlements/balances/{groupId}
     */
    @GetMapping("/balances/{groupId}")
    public ResponseEntity<?> getGroupBalances(@PathVariable Long groupId) {
        try {
            List<BalanceResponse> responses = settlementService.calculateGroupBalances(groupId);
            return ResponseEntity.ok(responses);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get settlement suggestions for a group
     * GET /api/settlements/suggestions/{groupId}
     */
    @GetMapping("/suggestions/{groupId}")
    public ResponseEntity<?> getSettlementSuggestions(@PathVariable Long groupId) {
        try {
            List<SettlementResponse> responses = settlementService.getSettlementSuggestions(groupId);
            return ResponseEntity.ok(responses);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Record a settlement
     * POST /api/settlements
     */
    @PostMapping
    public ResponseEntity<?> recordSettlement(@Valid @RequestBody CreateSettlementRequest request) {
        try {
            SettlementResponse response = settlementService.recordSettlement(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get all settlements for a group
     * GET /api/settlements/group/{groupId}
     */
    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupSettlements(@PathVariable Long groupId) {
        try {
            List<SettlementResponse> responses = settlementService.getGroupSettlements(groupId);
            return ResponseEntity.ok(responses);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}