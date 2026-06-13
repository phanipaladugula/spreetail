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

@Service
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    public FriendshipService(FriendshipRepository friendshipRepository,
                             UserRepository userRepository) {
        this.friendshipRepository = friendshipRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public FriendResponse sendFriendRequest(Long currentUserId, String friendEmail) {
        // Find friend by email
        User friend = userRepository.findByEmail(friendEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + friendEmail));

        // Check if already friends or request exists
        Optional<Friendship> existing = friendshipRepository.findByUserIdAndFriendId(currentUserId, friend.getId());
        if (existing.isPresent()) {
            throw new RuntimeException("Friend request already exists or you are already friends");
        }

        // Also check reverse
        existing = friendshipRepository.findByUserIdAndFriendId(friend.getId(), currentUserId);
        if (existing.isPresent()) {
            throw new RuntimeException("Friend request already exists");
        }

        // Create friendship request
        Friendship friendship = new Friendship(currentUserId, friend.getId());
        friendship = friendshipRepository.save(friendship);

        return convertToResponse(friendship, friend);
    }

    @Transactional
    public FriendResponse acceptFriendRequest(Long currentUserId, Long requestId) {
        Friendship friendship = friendshipRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        if (!friendship.getFriendId().equals(currentUserId)) {
            throw new RuntimeException("You can only accept requests sent to you");
        }

        friendship.setStatus("accepted");
        friendship.setAcceptedAt(LocalDateTime.now());
        friendship = friendshipRepository.save(friendship);

        User user = userRepository.findById(friendship.getUserId()).orElse(null);
        return convertToResponse(friendship, user);
    }

    @Transactional
    public void declineFriendRequest(Long currentUserId, Long requestId) {
        Friendship friendship = friendshipRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        if (!friendship.getFriendId().equals(currentUserId)) {
            throw new RuntimeException("You can only decline requests sent to you");
        }

        friendship.setStatus("declined");
        friendshipRepository.save(friendship);
    }

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