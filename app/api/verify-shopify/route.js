import { NextResponse } from 'next/server'

// Obtenir un access token Shopify via client credentials
async function getShopifyAccessToken() {
  const response = await fetch(
    `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
      }),
    }
  )
  const data = await response.json()
  return data.access_token
}

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Obtenir un token frais
    const accessToken = await getShopifyAccessToken()

    if (!accessToken) {
      return NextResponse.json({
        error: 'Impossible de se connecter à Shopify',
        verified: false
      }, { status: 500 })
    }

    // Rechercher les commandes avec cet email
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/orders.json?email=${encodeURIComponent(email)}&status=any&limit=1`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('Shopify API error:', response.status)
      return NextResponse.json({
        error: 'Erreur API Shopify',
        verified: false
      }, { status: 500 })
    }

    const data = await response.json()
    const hasOrders = data.orders && data.orders.length > 0

    return NextResponse.json({
      verified: hasOrders,
      orderCount: data.orders?.length || 0,
      message: hasOrders
        ? 'Email vérifié! Vous êtes un client VistaCup.'
        : 'Aucune commande trouvée avec cet email.'
    })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({
      error: 'Erreur de vérification',
      verified: false
    }, { status: 500 })
  }
}
