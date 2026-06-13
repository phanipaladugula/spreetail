package com.spreetail.expense.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Settlement Entity - Represents a settlement between users
 */
@Entity
@Table(name = "settlements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Settlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @Column(name = "from_user", nullable = false)
    private Long fromUser;

    @Column(name = "to_user", nullable = false)
    private Long toUser;

    @Column(nullable = false, precision = 12, scale = 2)
    private Double amount;

    @Column(length = 10)
    private String currency;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @PrePersist
    protected void onCreate() {
        settledAt = LocalDateTime.now();
    }
}