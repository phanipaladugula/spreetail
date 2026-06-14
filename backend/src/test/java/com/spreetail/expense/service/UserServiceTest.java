package com.spreetail.expense.service;

import com.spreetail.expense.dto.*;
import com.spreetail.expense.model.User;
import com.spreetail.expense.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Tests for UserService
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private UserService userService;

    private UserRegisterRequest registerRequest;
    private UserLoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder, jwtService);

        registerRequest = new UserRegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");

        loginRequest = new UserLoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
    }

    @Test
    void testRegisterUserSavesNewUser() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        UserResponse response = userService.registerUser(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals("test@example.com", response.getEmail());
    }

    @Test
    void testRegisterUserWithDuplicateEmailThrowsException() {
        // Arrange
        User existingUser = new User();
        existingUser.setEmail("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> userService.registerUser(registerRequest));
    }

    @Test
    void testLoginUserWithValidCredentialsReturnsToken() {
        // Arrange
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("encoded_password");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encoded_password")).thenReturn(true);
        when(jwtService.generateToken("test@example.com")).thenReturn("jwt-token-123");

        // Act
        LoginResponse response = userService.loginUser(loginRequest);

        // Assert
        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("jwt-token-123", response.getToken());
        assertEquals("testuser", response.getUser().getUsername());
    }

    @Test
    void testLoginUserWithInvalidCredentialsThrowsException() {
        // Arrange
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("encoded_password");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "encoded_password")).thenReturn(false);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> userService.loginUser(loginRequest));
    }

    @Test
    void testLoginUserWithNonExistentEmailThrowsException() {
        // Arrange
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> userService.loginUser(loginRequest));
    }

    @Test
    void testGetUserByIdReturnsUser() {
        // Arrange
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // Act
        UserResponse response = userService.getUserById(1L);

        // Assert
        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
    }

    @Test
    void testGetUserByIdWithInvalidIdThrowsException() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> userService.getUserById(999L));
    }

    @Test
    void testGetUserByEmailReturnsUser() {
        // Arrange
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        // Act
        UserResponse response = userService.getUserByEmail("test@example.com");

        // Assert
        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail());
    }

    @Test
    void testGetEmailFromTokenExtractsEmail() {
        // Arrange
        when(jwtService.extractEmail("jwt-token-123")).thenReturn("test@example.com");

        // Act
        String email = userService.getUserEmailFromToken("jwt-token-123");

        // Assert
        assertEquals("test@example.com", email);
    }
}