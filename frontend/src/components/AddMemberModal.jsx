import { useState } from 'react'
import { X, UserPlus, Mail } from 'lucide-react'
import { addMemberByEmail } from '../api/groups'
import toast from 'react-hot-toast'

export default function AddMemberModal({ group, onClose, onSuccess }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    try {
      await addMemberByEmail(group.id, email)
      toast.success('Member added successfully!')
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={20} style={{ color: 'var(--color-green)' }} />
            </div>
            <div>
              <h2 className="heading-sm" style={{ marginBottom: '0.125rem' }}>Add Member</h2>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>to {group.name}</div>
            </div>
          </div>
          <button className="btn btn-ghost" style={{ padding: '0.5rem', marginTop: '-0.5rem', marginRight: '-0.5rem' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="member-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }} />
              <input
                id="member-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="user@spreetail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.5rem', lineHeight: 1.5 }}>
              The user must already have a Spreetail Expense Sharing account. If they don't, ask them to register first.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !email}>
              {loading ? <span className="spinner" /> : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
