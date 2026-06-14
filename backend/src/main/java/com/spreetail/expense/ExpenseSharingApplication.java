package com.spreetail.expense;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main application class for Spreetail Expense Sharing Application
 * This is the entry point for the Spring Boot application
 */
@SpringBootApplication
@EnableAsync
public class ExpenseSharingApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpenseSharingApplication.class, args);
        System.out.println("Spreetail Expense Sharing Application started successfully!");
    }
}