import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Receipt, ArrowLeftRight, Upload, LogOut, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import SpreetailLogo from './SpreetailLogo'
import Avatar from './Avatar'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/groups', label: 'Groups', icon: Users },
  { to: '/expenses', label: 'My Expenses', icon: Receipt },
  { to: '/import', label: 'Import CSV', icon: Upload },
]

export default function Navbar() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <NavLink to="/dashboard" className="navbar-logo">
          <SpreetailLogo height={22} color="#09cca9" />
        </NavLink>

        {/* Nav Links */}
        <ul className="navbar-links">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          {/* User dropdown */}
          <div style={{ position: 'relative' }} ref={dropRef}>
            <button
              id="user-menu-btn"
              className="btn btn-ghost"
              style={{ gap: '0.5rem', padding: '0.375rem 0.625rem' }}
              onClick={() => setDropdownOpen((v) => !v)}
            >
              <Avatar name={user?.username || 'U'} size={28} />
              <span className="text-sm font-medium" style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.username}
              </span>
              <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
            </button>

            {dropdownOpen && (
              <div
                className="glass-card"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  minWidth: 200,
                  padding: '0.5rem',
                  zIndex: 999,
                  animation: 'slideDown 0.15s ease',
                }}
              >
                <div style={{ padding: '0.625rem 0.875rem 0.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.25rem' }}>
                  <div className="text-sm font-semibold">{user?.username}</div>
                  <div className="text-xs text-secondary">{user?.email}</div>
                </div>
                <button
                  id="logout-btn"
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--color-danger)', gap: '0.5rem', padding: '0.5rem 0.875rem' }}
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
