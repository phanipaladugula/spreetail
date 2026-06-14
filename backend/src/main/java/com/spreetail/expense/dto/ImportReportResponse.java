package com.spreetail.expense.dto;

import java.util.List;

/**
 * Response DTO for CSV import report
 * Contains statistics, anomalies detected, and import results
 */
public class ImportReportResponse {

    private int totalRowsProcessed;
    private int successfullyImported;
    private int skippedRows;
    private int anomaliesDetected;
    private List<ExpenseResponse> importedExpenses;
    private List<CsvAnomaly> anomalies;
    private String status; // "success", "warning", "error"
    private String message;

    public ImportReportResponse() {
    }

    public ImportReportResponse(int totalRowsProcessed, int successfullyImported,
                               int skippedRows, int anomaliesDetected,
                               List<ExpenseResponse> importedExpenses,
                               List<CsvAnomaly> anomalies,
                               String status, String message) {
        this.totalRowsProcessed = totalRowsProcessed;
        this.successfullyImported = successfullyImported;
        this.skippedRows = skippedRows;
        this.anomaliesDetected = anomaliesDetected;
        this.importedExpenses = importedExpenses;
        this.anomalies = anomalies;
        this.status = status;
        this.message = message;
    }

    public int getTotalRowsProcessed() {
        return totalRowsProcessed;
    }

    public void setTotalRowsProcessed(int totalRowsProcessed) {
        this.totalRowsProcessed = totalRowsProcessed;
    }

    public int getSuccessfullyImported() {
        return successfullyImported;
    }

    public void setSuccessfullyImported(int successfullyImported) {
        this.successfullyImported = successfullyImported;
    }

    public int getSkippedRows() {
        return skippedRows;
    }

    public void setSkippedRows(int skippedRows) {
        this.skippedRows = skippedRows;
    }

    public int getAnomaliesDetected() {
        return anomaliesDetected;
    }

    public void setAnomaliesDetected(int anomaliesDetected) {
        this.anomaliesDetected = anomaliesDetected;
    }

    public List<ExpenseResponse> getImportedExpenses() {
        return importedExpenses;
    }

    public void setImportedExpenses(List<ExpenseResponse> importedExpenses) {
        this.importedExpenses = importedExpenses;
    }

    public List<CsvAnomaly> getAnomalies() {
        return anomalies;
    }

    public void setAnomalies(List<CsvAnomaly> anomalies) {
        this.anomalies = anomalies;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}