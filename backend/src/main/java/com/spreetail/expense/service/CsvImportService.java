package com.spreetail.expense.service;

import com.spreetail.expense.dto.CreateExpenseRequest;
import com.spreetail.expense.dto.CsvImportRequest;
import com.spreetail.expense.dto.ExpenseResponse;
import com.spreetail.expense.model.Expense;
import com.spreetail.expense.model.GroupMember;
import com.spreetail.expense.model.User;
import com.spreetail.expense.repository.GroupMemberRepository;
import com.spreetail.expense.repository.UserRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Reader;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class CsvImportService {

    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ExpenseService expenseService;

    public CsvImportService(UserRepository userRepository,
                            GroupMemberRepository groupMemberRepository,
                            ExpenseService expenseService) {
        this.userRepository = userRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.expenseService = expenseService;
    }

    public List<ExpenseResponse> importExpensesFromCsv(MultipartFile file, Long groupId, Long currentUserId) throws Exception {
        List<CreateExpenseRequest> expenses = parseCsvFile(file, groupId);

        List<ExpenseResponse> importedExpenses = new ArrayList<>();
        for (CreateExpenseRequest expenseRequest : expenses) {
            try {
                ExpenseResponse response = expenseService.createExpense(expenseRequest, currentUserId);
                importedExpenses.add(response);
            } catch (Exception e) {
                System.err.println("Failed to import expense: " + expenseRequest.getDescription() + " - " + e.getMessage());
            }
        }

        return importedExpenses;
    }

    private List<CreateExpenseRequest> parseCsvFile(MultipartFile file, Long groupId) throws Exception {
        List<CreateExpenseRequest> expenses = new ArrayList<>();

        try (Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                     .withFirstRecordAsHeader()
                     .withIgnoreHeaderCase()
                     .withTrim())) {

            for (CSVRecord record : csvParser) {
                CreateExpenseRequest request = new CreateExpenseRequest();

                // Parse fields
                request.setGroupId(groupId);
                request.setDescription(getFieldValue(record, "description"));

                // Parse amount
                String amountStr = getFieldValue(record, "amount").replace(",", "");
                if (amountStr != null && !amountStr.isEmpty()) {
                    request.setAmount(Double.parseDouble(amountStr));
                }

                // Currency
                String currency = getFieldValue(record, "currency");
                request.setCurrency(currency != null && !currency.isEmpty() ? currency : "INR");

                // Split type
                String splitType = getFieldValue(record, "split_type");
                request.setSplitType(splitType != null && !splitType.isEmpty() ? splitType : "equal");

                // Notes
                request.setNotes(getFieldValue(record, "notes"));

                // Get paid by user
                String paidByName = getFieldValue(record, "paid_by");
                if (paidByName != null && !paidByName.isEmpty()) {
                    Long paidByUserId = findUserIdByName(paidByName);
                    request.setPaidByUserId(paidByUserId);
                }

                // Parse split with
                String splitWithStr = getFieldValue(record, "split_with");
                List<Long> splitWith = parseUserList(splitWithStr);
                request.setSplitWith(splitWith);

                // Parse split details
                String splitDetailsRaw = getFieldValue(record, "split_details");
                Map<String, Double> splitDetails = parseSplitDetails(splitDetailsRaw);
                request.setSplitDetails(splitDetails);

                expenses.add(request);
            }
        }

        return expenses;
    }

    private String getFieldValue(CSVRecord record, String fieldName) {
        try {
            String value = record.get(fieldName);
            return value != null ? value.trim() : "";
        } catch (IllegalArgumentException e) {
            return "";
        }
    }

    private Long findUserIdByName(String name) {
        // Try exact match first
        User user = userRepository.findByUsername(name).orElse(null);
        if (user != null) {
            return user.getId();
        }

        // Try case-insensitive match
        List<User> users = userRepository.findAll();
        for (User u : users) {
            if (u.getUsername().equalsIgnoreCase(name)) {
                return u.getId();
            }
        }

        return null;
    }

    private List<Long> parseUserList(String userListStr) {
        List<Long> userIds = new ArrayList<>();

        if (userListStr == null || userListStr.isEmpty()) {
            return userIds;
        }

        // Parse semicolon-separated usernames like "Aisha;Rohan;Priya;Meera"
        String[] names = userListStr.split(";");

        for (String name : names) {
            name = name.trim();
            if (!name.isEmpty()) {
                Long userId = findUserIdByName(name);
                if (userId != null) {
                    userIds.add(userId);
                }
            }
        }

        return userIds;
    }

    private Map<String, Double> parseSplitDetails(String splitDetailsRaw) {
        Map<String, Double> details = new HashMap<>();

        if (splitDetailsRaw == null || splitDetailsRaw.isEmpty()) {
            return details;
        }

        // Parse format like "Rohan 700; Priya 400; Meera 400"
        String[] parts = splitDetailsRaw.split(";");

        for (String part : parts) {
            part = part.trim();
            if (!part.isEmpty()) {
                String[] keyValue = part.split("\\s+", 2);
                if (keyValue.length == 2) {
                    String name = keyValue[0].trim();
                    String valueStr = keyValue[1].trim();

                    Long userId = findUserIdByName(name);
                    if (userId != null) {
                        try {
                            Double value = Double.parseDouble(valueStr.replace("%", ""));
                            details.put(userId.toString(), value);
                        } catch (NumberFormatException e) {
                            // Skip invalid values
                        }
                    }
                }
            }
        }

        return details;
    }
}