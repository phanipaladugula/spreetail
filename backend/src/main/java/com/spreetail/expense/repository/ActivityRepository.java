package com.spreetail.expense.repository;

import com.spreetail.expense.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Activity> findByActionOrderByCreatedAtDesc(String action);

    @Query("SELECT a FROM Activity a WHERE a.entityType = ?1 AND a.entityId = ?2 ORDER BY a.createdAt DESC")
    List<Activity> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId);

    @Query("SELECT a FROM Activity a WHERE a.userId IN ?1 ORDER BY a.createdAt DESC")
    List<Activity> findByUserIdsOrderByCreatedAtDesc(List<Long> userIds);
}