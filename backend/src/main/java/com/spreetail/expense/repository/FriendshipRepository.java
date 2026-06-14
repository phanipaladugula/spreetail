package com.spreetail.expense.repository;

import com.spreetail.expense.model.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Friendship entity
 * Handles database operations for friend relationships
 */
@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    /**
     * Find friendship by user ID and friend ID
     */
    Optional<Friendship> findByUserIdAndFriendId(Long userId, Long friendId);

    /**
     * Find friendship by user ID, friend ID, and status
     */
    Optional<Friendship> findByUserIdAndFriendIdAndStatus(Long userId, Long friendId, String status);

    /**
     * Find all friendships where user is the requester
     */
    List<Friendship> findByUserId(Long userId);

    /**
     * Find all friendships where user is the recipient
     */
    List<Friendship> findByFriendId(Long friendId);

    /**
     * Find all friendships where user is the requester with specific status
     */
    List<Friendship> findByUserIdAndStatus(Long userId, String status);

    /**
     * Find all friendships where user is the recipient with specific status
     */
    List<Friendship> findByFriendIdAndStatus(Long friendId, String status);
}