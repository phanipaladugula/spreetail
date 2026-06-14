package com.spreetail.expense.exception;

/**
 * Exception thrown for bad request parameters
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}