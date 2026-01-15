'use client'

import { useState } from 'react'
import Header from '../../components/Header'
import MatchCard from '../../components/MatchCard'

// Tous les matchs de démonstration
const allMatches = [
  // Groupe A
  { id: 1, date: '2026-06-11', time: '21:00', phase: 'Groupe A', teamA: { name: 'États-Unis', code: 'us' }, teamB: { name: 'Mexique', code: 'mx' }, status: 'upcoming' },
  { id: 2, date: '2026-06-12', time: '18:00', phase: 'Groupe A', teamA: { name: 'Canada', code: 'ca' }, teamB: { name: 'France', code: 'fr' }, status: 'upcoming' },
  { id: 3, date: '2026-06-16', time: '21:00', phase: 'Groupe A', teamA: { name: 'États-Unis', code: 'us' }, teamB: { name: 'Canada', code: 'ca' }, status: 'upcoming' },
  { id: 4, date: '2026-06-17', time: '18:00', phase: 'Groupe A', teamA: { name: 'Mexique', code: 'mx' }, teamB: { name: 'France', code: 'fr' }, status: 'upcoming' },

  // Groupe B
  { id: 5, date: '2026-06-12', time: '21:00', phase: 'Groupe B', teamA: { name: 'Brésil', code: 'br' }, teamB: { name: 'Argentine', code: 'ar' }, status: 'upcoming' },
  { id: 6, date: '2026-06-13', time: '18:00', phase: 'Groupe B', teamA: { name: 'Allemagne', code: 'de' }, teamB: { name: 'Espagne', code: 'es' }, status: 'upcoming' },
  { id: 7, date: '2026-06-17', time: '21:00', phase: 'Groupe B', teamA: { name: 'Brésil', code: 'br' }, teamB: { name: 'Allemagne', code: 'de' }, status: 'upcoming' },
  { id: 8, date: '2026-06-18', time: '18:00', phase: 'Groupe B', teamA: { name: 'Argentine', code: 'ar' }, teamB: { name: 'Espagne', code: 'es' }, status: 'upcoming' },

  // Groupe C
  { id: 9, date: '2026-06-13', time: '21:00', phase: 'Groupe C', teamA: { name: 'Angleterre', code: 'gb-eng' }, teamB: { name: 'Italie', code: 'it' }, status: 'upcoming' },
  { id: 10, date: '2026-06-14', time: '18:00', phase: 'Groupe C', teamA: { name: 'Portugal', code: 'pt' }, teamB: { name: 'Pays-Bas', code: 'nl' }, status: 'upcoming' },

  // Groupe D
  { id: 11, date: '2026-06-14', time: '21:00', phase: 'Groupe D', teamA: { name: 'Belgique', code: 'be' }, teamB: { name: 'Croatie', code: 'hr' }, status: 'upcoming' },
  { id: 12, date: '2026-06-15', time: '18:00', phase: 'Groupe D', teamA: { name: 'Japon', code: 'jp' }, teamB: { name: 'Corée du Sud', code: 'kr' }, status: 'upcoming' },
]

const phases = ['Tous', 'Groupe A', 'Groupe B', 'Groupe C', 'Groupe D']

export default function Matches() {
  const [selectedPhase, setSelectedPhase] = useState('Tous')

  const filteredMatches = selectedPhase === 'Tous'
    ? allMatches
    : allMatches.filter(m => m.phase === selectedPhase)

  return (
    <>
      <Header />

      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Matchs</h1>
        <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
          Faites vos pronostics pour chaque match
        </p>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {phases.map(phase => (
            <button
              key={phase}
              className={`btn ${selectedPhase === phase ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedPhase(phase)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {phase}
            </button>
          ))}
        </div>

        {/* Liste des matchs */}
        <div>
          {filteredMatches.length > 0 ? (
            filteredMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#9ca3af' }}>Aucun match pour cette phase</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="card" style={{ marginTop: '2rem', background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#3b82f6' }}>Comment gagner des points?</h3>
          <ul style={{ color: '#9ca3af', lineHeight: '1.8' }}>
            <li><strong style={{ color: '#22c55e' }}>+10 points</strong> - Vainqueur correct</li>
            <li><strong style={{ color: '#22c55e' }}>+30 points</strong> - Score exact correct</li>
            <li><strong style={{ color: '#22c55e' }}>+20 points</strong> - Bonus streak (3 pronostics corrects d'affilée)</li>
          </ul>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>
            Note: Vous ne perdez jamais de points! Un pronostic incorrect = 0 points gagnés.
          </p>
        </div>
      </main>
    </>
  )
}
