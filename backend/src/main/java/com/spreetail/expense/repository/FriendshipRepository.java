package com.spreetail.expense.repository;

import com.spreetail.expense.model.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    Optional<Friendship> findByUserIdAndFriendId(Long userId, Long friendId);
    List<Friendship> findByUserId(Long userId);
    List<Friendship> findByFriendId(Long friendId);
    List<Friendship> findByUserIdAndStatus(Long userId, String status);
    List<Friendship> findByFriendIdAndStatus(Long friendId, String status);
}