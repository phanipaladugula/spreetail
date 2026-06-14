import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Receipt, TrendingUp, ArrowLeftRight, Plus, Zap,
  ArrowUpRight, Wallet, BarChart3, Clock
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getMyGroups } from '../api/groups'
import { getMyExpenses } from '../api/expenses'
import Navbar from '../components/Navbar'
import Avatar from '../components/Avatar'
import LoadingSpinner from '../components/LoadingSpinner'
import { format } from 'date-fns'

function formatCurrency(amount, currency = 'INR') {
  const sym = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[currency] || currency
  return `${sym}${Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function ensureArray(val) {
  if (Array.isArray(val)) return val
  if (val && Array.isArray(val.content)) return val.content
  return []
}

const SPLIT_COLORS = {
  equal: { bg: 'rgba(9,204,169,0.12)', color: '#09cca9' },
  unequal: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  percentage: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  share: { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [grRes, expRes] = await Promise.all([getMyGroups(), getMyExpenses()])
        setGroups(ensureArray(grRes.data))
        setExpenses(ensureArray(expRes.data))
      } catch {
        setGroups([])
        setExpenses([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalSpentINR = expenses.filter(e => e.currency === 'INR').reduce((s, e) => s + (e.amount || 0), 0)
  const totalSpentUSD = expenses.filter(e => e.currency === 'USD').reduce((s, e) => s + (e.amount || 0), 0)
  const recentExpenses = expenses.slice(0, 6)
  const recentGroups = groups.slice(0, 4)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div className="page-layout">
      <Navbar />
      <main className="main-content">
        {/* Hero welcome banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(9,204,169,0.08) 0%, rgba(14,18,20,0) 60%)',
          borderBottom: '1px solid var(--color-border)',
          padding: '2rem 0',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1.5px, transparent 1.5px)',
            backgroundSize: '20px 20px',
          }} />
          <div className="container" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: 'var(--color-green)',
                    background: 'var(--color-green-dim)',
                    padding: '0.2rem 0.625rem', borderRadius: '9999px',
                    border: '1px solid rgba(9,204,169,0.25)'
                  }}>
                    Dashboard
                  </span>
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                  {greeting},{' '}
                  <span style={{ color: 'var(--color-green)' }}>{user?.username}</span> 👋
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                  {groups.length === 0
                    ? 'Welcome! Create your first group to get started.'
                    : `You're in ${groups.length} group${groups.length !== 1 ? 's' : ''} with ${expenses.length} expense${expenses.length !== 1 ? 's' : ''} tracked.`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/groups" className="btn btn-outline" id="go-to-groups-btn">
                  <Users size={15} /> My Groups
                </Link>
                <Link to="/import" className="btn btn-primary" id="go-to-import-btn">
                  <Zap size={15} /> Import CSV
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '2rem 1.5rem' }}>
          {/* Stats Row */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            {[
              {
                label: 'My Groups', value: groups.length, icon: <Users size={20} />,
                iconBg: 'var(--color-green-dim)', iconColor: 'var(--color-green)',
                sub: `${groups.filter(g => (g.members?.length || 0) > 1).length} active`
              },
              {
                label: 'Expenses Paid', value: expenses.length, icon: <Receipt size={20} />,
                iconBg: 'rgba(59,130,246,0.15)', iconColor: '#3b82f6',
                sub: `across ${new Set(expenses.map(e => e.groupId)).size} groups`
              },
              {
                label: 'Total (INR)', value: `₹${totalSpentINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
                icon: <Wallet size={20} />, iconBg: 'rgba(245,158,11,0.15)', iconColor: '#f59e0b',
                sub: 'amount paid by you'
              },
              {
                label: 'This Month', value: expenses.filter(e => {
                  const d = new Date(e.createdAt); const n = new Date()
                  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
                }).length,
                icon: <BarChart3 size={20} />, iconBg: 'rgba(239,68,68,0.15)', iconColor: '#ef4444',
                sub: 'expenses this month'
              }
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ gap: '0.75rem' }}>
                <div className="stat-icon" style={{ background: s.iconBg, color: s.iconColor }}>{s.icon}</div>
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: '0.125rem' }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.25rem' }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Recent Groups */}
            <div>
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h2 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} style={{ color: 'var(--color-green)' }} /> Groups
                </h2>
                <Link to="/groups" className="btn btn-ghost btn-sm" style={{ color: 'var(--color-green)', gap: '0.25rem' }} id="view-all-groups">
                  View all <ArrowUpRight size={13} />
                </Link>
              </div>

              {recentGroups.length === 0 ? (
                <div style={{
                  background: 'rgba(9,204,169,0.04)',
                  border: '1.5px dashed rgba(9,204,169,0.2)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                }}>
                  <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'var(--color-green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Users size={26} style={{ color: 'var(--color-green)' }} />
                  </div>
                  <div className="font-semibold" style={{ marginBottom: '0.375rem' }}>No groups yet</div>
                  <div className="text-sm text-secondary" style={{ marginBottom: '1rem' }}>Start splitting expenses by creating a group</div>
                  <Link to="/groups" className="btn btn-outline-green btn-sm" id="create-first-group">
                    <Plus size={14} /> Create Group
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {recentGroups.map((g) => (
                    <Link
                      key={g.id} to={`/groups/${g.id}`}
                      className="glass-card"
                      style={{ padding: '1rem 1.125rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.875rem', transition: 'all 0.2s' }}
                      id={`group-card-${g.id}`}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(9,204,169,0.3)'; e.currentTarget.style.transform = 'translateX(3px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = '' }}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: 'var(--radius-md)',
                        background: 'var(--color-green-dim)', border: '1px solid rgba(9,204,169,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', fontWeight: 700, color: 'var(--color-green)', flexShrink: 0,
                      }}>
                        {g?.name ? g.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="font-semibold truncate">{g.name}</div>
                        {g.description && <div className="text-xs text-secondary truncate">{g.description}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        {(g.members || []).slice(0, 3).map((m, i) => (
                          <div key={m.userId} style={{ marginLeft: i > 0 ? -6 : 0 }}>
                            <Avatar name={m.username} size={26} />
                          </div>
                        ))}
                        {(g.members?.length || 0) > 3 && (
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginLeft: -6 }}>
                            +{g.members.length - 3}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                  {groups.length > 4 && (
                    <Link to="/groups" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', color: 'var(--color-green)' }} id="show-more-groups">
                      + {groups.length - 4} more groups
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Recent Expenses */}
            <div>
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h2 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Receipt size={18} style={{ color: '#3b82f6' }} /> Recent Expenses
                </h2>
                <Link to="/expenses" className="btn btn-ghost btn-sm" style={{ color: 'var(--color-green)', gap: '0.25rem' }} id="view-all-expenses">
                  View all <ArrowUpRight size={13} />
                </Link>
              </div>

              {recentExpenses.length === 0 ? (
                <div style={{
                  background: 'rgba(59,130,246,0.04)',
                  border: '1.5px dashed rgba(59,130,246,0.2)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                }}>
                  <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Receipt size={26} style={{ color: '#3b82f6' }} />
                  </div>
                  <div className="font-semibold" style={{ marginBottom: '0.375rem' }}>No expenses yet</div>
                  <div className="text-sm text-secondary">Open a group to add your first expense</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {recentExpenses.map((exp) => {
                    const sc = SPLIT_COLORS[exp.splitType] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)' }
                    return (
                      <div key={exp.id} className="glass-card" style={{ padding: '0.875rem 1.125rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Receipt size={16} style={{ color: sc.color }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="font-medium text-sm truncate">{exp.description}</div>
                          <div className="text-xs text-secondary">
                            {exp.groupName} · <span style={{ color: sc.color }}>{exp.splitType}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div className="font-semibold text-sm" style={{ color: 'var(--color-green)' }}>
                            {formatCurrency(exp.amount, exp.currency)}
                          </div>
                          <div className="text-xs text-dim">
                            {exp.createdAt ? format(new Date(exp.createdAt), 'MMM d') : ''}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="heading-md" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} style={{ color: '#f59e0b' }} /> Quick Actions
            </h2>
            <div className="grid-3">
              {[
                {
                  to: '/groups', id: 'quick-groups',
                  icon: <Users size={22} />, iconBg: 'var(--color-green-dim)', iconColor: 'var(--color-green)',
                  title: 'Manage Groups', sub: 'Create, view & edit groups',
                  border: 'rgba(9,204,169,0.15)'
                },
                {
                  to: '/expenses', id: 'quick-expenses',
                  icon: <Receipt size={22} />, iconBg: 'rgba(59,130,246,0.15)', iconColor: '#3b82f6',
                  title: 'My Expenses', sub: 'Track what you\'ve paid',
                  border: 'rgba(59,130,246,0.15)'
                },
                {
                  to: '/import', id: 'quick-import',
                  icon: <Zap size={22} />, iconBg: 'rgba(245,158,11,0.15)', iconColor: '#f59e0b',
                  title: 'Import CSV', sub: 'Bulk-import expenses from file',
                  border: 'rgba(245,158,11,0.15)'
                },
              ].map(a => (
                <Link
                  key={a.to} to={a.to} id={a.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.375rem',
                    background: 'var(--color-surface)', border: `1px solid ${a.border}`,
                    borderRadius: 'var(--radius-lg)', textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                >
                  <div style={{ width: 46, height: 46, borderRadius: 'var(--radius-md)', background: a.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.iconColor, flexShrink: 0 }}>
                    {a.icon}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ marginBottom: '0.125rem' }}>{a.title}</div>
                    <div className="text-xs text-secondary">{a.sub}</div>
                  </div>
                  <ArrowUpRight size={16} style={{ marginLeft: 'auto', color: 'var(--color-text-dim)' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
