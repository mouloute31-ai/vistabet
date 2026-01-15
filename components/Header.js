'use client'

import Link from 'next/link'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, profile, loading } = useAuth()

  return (
    <header className="header">
      <div className="container header-content">
        <Link href="/" className="logo">
          Vista<span>Bet</span>
        </Link>

        <nav className="nav">
          <Link href="/">Accueil</Link>
          <Link href="/matches">Matchs</Link>
          <Link href="/leaderboard">Classement</Link>
          <Link href="/profile">{user ? 'Mon Profil' : 'Connexion'}</Link>
          <a href="https://ytibyd-vn.myshopify.com" target="_blank" rel="noopener" className="nav-shop">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            Boutique
          </a>
        </nav>

        <Link href="/profile" className="user-points">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v12M8 10l4-4 4 4M8 14l4 4 4-4"/>
          </svg>
          <span className="points-value">
            {loading ? '...' : (profile?.points ?? 0)} pts
          </span>
        </Link>
      </div>
    </header>
  )
}
