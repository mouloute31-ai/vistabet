'use client'

import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import { useAuth } from '../../context/AuthContext'
import { getUserPredictions, verifyShopifyCustomer, setShopifyVerified } from '../../lib/supabase'

export default function Profile() {
  const { user, profile, loading, signIn, signUp, signOut, refreshProfile } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [predictions, setPredictions] = useState([])
  const [verifying, setVerifying] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState('')

  useEffect(() => {
    const loadPredictions = async () => {
      if (user) {
        const { data } = await getUserPredictions(user.id)
        setPredictions(data || [])
      }
    }
    loadPredictions()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setAuthLoading(true)

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password)

    if (error) {
      setError(error.message)
    }
    setAuthLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleVerifyShopify = async () => {
    if (!user) return
    setVerifying(true)
    setVerificationMessage('')

    const result = await verifyShopifyCustomer(user.email)

    if (result.verified) {
      await setShopifyVerified(user.id, true)
      await refreshProfile()
      setVerificationMessage('Compte vérifié avec succès!')
    } else {
      setVerificationMessage(result.message || 'Aucune commande trouvée avec cet email.')
    }
    setVerifying(false)
  }

  const rewards = [
    { points: 100, description: '5$ de réduction sur VistaCup' },
    { points: 250, description: '15$ de réduction sur VistaCup' },
    { points: 500, description: 'Livraison gratuite + 20$' },
  ]

  if (loading) {
    return (
      <>
        <Header />
        <main className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
          <p>Chargement...</p>
        </main>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Header />
        <main>
          <div className="auth-container">
            <div className="auth-form">
              <h2>{isSignUp ? 'Inscription' : 'Connexion'}</h2>

              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  color: '#ef4444',
                  fontSize: '0.875rem'
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={authLoading}
                  style={{ opacity: authLoading ? 0.5 : 1 }}
                >
                  {authLoading ? 'Chargement...' : (isSignUp ? "S'inscrire" : 'Se connecter')}
                </button>
              </form>

              <p style={{ textAlign: 'center', marginTop: '1rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                {isSignUp ? 'Déjà un compte?' : 'Pas encore de compte?'}{' '}
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                  style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {isSignUp ? 'Se connecter' : "S'inscrire"}
                </button>
              </p>

              {isSignUp && (
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#22c55e', fontSize: '0.75rem' }}>
                  +50 points offerts à l'inscription!
                </p>
              )}
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />

      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Mon Profil</h1>
        <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>{user.email}</p>

        {/* Stats personnelles */}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-value">{profile?.points || 0}</div>
            <div className="stat-label">Points totaux</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{profile?.total_predictions || 0}</div>
            <div className="stat-label">Pronostics faits</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#22c55e' }}>{profile?.correct_predictions || 0}</div>
            <div className="stat-label">Pronostics corrects</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{profile?.streak || 0}</div>
            <div className="stat-label">Streak actuel</div>
          </div>
        </div>

        {/* Statut de vérification Shopify */}
        <div className="card" style={{
          marginTop: '2rem',
          background: profile?.shopify_verified
            ? 'rgba(34, 197, 94, 0.1)'
            : 'rgba(245, 158, 11, 0.1)',
          borderColor: profile?.shopify_verified
            ? 'rgba(34, 197, 94, 0.3)'
            : 'rgba(245, 158, 11, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{
                marginBottom: '0.5rem',
                color: profile?.shopify_verified ? '#22c55e' : '#f59e0b'
              }}>
                {profile?.shopify_verified ? '✓ Compte vérifié' : '⚠ Compte non vérifié'}
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                {profile?.shopify_verified
                  ? 'Vous pouvez échanger vos points contre des récompenses.'
                  : 'Vérifiez votre compte pour échanger vos points. Vous devez avoir passé au moins une commande sur VistaCup.'}
              </p>
              {verificationMessage && (
                <p style={{
                  marginTop: '0.5rem',
                  fontSize: '0.875rem',
                  color: verificationMessage.includes('succès') ? '#22c55e' : '#f59e0b'
                }}>
                  {verificationMessage}
                </p>
              )}
            </div>
            {!profile?.shopify_verified && (
              <button
                className="btn btn-primary"
                onClick={handleVerifyShopify}
                disabled={verifying}
                style={{ opacity: verifying ? 0.5 : 1 }}
              >
                {verifying ? 'Vérification...' : 'Vérifier mon compte'}
              </button>
            )}
          </div>
        </div>

        {/* Historique des pronostics */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Mes pronostics ({predictions.length})</h2>
          {predictions.length > 0 ? (
            <div>
              {predictions.map((pred) => (
                <div key={pred.id} className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: '600' }}>
                        {pred.match?.team_a?.name} vs {pred.match?.team_b?.name}
                      </p>
                      <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                        Pronostic: {pred.predicted_winner === 'A' ? pred.match?.team_a?.name : pred.predicted_winner === 'B' ? pred.match?.team_b?.name : 'Match nul'}
                        {pred.predicted_score_a !== null && ` (${pred.predicted_score_a}-${pred.predicted_score_b})`}
                      </p>
                    </div>
                    <div style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: pred.points_earned > 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                      color: pred.points_earned > 0 ? '#22c55e' : '#9ca3af'
                    }}>
                      {pred.points_earned > 0 ? `+${pred.points_earned} pts` : 'En attente'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#9ca3af' }}>Aucun pronostic pour le moment</p>
              <a href="/matches" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Faire un pronostic
              </a>
            </div>
          )}
        </div>

        {/* Récompenses disponibles */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Échanger mes points</h2>
          {!profile?.shopify_verified && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <p style={{ color: '#f59e0b', fontSize: '0.875rem' }}>
                Vérifiez votre compte pour débloquer l'échange de points.
              </p>
            </div>
          )}
          <div className="rewards-grid">
            {rewards.map((reward, index) => {
              const hasEnoughPoints = (profile?.points || 0) >= reward.points
              const isVerified = profile?.shopify_verified
              const canRedeem = hasEnoughPoints && isVerified

              return (
                <div key={index} className="reward-card" style={{ opacity: isVerified ? 1 : 0.6 }}>
                  <div className="reward-points">{reward.points} pts</div>
                  <div className="reward-description">{reward.description}</div>
                  <button
                    className="btn btn-secondary"
                    disabled={!canRedeem}
                    style={{ opacity: canRedeem ? 1 : 0.5 }}
                  >
                    {!isVerified
                      ? 'Compte non vérifié'
                      : hasEnoughPoints
                        ? 'Échanger'
                        : 'Points insuffisants'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Déconnexion */}
        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <button className="btn btn-secondary" onClick={handleSignOut}>
            Se déconnecter
          </button>
        </div>
      </main>
    </>
  )
}
