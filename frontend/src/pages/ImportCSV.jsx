import { useState, useRef, useEffect } from 'react'
import {
  Upload, FileText, CheckCircle, AlertTriangle, XCircle,
  ChevronDown, ChevronUp, Eye, Download, RotateCcw, Zap
} from 'lucide-react'
import { getMyGroups } from '../api/groups'
import { importCSV } from '../api/import'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

function ensureArray(val) {
  if (Array.isArray(val)) return val
  if (val && Array.isArray(val.content)) return val.content
  return []
}

function formatAmount(amount, currency = 'INR') {
  const sym = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[currency] || currency
  return `${sym}${Math.abs(Number(amount) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

const ANOMALY_LABELS = {
  EMPTY_FIELD: 'Empty Field', ZERO_AMOUNT: 'Zero Amount', NEGATIVE_AMOUNT: 'Negative Amount',
  INVALID_CURRENCY: 'Invalid Currency', INVALID_SPLIT_TYPE: 'Invalid Split Type',
  SETTLEMENT_AS_EXPENSE: 'Settlement Expense', USER_NOT_FOUND: 'User Not Found',
  NO_SPLIT_USERS: 'No Split Users', USER_NOT_IN_GROUP: 'Not in Group',
  SPLIT_SUM_MISMATCH: 'Split Mismatch', PERCENTAGE_SUM_MISMATCH: 'Percent Mismatch',
  DUPLICATE_IN_CSV: 'CSV Duplicate', DUPLICATE_IN_DATABASE: 'DB Duplicate',
  INVALID_AMOUNT_FORMAT: 'Invalid Amount', PARSING_ERROR: 'Parse Error',
}

const ACTION_META = {
  SKIPPED:                { label: 'Skipped', bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
  DEFAULT_TO_INR:         { label: 'Defaulted to INR', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  DEFAULT_TO_EQUAL:       { label: 'Defaulted to Equal', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  REFUND_SPLIT_REVERSED:  { label: 'Reversed Split', bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  PROPORTIONALLY_ADJUSTED:{ label: 'Adjusted', bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  NORMALIZED:             { label: 'Normalized', bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  REMOVE_FROM_SPLIT:      { label: 'Removed from Split', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  DUPLICATE_SKIPPED:      { label: 'Duplicate Skipped', bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
}

const SPLIT_META = {
  equal:      { bg: 'rgba(9,204,169,0.12)',   color: '#09cca9' },
  unequal:    { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6' },
  percentage: { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  share:      { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
}

function StepIndicator({ step }) {
  const steps = ['Upload & Configure', 'Preview & Review', 'Import Complete']
  const active = step === 'upload' ? 0 : step === 'preview' ? 1 : 2
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2.5rem' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.875rem', fontWeight: 700,
              background: i < active ? 'var(--color-green)' : i === active ? 'var(--color-green)' : 'var(--color-surface-2)',
              color: i <= active ? '#0e1214' : 'var(--color-text-dim)',
              boxShadow: i === active ? '0 0 0 4px rgba(9,204,169,0.15)' : 'none',
              transition: 'all 0.3s',
            }}>
              {i < active ? <CheckCircle size={16} style={{ color: '#0e1214' }} /> : i + 1}
            </div>
            <span style={{
              fontSize: '0.8125rem', fontWeight: i === active ? 600 : 400,
              color: i <= active ? 'var(--color-text)' : 'var(--color-text-dim)',
              whiteSpace: 'nowrap',
            }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 1, background: i < active ? 'var(--color-green)' : 'var(--color-border)', margin: '0 0.75rem', transition: 'background 0.3s' }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function ImportCSV() {
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [step, setStep] = useState('upload')
  const [showAnomalies, setShowAnomalies] = useState(true)
  const [showImported, setShowImported] = useState(true)
  const fileRef = useRef()

  useEffect(() => {
    getMyGroups().then(res => setGroups(ensureArray(res.data))).catch(() => {})
  }, [])

  const handleFile = (f) => {
    if (!f) return
    if (!f.name.endsWith('.csv')) { toast.error('Only CSV files are accepted'); return }
    setFile(f)
    setReport(null)
    setStep('upload')
  }

  const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }

  const runImport = async (preview) => {
    if (!selectedGroup) return toast.error('Please select a group first')
    if (!file) return toast.error('Please choose a CSV file')
    setLoading(true)
    try {
      const res = await importCSV(selectedGroup, file, preview)
      setReport(res.data)
      setStep(preview ? 'preview' : 'done')
      if (!preview) toast.success(`Successfully imported ${res.data?.successfullyImported || 0} expenses!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed — check your CSV format')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setFile(null); setReport(null); setStep('upload'); setSelectedGroup('') }

  const anomalies = ensureArray(report?.anomalies)
  const importedExpenses = ensureArray(report?.importedExpenses)
  const skippedAnomalies = anomalies.filter(a => a.actionTaken === 'SKIPPED' || a.actionTaken === 'DUPLICATE_SKIPPED')
  const handledAnomalies = anomalies.filter(a => a.actionTaken !== 'SKIPPED' && a.actionTaken !== 'DUPLICATE_SKIPPED')

  return (
    <div className="page-layout">
      <Navbar />
      <main className="main-content">
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.07) 0%, transparent 60%)', borderBottom: '1px solid var(--color-border)', padding: '2rem 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }} />
          <div className="container" style={{ position: 'relative' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f59e0b', background: 'rgba(245,158,11,0.12)', padding: '0.2rem 0.625rem', borderRadius: '9999px', border: '1px solid rgba(245,158,11,0.25)' }}>
              CSV Import
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.5rem', marginBottom: '0.25rem' }}>Import Expenses from CSV</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
              Upload a CSV file — we'll detect anomalies, show a preview, then confirm before importing.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem' }}>
          <StepIndicator step={step} />

          {/* Upload Card */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {/* Group selector */}
              <div className="form-group" style={{ gridColumn: step === 'done' ? '1 / -1' : undefined }}>
                <label className="form-label" htmlFor="import-group">Target Group *</label>
                <select
                  id="import-group"
                  className="form-input form-select"
                  value={selectedGroup}
                  onChange={e => setSelectedGroup(e.target.value)}
                  disabled={step === 'done'}
                >
                  <option value="">Select a group…</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.members?.length || 0} members)</option>
                  ))}
                </select>
              </div>

              {/* CSV format hint */}
              <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <FileText size={14} /> Expected CSV Columns
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, fontFamily: 'monospace' }}>
                  description, amount, currency,<br />paidBy, splitType, splitWith
                </div>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              id="file-drop-zone"
              onClick={() => step !== 'done' && fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); if (step !== 'done') setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={step !== 'done' ? handleDrop : undefined}
              style={{
                border: `2px dashed ${dragging ? 'var(--color-green)' : file ? 'rgba(9,204,169,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 'var(--radius-lg)', padding: '2.5rem',
                textAlign: 'center', cursor: step !== 'done' ? 'pointer' : 'default',
                background: dragging ? 'rgba(9,204,169,0.05)' : file ? 'rgba(9,204,169,0.03)' : 'var(--color-bg-3)',
                transition: 'all 0.2s',
              }}
            >
              <input ref={fileRef} type="file" accept=".csv" id="csv-file-input" onChange={e => handleFile(e.target.files[0])} />
              {file ? (
                <div>
                  <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'var(--color-green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
                    <FileText size={26} style={{ color: 'var(--color-green)' }} />
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-green)', marginBottom: '0.25rem' }}>{file.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    {(file.size / 1024).toFixed(1)} KB
                    {step !== 'done' && <span style={{ color: 'var(--color-text-dim)' }}> · Click to change file</span>}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
                    <Upload size={26} style={{ color: '#f59e0b' }} />
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Drop your CSV file here</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>or click to browse your files</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
              {step !== 'upload' && (
                <button id="reset-btn" className="btn btn-ghost" onClick={reset}>
                  <RotateCcw size={15} /> Start Over
                </button>
              )}
              {step !== 'done' && (
                <button
                  id="preview-btn"
                  className="btn btn-outline"
                  disabled={loading || !file || !selectedGroup}
                  onClick={() => runImport(true)}
                >
                  {loading && step === 'upload' ? <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> : <Eye size={15} />}
                  Preview Import
                </button>
              )}
              {step === 'preview' && (
                <button
                  id="confirm-import-btn"
                  className="btn btn-primary"
                  disabled={loading || (report?.skippedRows === report?.totalRowsProcessed)}
                  onClick={() => runImport(false)}
                >
                  {loading ? <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> : <Zap size={15} />}
                  Confirm & Import
                </button>
              )}
            </div>
          </div>

          {/* Report */}
          {report && (
            <div>
              {/* Summary Stats */}
              <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
                {[
                  { label: 'Rows Processed', value: report.totalRowsProcessed ?? '-', icon: <FileText size={18} />, color: '#3b82f6' },
                  { label: step === 'done' ? 'Imported' : 'Will Import', value: report.successfullyImported ?? 0, icon: <CheckCircle size={18} />, color: '#09cca9' },
                  { label: 'Skipped', value: report.skippedRows ?? 0, icon: <XCircle size={18} />, color: '#ef4444' },
                  { label: 'Anomalies', value: report.anomaliesDetected ?? 0, icon: <AlertTriangle size={18} />, color: '#f59e0b' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                      <div style={{ fontSize: '1.375rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Message */}
              {report.message && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)', marginBottom: '1.5rem',
                  background: report.status === 'success' ? 'rgba(34,197,94,0.08)' : report.status === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
                  border: `1px solid ${report.status === 'success' ? 'rgba(34,197,94,0.2)' : report.status === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                }}>
                  {report.status === 'success' ? <CheckCircle size={18} style={{ color: '#22c55e', flexShrink: 0 }} /> : report.status === 'error' ? <XCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} /> : <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />}
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: report.status === 'success' ? '#22c55e' : report.status === 'error' ? '#ef4444' : '#f59e0b', marginRight: '0.5rem' }}>
                      {step === 'preview' ? 'Preview' : report.status}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{report.message}</span>
                  </div>
                </div>
              )}

              {/* Anomalies */}
              {anomalies.length > 0 && (
                <div style={{ background: 'var(--color-surface)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.25rem' }}>
                  <div
                    id="toggle-anomalies"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.375rem', cursor: 'pointer', borderBottom: showAnomalies ? '1px solid var(--color-border)' : 'none' }}
                    onClick={() => setShowAnomalies(v => !v)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                      </div>
                      <span style={{ fontWeight: 600 }}>{anomalies.length} Anomalies Detected</span>
                      {skippedAnomalies.length > 0 && (
                        <span style={{ fontSize: '0.75rem', background: 'rgba(239,68,68,0.12)', color: '#ef4444', padding: '0.15rem 0.5rem', borderRadius: '9999px', border: '1px solid rgba(239,68,68,0.25)' }}>
                          {skippedAnomalies.length} skipped
                        </span>
                      )}
                      {handledAnomalies.length > 0 && (
                        <span style={{ fontSize: '0.75rem', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', padding: '0.15rem 0.5rem', borderRadius: '9999px', border: '1px solid rgba(245,158,11,0.25)' }}>
                          {handledAnomalies.length} auto-handled
                        </span>
                      )}
                    </div>
                    {showAnomalies ? <ChevronUp size={16} style={{ color: 'var(--color-text-secondary)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-secondary)' }} />}
                  </div>
                  {showAnomalies && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                        <thead>
                          <tr style={{ background: 'var(--color-bg-3)' }}>
                            {['Row', 'Type', 'Description', 'Field', 'Value', 'Action'].map(h => (
                              <th key={h} style={{ padding: '0.625rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', borderBottom: '1px solid var(--color-border)' }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {anomalies.map((a, i) => {
                            const am = ACTION_META[a.actionTaken] || { label: a.actionTaken, bg: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)' }
                            const isSkipped = a.actionTaken === 'SKIPPED' || a.actionTaken === 'DUPLICATE_SKIPPED'
                            return (
                              <tr
                                key={i} id={`anomaly-row-${i}`}
                                style={{ borderBottom: '1px solid var(--color-border)', background: isSkipped ? 'rgba(239,68,68,0.03)' : 'transparent' }}
                              >
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>#{a.rowNumber}</td>
                                <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: isSkipped ? '#ef4444' : '#f59e0b' }}>
                                    {ANOMALY_LABELS[a.type] || a.type}
                                  </span>
                                </td>
                                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', maxWidth: 200 }}>{a.description}</td>
                                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-dim)', fontFamily: 'monospace', fontSize: '0.75rem' }}>{a.fieldName || '—'}</td>
                                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-dim)', fontFamily: 'monospace', fontSize: '0.75rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {a.fieldValue != null ? String(a.fieldValue).substring(0, 25) : '—'}
                                </td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                  <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '9999px', background: am.bg, color: am.color, whiteSpace: 'nowrap' }}>
                                    {am.label}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Imported Expenses Preview */}
              {importedExpenses.length > 0 && (
                <div style={{ background: 'var(--color-surface)', border: '1px solid rgba(9,204,169,0.2)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.375rem', cursor: 'pointer', borderBottom: showImported ? '1px solid var(--color-border)' : 'none' }}
                    onClick={() => setShowImported(v => !v)}
                    id="toggle-imported"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--color-green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={16} style={{ color: 'var(--color-green)' }} />
                      </div>
                      <span style={{ fontWeight: 600 }}>
                        {step === 'done' ? 'Imported' : 'Will Import'} — {importedExpenses.length} Expense{importedExpenses.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {showImported ? <ChevronUp size={16} style={{ color: 'var(--color-text-secondary)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-secondary)' }} />}
                  </div>
                  {showImported && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
                      {importedExpenses.map((exp, i) => {
                        const sm = SPLIT_META[exp.splitType] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)' }
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 1rem', background: 'var(--color-bg-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: sm.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <CheckCircle size={14} style={{ color: sm.color }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.description}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                Paid by <span style={{ color: 'var(--color-text)' }}>{exp.paidByUsername}</span>
                                {' · '}
                                <span style={{ color: sm.color }}>{exp.splitType}</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontWeight: 700, color: 'var(--color-green)', fontSize: '0.9375rem' }}>
                                {formatAmount(exp.amount, exp.currency)}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>{exp.currency}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Done state CTA */}
              {step === 'done' && (
                <div style={{ textAlign: 'center', marginTop: '2rem', padding: '2rem', background: 'var(--color-green-dim)', border: '1px solid rgba(9,204,169,0.2)', borderRadius: 'var(--radius-lg)' }}>
                  <CheckCircle size={40} style={{ color: 'var(--color-green)', margin: '0 auto 0.875rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.375rem', color: 'var(--color-green)' }}>Import Complete!</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                    {report.successfullyImported} expense{report.successfullyImported !== 1 ? 's' : ''} were added to your group.
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button className="btn btn-outline" onClick={reset} id="import-another">
                      <RotateCcw size={15} /> Import Another
                    </button>
                    <a href={`/groups/${selectedGroup}`} className="btn btn-primary" id="view-group-after-import">
                      View Group →
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
