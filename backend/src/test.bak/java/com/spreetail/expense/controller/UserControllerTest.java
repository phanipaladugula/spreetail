package com.spreetail.expense.controller;

import com.spreetail.expense.dto.*;
import com.spreetail.expense.service.JwtService;
import com.spreetail.expense.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Tests for UserController
 */
@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @InjectMocks
    private UserController userController;

    @Mock
    private UserService userService;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserRegisterRequest registerRequest;
    private UserLoginRequest loginRequest;
    private UserResponse userResponse;
    private LoginResponse loginResponse;

    @BeforeEach
    void setUp() {
        registerRequest = new UserRegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");

        loginRequest = new UserLoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        userResponse = new UserResponse(1L, "testuser", "test@example.com", "2024-01-01");

        loginResponse = new LoginResponse("jwt-token-123", userResponse);
    }

    @Test
    void testRegisterUserReturns201() {
        // Arrange
        when(userService.registerUser(any(UserRegisterRequest.class))).thenReturn(userResponse);

        // Act
        ResponseEntity<?> response = userController.registerUser(registerRequest);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void testLoginUserReturnsToken() {
        // Arrange
        when(userService.loginUser(anyString(), anyString())).thenReturn(loginResponse);

        // Act
        ResponseEntity<?> response = userController.loginUser(loginRequest);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void testGetCurrentUserReturnsUser() {
        // Arrange
        when(userService.getUserByEmail(anyString())).thenReturn(userResponse);

        // Act
        ResponseEntity<?> response = userController.getCurrentUser("Bearer jwt-token-123");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testGetCurrentUserWithoutTokenFails() {
        // Act
        ResponseEntity<?> response = userController.getCurrentUser(null);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}