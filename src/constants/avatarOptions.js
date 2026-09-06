export const FACE_COLORS = [
  { label: 'Fair Light', value: '#F9C9B6' },
  { label: 'Peach', value: '#F8D2B1' },
  { label: 'Warm Beige', value: '#F3C49B' },
  { label: 'Honey Almond', value: '#D89E75' },
  { label: 'Caramel', value: '#B97B51' },
  { label: 'Rich Chestnut', value: '#8C4D2E' },
  { label: 'Deep Espresso', value: '#543224' },
];

export const HAIR_COLORS = [
  { label: 'Jet Black', value: '#18181b' },
  { label: 'Dark Cocoa', value: '#3f2e27' },
  { label: 'Caramel Brown', value: '#794a2b' },
  { label: 'Golden Blonde', value: '#fcd34d' },
  { label: 'Soft Copper', value: '#ea580c' },
  { label: 'Ruby Crimson', value: '#e11d48' },
  { label: 'Pastel Rose', value: '#f472b6' },
  { label: 'Electric Blue', value: '#06b6d4' },
  { label: 'Neon Emerald', value: '#10b981' },
  { label: 'Cyber Violet', value: '#8b5cf6' },
  { label: 'Silver Mist', value: '#cbd5e1' },
];

export const SHIRT_COLORS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Sky Blue', value: '#38bdf8' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Coral Sunset', value: '#f97316' },
  { label: 'Rose Wine', value: '#f43f5e' },
  { label: 'Amethyst', value: '#a855f7' },
  { label: 'Obsidian', value: '#1e293b' },
  { label: 'Soft Cloud', value: '#f8fafc' },
  { label: 'Mustard', value: '#eab308' },
];

export const HAT_COLORS = [
  { label: 'Matte Black', value: '#1f2937' },
  { label: 'Sky Blue', value: '#38bdf8' },
  { label: 'Coral', value: '#fb7185' },
  { label: 'Electric Lime', value: '#84cc16' },
  { label: 'Golden Sun', value: '#fbbf24' },
  { label: 'Purple Iris', value: '#8b5cf6' },
  { label: 'Pure White', value: '#ffffff' },
  { label: 'Sand Brown', value: '#a8825c' },
];

export const STYLE_OPTIONS = {
  sex: [
    { value: 'man', label: 'Man', icon: '👨' },
    { value: 'woman', label: 'Woman', icon: '👩' },
  ],
  shape: [
    { value: 'circle', label: 'Circle', icon: '⚪' },
    { value: 'rounded', label: 'Rounded', icon: '▢' },
    { value: 'square', label: 'Square', icon: '■' },
  ],
  earSize: [
    { value: 'small', label: 'Small Ears' },
    { value: 'big', label: 'Big Ears' },
  ],
  hairStyle: [
    { value: 'normal', label: 'Normal' },
    { value: 'thick', label: 'Thick' },
    { value: 'mohawk', label: 'Mohawk' },
    { value: 'womanLong', label: 'Long Waves' },
    { value: 'womanShort', label: 'Short Bob' },
  ],
  hairStyleMan: [
    { value: 'normal', label: 'Normal' },
    { value: 'thick', label: 'Thick' },
    { value: 'mohawk', label: 'Mohawk' },
  ],
  hairStyleWoman: [
    { value: 'normal', label: 'Normal' },
    { value: 'womanLong', label: 'Long Waves' },
    { value: 'womanShort', label: 'Short Bob' },
  ],
  hatStyle: [
    { value: 'none', label: 'No Hat' },
    { value: 'beanie', label: 'Beanie' },
    { value: 'turban', label: 'Turban' },
  ],
  eyeStyle: [
    { value: 'circle', label: 'Circle Eyes' },
    { value: 'oval', label: 'Oval Eyes' },
    { value: 'smile', label: 'Smiling Eyes' },
  ],
  glassesStyle: [
    { value: 'none', label: 'No Glasses' },
    { value: 'round', label: 'Round Frames' },
    { value: 'square', label: 'Square Frames' },
  ],
  noseStyle: [
    { value: 'short', label: 'Short Nose' },
    { value: 'long', label: 'Long Nose' },
    { value: 'round', label: 'Button Nose' },
  ],
  mouthStyle: [
    { value: 'laugh', label: 'Laugh' },
    { value: 'smile', label: 'Smile' },
    { value: 'peace', label: 'Gentle Peace' },
  ],
  shirtStyle: [
    { value: 'hoody', label: 'Hoodie' },
    { value: 'short', label: 'T-Shirt' },
    { value: 'polo', label: 'Polo Shirt' },
  ],
};

export const VIBRANT_BACKGROUNDS = [
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    value: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 50%, #fecdd3 100%)',
    iconColor: '#fb923c',
  },
  {
    id: 'sky-azure',
    name: 'Sky Azure',
    value: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
    iconColor: '#38bdf8',
  },
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    value: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 50%, #86efac 100%)',
    iconColor: '#4ade80',
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    value: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 50%, #c4b5fd 100%)',
    iconColor: '#a855f7',
  },
  {
    id: 'sunny-citrus',
    name: 'Sunny Citrus',
    value: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
    iconColor: '#f59e0b',
  },
  {
    id: 'candy-pop',
    name: 'Candy Pop',
    value: 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 50%, #f472b6 100%)',
    iconColor: '#f43f5e',
  },
  {
    id: 'coral-breeze',
    name: 'Coral Breeze',
    value: 'linear-gradient(135deg, #fff1f2 0%, #fed7aa 50%, #fbcfe8 100%)',
    iconColor: '#fb7185',
  },
  {
    id: 'electric-violet',
    name: 'Electric Violet',
    value: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
    iconColor: '#6366f1',
  },
  {
    id: 'tropical-punch',
    name: 'Tropical Punch',
    value: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 50%, #fdba74 100%)',
    iconColor: '#eab308',
  },
  {
    id: 'cyan-aurora',
    name: 'Cyan Aurora',
    value: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 50%, #67e8f9 100%)',
    iconColor: '#06b6d4',
  },
  {
    id: 'pure-studio',
    name: 'Studio White',
    value: '#ffffff',
    iconColor: '#94a3b8',
  },
];
