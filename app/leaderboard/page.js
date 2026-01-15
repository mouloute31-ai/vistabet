'use client'

import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import { getLeaderboard } from '../../lib/supabase'

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLeaderboard = async () => {
      const { data } = await getLeaderboard(20)
      setLeaderboardData(data || [])
      setLoading(false)
    }
    loadLeaderboard()
  }, [])

  return (
    <>
      <Header />

      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Classement</h1>
        <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
          Les meilleurs pronostiqueurs de la Coupe du Monde 2026
        </p>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#9ca3af' }}>Chargement...</p>
          </div>
        ) : leaderboardData.length > 0 ? (
          <div className="leaderboard">
            <div className="leaderboard-header" style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ width: '40px' }}>#</span>
              <span style={{ flex: 1 }}>Joueur</span>
              <span style={{ width: '100px', textAlign: 'center' }}>Pronostics</span>
              <span style={{ width: '80px', textAlign: 'center' }}>Corrects</span>
              <span style={{ width: '100px', textAlign: 'right' }}>Points</span>
            </div>

            {leaderboardData.map((player, index) => {
              const rank = index + 1
              return (
                <div key={player.id} className="leaderboard-row">
                  <span className={`leaderboard-rank ${rank <= 3 ? 'top-3' : ''}`}>
                    {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
                  </span>
                  <span className="leaderboard-user" style={{ flex: 1 }}>
                    {player.username?.split('@')[0] || 'Joueur'}
                  </span>
                  <span style={{ width: '100px', textAlign: 'center', color: '#9ca3af' }}>
                    {player.total_predictions || 0}
                  </span>
                  <span style={{ width: '80px', textAlign: 'center', color: '#22c55e' }}>
                    {player.correct_predictions || 0}
                  </span>
                  <span className="leaderboard-points" style={{ width: '100px', textAlign: 'right' }}>
                    {player.points} pts
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#9ca3af' }}>Aucun joueur pour le moment</p>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Inscrivez-vous pour apparaître dans le classement!
            </p>
          </div>
        )}

        {/* Prix */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Prix à gagner</h2>
          <div className="stats">
            <div className="stat-card" style={{ borderColor: 'rgba(245, 158, 11, 0.5)' }}>
              <div className="stat-value">🥇</div>
              <div className="stat-label">1er: 100$ de produits VistaCup</div>
            </div>
            <div className="stat-card" style={{ borderColor: 'rgba(156, 163, 175, 0.5)' }}>
              <div className="stat-value">🥈</div>
              <div className="stat-label">2e-3e: 50$ de produits</div>
            </div>
            <div className="stat-card" style={{ borderColor: 'rgba(180, 83, 9, 0.5)' }}>
              <div className="stat-value">🥉</div>
              <div className="stat-label">Top 10: 20% de réduction</div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
