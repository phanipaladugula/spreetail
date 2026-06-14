import { useState } from 'react'
import { X, ArrowRight } from 'lucide-react'
import { recordSettlement } from '../api/settlements'
import toast from 'react-hot-toast'

export default function SettlementModal({ groupId, suggestion, members, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fromUserId: suggestion?.fromUserId || '',
    toUserId: suggestion?.toUserId || '',
    amount: suggestion?.amount || '',
    currency: suggestion?.currency || 'INR',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.fromUserId || !form.toUserId) return toast.error('Select both users')
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount')

    setLoading(true)
    try {
      await recordSettlement({
        groupId,
        fromUserId: Number(form.fromUserId),
        toUserId: Number(form.toUserId),
        amount: Number(form.amount),
        currency: form.currency,
      })
      toast.success('Settlement recorded!')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record settlement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up">
        <div className="modal-header">
          <div className="heading-md">Record Settlement</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} id="close-settlement-modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {suggestion && (
              <div className="glass-card-green" style={{ padding: '1rem', marginBottom: '0.5rem' }}>
                <div className="text-sm text-secondary" style={{ marginBottom: '0.25rem' }}>Suggested Settlement</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="font-semibold">{suggestion.fromUsername}</span>
                  <ArrowRight size={16} style={{ color: 'var(--color-green)' }} />
                  <span className="font-semibold">{suggestion.toUsername}</span>
                  <span className="badge badge-green" style={{ marginLeft: 'auto' }}>
                    {suggestion.currency} {suggestion.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Paid By (From) *</label>
                <select
                  id="settlement-from"
                  className="form-input form-select"
                  value={form.fromUserId}
                  onChange={(e) => setForm({ ...form, fromUserId: e.target.value })}
                >
                  <option value="">Select user...</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.username}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Paid To *</label>
                <select
                  id="settlement-to"
                  className="form-input form-select"
                  value={form.toUserId}
                  onChange={(e) => setForm({ ...form, toUserId: e.target.value })}
                >
                  <option value="">Select user...</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.username}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Amount *</label>
                <input
                  id="settlement-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select
                  id="settlement-currency"
                  className="form-input form-select"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                >
                  {['INR', 'USD', 'EUR', 'GBP'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} id="cancel-settlement">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="submit-settlement">
              {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : null}
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
