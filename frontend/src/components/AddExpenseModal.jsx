import { useState, useEffect } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import { createExpense } from '../api/expenses'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const SPLIT_TYPES = [
  { value: 'equal', label: '⚖️ Equal Split' },
  { value: 'unequal', label: '✏️ Custom Amounts' },
  { value: 'percentage', label: '% Percentage' },
  { value: 'share', label: '🔢 Shares' },
]

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY']

export default function AddExpenseModal({ group, onClose, onSuccess }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    currency: 'INR',
    splitType: 'equal',
    notes: '',
  })
  const [selectedMembers, setSelectedMembers] = useState(
    (group.members || []).map((m) => m.userId)
  )
  const [splitDetails, setSplitDetails] = useState({})

  const members = group.members || []

  useEffect(() => {
    // Init split details when type changes
    const init = {}
    selectedMembers.forEach((id) => { init[id] = '' })
    setSplitDetails(init)
  }, [form.splitType, selectedMembers.length])

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.description.trim()) return toast.error('Description is required')
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return toast.error('Enter a valid amount')
    if (selectedMembers.length === 0) return toast.error('Select at least one member')

    // Validate split details
    let details = {}
    if (form.splitType !== 'equal') {
      for (const id of selectedMembers) {
        const val = parseFloat(splitDetails[id])
        if (!val || isNaN(val)) return toast.error('Fill in all split values')
        details[id] = val
      }
      if (form.splitType === 'percentage') {
        const sum = Object.values(details).reduce((a, b) => a + b, 0)
        if (Math.abs(sum - 100) > 0.01) return toast.error(`Percentages must sum to 100 (currently ${sum.toFixed(1)})`)
      }
      if (form.splitType === 'unequal') {
        const sum = Object.values(details).reduce((a, b) => a + b, 0)
        if (Math.abs(sum - Number(form.amount)) > 0.01) {
          return toast.error(`Amounts must sum to ${form.amount} (currently ${sum.toFixed(2)})`)
        }
      }
    }

    setLoading(true)
    try {
      await createExpense({
        groupId: group.id,
        description: form.description.trim(),
        amount: Number(form.amount),
        currency: form.currency,
        splitType: form.splitType,
        splitWith: selectedMembers,
        splitDetails: details,
        notes: form.notes.trim(),
      })
      toast.success('Expense added!')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  const memberName = (userId) =>
    members.find((m) => m.userId === userId)?.username || `User ${userId}`

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg animate-slide-up">
        <div className="modal-header">
          <div>
            <div className="heading-md">Add Expense</div>
            <div className="text-sm text-secondary">{group.name}</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} id="close-expense-modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ gap: '1.25rem' }}>
            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description *</label>
              <input
                id="expense-description"
                className="form-input"
                placeholder="e.g. Dinner at restaurant"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                autoFocus
              />
            </div>

            {/* Amount + Currency */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Amount *</label>
                <input
                  id="expense-amount"
                  className="form-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select
                  id="expense-currency"
                  className="form-input form-select"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Split Type */}
            <div className="form-group">
              <label className="form-label">Split Type</label>
              <div className="split-type-grid">
                {SPLIT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    id={`split-type-${t.value}`}
                    className={`split-type-btn ${form.splitType === t.value ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, splitType: t.value })}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Members */}
            <div className="form-group">
              <label className="form-label">Split With *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {members.map((m) => (
                  <label key={m.userId} className={`member-checkbox ${selectedMembers.includes(m.userId) ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(m.userId)}
                      onChange={() => toggleMember(m.userId)}
                      id={`member-cb-${m.userId}`}
                    />
                    <span className="text-sm font-medium" style={{ flex: 1 }}>
                      {m.username}
                      {m.userId === user?.id && <span className="text-secondary"> (you)</span>}
                    </span>
                    {/* Unequal / percentage / share input */}
                    {form.splitType !== 'equal' && selectedMembers.includes(m.userId) && (
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder={form.splitType === 'percentage' ? '%' : form.splitType === 'share' ? 'shares' : 'amount'}
                        className="form-input"
                        style={{ width: 100, padding: '0.3rem 0.625rem', fontSize: '0.8125rem' }}
                        value={splitDetails[m.userId] || ''}
                        onChange={(e) => setSplitDetails({ ...splitDetails, [m.userId]: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        id={`split-detail-${m.userId}`}
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea
                id="expense-notes"
                className="form-input form-textarea"
                placeholder="Any additional notes..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} id="cancel-expense">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="submit-expense">
              {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : null}
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
