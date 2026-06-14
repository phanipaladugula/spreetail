import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Plus, ArrowLeft, ArrowRight, Users, Receipt, ArrowLeftRight,
  TrendingUp, CheckCircle, Info, Wallet, Clock, AlertCircle
} from 'lucide-react'
import { getGroup, leaveGroup } from '../api/groups'
import { getGroupExpenses } from '../api/expenses'
import { getGroupBalances, getSettlementSuggestions, getGroupSettlements } from '../api/settlements'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Avatar from '../components/Avatar'
import AddExpenseModal from '../components/AddExpenseModal'
import SettlementModal from '../components/SettlementModal'
import AddMemberModal from '../components/AddMemberModal'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { format } from 'date-fns'

function ensureArray(val) {
  if (Array.isArray(val)) return val
  if (val && Array.isArray(val.content)) return val.content
  return []
}

function formatAmount(amount, currency = 'INR') {
  const sym = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[currency] || currency
  return `${sym}${Math.abs(Number(amount) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

const SPLIT_META = {
  equal:      { label: 'Equal',      bg: 'rgba(9,204,169,0.12)',   color: '#09cca9' },
  unequal:    { label: 'Custom',     bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6' },
  percentage: { label: 'Percent',    bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  share:      { label: 'Shares',     bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
}

function SplitPill({ type }) {
  const m = SPLIT_META[type] || { label: type, bg: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)' }
  return (
    <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '9999px', background: m.bg, color: m.color, letterSpacing: '0.02em' }}>
      {m.label}
    </span>
  )
}

const TABS = [
  { key: 'Expenses', icon: <Receipt size={15} /> },
  { key: 'Balances', icon: <Wallet size={15} /> },
  { key: 'Settlements', icon: <ArrowLeftRight size={15} /> },
]

export default function GroupDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Expenses')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [settleSuggestion, setSettleSuggestion] = useState(null)
  const [showSettleManual, setShowSettleManual] = useState(false)

  const load = async () => {
    try {
      const [grRes, expRes, balRes, sugRes, setRes, actRes] = await Promise.all([
        getGroup(id),
        getGroupExpenses(id),
        getGroupBalances(id),
        getSettlementSuggestions(id),
        getGroupSettlements(id),
        api.get(`/activities/group/${id}`)
      ])
      
      const groupData = grRes.data?.data || grRes.data || grRes;
      setGroup(groupData)
      setExpenses(ensureArray(expRes.data))
      setBalances(ensureArray(balRes.data))
      setSuggestions(ensureArray(sugRes.data))
      setSettlements(ensureArray(setRes.data))
      setActivities(ensureArray(actRes.data))
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleLeaveGroup = async () => {
    if (window.confirm("Are you sure you want to leave this group? Your historical balances will remain active until settled.")) {
      try {
        await leaveGroup(id);
        window.location.href = '/groups';
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to leave group');
      }
    }
  }

  if (loading) return <LoadingSpinner fullPage />

  if (!group) return (
    <div className="page-layout">
      <Navbar />
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: 'var(--color-text-dim)', margin: '0 auto 1rem' }} />
          <div className="heading-md" style={{ marginBottom: '1rem' }}>Group not found</div>
          <Link to="/groups" className="btn btn-outline"><ArrowLeft size={15} /> Back to Groups</Link>
        </div>
      </main>
    </div>
  )

  const myBalance = balances.find(b => b.userId === user?.id)
  const totalGroupSpend = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)

  return (
    <div className="page-layout">
      <Navbar />
      <main className="main-content">
        {/* Group hero header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(9,204,169,0.07) 0%, transparent 60%)',
          borderBottom: '1px solid var(--color-border)',
          padding: '1.75rem 0',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }} />
          <div className="container" style={{ position: 'relative' }}>
            <Link to="/groups" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, marginBottom: '1rem', color: 'var(--color-text-secondary)' }} id="back-to-groups">
              <ArrowLeft size={15} /> Groups
            </Link>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--radius-md)',
                  background: 'var(--color-green-dim)', border: '1px solid rgba(9,204,169,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-green)', flexShrink: 0,
                }}>
                  {group?.name ? group.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h1 style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{group.name}</h1>
                  {group.description && <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{group.description}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {(group.members || []).map((m, i) => (
                      <div key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Avatar name={m.username} size={22} />
                        <span style={{ fontSize: '0.8125rem', color: m.userId === user?.id ? 'var(--color-green)' : 'var(--color-text-secondary)', fontWeight: m.userId === user?.id ? 600 : 400 }}>
                          {m.username}
                          {m.status === 'inactive' && <span style={{ marginLeft: '4px', fontSize: '0.65rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1px 4px', borderRadius: '4px' }}>Left</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button id="leave-group-btn" className="btn btn-outline" style={{ borderColor: 'transparent', color: 'var(--color-text-dim)' }} onClick={handleLeaveGroup}>
                  Leave
                </button>
                <button id="add-member-btn" className="btn btn-outline" onClick={() => setShowAddMember(true)}>
                  <Plus size={15} /> Add Member
                </button>
                <button id="settle-manual-btn" className="btn btn-outline" onClick={() => setShowSettleManual(true)}>
                  <ArrowLeftRight size={15} /> Record Payment
                </button>
                <button id="add-expense-btn" className="btn btn-primary" onClick={() => setShowAddExpense(true)}>
                  <Plus size={15} /> Add Expense
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '2rem 1.5rem' }}>
          {/* Summary cards */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Total Expenses</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{expenses.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.25rem' }}>in this group</div>
            </div>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Group Spend</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-green)' }}>{formatAmount(totalGroupSpend)}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.25rem' }}>total recorded</div>
            </div>
            <div style={{
              background: myBalance && myBalance.netBalance > 0 ? 'rgba(9,204,169,0.06)' : myBalance && myBalance.netBalance < 0 ? 'rgba(239,68,68,0.06)' : 'var(--color-surface)',
              border: `1px solid ${myBalance && myBalance.netBalance > 0 ? 'rgba(9,204,169,0.2)' : myBalance && myBalance.netBalance < 0 ? 'rgba(239,68,68,0.2)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-lg)', padding: '1.25rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Your Balance</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: myBalance?.netBalance > 0 ? 'var(--color-green)' : myBalance?.netBalance < 0 ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
                {myBalance ? (myBalance.netBalance > 0 ? `+${formatAmount(myBalance.netBalance)}` : myBalance.netBalance < 0 ? `-${formatAmount(myBalance.netBalance)}` : 'Settled') : '-'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.25rem' }}>
                {myBalance?.netBalance > 0 ? 'you are owed' : myBalance?.netBalance < 0 ? 'you owe' : 'all settled up'}
              </div>
            </div>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Settlements</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: suggestions.length > 0 ? '#f59e0b' : 'var(--color-success)' }}>{suggestions.length > 0 ? suggestions.length : '✓'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.25rem' }}>{suggestions.length > 0 ? 'pending payments' : 'all settled'}</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--color-bg-3)', borderRadius: 'var(--radius-md)', padding: '0.25rem', width: 'fit-content', marginBottom: '1.5rem' }}>
            {TABS.map(({ key, icon }) => (
              <button
                key={key}
                id={`tab-${key.toLowerCase()}`}
                onClick={() => setActiveTab(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.5rem 1.125rem', borderRadius: 'var(--radius-sm)',
                  border: 'none', fontFamily: 'var(--font-primary)', fontSize: '0.875rem', fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: activeTab === key ? 'var(--color-surface-2)' : 'transparent',
                  color: activeTab === key ? 'var(--color-green)' : 'var(--color-text-secondary)',
                }}
              >
                {icon}
                {key}
                {key === 'Expenses' && expenses.length > 0 && (
                  <span style={{ fontSize: '0.7rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '9999px', padding: '0 0.4rem', color: 'var(--color-text-secondary)' }}>
                    {expenses.length}
                  </span>
                )}
                {key === 'Settlements' && suggestions.length > 0 && (
                  <span style={{ fontSize: '0.7rem', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '9999px', padding: '0 0.4rem', color: '#f59e0b' }}>
                    {suggestions.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── EXPENSES TAB ── */}
          {activeTab === 'Expenses' && (
            <div>
              {expenses.length === 0 ? (
                <div style={{ background: 'rgba(59,130,246,0.04)', border: '1.5px dashed rgba(59,130,246,0.2)', borderRadius: 'var(--radius-xl)', padding: '3.5rem', textAlign: 'center' }}>
                  <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-lg)', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                    <Receipt size={28} style={{ color: '#3b82f6' }} />
                  </div>
                  <div className="heading-md" style={{ marginBottom: '0.5rem' }}>No expenses yet</div>
                  <div className="text-secondary text-sm" style={{ marginBottom: '1.25rem' }}>Add your first expense to start tracking.</div>
                  <button className="btn btn-primary" onClick={() => setShowAddExpense(true)} id="add-first-expense">
                    <Plus size={15} /> Add Expense
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {expenses.map((exp) => {
                    const meta = SPLIT_META[exp.splitType] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)' }
                    const isMe = exp.paidBy === user?.id
                    return (
                      <div
                        key={exp.id} id={`expense-${exp.id}`}
                        style={{
                          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-lg)', padding: '1.125rem 1.375rem',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateX(2px)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = '' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                          {/* Colored type indicator */}
                          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Receipt size={18} style={{ color: meta.color }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{exp.description}</span>
                              <SplitPill type={exp.splitType} />
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                              Paid by{' '}
                              <span style={{ color: isMe ? 'var(--color-green)' : 'var(--color-text)', fontWeight: 600 }}>
                                {exp.paidByUsername}{isMe ? ' (you)' : ''}
                              </span>
                              {exp.notes && <span style={{ color: 'var(--color-text-dim)' }}> · {exp.notes}</span>}
                            </div>
                            {exp.createdAt && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Clock size={11} /> {format(new Date(exp.createdAt), 'MMM d, yyyy · h:mm a')}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-green)' }}>
                              {formatAmount(exp.amount, exp.currency)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>{exp.currency}</div>
                          </div>
                        </div>
                        {/* Splits breakdown */}
                        {exp.splits && exp.splits.length > 0 && (
                          <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {exp.splits.map((s) => (
                              <div key={s.userId} style={{
                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                padding: '0.25rem 0.625rem', borderRadius: '9999px',
                                background: s.userId === user?.id ? 'var(--color-green-dim)' : 'var(--color-surface-2)',
                                border: `1px solid ${s.userId === user?.id ? 'rgba(9,204,169,0.2)' : 'var(--color-border)'}`,
                                fontSize: '0.75rem', fontWeight: 500,
                                color: s.userId === user?.id ? 'var(--color-green)' : 'var(--color-text-secondary)',
                              }}>
                                <Avatar name={s.username} size={16} />
                                {s.username}: {formatAmount(s.shareAmount, exp.currency)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── BALANCES TAB ── */}
          {activeTab === 'Balances' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {balances.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                  <TrendingUp size={40} style={{ margin: '0 auto 1rem', color: 'var(--color-text-dim)' }} />
                  <div className="font-semibold">No balances yet</div>
                  <div className="text-sm" style={{ marginTop: '0.25rem' }}>Add expenses to see the balance breakdown.</div>
                </div>
              ) : balances.map((b) => {
                const isPos = b.netBalance > 0, isNeg = b.netBalance < 0
                return (
                  <div
                    key={b.userId} id={`balance-${b.userId}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                      padding: '1.25rem 1.375rem',
                      background: isPos ? 'rgba(9,204,169,0.04)' : isNeg ? 'rgba(239,68,68,0.04)' : 'var(--color-surface)',
                      border: `1px solid ${isPos ? 'rgba(9,204,169,0.15)' : isNeg ? 'rgba(239,68,68,0.15)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <Avatar name={b.username} size={40} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                        {b.username}
                        {b.userId === user?.id && <span style={{ color: 'var(--color-green)', fontWeight: 400, fontSize: '0.8125rem' }}> (you)</span>}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>
                        Paid {formatAmount(b.totalToReceive || 0)} · Owes {formatAmount(b.totalOwed || 0)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.125rem', color: isPos ? 'var(--color-green)' : isNeg ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
                        {isPos ? `+${formatAmount(b.netBalance)}` : isNeg ? `-${formatAmount(b.netBalance)}` : 'Settled ✓'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>
                        {isPos ? 'to receive' : isNeg ? 'to pay' : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── SETTLEMENTS TAB ── */}
          {activeTab === 'Settlements' && (
            <div>
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Info size={15} style={{ color: '#f59e0b' }} />
                    </div>
                    <h3 style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Suggested Settlements</h3>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', padding: '0.15rem 0.5rem', borderRadius: '9999px', border: '1px solid rgba(245,158,11,0.25)' }}>
                      {suggestions.length} pending
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                          padding: '1rem 1.375rem',
                          background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)',
                          borderRadius: 'var(--radius-lg)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <Avatar name={s.fromUsername} size={34} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.fromUsername}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>pays</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 32, height: 2, background: 'rgba(245,158,11,0.4)', borderRadius: 1 }} />
                          <ArrowRight size={14} style={{ color: '#f59e0b' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <Avatar name={s.toUsername} size={34} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.toUsername}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>receives</div>
                          </div>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f59e0b' }}>
                            {formatAmount(s.amount, s.currency)}
                          </span>
                          <button
                            id={`settle-btn-${i}`}
                            className="btn btn-primary btn-sm"
                            onClick={() => setSettleSuggestion(s)}
                          >
                            Settle →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settlement History */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--color-success-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={15} style={{ color: 'var(--color-success)' }} />
                </div>
                <h3 style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Settlement History</h3>
                {settlements.length > 0 && (
                  <span style={{ fontSize: '0.75rem', background: 'var(--color-success-dim)', color: 'var(--color-success)', padding: '0.15rem 0.5rem', borderRadius: '9999px', border: '1px solid rgba(34,197,94,0.25)' }}>
                    {settlements.length} recorded
                  </span>
                )}
              </div>
              {settlements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)', background: 'var(--color-bg-3)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <CheckCircle size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--color-text-dim)' }} />
                  <div className="font-medium">No settlements recorded yet</div>
                  <div className="text-sm" style={{ marginTop: '0.25rem' }}>Once payments are made, they'll appear here.</div>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlements.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Avatar name={s.fromUsername} size={24} />
                              <span>{s.fromUsername}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Avatar name={s.toUsername} size={24} />
                              <span>{s.toUsername}</span>
                            </div>
                          </td>
                          <td><span style={{ fontWeight: 600, color: 'var(--color-green)' }}>{formatAmount(s.amount, s.currency)}</span></td>
                          <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                            {s.settledAt ? format(new Date(s.settledAt), 'MMM d, yyyy') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {showAddExpense && (
        <AddExpenseModal group={group} onClose={() => setShowAddExpense(false)} onSuccess={load} />
      )}
      {showAddMember && (
        <AddMemberModal group={group} onClose={() => setShowAddMember(false)} onSuccess={load} />
      )}
      {(settleSuggestion || showSettleManual) && (
        <SettlementModal
          groupId={Number(id)}
          suggestion={settleSuggestion}
          members={group.members || []}
          onClose={() => { setSettleSuggestion(null); setShowSettleManual(false) }}
          onSuccess={() => { setSettleSuggestion(null); setShowSettleManual(false); load() }}
        />
      )}
    </div>
  )
}
