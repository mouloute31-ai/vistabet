'use client'

import Link from 'next/link'
import Header from '../components/Header'
import MatchCard from '../components/MatchCard'
import { useAuth } from '../context/AuthContext'

// Données de démonstration - les vrais matchs seront dans Supabase
const demoMatches = [
  {
    id: 1,
    date: '2026-06-11',
    time: '21:00',
    phase: 'Groupe A',
    teamA: { name: 'États-Unis', code: 'us' },
    teamB: { name: 'Mexique', code: 'mx' },
    status: 'upcoming'
  },
  {
    id: 2,
    date: '2026-06-12',
    time: '18:00',
    phase: 'Groupe A',
    teamA: { name: 'Canada', code: 'ca' },
    teamB: { name: 'France', code: 'fr' },
    status: 'upcoming'
  },
  {
    id: 3,
    date: '2026-06-12',
    time: '21:00',
    phase: 'Groupe B',
    teamA: { name: 'Brésil', code: 'br' },
    teamB: { name: 'Argentine', code: 'ar' },
    status: 'upcoming'
  },
  {
    id: 4,
    date: '2026-06-13',
    time: '18:00',
    phase: 'Groupe B',
    teamA: { name: 'Allemagne', code: 'de' },
    teamB: { name: 'Espagne', code: 'es' },
    status: 'upcoming'
  },
]

const rewards = [
  { points: 100, description: '5$ de réduction sur VistaCup' },
  { points: 250, description: '15$ de réduction sur VistaCup' },
  { points: 500, description: 'Livraison gratuite + 20$ de réduction' },
]

export default function Home() {
  const { user, profile, loading } = useAuth()

  const userPoints = profile?.points || 0

  return (
    <>
      <Header />

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <span className="hero-badge">Coupe du Monde 2026</span>
            <h1>Vista<span>Cup</span> Pronostics</h1>
            <p>
              Pronostiquez les matchs de la Coupe du Monde 2026 et gagnez des points
              échangeables contre des réductions sur la boutique VistaCup!
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {user ? (
                <Link href="/matches" className="btn btn-primary">
                  Faire un pronostic
                </Link>
              ) : (
                <Link href="/profile" className="btn btn-primary">
                  S'inscrire (+50 pts offerts)
                </Link>
              )}
              <Link href="/leaderboard" className="btn btn-secondary">
                Voir le classement
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="container">
          <div className="stats">
            <div className="stat-card">
              <div className="stat-value">{loading ? '...' : userPoints}</div>
              <div className="stat-label">Vos points</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{profile?.total_predictions || 0}/64</div>
              <div className="stat-label">Pronostics faits</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{profile?.correct_predictions || 0}</div>
              <div className="stat-label">Pronostics corrects</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{profile?.streak || 0}</div>
              <div className="stat-label">Streak actuel</div>
            </div>
          </div>
        </section>

        {/* Matchs à venir */}
        <section className="container" style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Prochains matchs</h2>
            <Link href="/matches" style={{ color: '#3b82f6', fontSize: '0.875rem' }}>
              Voir tous les matchs →
            </Link>
          </div>
          {demoMatches.slice(0, 3).map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </section>

        {/* Récompenses */}
        <section className="container" style={{ margin: '3rem auto' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Récompenses</h2>
          <div className="rewards-grid">
            {rewards.map((reward, index) => (
              <div key={index} className="reward-card">
                <div className="reward-points">{reward.points} pts</div>
                <div className="reward-description">{reward.description}</div>
                <button
                  className="btn btn-secondary"
                  disabled={userPoints < reward.points}
                  style={{ opacity: userPoints < reward.points ? 0.5 : 1 }}
                >
                  {userPoints >= reward.points ? 'Échanger' : 'Points insuffisants'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="container" style={{ margin: '3rem auto', paddingBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Comment gagner des points?</h2>
          <div className="stats">
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#22c55e' }}>+10</div>
              <div className="stat-label">Vainqueur correct</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#22c55e' }}>+30</div>
              <div className="stat-label">Score exact</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#22c55e' }}>+20</div>
              <div className="stat-label">Bonus streak (3 corrects)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#22c55e' }}>+1/$</div>
              <div className="stat-label">Achat sur VistaCup</div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
