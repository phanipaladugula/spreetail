package com.spreetail.expense;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application class for Spreetail Expense Sharing Application
 * This is the entry point for the Spring Boot application
 */
@SpringBootApplication
public class ExpenseSharingApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpenseSharingApplication.class, args);
        System.out.println("Spreetail Expense Sharing Application started successfully!");
    }
}