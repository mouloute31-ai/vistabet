'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { savePrediction, getPrediction } from '../lib/supabase'

export default function MatchCard({ match }) {
  const { user } = useAuth()
  const [prediction, setPrediction] = useState(null)
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [existingPrediction, setExistingPrediction] = useState(null)

  // Charger le pronostic existant
  useEffect(() => {
    const loadExistingPrediction = async () => {
      if (user && match.id) {
        const { data } = await getPrediction(user.id, match.id)
        if (data) {
          setExistingPrediction(data)
          setPrediction(data.predicted_winner)
          setScoreA(data.predicted_score_a?.toString() || '')
          setScoreB(data.predicted_score_b?.toString() || '')
          setSubmitted(true)
        }
      }
    }
    loadExistingPrediction()
  }, [user, match.id])

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const handleSubmit = async () => {
    if (!prediction) return

    if (!user) {
      alert('Connectez-vous pour enregistrer votre pronostic!')
      return
    }

    setLoading(true)

    const { error } = await savePrediction(
      user.id,
      match.id,
      prediction,
      scoreA ? parseInt(scoreA) : null,
      scoreB ? parseInt(scoreB) : null
    )

    if (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'enregistrement du pronostic')
    } else {
      setSubmitted(true)
    }

    setLoading(false)
  }

  // Utiliser les données du match selon le format (demo ou Supabase)
  const teamA = match.teamA || match.team_a
  const teamB = match.teamB || match.team_b
  const matchTime = match.time || new Date(match.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  if (!teamA || !teamB) return null

  return (
    <div className="match-card">
      <div className="match-header">
        <span>{formatDate(match.date)} - {matchTime}</span>
        <span className="match-phase">{match.phase}</span>
      </div>

      <div className="match-teams">
        <div className="team">
          <img
            src={`https://flagcdn.com/w160/${teamA.code}.png`}
            alt={teamA.name}
            className="team-flag"
          />
          <span className="team-name">{teamA.name}</span>
        </div>

        <span className="match-vs">VS</span>

        <div className="team">
          <img
            src={`https://flagcdn.com/w160/${teamB.code}.png`}
            alt={teamB.name}
            className="team-flag"
          />
          <span className="team-name">{teamB.name}</span>
        </div>
      </div>

      {!submitted ? (
        <div className="match-prediction">
          <p style={{ marginBottom: '0.75rem', color: '#9ca3af', fontSize: '0.875rem' }}>
            Qui va gagner? (+10 points si correct)
          </p>

          <div className="prediction-buttons">
            <button
              className={`prediction-btn ${prediction === 'A' ? 'selected' : ''}`}
              onClick={() => setPrediction('A')}
            >
              {teamA.name}
            </button>
            <button
              className={`prediction-btn ${prediction === 'draw' ? 'selected' : ''}`}
              onClick={() => setPrediction('draw')}
            >
              Match nul
            </button>
            <button
              className={`prediction-btn ${prediction === 'B' ? 'selected' : ''}`}
              onClick={() => setPrediction('B')}
            >
              {teamB.name}
            </button>
          </div>

          <p style={{ marginTop: '1rem', marginBottom: '0.75rem', color: '#9ca3af', fontSize: '0.875rem' }}>
            Score exact? (optionnel, +30 points si correct)
          </p>

          <div className="score-input">
            <div className="score-field">
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{teamA.name}</span>
              <input
                type="number"
                min="0"
                max="20"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                placeholder="0"
              />
            </div>
            <span className="score-separator">-</span>
            <div className="score-field">
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{teamB.name}</span>
              <input
                type="number"
                min="0"
                max="20"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!prediction || loading}
              style={{ opacity: (!prediction || loading) ? 0.5 : 1 }}
            >
              {loading ? 'Enregistrement...' : (user ? 'Valider mon pronostic' : 'Connectez-vous pour pronostiquer')}
            </button>
          </div>
        </div>
      ) : (
        <div className="match-prediction" style={{ textAlign: 'center' }}>
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <p style={{ color: '#22c55e', fontWeight: '600' }}>
              ✓ Pronostic enregistré!
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Votre pronostic: {prediction === 'A' ? teamA.name : prediction === 'B' ? teamB.name : 'Match nul'}
              {scoreA && scoreB && ` (${scoreA}-${scoreB})`}
            </p>
            <button
              className="btn btn-secondary"
              onClick={() => setSubmitted(false)}
              style={{ marginTop: '1rem', fontSize: '0.75rem', padding: '0.5rem 1rem' }}
            >
              Modifier
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
