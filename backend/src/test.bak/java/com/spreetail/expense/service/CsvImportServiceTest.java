package com.spreetail.expense.service;

import com.spreetail.expense.dto.CreateExpenseRequest;
import com.spreetail.expense.dto.ImportReportResponse;
import com.spreetail.expense.model.GroupMember;
import com.spreetail.expense.model.User;
import com.spreetail.expense.repository.ExpenseRepository;
import com.spreetail.expense.repository.GroupMemberRepository;
import com.spreetail.expense.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

/**
 * Comprehensive tests for CSV import edge case handling
 * Tests all 12+ data problems mentioned in SCOPE.md
 */
@ExtendWith(MockitoExtension.class)
class CsvImportServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GroupMemberRepository groupMemberRepository;

    @Mock
    private ExpenseService expenseService;

    @Mock
    private ExpenseRepository expenseRepository;

    private CsvImportService csvImportService;

    private User userAisha;
    private User userRohan;
    private User userPriya;
    private GroupMember groupMember;

    @BeforeEach
    void setUp() {
        csvImportService = new CsvImportService(
                userRepository,
                groupMemberRepository,
                expenseService,
                expenseRepository
        );

        // Setup test users
        userAisha = new User();
        userAisha.setId(1L);
        userAisha.setUsername("Aisha");
        userAisha.setEmail("aisha@example.com");

        userRohan = new User();
        userRohan.setId(2L);
        userRohan.setUsername("Rohan");
        userRohan.setEmail("rohan@example.com");

        userPriya = new User();
        userPriya.setId(3L);
        userPriya.setUsername("Priya");
        userPriya.setEmail("priya@example.com");

        // Setup group member
        groupMember = new GroupMember();
        groupMember.setGroupId(1L);
        groupMember.setUserId(1L);
        groupMember.setStatus("active");

        // Mock user repository responses
        when(userRepository.findByUsername("Aisha")).thenReturn(Optional.of(userAisha));
        when(userRepository.findByUsername("Rohan")).thenReturn(Optional.of(userRohan));
        when(userRepository.findByUsername("Priya")).thenReturn(Optional.of(userPriya));
        when(userRepository.findAll()).thenReturn(List.of(userAisha, userRohan, userPriya));

        // Mock group member responses
        when(groupMemberRepository.findByGroupIdAndUserId(anyLong(), anyLong()))
                .thenReturn(Optional.of(groupMember));
    }

    @Test
    void testCsvImportWithValidData() throws IOException {
        // Arrange
        String csv = "date,description,paid_by,amount,currency,split_type,split_with,split_details,notes\n" +
                     "01-02-2026,Groceries,Aisha,1500,INR,equal,Aisha;Rohan;Priya,,Weekly groceries";

        MockMultipartFile file = createMockMultipartFile(csv);

        // Act & Assert - Should not throw exception
        assertDoesNotThrow(() -> csvImportService.importExpensesFromCsv(file, 1L, 1L));
    }

    // Anomaly #1: Empty Required Fields
    @Test
    void testEmptyDescriptionIsSkipped() throws IOException {
        // Arrange
        String csv = "date,description,paid_by,amount,currency,split_type,split_with,split_details,notes\n" +
                     "01-02-2026,,Aisha,1500,INR,equal,Aisha;Rohan;Priya,,Weekly groceries";

        MockMultipartFile file = createMockMultipartFile(csv);

        // Act
        ImportReportResponse report = csvImportService.importExpensesFromCsv(file, 1L, 1L);

        // Assert
        assertTrue(report.getAnomalies().stream()
                .anyMatch(a -> a.getType().equals("EMPTY_FIELD")));
        assertEquals(0, report.getSuccessfullyImported());
    }

    // Anomaly #2: Zero Amount
    @Test
    void testZeroAmountIsSkipped() throws IOException {
        // Arrange
        String csv = "date,description,paid_by,amount,currency,split_type,split_with,split_details,notes\n" +
                     "01-02-2026,Test expense,Aisha,0,INR,equal,Aisha;Rohan;Priya,,Test";

        MockMultipartFile file = createMockMultipartFile(csv);

        // Act
        ImportReportResponse report = csvImportService.importExpensesFromCsv(file, 1L, 1L);

        // Assert
        assertTrue(report.getAnomalies().stream()
                .anyMatch(a -> a.getType().equals("ZERO_AMOUNT")));
        assertEquals(0, report.getSuccessfullyImported());
    }

    // Anomaly #3: Negative Amount (Refund)
    @Test
    void testNegativeAmountTreatedAsRefund() throws IOException {
        // Arrange
        String csv = "date,description,paid_by,amount,currency,split_type,split_with,split_details,notes\n" +
                     "01-02-2026,Parasailing refund,Dev,-30,USD,equal,Aisha;Rohan;Priya;Dev,Refund for cancelled slot";

        // Mock Dev user
        User dev = new User();
        dev.setId(4L);
        dev.setUsername("Dev");
        when(userRepository.findByUsername("Dev")).thenReturn(Optional.of(dev));

        MockMultipartFile file = createMockMultipartFile(csv);

        // Act
        ImportReportResponse report = csvImportService.importExpensesFromCsv(file, 1L, 1L);

        // Assert
        assertTrue(report.getAnomalies().stream()
                .anyMatch(a -> a.getType().equals("NEGATIVE_AMOUNT")));
        assertEquals("REFUND_SPLIT_REVERSED", report.getAnomalies().get(0).getActionTaken());
    }

    // Anomaly #4: Invalid Currency
    @Test
    void testInvalidCurrencyDefaultsToINR() throws IOException {
        // Arrange
        String csv = "date,description,paid_by,amount,currency,split_type,split_with,split_details,notes\n" +
                     "01-02-2026,Test,Aisha,1500,XYZ,equal,Aisha;Rohan;Priya,,Test";

        MockMultipartFile file = createMockMultipartFile(csv);

        // Act
        ImportReportResponse report = csvImportService.importExpensesFromCsv(file, 1L, 1L);

        // Assert
        assertTrue(report.getAnomalies().stream()
                .anyMatch(a -> a.getType().equals("INVALID_CURRENCY")));
        assertEquals("DEFAULT_TO_INR", report.getAnomalies().get(0).getActionTaken());
    }

    // Anomaly #5: Invalid Split Type
    @Test
    void testInvalidSplitTypeDefaultsToEqual() throws IOException {
        // Arrange
        String csv = "date,description,paid_by,amount,currency,split_type,split_with,split_details,notes\n" +
                     "01-02-2026,Test,Aisha,1500,INR,random_split,Aisha;Rohan;Priya,,Test";

        MockMultipartFile file = createMockMultipartFile(csv);

        // Act
        ImportReportResponse report = csvImportService.importExpensesFromCsv(file, 1L, 1L);

        // Assert
        assertTrue(report.getAnomalies().stream()
                .anyMatch(a -> a.getType().equals("INVALID_SPLIT_TYPE")));
        assertEquals("DEFAULT_TO_EQUAL", report.getAnomalies().get(0).getActionTaken());
    }

    // Anomaly #6: Settlement Logged as Expense
    @Test
    void testSettlementAsExpenseIsSkipped() throws IOException {
        // Arrange
        String csv = "date,description,paid_by,amount,currency,split_type,split_with,split_details,notes\n" +
                     "01-02-2026,Rohan settlement to Aisha,Rohan,2300,INR,equal,Rohan;Aisha,,Settling up for rent";

        MockMultipartFile file = createMockMultipartFile(csv);

        // Act
        ImportReportResponse report = csvImportService.importExpensesFromCsv(file, 1L, 1L);

        // Assert
        assertTrue(report.getAnomalies().stream()
                .anyMatch(a -> a.getType().equals("SETTLEMENT_AS_EXPENSE")));
        assertEquals("SKIPPED", report.getAnomalies().get(0).getActionTaken());
    }

    // Anomaly #7: User Not Found
    @Test
    void testUnknownUserIsSkipped() throws IOException {
        // Arrange
        String csv = "date,description,paid_by,amount,currency,split_type,split_with,split_details,notes\n" +
                     "01-02-2026,Test,UnknownUser,1500,INR,equal,Aisha;Rohan;Priya,,Test";

        MockMultipartFile file = createMockMultipartFile(csv);

        // Act
        ImportReportResponse report = csvImportService.importExpensesFromCsv(file, 1L, 1L);

        // Assert
        assertTrue(report.getAnomalies().stream()
                .anyMatch(a -> a.getType().equals("USER_NOT_FOUND")));
    }

    // Anomaly #8: No Valid Split Users
    @Test
    void testNoSplitUsersIsSkipped() throws IOException {
        // Arrange
        String csv = "date,description,paid_by,amount,currency,split_type,split_with,split_details,notes\n" +
                     "01-02-2026,Test,Aisha,1500,INR,equal,,,";

        MockMultipartFile file = createMockMultipartFile(csv);

        // Act
        ImportReportResponse report = csvImportService.importExpensesFromCsv(file, 1L, 1L);

        // Assert
        assertTrue(report.getAnomalies().stream()
                .anyMatch(a -> a.getType().equals("NO_SPLIT_USERS")));
    }

    // Anomaly #9: User Not In Group
    @Test
    void testUserNotInGroupIsRemovedFromSplit() throws IOException {
        // Arrange
        String csv = "date,description,paid_by,amount,currency,split_type,split_with,split_details,notes\n" +
                     "01-02-2026,Test,Aisha,1500,INR,equal,Aisha;NonMember;Priya,,Test";

        MockMultipartFile file = createMockMultipartFile(csv);

        // Act
        ImportReportResponse report = csvImportService.importExpensesFromCsv(file, 1L, 1L);

        // Assert
        assertTrue(report.getAnomalies().stream()
                .anyMatch(a -> a.getType().equals("USER_NOT_IN_GROUP")));
        assertEquals("REMOVE_FROM_SPLIT", report.getAnomalies().get(0).getActionTaken());
    }

    // Anomaly #10: Split Sum Mismatch
    @Test
    void testSplitSumMismatchIsDetected() throws IOException {
        // Arrange
        String csv = "date,description,paid_by,amount,currency,split_type,split_with,split_details,notes\n" +
                     "01-02-2026,Test,Aisha,100,INR,unequal,Aisha;Rohan;Priya,Aisha 50; Rohan 30; Priya 40,Test";

        MockMultipartFile file = createMockMultipartFile(csv);

        // Act
        ImportReportResponse report = csvImportService.importExpensesFromCsv(file, 1L, 1L);

        // Assert
        assertTrue(report.getAnomalies().stream()
                .anyMatch(a -> a.getType().equals("SPLIT_SUM_MISMATCH")));
        assertEquals("PROPORTIONALLY_ADJUSTED", report.getAnomalies().get(0).getActionTaken());
    }

    // Anomaly #11: Duplicate In CSV
    @Test
    void testDuplicateInCsvIsSkipped() throws IOException {
        // Arrange
        String csv = "date,description,paid_by,amount,currency,split_type,split_with,split_details,notes\n" +
                     "01-02-2026,Groceries,Aisha,1500,INR,equal,Aisha;Rohan;Priya,,Test\n" +
                     "01-02-2026,Groceries,Aisha,1500,INR,equal,Aisha;Rohan;Priya,,Test";

        MockMultipartFile file = createMockMultipartFile(csv);

        // Act
        ImportReportResponse report = csvImportService.importExpensesFromCsv(file, 1L, 1L);

        // Assert
        assertTrue(report.getAnomalies().stream()
                .anyMatch(a -> a.getType().equals("DUPLICATE_IN_CSV")));
        assertEquals("SKIPPED", report.getAnomalies().get(0).getActionTaken());
        // Only first should be imported
        assertTrue(report.getSuccessfullyImported() <= 1);
    }

    // Additional test: Percentage sum mismatch
    @Test
    void testPercentageSumMismatchIsDetected() throws IOException {
        // Arrange
        String csv = "date,description,paid_by,amount,currency,split_type,split_with,split_details,notes\n" +
                     "01-02-2026,Test,Aisha,100,INR,percentage,Aisha;Rohan;Priya,Aisha 30%; Rohan 30%; Priya 50%,Test";

        MockMultipartFile file = createMockMultipartFile(csv);

        // Act
        ImportReportResponse report = csvImportService.importExpensesFromCsv(file, 1L, 1L);

        // Assert
        assertTrue(report.getAnomalies().stream()
                .anyMatch(a -> a.getType().equals("PERCENTAGE_SUM_MISMATCH")));
        assertEquals("NORMALIZED", report.getAnomalies().get(0).getActionTaken());
    }

    // Test: Import report structure
    @Test
    void testImportReportContainsRequiredFields() throws IOException {
        // Arrange
        String csv = "date,description,paid_by,amount,currency,split_type,split_with,split_details,notes\n" +
                     "01-02-2026,Test,Aisha,1500,INR,equal,Aisha;Rohan;Priya,,Test";

        MockMultipartFile file = createMockMultipartFile(csv);

        // Act
        ImportReportResponse report = csvImportService.importExpensesFromCsv(file, 1L, 1L);

        // Assert
        assertNotNull(report.getTotalRowsProcessed());
        assertNotNull(report.getSuccessfullyImported());
        assertNotNull(report.getSkippedRows());
        assertNotNull(report.getAnomaliesDetected());
        assertNotNull(report.getAnomalies());
        assertNotNull(report.getStatus());
        assertNotNull(report.getMessage());
    }

    // Test: Preview mode
    @Test
    void testPreviewModeDoesNotImport() throws IOException {
        // Arrange
        String csv = "date,description,paid_by,amount,currency,split_type,split_with,split_details,notes\n" +
                     "01-02-2026,Test,Aisha,1500,INR,equal,Aisha;Rohan;Priya,,Test";

        MockMultipartFile file = createMockMultipartFile(csv);

        // Act
        ImportReportResponse report = csvImportService.previewCsvImport(file, 1L);

        // Assert
        assertEquals("preview", report.getStatus());
        assertEquals(0, report.getSuccessfullyImported());
        assertTrue(report.getMessage().contains("Preview mode"));
    }

    // Test: Invalid amount format
    @Test
    void testInvalidAmountFormatIsSkipped() throws IOException {
        // Arrange
        String csv = "date,description,paid_by,amount,currency,split_type,split_with,split_details,notes\n" +
                     "01-02-2026,Test,Aisha,not_a_number,INR,equal,Aisha;Rohan;Priya,,Test";

        MockMultipartFile file = createMockMultipartFile(csv);

        // Act
        ImportReportResponse report = csvImportService.importExpensesFromCsv(file, 1L, 1L);

        // Assert
        assertTrue(report.getAnomalies().stream()
                .anyMatch(a -> a.getType().equals("INVALID_AMOUNT")));
    }

    private MockMultipartFile createMockMultipartFile(String content) throws IOException {
        return new MockMultipartFile(
                "file",
                "expenses.csv",
                "text/csv",
                new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8))
        );
    }
}