package com.spreetail.expense.service;

import com.spreetail.expense.dto.FriendResponse;
import com.spreetail.expense.model.Friendship;
import com.spreetail.expense.model.User;
import com.spreetail.expense.repository.FriendshipRepository;
import com.spreetail.expense.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Friendship operations
 * Handles friend requests, acceptance, declining, and friendship management
 */
@Service
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    public FriendshipService(FriendshipRepository friendshipRepository,
                             UserRepository userRepository) {
        this.friendshipRepository = friendshipRepository;
        this.userRepository = userRepository;
    }

    /**
     * Send a friend request to another user
     * @param currentUserId ID of the user sending the request
     * @param friendEmail Email of the user to befriend
     * @return FriendResponse with friendship details
     * @throws RuntimeException if user not found, already friends, or request exists
     */
    @Transactional
    public FriendResponse sendFriendRequest(Long currentUserId, String friendEmail) {
        // Validate friend email is not empty
        if (friendEmail == null || friendEmail.trim().isEmpty()) {
            throw new RuntimeException("Friend email is required");
        }

        // Check if trying to add self as friend
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        if (currentUser.getEmail().equalsIgnoreCase(friendEmail.trim())) {
            throw new RuntimeException("You cannot add yourself as a friend");
        }

        // Find friend by email
        User friend = userRepository.findByEmail(friendEmail.trim())
                .orElseThrow(() -> new RuntimeException("User with email '" + friendEmail + "' not found. Please ask them to register first."));

        // Check if already friends
        Optional<Friendship> existingAccepted = friendshipRepository.findByUserIdAndFriendIdAndStatus(
                currentUserId, friend.getId(), "accepted");
        if (existingAccepted.isPresent()) {
            throw new RuntimeException("You are already friends with " + friend.getUsername());
        }

        // Check if pending request exists
        Optional<Friendship> existingRequest = friendshipRepository.findByUserIdAndFriendIdAndStatus(
                currentUserId, friend.getId(), "pending");
        if (existingRequest.isPresent()) {
            throw new RuntimeException("Friend request already sent to " + friend.getUsername());
        }

        // Check if incoming request exists
        existingRequest = friendshipRepository.findByUserIdAndFriendIdAndStatus(
                friend.getId(), currentUserId, "pending");
        if (existingRequest.isPresent()) {
            throw new RuntimeException("You already have a pending friend request from " + friend.getUsername());
        }

        // Create friendship request
        Friendship friendship = new Friendship(currentUserId, friend.getId());
        friendship.setStatus("pending");
        friendship.setCreatedAt(LocalDateTime.now());
        friendship = friendshipRepository.save(friendship);

        return convertToResponse(friendship, friend);
    }

    /**
     * Accept a friend request
     * @param currentUserId ID of the user accepting the request
     * @param requestId ID of the friendship request
     * @return FriendResponse with updated friendship details
     * @throws RuntimeException if request not found or not authorized
     */
    @Transactional
    public FriendResponse acceptFriendRequest(Long currentUserId, Long requestId) {
        Friendship friendship = friendshipRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        // Verify the request was sent to this user
        if (!friendship.getFriendId().equals(currentUserId)) {
            throw new RuntimeException("You can only accept requests sent to you");
        }

        // Update friendship status
        friendship.setStatus("accepted");
        friendship.setAcceptedAt(LocalDateTime.now());
        friendship = friendshipRepository.save(friendship);

        // Get the user who sent the request
        User user = userRepository.findById(friendship.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return convertToResponse(friendship, user);
    }

    /**
     * Decline a friend request
     * @param currentUserId ID of the user declining the request
     * @param requestId ID of the friendship request
     * @throws RuntimeException if request not found or not authorized
     */
    @Transactional
    public void declineFriendRequest(Long currentUserId, Long requestId) {
        Friendship friendship = friendshipRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        // Verify the request was sent to this user
        if (!friendship.getFriendId().equals(currentUserId)) {
            throw new RuntimeException("You can only decline requests sent to you");
        }

        friendship.setStatus("declined");
        friendshipRepository.save(friendship);
    }

    /**
     * Get all accepted friends for a user
     * @param currentUserId ID of the user
     * @return List of FriendResponse objects
     */
    public List<FriendResponse> getFriends(Long currentUserId) {
        List<FriendResponse> friends = new ArrayList<>();

        // Get friendships where user is the requester and status is accepted
        List<Friendship> sent = friendshipRepository.findByUserIdAndStatus(currentUserId, "accepted");
        for (Friendship f : sent) {
            User friend = userRepository.findById(f.getFriendId()).orElse(null);
            if (friend != null) {
                friends.add(convertToResponse(f, friend));
            }
        }

        // Get friendships where user is the recipient and status is accepted
        List<Friendship> received = friendshipRepository.findByFriendIdAndStatus(currentUserId, "accepted");
        for (Friendship f : received) {
            User friend = userRepository.findById(f.getUserId()).orElse(null);
            if (friend != null) {
                friends.add(convertToResponse(f, friend));
            }
        }

        return friends;
    }

    /**
     * Get all pending friend requests for a user
     * @param currentUserId ID of the user
     * @return List of FriendResponse objects with pending status
     */
    public List<FriendResponse> getPendingRequests(Long currentUserId) {
        List<FriendResponse> requests = new ArrayList<>();

        // Get pending requests where user is the recipient
        List<Friendship> pending = friendshipRepository.findByFriendIdAndStatus(currentUserId, "pending");
        for (Friendship f : pending) {
            User user = userRepository.findById(f.getUserId()).orElse(null);
            if (user != null) {
                requests.add(convertToResponse(f, user));
            }
        }

        return requests;
    }

    /**
     * Convert Friendship entity to FriendResponse DTO
     * @param friendship The friendship entity
     * @param friendUser The friend user entity
     * @return FriendResponse DTO
     */
    private FriendResponse convertToResponse(Friendship friendship, User friendUser) {
        if (friendUser == null) {
            return null;
        }
        return new FriendResponse(
                friendship.getId(),
                friendship.getUserId(),
                friendship.getFriendId(),
                friendUser.getUsername(),
                friendUser.getEmail(),
                friendship.getStatus(),
                friendship.getCreatedAt(),
                friendship.getAcceptedAt()
        );
    }
}