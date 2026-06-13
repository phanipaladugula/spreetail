package com.spreetail.expense.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * GroupMember Entity - Represents membership of a user in a group
 */
@Entity
@Table(name = "group_members")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @Column(name = "group_id", insertable = false, updatable = false)
    private Long groupId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Column(length = 20)
    private String status;

    public GroupMember(Group group, Long userId) {
        this.group = group;
        this.groupId = group.getId();
        this.userId = userId;
        this.status = "active";
        this.joinedAt = LocalDateTime.now();
    }
}