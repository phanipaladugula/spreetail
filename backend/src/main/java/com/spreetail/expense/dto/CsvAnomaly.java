package com.spreetail.expense.dto;

/**
 * Represents a data anomaly detected during CSV import
 * This is used to surface problems to the user before or during import
 */
public class CsvAnomaly {

    private int rowNumber;
    private String type;
    private String description;
    private String fieldName;
    private String fieldValue;
    private String actionTaken;
    private String policy;

    public CsvAnomaly(int rowNumber, String type, String description, String fieldName,
                     String fieldValue, String actionTaken, String policy) {
        this.rowNumber = rowNumber;
        this.type = type;
        this.description = description;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
        this.actionTaken = actionTaken;
        this.policy = policy;
    }

    public int getRowNumber() {
        return rowNumber;
    }

    public void setRowNumber(int rowNumber) {
        this.rowNumber = rowNumber;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getFieldValue() {
        return fieldValue;
    }

    public void setFieldValue(String fieldValue) {
        this.fieldValue = fieldValue;
    }

    public String getActionTaken() {
        return actionTaken;
    }

    public void setActionTaken(String actionTaken) {
        this.actionTaken = actionTaken;
    }

    public String getPolicy() {
        return policy;
    }

    public void setPolicy(String policy) {
        this.policy = policy;
    }
}