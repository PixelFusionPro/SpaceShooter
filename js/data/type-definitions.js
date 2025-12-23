// Type Definitions for Game Entities
// Single source of truth for type names, icons, and descriptions

/**
 * Fortress Structure Type Definitions
 * Used by: fortress-manager.js, fortress-ui.js
 */
const FORTRESS_TYPES = {
  'fence': {
    name: 'Wooden Fence',
    icon: '🪵',
    description: 'Basic wooden defensive barrier'
  },
  'wall': {
    name: 'Stone Wall',
    icon: '🧱',
    description: 'Strong stone defensive wall'
  },
  'barricade': {
    name: 'Barricade',
    icon: '🪨',
    description: 'Heavy barricade for strong defense'
  },
  'tower': {
    name: 'Guard Tower',
    icon: '🗼',
    description: 'Defensive tower with automated weapons'
  },
  'gate': {
    name: 'Gate',
    icon: '🚪',
    description: 'Fortified gate structure'
  }
};

/**
 * Companion Type Definitions
 * Used by: companion-manager.js, companion-ui.js
 */
const COMPANION_TYPES = {
  'drone': {
    name: 'Attack Drone',
    icon: '🤖',
    description: 'Fast aerial combat drone'
  },
  'robot': {
    name: 'Combat Robot',
    icon: '🦾',
    description: 'Heavy ground combat unit'
  },
  'turret': {
    name: 'Auto Turret',
    icon: '🔫',
    description: 'Stationary automated defense turret'
  },
  'medic': {
    name: 'Medical Drone',
    icon: '⚕️',
    description: 'Support drone with healing capabilities'
  },
  'tank': {
    name: 'Tank Companion',
    icon: '🛡️',
    description: 'Heavily armored tank unit'
  }
};

/**
 * Powerup Type Definitions
 * Used by: powerups.js, powerup-related UI
 */
const POWERUP_TYPES = {
  // Tier 1
  'heal': {
    name: 'Health',
    icon: '+',
    tier: 1,
    description: 'Restore 25% health'
  },
  'speed': {
    name: 'Speed Boost',
    icon: '➤',
    tier: 1,
    description: 'Increase movement speed'
  },
  'multishot': {
    name: 'Multishot',
    icon: '⋮',
    tier: 1,
    description: 'Fire multiple bullets'
  },
  'shield': {
    name: 'Shield',
    icon: '⛨',
    tier: 1,
    description: 'Absorb damage'
  },
  // Tier 2
  'damage': {
    name: 'Damage Boost',
    icon: '⚔',
    tier: 2,
    description: '+50% bullet damage'
  },
  'firerate': {
    name: 'Fire Rate',
    icon: '⚡',
    tier: 2,
    description: '2x fire rate'
  },
  'regen': {
    name: 'Regeneration',
    icon: '♥',
    tier: 2,
    description: 'Heal over time'
  },
  // Tier 3
  'invincibility': {
    name: 'Invincibility',
    icon: '★',
    tier: 3,
    description: 'Temporary invulnerability'
  },
  'timeslow': {
    name: 'Time Slow',
    icon: '⏱',
    tier: 3,
    description: 'Slow all enemies'
  },
  'explosive': {
    name: 'Explosive Rounds',
    icon: '💥',
    tier: 3,
    description: 'Bullets deal AoE damage'
  },
  'homing': {
    name: 'Homing Bullets',
    icon: '🎯',
    tier: 3,
    description: 'Bullets track enemies'
  }
};

/**
 * Enemy Type Definitions
 * Used by: enemy-manager.js, wave-manager.js
 */
const ENEMY_TYPES = {
  'normal': {
    name: 'Zombie',
    description: 'Standard undead enemy'
  },
  'fast': {
    name: 'Runner',
    description: 'Fast moving zombie'
  },
  'heavy': {
    name: 'Brute',
    description: 'Heavily armored zombie'
  },
  'explosive': {
    name: 'Exploder',
    description: 'Explodes on death'
  },
  'healer': {
    name: 'Necromancer',
    description: 'Heals nearby enemies'
  },
  'boss': {
    name: 'Boss',
    description: 'Powerful boss enemy'
  }
};

/**
 * Helper function to get type info
 * @param {string} category - 'fortress', 'companion', 'powerup', or 'enemy'
 * @param {string} type - The type key (e.g., 'fence', 'drone', etc.)
 * @returns {object} Type information object
 */
function getTypeInfo(category, type) {
  const categories = {
    'fortress': FORTRESS_TYPES,
    'companion': COMPANION_TYPES,
    'powerup': POWERUP_TYPES,
    'enemy': ENEMY_TYPES
  };

  const typeMap = categories[category.toLowerCase()];
  if (!typeMap) {
    console.warn(`Unknown category: ${category}`);
    return { name: type, icon: '?', description: 'Unknown type' };
  }

  return typeMap[type.toLowerCase()] || { name: type, icon: '?', description: 'Unknown type' };
}

/**
 * Get just the display name for a type
 * @param {string} category - Category name
 * @param {string} type - Type key
 * @returns {string} Display name
 */
function getTypeName(category, type) {
  return getTypeInfo(category, type).name;
}

/**
 * Get just the icon for a type
 * @param {string} category - Category name
 * @param {string} type - Type key
 * @returns {string} Icon emoji
 */
function getTypeIcon(category, type) {
  return getTypeInfo(category, type).icon;
}
