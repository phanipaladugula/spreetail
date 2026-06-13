import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../api';
import './GroupDetails.css';

function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    splitType: 'equal',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [groupId]);

  const loadData = async () => {
    try {
      const [groupData, expensesData, balancesData, suggestionsData, settlementsData] = await Promise.all([
        api.getGroup(groupId),
        api.getGroupExpenses(groupId),
        api.getGroupBalances(groupId),
        api.getSettlementSuggestions(groupId),
        api.getGroupSettlements(groupId)
      ]);
      setGroup(groupData);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setBalances(Array.isArray(balancesData) ? balancesData : []);
      setSuggestions(Array.isArray(suggestionsData) ? suggestionsData : []);
      setSettlements(Array.isArray(settlementsData) ? settlementsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const memberIds = group.members?.map(m => m.userId) || [];
      await api.createExpense({
        groupId: parseInt(groupId),
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        currency: 'INR',
        splitType: expenseForm.splitType,
        splitWith: memberIds,
        splitDetails: {},
        notes: expenseForm.notes
      });
      setShowAddExpense(false);
      setExpenseForm({ description: '', amount: '', splitType: 'equal', notes: '' });
      loadData();
    } catch (error) {
      alert('Failed to add expense: ' + (error.message || 'Unknown error'));
    }
  };

  const handleRecordSettlement = async (suggestion) => {
    try {
      await api.recordSettlement({
        groupId: parseInt(groupId),
        fromUserId: suggestion.fromUserId,
        toUserId: suggestion.toUserId,
        amount: suggestion.amount,
        currency: 'INR'
      });
      loadData();
    } catch (error) {
      alert('Failed to record settlement: ' + (error.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading group...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📂</div>
        <h2>Group not found</h2>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="group-details">
      <header className="group-header">
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary btn-sm">
          ← Back
        </button>
        <div className="group-title">
          <h1>{group.name}</h1>
          {group.description && <p>{group.description}</p>}
        </div>
        <div className="group-stats">
          <div className="stat">
            <div className="stat-label">Members</div>
            <div className="stat-value">{group.members?.length || 0}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Expenses</div>
            <div className="stat-value">{expenses.length}</div>
          </div>
        </div>
      </header>

      <nav className="group-tabs">
        <button
          className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          💰 Expenses
        </button>
        <button
          className={`tab ${activeTab === 'balances' ? 'active' : ''}`}
          onClick={() => setActiveTab('balances')}
        >
          ⚖️ Balances
        </button>
        <button
          className={`tab ${activeTab === 'settlements' ? 'active' : ''}`}
          onClick={() => setActiveTab('settlements')}
        >
          🤝 Settlements
        </button>
      </nav>

      <div className="content">
        {activeTab === 'expenses' && (
          <div className="expenses-section">
            <div className="section-header">
              <h2>Expenses</h2>
              <button onClick={() => setShowAddExpense(true)} className="btn btn-primary">
                + Add Expense
              </button>
            </div>

            {showAddExpense && (
              <div className="modal-overlay" onClick={() => setShowAddExpense(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Add Expense</h2>
                    <button className="modal-close" onClick={() => setShowAddExpense(false)}>&times;</button>
                  </div>
                  <form onSubmit={handleAddExpense} className="modal-body">
                    <div className="form-group">
                      <label htmlFor="description">Description *</label>
                      <input
                        type="text"
                        id="description"
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                        placeholder="e.g., Groceries"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="amount">Amount *</label>
                      <input
                        type="number"
                        id="amount"
                        step="0.01"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="splitType">Split Type *</label>
                      <select
                        id="splitType"
                        value={expenseForm.splitType}
                        onChange={(e) => setExpenseForm({ ...expenseForm, splitType: e.target.value })}
                      >
                        <option value="equal">Equal Split</option>
                        <option value="unequal">Unequal Split</option>
                        <option value="percentage">Percentage Split</option>
                        <option value="share">Share Split</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="notes">Notes (optional)</label>
                      <input
                        type="text"
                        id="notes"
                        value={expenseForm.notes}
                        onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                        placeholder="Any additional details"
                      />
                    </div>
                  </form>
                  <div className="modal-footer">
                    <button
                      type="button"
                      onClick={() => setShowAddExpense(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Expense
                    </button>
                  </div>
                </div>
              </div>
            )}

            {expenses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💰</div>
                <h2>No expenses yet</h2>
                <p>Add your first expense to start tracking!</p>
              </div>
            ) : (
              <div className="expenses-list">
                {expenses.map(expense => (
                  <div key={expense.id} className="expense-card">
                    <div className="expense-header">
                      <div className="expense-icon">💰</div>
                      <div className="expense-info">
                        <h3>{expense.description}</h3>
                        <p className="expense-paid-by">Paid by <strong>{expense.paidByUsername}</strong></p>
                      </div>
                      <div className="expense-amount">₹{expense.amount?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div className="expense-meta">
                      <span className="badge badge-secondary">{expense.splitType} split</span>
                      <span className="expense-date">{new Date(expense.createdAt).toLocaleDateString()}</span>
                    </div>
                    {expense.notes && (
                      <p className="expense-notes">📝 {expense.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'balances' && (
          <div className="balances-section">
            <h2>Balance Summary</h2>
            <div className="balances-list">
              {balances.map(balance => (
                <div key={balance.userId} className="balance-card">
                  <div className="balance-header">
                    <div className="balance-icon">
                      {balance.netBalance > 0 ? '💰' : balance.netBalance < 0 ? '💸' : '✓'}
                    </div>
                    <h3>{balance.username}</h3>
                  </div>
                  <div className="balance-details">
                    <div className="balance-row">
                      <span>Owes:</span>
                        <span className={balance.totalOwed > 0 ? 'text-danger' : ''}>
                          ₹{balance.totalOwed?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    <div className="balance-row">
                      <span>Gets back:</span>
                      <span className={balance.totalToReceive > 0 ? 'text-success' : ''}>
                        ₹{balance.totalToReceive?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="balance-total">
                      <span>Net:</span>
                        {balance.netBalance > 0 ? (
                          <span className="text-success">+₹{balance.netBalance.toFixed(2)}</span>
                        ) : balance.netBalance < 0 ? (
                          <span className="text-danger">-₹{Math.abs(balance.netBalance).toFixed(2)}</span>
                        ) : (
                          <span className="text-secondary">₹0.00</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        )}

        {activeTab === 'settlements' && (
          <div className="settlements-section">
            <h2>Settlements</h2>

            {suggestions.length > 0 && (
              <div className="settlement-suggestions">
                <h3>Suggested Payments</h3>
                <div className="suggestions-list">
                  {suggestions.map((s, index) => (
                    <div key={index} className="suggestion-card">
                      <div className="suggestion-info">
                        <p>
                          <strong>{s.fromUsername}</strong> should pay{' '}
                          <strong>{s.toUsername}</strong>:
                        </p>
                        <p className="suggestion-amount">₹{s.amount?.toFixed(2) || '0.00'}</p>
                      </div>
                      <button
                        onClick={() => handleRecordSettlement(s)}
                        className="btn btn-success btn-sm"
                      >
                        Mark as Paid
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suggestions.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <h2>All Settled Up!</h2>
                <p>No payments are currently owed.</p>
              </div>
            )}

            {settlements.length > 0 && (
              <div className="settlements-history">
                <h3>Settlement History</h3>
                <div className="settlements-list">
                  {settlements.map(settlement => (
                    <div key={settlement.id} className="settlement-card">
                      <div className="settlement-info">
                        <p>
                          <strong>{settlement.fromUsername}</strong> paid{' '}
                          <strong>{settlement.toUsername}</strong>
                        </p>
                        <p className="settlement-amount">₹{settlement.amount?.toFixed(2) || '0.00'}</p>
                        <p className="settlement-date">{new Date(settlement.settledAt).toLocaleString()}</p>
                      </div>
                      <span className="badge badge-success">✓ Paid</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupDetails;