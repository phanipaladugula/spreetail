import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, ChevronRight, Search, ArrowUpRight } from 'lucide-react'
import { getMyGroups } from '../api/groups'
import Navbar from '../components/Navbar'
import Avatar from '../components/Avatar'
import CreateGroupModal from '../components/CreateGroupModal'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { format } from 'date-fns'

function ensureArray(val) {
  if (Array.isArray(val)) return val
  if (val && Array.isArray(val.content)) return val.content
  return []
}

export default function Groups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await getMyGroups()
      setGroups(ensureArray(res.data))
    } catch {
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = groups.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-layout">
      <Navbar />
      <main className="main-content">
        {/* Page hero */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(9,204,169,0.07) 0%, transparent 60%)',
          borderBottom: '1px solid var(--color-border)',
          padding: '2rem 0',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }} />
          <div className="container" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-green)', background: 'var(--color-green-dim)', padding: '0.2rem 0.625rem', borderRadius: '9999px', border: '1px solid rgba(9,204,169,0.25)' }}>
                  Groups
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.5rem', marginBottom: '0.25rem' }}>My Groups</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                  {groups.length === 0 ? 'Create groups to start splitting expenses' : `${groups.length} group${groups.length !== 1 ? 's' : ''} · ${groups.reduce((t, g) => t + (g.members?.length || 0), 0)} total members`}
                </p>
              </div>
              <button id="create-group-btn" className="btn btn-primary" onClick={() => setShowCreate(true)}>
                <Plus size={16} /> New Group
              </button>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '2rem 1.5rem' }}>
          {/* Search */}
          {groups.length > 0 && (
            <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: 400 }}>
              <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)', pointerEvents: 'none' }} />
              <input
                id="group-search"
                className="form-input"
                placeholder="Search groups…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          )}

          {loading ? (
            <div className="loading-center"><LoadingSpinner size="lg" /></div>
          ) : filtered.length === 0 && search ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="text-secondary">No groups match "<strong>{search}</strong>"</div>
            </div>
          ) : groups.length === 0 ? (
            <div style={{
              background: 'rgba(9,204,169,0.04)', border: '1.5px dashed rgba(9,204,169,0.2)',
              borderRadius: 'var(--radius-xl)', padding: '4rem 2rem', textAlign: 'center',
            }}>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'var(--color-green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Users size={32} style={{ color: 'var(--color-green)' }} />
              </div>
              <div className="heading-md" style={{ marginBottom: '0.5rem' }}>No groups yet</div>
              <div className="text-secondary text-sm" style={{ marginBottom: '1.5rem', maxWidth: 320, margin: '0 auto 1.5rem' }}>
                Create a group to start tracking shared expenses with friends, roommates, or colleagues.
              </div>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)} id="create-first-group-empty">
                <Plus size={16} /> Create Your First Group
              </button>
            </div>
          ) : (
            <div className="grid-3">
              {filtered.map((g) => (
                <Link
                  key={g.id} to={`/groups/${g.id}`}
                  id={`group-${g.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.375rem',
                      display: 'flex', flexDirection: 'column', gap: '1rem',
                      transition: 'all 0.2s',
                      height: '100%',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(9,204,169,0.35)'
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(9,204,169,0.1)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = ''
                      e.currentTarget.style.transform = ''
                      e.currentTarget.style.boxShadow = ''
                    }}
                  >
                    {/* Top row: icon + arrow */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 'var(--radius-md)',
                        background: 'var(--color-green-dim)', border: '1px solid rgba(9,204,169,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-green)',
                      }}>
                        {g?.name ? g.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <ChevronRight size={18} style={{ color: 'var(--color-text-dim)', marginTop: 4 }} />
                    </div>

                    {/* Name + description */}
                    <div>
                      <div className="heading-sm" style={{ marginBottom: '0.25rem' }}>{g.name}</div>
                      {g.description ? (
                        <div className="text-sm text-secondary" style={{ lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {g.description}
                        </div>
                      ) : (
                        <div className="text-sm text-dim">No description</div>
                      )}
                    </div>

                    {/* Members + count */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {(g.members || []).slice(0, 5).map((m, i) => (
                          <div key={m.userId} style={{ marginLeft: i > 0 ? -7 : 0, zIndex: 5 - i }}>
                            <Avatar name={m.username} size={30} />
                          </div>
                        ))}
                        {(g.members?.length || 0) > 5 && (
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginLeft: -7 }}>
                            +{g.members.length - 5}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                        {g.members?.length || 0} member{(g.members?.length || 0) !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Date */}
                    {g.createdAt && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                        Created {format(new Date(g.createdAt), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); load() }}
        />
      )}
    </div>
  )
}
