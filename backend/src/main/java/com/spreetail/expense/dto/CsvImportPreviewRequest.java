package com.spreetail.expense.dto;

import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

/**
 * Request DTO for previewing CSV import without actually importing
 */
public class CsvImportPreviewRequest {

    private Long groupId;
    private MultipartFile file;
    private Boolean autoImport; // If true, import immediately; if false, just preview

    public CsvImportPreviewRequest() {
        this.autoImport = false;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }

    public Boolean getAutoImport() {
        return autoImport;
    }

    public void setAutoImport(Boolean autoImport) {
        this.autoImport = autoImport;
    }
}