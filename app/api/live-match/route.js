// API Route pour récupérer le match en cours ou à venir
// Utilisé par PromoMatch sur Shopify

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const testMode = searchParams.get('test');

  // Mode test pour simuler un match terminé avec promo active
  if (testMode === 'finished') {
    const now = new Date();
    const promoExpiresAt = new Date(now.getTime() + 1 * 60 * 60 * 1000); // Expire dans 1h

    return Response.json({
      match: {
        id: 999999,
        status: 'finished',
        date: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // Match fini il y a 30min
        matchday: 1,
        stage: 'GROUP_STAGE',
        group: 'GROUP A',
        minute: null,
        promoStartsAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        promoExpiresAt: promoExpiresAt.toISOString(),
        team1: {
          id: 1,
          name: 'Mexico',
          shortName: 'Mexico',
          code: 'MEX',
          crest: 'https://flagcdn.com/w160/mx.png',
          score: 2
        },
        team2: {
          id: 2,
          name: 'South Africa',
          shortName: 'South Africa',
          code: 'RSA',
          crest: 'https://flagcdn.com/w160/za.png',
          score: 1
        },
        winner: 'team1'
      },
      lastUpdated: now.toISOString(),
      testMode: true
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      }
    });
  }

  // Mode test pour simuler un match live
  if (testMode === 'live') {
    const now = new Date();

    return Response.json({
      match: {
        id: 999998,
        status: 'live',
        date: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        matchday: 1,
        stage: 'GROUP_STAGE',
        group: 'GROUP A',
        minute: 45,
        promoStartsAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        promoExpiresAt: null,
        team1: {
          id: 1,
          name: 'Mexico',
          shortName: 'Mexico',
          code: 'MEX',
          crest: 'https://flagcdn.com/w160/mx.png',
          score: 1
        },
        team2: {
          id: 2,
          name: 'South Africa',
          shortName: 'South Africa',
          code: 'RSA',
          crest: 'https://flagcdn.com/w160/za.png',
          score: 1
        },
        winner: null
      },
      lastUpdated: now.toISOString(),
      testMode: true
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      }
    });
  }

  const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

  if (!API_KEY) {
    return Response.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Récupérer les matchs de la Coupe du Monde 2026
    const response = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches',
      {
        headers: {
          'X-Auth-Token': API_KEY,
        },
        next: { revalidate: 60 } // Cache 1 minute
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const matches = data.matches || [];

    // Trouver le match en cours (LIVE, IN_PLAY, PAUSED)
    let currentMatch = matches.find(m =>
      ['LIVE', 'IN_PLAY', 'PAUSED', 'HALFTIME'].includes(m.status)
    );

    // Si pas de match en cours, trouver le prochain match (dans les 2 prochaines heures)
    if (!currentMatch) {
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      currentMatch = matches.find(m => {
        const matchDate = new Date(m.utcDate);
        return m.status === 'TIMED' && matchDate >= now && matchDate <= twoHoursLater;
      });
    }

    // Si pas de match imminent, trouver le dernier match terminé (dans les 2 dernières heures)
    if (!currentMatch) {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const recentFinished = matches
        .filter(m => {
          const matchDate = new Date(m.utcDate);
          return m.status === 'FINISHED' && matchDate >= twoHoursAgo;
        })
        .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));

      currentMatch = recentFinished[0];
    }

    // Si aucun match pertinent, retourner le prochain match à venir
    if (!currentMatch) {
      const now = new Date();
      const upcomingMatches = matches
        .filter(m => m.status === 'TIMED' && new Date(m.utcDate) > now)
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

      currentMatch = upcomingMatches[0];
    }

    if (!currentMatch) {
      return Response.json({
        match: null,
        message: 'Aucun match disponible'
      });
    }

    // Calculer les dates de début et fin de la promo
    // La promo commence au coup d'envoi et dure 2h après la fin du match
    const matchStartDate = new Date(currentMatch.utcDate);
    const estimatedEndDate = new Date(matchStartDate.getTime() + 2 * 60 * 60 * 1000); // +2h après le début (durée du match)
    const promoExpiresAt = new Date(estimatedEndDate.getTime() + 2 * 60 * 60 * 1000); // +2h après la fin du match

    // promoStartsAt = début du match (coup d'envoi)
    // promoExpiresAt = 2h après la fin estimée du match (4h après le début)

    // Formater la réponse pour PromoMatch
    const formattedMatch = {
      id: currentMatch.id,
      status: mapStatus(currentMatch.status),
      date: currentMatch.utcDate,
      matchday: currentMatch.matchday,
      stage: currentMatch.stage,
      group: currentMatch.group,
      minute: currentMatch.minute || null,
      promoStartsAt: matchStartDate.toISOString(),
      promoExpiresAt: promoExpiresAt.toISOString(),
      team1: {
        id: currentMatch.homeTeam.id,
        name: currentMatch.homeTeam.name,
        shortName: currentMatch.homeTeam.shortName,
        code: currentMatch.homeTeam.tla,
        crest: currentMatch.homeTeam.crest,
        score: currentMatch.score.fullTime.home
      },
      team2: {
        id: currentMatch.awayTeam.id,
        name: currentMatch.awayTeam.name,
        shortName: currentMatch.awayTeam.shortName,
        code: currentMatch.awayTeam.tla,
        crest: currentMatch.awayTeam.crest,
        score: currentMatch.score.fullTime.away
      },
      winner: determineWinner(currentMatch)
    };

    return Response.json({
      match: formattedMatch,
      lastUpdated: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
      }
    });

  } catch (error) {
    console.error('Error fetching match:', error);
    return Response.json({
      error: 'Failed to fetch match data',
      details: error.message
    }, { status: 500 });
  }
}

// Mapper les statuts de l'API vers nos statuts
function mapStatus(apiStatus) {
  const statusMap = {
    'TIMED': 'upcoming',
    'SCHEDULED': 'upcoming',
    'LIVE': 'live',
    'IN_PLAY': 'live',
    'PAUSED': 'live',
    'HALFTIME': 'live',
    'FINISHED': 'finished',
    'AWARDED': 'finished',
    'SUSPENDED': 'suspended',
    'POSTPONED': 'postponed',
    'CANCELLED': 'cancelled'
  };
  return statusMap[apiStatus] || 'unknown';
}

// Déterminer le gagnant
function determineWinner(match) {
  if (match.status !== 'FINISHED') return null;

  const homeScore = match.score.fullTime.home;
  const awayScore = match.score.fullTime.away;

  if (homeScore === null || awayScore === null) return null;

  if (homeScore > awayScore) return 'team1';
  if (awayScore > homeScore) return 'team2';
  return 'draw';
}

// Handle CORS preflight
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
