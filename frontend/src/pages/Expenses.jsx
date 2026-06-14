import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, ArrowUpRight, Search, Wallet, BarChart3, Calendar, ArrowLeftRight } from 'lucide-react'
import { getMyExpenses } from '../api/expenses'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import Avatar from '../components/Avatar'
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
  equal:      { label: 'Equal',   bg: 'rgba(9,204,169,0.12)',   color: '#09cca9' },
  unequal:    { label: 'Custom',  bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6' },
  percentage: { label: 'Percent', bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  share:      { label: 'Shares',  bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCurrency, setFilterCurrency] = useState('all')
  const [filterSplit, setFilterSplit] = useState('all')

  useEffect(() => {
    async function load() {
      try {
        const res = await getMyExpenses()
        setExpenses(ensureArray(res.data))
      } catch {
        setExpenses([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const currencies = ['all', ...new Set(expenses.map(e => e.currency).filter(Boolean))]
  const splitTypes = ['all', ...new Set(expenses.map(e => e.splitType).filter(Boolean))]

  const filtered = expenses.filter(e => {
    const matchSearch = !search || e.description?.toLowerCase().includes(search.toLowerCase()) || e.groupName?.toLowerCase().includes(search.toLowerCase()) || e.notes?.toLowerCase().includes(search.toLowerCase())
    const matchCurrency = filterCurrency === 'all' || e.currency === filterCurrency
    const matchSplit = filterSplit === 'all' || e.splitType === filterSplit
    return matchSearch && matchCurrency && matchSplit
  })

  const totalINR = expenses.filter(e => e.currency === 'INR').reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const totalUSD = expenses.filter(e => e.currency === 'USD').reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.createdAt), n = new Date()
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
  })
  const uniqueGroups = new Set(expenses.map(e => e.groupId)).size

  return (
    <div className="page-layout">
      <Navbar />
      <main className="main-content">
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.07) 0%, transparent 60%)', borderBottom: '1px solid var(--color-border)', padding: '2rem 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }} />
          <div className="container" style={{ position: 'relative' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#3b82f6', background: 'rgba(59,130,246,0.12)', padding: '0.2rem 0.625rem', borderRadius: '9999px', border: '1px solid rgba(59,130,246,0.25)' }}>
              My Expenses
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.5rem', marginBottom: '0.25rem' }}>Expenses Paid by You</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
              {expenses.length === 0 ? 'No expenses yet — add expenses from a group.' : `${expenses.length} expense${expenses.length !== 1 ? 's' : ''} across ${uniqueGroups} group${uniqueGroups !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="container" style={{ padding: '2rem 1.5rem' }}>
          {/* Stats */}
          {!loading && expenses.length > 0 && (
            <div className="grid-4" style={{ marginBottom: '2rem' }}>
              {[
                { label: 'Total Expenses', value: expenses.length, icon: <Receipt size={20} />, iconBg: 'rgba(59,130,246,0.15)', iconColor: '#3b82f6', sub: `${uniqueGroups} groups` },
                { label: 'Total Paid (INR)', value: `₹${totalINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: <Wallet size={20} />, iconBg: 'var(--color-green-dim)', iconColor: 'var(--color-green)', sub: 'rupee expenses' },
                { label: 'Total Paid (USD)', value: `$${totalUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, icon: <ArrowLeftRight size={20} />, iconBg: 'rgba(245,158,11,0.15)', iconColor: '#f59e0b', sub: 'dollar expenses' },
                { label: 'This Month', value: thisMonth.length, icon: <Calendar size={20} />, iconBg: 'rgba(139,92,246,0.15)', iconColor: '#8b5cf6', sub: `₹${thisMonth.filter(e => e.currency === 'INR').reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon" style={{ background: s.iconBg, color: s.iconColor }}>{s.icon}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.125rem' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          {!loading && expenses.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 0 }}>
                <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)', pointerEvents: 'none' }} />
                <input
                  id="expense-search"
                  className="form-input"
                  placeholder="Search expenses…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              <select id="filter-currency" className="form-input form-select" value={filterCurrency} onChange={e => setFilterCurrency(e.target.value)} style={{ width: 'auto', minWidth: 110 }}>
                {currencies.map(c => <option key={c} value={c}>{c === 'all' ? 'All Currencies' : c}</option>)}
              </select>
              <select id="filter-split" className="form-input form-select" value={filterSplit} onChange={e => setFilterSplit(e.target.value)} style={{ width: 'auto', minWidth: 130 }}>
                {splitTypes.map(t => <option key={t} value={t}>{t === 'all' ? 'All Split Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              {(search || filterCurrency !== 'all' || filterSplit !== 'all') && (
                <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterCurrency('all'); setFilterSplit('all') }} id="clear-filters">
                  Clear filters
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="loading-center"><LoadingSpinner size="lg" /></div>
          ) : expenses.length === 0 ? (
            <div style={{ background: 'rgba(59,130,246,0.04)', border: '1.5px dashed rgba(59,130,246,0.2)', borderRadius: 'var(--radius-xl)', padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Receipt size={32} style={{ color: '#3b82f6' }} />
              </div>
              <div className="heading-md" style={{ marginBottom: '0.5rem' }}>No expenses yet</div>
              <div className="text-secondary text-sm" style={{ marginBottom: '1.25rem' }}>Open a group and add expenses to track them here.</div>
              <Link to="/groups" className="btn btn-primary" id="go-groups-from-expenses">
                <ArrowUpRight size={15} /> Go to Groups
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-secondary)' }}>
              No expenses match your filters.{' '}
              <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterCurrency('all'); setFilterSplit('all') }}>Clear filters</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {filtered.map((exp) => {
                const meta = SPLIT_META[exp.splitType] || { label: exp.splitType, bg: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)' }
                return (
                  <div
                    key={exp.id} id={`expense-row-${exp.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                      padding: '1rem 1.375rem',
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateX(2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = '' }}
                  >
                    {/* Type icon */}
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Receipt size={17} style={{ color: meta.color }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
                        <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.description}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: meta.bg, color: meta.color, flexShrink: 0 }}>
                          {meta.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                        <span>{exp.groupName}</span>
                        {exp.notes && <span style={{ color: 'var(--color-text-dim)' }}>· {exp.notes}</span>}
                        {exp.createdAt && <span style={{ color: 'var(--color-text-dim)' }}>· {format(new Date(exp.createdAt), 'MMM d, yyyy')}</span>}
                      </div>
                    </div>

                    {/* Amount */}
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'auto' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-green)' }}>
                        {formatAmount(exp.amount, exp.currency)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>{exp.currency}</div>
                    </div>

                    {/* Link */}
                    <Link
                      to={`/groups/${exp.groupId}`}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }}
                      id={`view-group-${exp.groupId}`}
                      title="View group"
                    >
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
