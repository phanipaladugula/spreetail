package com.spreetail.expense.service;

import com.spreetail.expense.dto.LoginResponse;
import com.spreetail.expense.dto.UserRegisterRequest;
import com.spreetail.expense.dto.UserResponse;
import com.spreetail.expense.model.User;
import com.spreetail.expense.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service class for User operations
 * This is the service layer in MCSA architecture
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /**
     * Register a new user
     */
    public UserResponse registerUser(UserRegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Save user to database
        User savedUser = userRepository.save(user);

        // Convert to response DTO
        return convertToUserResponse(savedUser);
    }

    /**
     * Login user and return JWT token
     */
    public LoginResponse loginUser(String email, String password) {
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Check password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtService.generateToken(user.getEmail());

        // Return login response
        return new LoginResponse(token, convertToUserResponse(user));
    }

    /**
     * Get user by ID
     */
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToUserResponse(user);
    }

    /**
     * Get user by email
     */
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToUserResponse(user);
    }

    /**
     * Helper method to convert User to UserResponse
     */
    private UserResponse convertToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }

    /**
     * Update user profile
     * @param currentEmail Current user's email
     * @param request UserProfileUpdateRequest with new values
     * @return UserProfileResponse with updated profile
     * @throws RuntimeException if validation fails or unauthorized
     */
    @Transactional
    public UserProfileResponse updateProfile(String currentEmail, UserProfileUpdateRequest request) {
        // Get current user
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update username if provided
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            String newUsername = request.getUsername().trim();

            // Check if username already taken by another user
            userRepository.findByUsername(newUsername).ifPresent(otherUser -> {
                if (!otherUser.getId().equals(user.getId())) {
                    throw new RuntimeException("Username already taken");
                }
            });

            user.setUsername(newUsername);
        }

        // Update email if provided
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().trim();

            // Check if email already taken by another user
            userRepository.findByEmail(newEmail).ifPresent(otherUser -> {
                if (!otherUser.getId().equals(user.getId())) {
                    throw new RuntimeException("Email already registered");
                }
            });

            user.setEmail(newEmail);
        }

        // Update password if requested
        if (request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty()) {
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                throw new RuntimeException("Passwords do not match");
            }

            if (request.getNewPassword().trim().length() < 6) {
                throw new RuntimeException("Password must be at least 6 characters");
            }

            user.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        }

        // Validate current password if email is being changed
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().trim().isEmpty()) {
                throw new RuntimeException("Current password is required to change email");
            }

            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }
        }

        // Save updated user
        User savedUser = userRepository.save(user);

        // Return updated profile
        return new UserProfileResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getCreatedAt().toString()
        );
    }

    /**
     * Get user email from JWT token
     */
    public String getUserEmailFromToken(String token) {
        return jwtService.extractEmail(token);
    }
}