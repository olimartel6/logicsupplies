// Tier definitions (default, can be overridden by business config)
const DEFAULT_TIERS = [
  { name: 'Bronze', min_points: 0, multiplier: 1, color: '#CD7F32', icon: '🥉' },
  { name: 'Argent', min_points: 500, multiplier: 1.5, color: '#C0C0C0', icon: '🥈' },
  { name: 'Or', min_points: 2000, multiplier: 2, color: '#FFD700', icon: '🥇' },
  { name: 'Platine', min_points: 5000, multiplier: 3, color: '#E5E4E2', icon: '💎' },
];

export function getTier(totalPointsEarned, businessTiers) {
  const tiers = businessTiers || DEFAULT_TIERS;
  let current = tiers[0];
  for (const tier of tiers) {
    if (totalPointsEarned >= tier.min_points) current = tier;
  }
  return current;
}

export function getNextTier(totalPointsEarned, businessTiers) {
  const tiers = businessTiers || DEFAULT_TIERS;
  for (const tier of tiers) {
    if (tier.min_points > totalPointsEarned) return tier;
  }
  return null; // max tier reached
}

export function isBirthdayToday(birthday) {
  if (!birthday) return false;
  const today = new Date();
  const bday = new Date(birthday);
  return today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate();
}

export function shouldGetSurpriseReward(visitCount) {
  // Every 10th visit gets a surprise reward
  return visitCount > 0 && visitCount % 10 === 0;
}
