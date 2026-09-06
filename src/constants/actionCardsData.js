// Curated Action, Motivation & Location Cards for Kindy

export const COFFEE_MAP_CARDS = [
  {
    id: 'coffee-1',
    side: 'left',
    title: 'Blue Bottle Coffee',
    category: 'Ferry Building Marketplace · 0.1 mi',
    badge: 'BEST PICK',
    isBestPick: true,
    rating: '4.9 ★',
    icon: '☕',
    description: 'Fresh espresso roasted daily with panoramic views of the bay.',
    url: 'https://maps.google.com/?q=Blue+Bottle+Coffee+Ferry+Building+San+Francisco',
    motivationPrompt: 'Tell me more about Blue Bottle Coffee at the Ferry Building!',
  },
  {
    id: 'coffee-2',
    side: 'left',
    title: 'Red Bay Coffee Roasters',
    category: 'Embarcadero Plaza · 0.2 mi',
    badge: 'LOCAL ARTISAN',
    isBestPick: false,
    rating: '4.8 ★',
    icon: '☕',
    description: 'Specialty African & Central American coffees with community focus.',
    url: 'https://maps.google.com/?q=Red+Bay+Coffee+San+Francisco',
    motivationPrompt: 'What makes Red Bay Coffee in San Francisco special?',
  },
  {
    id: 'coffee-3',
    side: 'left',
    title: 'Philz Coffee Embarcadero',
    category: '101 Spear St · 0.3 mi',
    badge: 'FAN FAVORITE',
    isBestPick: false,
    rating: '4.7 ★',
    icon: '🍃',
    description: 'Famous handcrafted Mint Mojito iced coffee made fresh to order.',
    url: 'https://maps.google.com/?q=Philz+Coffee+Embarcadero+San+Francisco',
    motivationPrompt: 'Tell me about Philz Coffee on Embarcadero!',
  },
  {
    id: 'coffee-4',
    side: 'right',
    title: 'Equator Coffees Waterfront',
    category: 'Round House at Golden Gate · Scenic',
    badge: 'CERTIFIED B-CORP',
    isBestPick: false,
    rating: '4.8 ★',
    icon: '✨',
    description: 'Sustainable, ethical fair-trade single-origin coffees.',
    url: 'https://maps.google.com/?q=Equator+Coffees+San+Francisco',
    motivationPrompt: 'Tell me about Equator Coffees and their sustainable mission!',
  },
  {
    id: 'coffee-5',
    side: 'right',
    title: 'Ferry Plaza Food Rescue',
    category: 'Farmers Market · Saturday Morning',
    badge: 'VOLUNTEER',
    isBestPick: false,
    rating: '5.0 ★',
    icon: '🤝',
    description: 'Help distribute farm produce to families in need (Great for LinkedIn!).',
    url: 'https://maps.google.com/?q=Ferry+Plaza+Farmers+Market+San+Francisco',
    motivationPrompt: 'How can volunteering at the Ferry Plaza Food Rescue help my social growth?',
  },
  {
    id: 'coffee-6',
    side: 'right',
    title: 'Embarcadero Bay Trail Walk',
    category: 'Waterfront Promenade · Free Access',
    badge: 'ACTIVE WELLNESS',
    isBestPick: false,
    rating: '4.9 ★',
    icon: '🌊',
    description: 'Take a restorative walk along the harbor to recharge and reflect.',
    url: 'https://maps.google.com/?q=Embarcadero+Promenade+San+Francisco',
    motivationPrompt: 'How does walking along the Embarcadero Bay Trail help my wellness?',
  },
];

