import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Fonctions d'authentification
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Fonctions pour les profils
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
  return { data, error }
}

// Fonctions pour les équipes
export async function getTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('name')
  return { data, error }
}

// Fonctions pour les matchs
export async function getMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      team_a:teams!matches_team_a_id_fkey(*),
      team_b:teams!matches_team_b_id_fkey(*)
    `)
    .order('date')
  return { data, error }
}

export async function getUpcomingMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      team_a:teams!matches_team_a_id_fkey(*),
      team_b:teams!matches_team_b_id_fkey(*)
    `)
    .eq('status', 'upcoming')
    .order('date')
  return { data, error }
}

// Fonctions pour les pronostics
export async function getPrediction(userId, matchId) {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .eq('match_id', matchId)
    .single()
  return { data, error }
}

export async function getUserPredictions(userId) {
  const { data, error } = await supabase
    .from('predictions')
    .select(`
      *,
      match:matches(
        *,
        team_a:teams!matches_team_a_id_fkey(*),
        team_b:teams!matches_team_b_id_fkey(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function savePrediction(userId, matchId, predictedWinner, predictedScoreA, predictedScoreB) {
  const { data, error } = await supabase
    .from('predictions')
    .upsert({
      user_id: userId,
      match_id: matchId,
      predicted_winner: predictedWinner,
      predicted_score_a: predictedScoreA,
      predicted_score_b: predictedScoreB,
    }, {
      onConflict: 'user_id,match_id'
    })
  return { data, error }
}

// Fonctions pour le classement
export async function getLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, points, correct_predictions, total_predictions')
    .order('points', { ascending: false })
    .limit(limit)
  return { data, error }
}

// Fonction pour ajouter des points
export async function addPoints(userId, points) {
  const { data: profile } = await getProfile(userId)
  if (profile) {
    const newPoints = profile.points + points
    await updateProfile(userId, { points: newPoints })
  }
}

// Fonction pour marquer le profil comme vérifié Shopify
export async function setShopifyVerified(userId, verified = true) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ shopify_verified: verified })
    .eq('id', userId)
  return { data, error }
}

// Fonction pour vérifier si l'email correspond à un client Shopify
export async function verifyShopifyCustomer(email) {
  try {
    const response = await fetch('/api/verify-shopify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    return await response.json()
  } catch (error) {
    console.error('Verification error:', error)
    return { verified: false, error: 'Erreur de connexion' }
  }
}
