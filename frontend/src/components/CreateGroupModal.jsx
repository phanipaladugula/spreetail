import { useState } from 'react'
import { X, Search } from 'lucide-react'
import { createGroup } from '../api/groups'
import { getMe } from '../api/auth'
import api from '../api'
import toast from 'react-hot-toast'

export default function CreateGroupModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [memberEmail, setMemberEmail] = useState('')
  const [members, setMembers] = useState([])
  const [searching, setSearching] = useState(false)

  const searchUser = async () => {
    if (!memberEmail.trim()) return
    setSearching(true)
    try {
      // Search by email using auth/search endpoint or try to find user
      const res = await api.get(`/users/search?email=${encodeURIComponent(memberEmail.trim())}`)
      const found = res.data
      if (members.find((m) => m.id === found.id)) {
        toast('User already added')
      } else {
        setMembers((prev) => [...prev, found])
        setMemberEmail('')
        toast.success(`Added ${found.username}`)
      }
    } catch {
      toast.error('User not found. They must be registered first.')
    } finally {
      setSearching(false)
    }
  }

  const removeMember = (id) => setMembers((prev) => prev.filter((m) => m.id !== id))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Group name is required')

    setLoading(true)
    try {
      await createGroup({
        name: form.name.trim(),
        description: form.description.trim(),
        memberIds: members.map((m) => m.id),
      })
      toast.success('Group created!')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up">
        <div className="modal-header">
          <div className="heading-md">Create New Group</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} id="close-create-group">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Group Name *</label>
              <input
                id="group-name"
                className="form-input"
                placeholder="e.g. Goa Trip, Apartment"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                id="group-description"
                className="form-input form-textarea"
                placeholder="What's this group for?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Add Members (by email)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="member-email-input"
                  className="form-input"
                  placeholder="member@email.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchUser())}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  id="add-member-btn"
                  className="btn btn-outline-green"
                  onClick={searchUser}
                  disabled={searching}
                >
                  {searching ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Search size={16} />}
                  Add
                </button>
              </div>
            </div>

            {members.length > 0 && (
              <div className="form-group">
                <label className="form-label">Members to Add</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {members.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        background: 'var(--color-green-dim)',
                        border: '1px solid rgba(9,204,169,0.2)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <span className="text-sm font-medium text-green">{m.username} <span className="text-secondary">({m.email})</span></span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon"
                        onClick={() => removeMember(m.id)}
                        id={`remove-member-${m.id}`}
                        style={{ color: 'var(--color-danger)' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} id="cancel-create-group">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="submit-create-group">
              {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : null}
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
