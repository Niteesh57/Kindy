// Curated Action, Motivation & Location Cards for Kindy

export const COFFEE_MAP_CARDS = [
  {
    id: 'coffee-1',
    side: 'left',
    title: 'Blue Bottle Coffee',
    category: 'Local Marketplace · 0.1 mi',
    badge: 'BEST PICK',
    isBestPick: true,
    rating: '4.9 ★',
    icon: '☕',
    description: 'Fresh espresso roasted daily with panoramic views of the bay.',
    url: 'https://maps.google.com/?q=Artisan+Coffee',
    motivationPrompt: 'Tell me more about this local artisan coffee spot!',
  },
  {
    id: 'coffee-2',
    side: 'left',
    title: 'Red Bay Coffee Roasters',
    category: 'Community Hub · 0.2 mi',
    badge: 'LOCAL ARTISAN',
    isBestPick: false,
    rating: '4.8 ★',
    icon: '☕',
    description: 'Specialty African & Central American coffees with community focus.',
    url: 'https://maps.google.com/?q=Local+Coffee+Roasters',
    motivationPrompt: 'What makes this specialty coffee spot unique?',
  },
  {
    id: 'coffee-3',
    side: 'left',
    title: 'Philz Coffee House',
    category: 'Downtown · 0.3 mi',
    badge: 'FAN FAVORITE',
    isBestPick: false,
    rating: '4.7 ★',
    icon: '🍃',
    description: 'Famous handcrafted Mint Mojito iced coffee made fresh to order.',
    url: 'https://maps.google.com/?q=Craft+Coffee',
    motivationPrompt: 'Tell me about this craft coffee house!',
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
 * 6 Multi-Purpose Impact & Reason Cards (Showing tangible gains & consequences of skipping)
 */
export const WHY_VOLUNTEER_IMPACT_CARDS = [
  {
    id: 'impact-1',
    side: 'left',
    title: 'Network Expansion & Mentors',
    category: 'Social & Career Capital',
    badge: 'BEST PICK',
    isBestPick: true,
    stat: '+520 Network',
    impactType: 'positive',
    icon: '🤝',
    description: 'Direct connections with local founders, educators, and leaders who unlock recommendations and job referrals.',
    actionPrompt: 'Explore network impact ↗',
    motivationPrompt: 'How does this volunteer work expand my network with 500+ connections?',
  },
  {
    id: 'impact-2',
    side: 'left',
    title: 'Hands-on Team Leadership',
    category: 'Skill Mastery',
    badge: 'LEADERSHIP',
    isBestPick: false,
    stat: 'Executive Practice',
    impactType: 'positive',
    icon: '⚡',
    description: 'Practical experience guiding groups and coordinating projects that classroom courses can never replicate.',
    actionPrompt: 'See leadership benefits ↗',
    motivationPrompt: 'How will volunteering build my real leadership and communication skills?',
  },
  {
    id: 'impact-3',
    side: 'left',
    title: 'Social Capital & Convenience',
    category: 'Community Reach',
    badge: 'ALLIES & ACCESS',
    isBestPick: false,
    stat: 'Lifelong Allies',
    impactType: 'positive',
    icon: '🌐',
    description: 'People in your city know your character firsthand. That creates instant social convenience for collaborations.',
    actionPrompt: 'See community advantage ↗',
    motivationPrompt: 'What does social capital and convenience mean for my future?',
  },
  {
    id: 'impact-4',
    side: 'right',
    title: 'Resume & Portfolio Proof',
    category: 'Career Distinction',
    badge: 'STANDOUT PROOF',
    isBestPick: false,
    stat: 'Top 5% Candidate',
    impactType: 'positive',
    icon: '💼',
    description: 'Concrete proof of initiative and character that hiring managers remember far better than generic resumes.',
    actionPrompt: 'How to frame on LinkedIn ↗',
    motivationPrompt: 'How can I showcase this contribution effectively on my LinkedIn and resume?',
  },
  {
    id: 'impact-5',
    side: 'right',
    title: 'Dopamine & Mental Energy',
    category: 'Wellbeing & Vitality',
    badge: 'VITALITY BOOST',
    isBestPick: false,
    stat: 'Mental Clarity',
    impactType: 'positive',
    icon: '✨',
    description: 'Breaking screen isolation with meaningful human contact releases endorphins and recharges your mental focus.',
    actionPrompt: 'Why wellness matters ↗',
    motivationPrompt: 'Why does helping others boost personal happiness and mental clarity?',
  },
  {
    id: 'impact-6',
    side: 'right',
    title: 'The Cost of Skipping Out',
    category: 'Reality Check',
    badge: 'COST OF INACTION',
    isBestPick: false,
    stat: 'Zero Growth',
    impactType: 'negative',
    icon: '⚠️',
    description: 'Staying home preserves comfort, but keeps your network, practical leadership, and visibility completely flat.',
    actionPrompt: 'Discuss comfort zone ↗',
    motivationPrompt: 'What is the actual downside if I choose to stay home and not participate?',
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
 * Format arbitrary cards generated directly by LLM (supports impact stats, consequences, and optional URLs)
 */
export function formatLLMCards(cards = []) {
  if (!Array.isArray(cards) || cards.length === 0) return [];

  return cards.slice(0, 6).map((item, index) => {
    const isBestPick =
      item.isBestPick === true ||
      item.bestPick === true ||
      (index === 0 && item.badge === 'BEST PICK');
    const side = item.side || (index < 3 ? 'left' : 'right');
    const isNegative =
      item.impactType === 'negative' ||
      Boolean(
        item.badge &&
          (item.badge.includes('RISK') ||
            item.badge.includes('COST') ||
            item.badge.includes('LOSS') ||
            item.badge.includes('SKIP') ||
            item.badge.includes('INACTION'))
      );

    return {
      id: item.id || `llm-card-${index}`,
      side,
      title: item.title || 'Insight & Impact',
      category: item.category || item.place || (item.stat ? 'Tangible Impact' : 'Guide'),
      badge: isBestPick ? 'BEST PICK' : (item.badge || (item.stat ? 'KEY IMPACT' : 'RECOMMENDED')),
      isBestPick,
      rating: item.rating || (isBestPick && item.url ? '4.9 ★' : null),
      icon: item.icon || (isBestPick ? '⭐' : (isNegative ? '⚠️' : '💡')),
      stat: item.stat || item.impact || null,
      impactType: isNegative ? 'negative' : 'positive',
      description: item.description || item.story || item.details || '',
      url: item.url || null, // URL is optional — impact/reason cards do not need fake maps links
      actionPrompt: item.actionPrompt || (item.url ? null : 'Discuss with Kindy ↗'),
      motivationPrompt:
        item.motivationPrompt || `Tell me more about "${item.title}" and why this impact matters!`,
    };
  });
}

