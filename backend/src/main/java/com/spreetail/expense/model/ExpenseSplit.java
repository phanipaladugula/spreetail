package com.spreetail.expense.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ExpenseSplit Entity - Represents how an expense is split among users
 */
@Entity
@Table(name = "expense_splits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSplit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    @Column(name = "expense_id", insertable = false, updatable = false)
    private Long expenseId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "share_amount", precision = 12)
    private Double shareAmount;

    @Column(name = "share_percentage", precision = 5)
    private Double sharePercentage;

    @Column
    private Integer shares;

    public ExpenseSplit(Expense expense, Long userId) {
        this.expense = expense;
        this.expenseId = expense.getId();
        this.userId = userId;
    }
}