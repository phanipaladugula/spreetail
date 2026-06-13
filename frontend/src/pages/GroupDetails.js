import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [showSettle, setShowSettle] = useState(false);

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
      setExpenses(expensesData);
      setBalances(balancesData);
      setSuggestions(suggestionsData);
      setSettlements(settlementsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const memberIds = group.members.map(m => m.userId);
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
      alert(error);
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
      alert(error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!group) {
    return <div className="error">Group not found</div>;
  }

  return (
    <div className="group-details">
      <header className="header">
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">← Back</button>
        <h1>{group.name}</h1>
        <div></div>
      </header>

      <div className="tabs">
        <button className={activeTab === 'expenses' ? 'active' : ''} onClick={() => setActiveTab('expenses')}>
          Expenses
        </button>
        <button className={activeTab === 'balances' ? 'active' : ''} onClick={() => setActiveTab('balances')}>
          Balances
        </button>
        <button className={activeTab === 'settlements' ? 'active' : ''} onClick={() => setActiveTab('settlements')}>
          Settlements
        </button>
      </div>

      <div className="content">
        {activeTab === 'expenses' && (
          <div className="expenses-section">
            <div className="section-header">
              <h2>Expenses</h2>
              <button onClick={() => setShowAddExpense(true)} className="btn btn-primary">Add Expense</button>
            </div>

            {showAddExpense && (
              <div className="modal">
                <form onSubmit={handleAddExpense} className="expense-form">
                  <h3>Add Expense</h3>
                  <div className="form-group">
                    <label>Description:</label>
                    <input
                      type="text"
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Split Type:</label>
                    <select
                      value={expenseForm.splitType}
                      onChange={(e) => setExpenseForm({ ...expenseForm, splitType: e.target.value })}
                    >
                      <option value="equal">Equal</option>
                      <option value="unequal">Unequal</option>
                      <option value="percentage">Percentage</option>
                      <option value="share">Share</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Notes (optional):</label>
                    <input
                      type="text"
                      value={expenseForm.notes}
                      onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowAddExpense(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Add</button>
                  </div>
                </form>
              </div>
            )}

            {expenses.length === 0 ? (
              <div className="empty-state">No expenses yet</div>
            ) : (
              <div className="expenses-list">
                {expenses.map(expense => (
                  <div key={expense.id} className="expense-card">
                    <div className="expense-header">
                      <h3>{expense.description}</h3>
                      <span className="amount">₹{expense.amount}</span>
                    </div>
                    <p>Paid by {expense.paidByUsername}</p>
                    <p className="split-type">Split: {expense.splitType}</p>
                    {expense.notes && <p className="notes">{expense.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'balances' && (
          <div className="balances-section">
            <h2>Balances</h2>
            <div className="balances-list">
              {balances.map(balance => (
                <div key={balance.userId} className="balance-card">
                  <h3>{balance.username}</h3>
                  {balance.netBalance > 0 ? (
                    <p className="positive">Gets back ₹{balance.netBalance.toFixed(2)}</p>
                  ) : balance.netBalance < 0 ? (
                    <p className="negative">Owes ₹{Math.abs(balance.netBalance).toFixed(2)}</p>
                  ) : (
                    <p className="settled">Settled up</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settlements' && (
          <div className="settlements-section">
            <h2>Settlements</h2>

            {suggestions.length > 0 && (
              <div className="suggestions">
                <h3>Suggested Settlements</h3>
                {suggestions.map((s, index) => (
                  <div key={index} className="suggestion-card">
                    <p>{s.fromUsername} should pay {s.toUsername}: ₹{s.amount.toFixed(2)}</p>
                    <button onClick={() => handleRecordSettlement(s)} className="btn btn-primary">Mark as Paid</button>
                  </div>
                ))}
              </div>
            )}

            {settlements.length > 0 && (
              <div className="settlements-history">
                <h3>Settlement History</h3>
                {settlements.map(settlement => (
                  <div key={settlement.id} className="settlement-card">
                    <p>{settlement.fromUsername} paid {settlement.toUsername}: ₹{settlement.amount}</p>
                    <p className="date">{new Date(settlement.settledAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupDetails;