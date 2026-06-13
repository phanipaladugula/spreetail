package com.spreetail.expense.dto;

import java.util.List;

public class CsvImportRequest {
    private Long groupId;
    private List<CsvExpenseRow> expenses;

    public CsvImportRequest() {}

    public CsvImportRequest(Long groupId, List<CsvExpenseRow> expenses) {
        this.groupId = groupId;
        this.expenses = expenses;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public List<CsvExpenseRow> getExpenses() {
        return expenses;
    }

    public void setExpenses(List<CsvExpenseRow> expenses) {
        this.expenses = expenses;
    }

    public static class CsvExpenseRow {
        private String date;
        private String description;
        private String paidBy;
        private Double amount;
        private String currency;
        private String splitType;
        private List<Long> splitWith;
        private String splitDetailsRaw;
        private String notes;

        public CsvExpenseRow() {}

        public CsvExpenseRow(String date, String description, String paidBy, Double amount,
                            String currency, String splitType, List<Long> splitWith,
                            String splitDetailsRaw, String notes) {
            this.date = date;
            this.description = description;
            this.paidBy = paidBy;
            this.amount = amount;
            this.currency = currency;
            this.splitType = splitType;
            this.splitWith = splitWith;
            this.splitDetailsRaw = splitDetailsRaw;
            this.notes = notes;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getPaidBy() {
            return paidBy;
        }

        public void setPaidBy(String paidBy) {
            this.paidBy = paidBy;
        }

        public Double getAmount() {
            return amount;
        }

        public void setAmount(Double amount) {
            this.amount = amount;
        }

        public String getCurrency() {
            return currency;
        }

        public void setCurrency(String currency) {
            this.currency = currency;
        }

        public String getSplitType() {
            return splitType;
        }

        public void setSplitType(String splitType) {
            this.splitType = splitType;
        }

        public List<Long> getSplitWith() {
            return splitWith;
        }

        public void setSplitWith(List<Long> splitWith) {
            this.splitWith = splitWith;
        }

        public String getSplitDetailsRaw() {
            return splitDetailsRaw;
        }

        public void setSplitDetailsRaw(String splitDetailsRaw) {
            this.splitDetailsRaw = splitDetailsRaw;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }
}