export const MOTIVATION_VOLUNTEER_CARDS = [
  {
    id: 'mot-1',
    side: 'left',
    title: 'Community Garden Steward',
    category: 'City Park Conservation · Weekend',
    badge: 'BEST PICK',
    isBestPick: true,
    rating: '4.9 ★',
    icon: '🌱',
    description: 'Boost your social connection & leadership while helping local nature thrive!',
    url: 'https://maps.google.com/?q=Community+Garden+Volunteer',
    motivationPrompt: 'Tell me how volunteering at a community garden can boost my career and LinkedIn!',
  },
  {
    id: 'mot-2',
    side: 'left',
    title: 'Youth Mentorship Circle',
    category: 'STEM & Academic Guidance · In-Person',
    badge: 'HIGH IMPACT',
    isBestPick: false,
    rating: '5.0 ★',
    icon: '🎓',
    description: 'Guide ambitious students in learning. Adds powerful social leadership to your profile.',
    url: 'https://www.google.com/search?q=youth+stem+mentorship+volunteer',
    motivationPrompt: 'Why is mentoring students one of the best ways to grow professionally?',
  },
  {
    id: 'mot-3',
    side: 'left',
    title: 'Local Food Rescue Network',
    category: 'City Distribution Center · Morning',
    badge: 'TEAM SPIRIT',
    isBestPick: false,
    rating: '4.9 ★',
    icon: '❤️',
    description: 'Help sort and share nutrition. Meet inspiring, kind-hearted people in your area.',
    url: 'https://maps.google.com/?q=Food+Bank+Volunteer',
    motivationPrompt: 'Tell me the impact of helping at a local food bank!',
  },
  {
    id: 'mot-4',
    side: 'right',
    title: 'Tech & Creative Mixer',
    category: 'Innovation District · Thursday 6 PM',
    badge: 'NETWORKING',
    isBestPick: false,
    rating: '4.8 ★',
    icon: '💼',
    description: 'Share your journey, discover new projects, and expand professional horizons.',
    url: 'https://www.google.com/search?q=tech+creator+meetup+near+me',
    motivationPrompt: 'How do I make the most out of attending a local tech meetup?',
  },
  {
    id: 'mot-5',
    side: 'right',
    title: 'Public Library Tech Coach',
    category: 'Public Library · Flexible Afternoon',
    badge: 'SKILL SHARING',
    isBestPick: false,
    rating: '4.9 ★',
    icon: '📚',
    description: 'Teach seniors smartphone & digital skills. A deeply rewarding way to give back.',
    url: 'https://maps.google.com/?q=Public+Library',
    motivationPrompt: 'What makes tech coaching at the library so meaningful?',
  },
  {
    id: 'mot-6',
    side: 'right',
    title: 'Nature Trail Conservation',
    category: 'Coastal Eco Stewardship · Sunday',
    badge: 'HEALTH & NATURE',
    isBestPick: false,
    rating: '4.9 ★',
    icon: '🌲',
    description: 'Get fresh air, exercise with friends, and share your environmental impact on LinkedIn!',
    url: 'https://maps.google.com/?q=Nature+Reserve+Clean+Up',
    motivationPrompt: 'Tell me how outdoor conservation helps both nature and personal health!',
  },
];

/**
 * Build dynamic cards from Gemini grounding sources (Google Maps & Search)
 */
export function buildCardsFromGrounding(sources = [], query = '') {
  if (!sources || sources.length === 0) return null;

  return sources.slice(0, 6).map((source, index) => {
    const isBestPick = index === 0;
    const isMaps = source.isMaps || (source.url && source.url.includes('maps'));
    const side = index % 2 === 0 ? 'left' : 'right';

    return {
      id: `grounding-${index}`,
      side,
      title: source.title || (isMaps ? 'Google Maps Destination' : 'Grounding Source'),
      category: isMaps ? 'Google Maps Verified' : 'Web Grounded Source',
      badge: isBestPick ? 'BEST PICK' : (isMaps ? 'VENUE' : 'CITATION'),
      isBestPick,
      rating: isMaps ? '4.9 ★' : null,
      icon: isMaps ? '📍' : '🌐',
      description: isMaps
        ? 'Verified location via Google Maps. Click to explore directions and details!'
        : 'Grounded information verified directly by Google Search.',
      url: source.url,
      motivationPrompt: `Tell me more about ${source.title}!`,
    };
  });
}

/**
 * Format arbitrary cards generated directly by LLM
 */
export function formatLLMCards(cards = []) {
  if (!Array.isArray(cards) || cards.length === 0) return [];

  return cards.slice(0, 6).map((item, index) => {
    const isBestPick = item.isBestPick === true || item.bestPick === true || index === 0 && item.badge === 'BEST PICK';
    const side = item.side || (index < 3 ? 'left' : 'right');

    return {
      id: item.id || `llm-card-${index}`,
      side,
      title: item.title || 'Recommendation',
      category: item.category || item.place || 'Guide',
      badge: isBestPick ? 'BEST PICK' : (item.badge || 'CHOICE'),
      isBestPick,
      rating: item.rating || (isBestPick ? '4.9 ★' : '4.8 ★'),
      icon: item.icon || (isBestPick ? '⭐' : '📍'),
      description: item.description || item.story || item.details || '',
      url: item.url || (item.title ? `https://maps.google.com/?q=${encodeURIComponent(item.title)}` : null),
      motivationPrompt: item.motivationPrompt || `Tell me more about ${item.title} and why you recommend it!`,
    };
  });
}

