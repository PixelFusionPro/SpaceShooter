// Game Configuration and Constants

const CONFIG = {
  // Canvas
  CANVAS_WIDTH: 360,
  CANVAS_HEIGHT: 600,

  // Player
  PLAYER: {
    SIZE: 7.5,
    SPEED_NORMAL: 2.5,
    SPEED_BOOSTED: 4.5,
    MAX_HEALTH: 100,
    REGEN_RATE: 0.2,
    REGEN_INTERVAL: 1000,
    FIRE_RATE: 300, // milliseconds between shots
    MULTISHOT_COUNT: 3, // Number of bullets when multishot active
  },

  // Enemies
  ENEMIES: {
    NORMAL: { SIZE: 7.5, SPEED: 0.9, HEALTH: 2 },
    TANK: { SIZE: 11, SPEED: 0.5, HEALTH: 5 },
    RUNNER: { SIZE: 6, SPEED: 1.5, HEALTH: 1 },
    EXPLOSIVE: { SIZE: 9, SPEED: 1.1, HEALTH: 2 },
    HEALER: { SIZE: 7, SPEED: 0.8, HEALTH: 3 },
    BOSS: { SIZE: 15, SPEED: 0.4, HEALTH: 20, MINION_INTERVAL: 7000, MAX_MINIONS: 10 },
    ELITE_CHANCE: 0.05,
    VARIANT_CHANCE: 0.1,
    DAMAGE_PER_FRAME: 0.1,
    STUCK_THRESHOLD: 300, // frames before respawn
  },

  // Wave System
  WAVE: {
    ENEMIES_PER_WAVE_MULTIPLIER: 4,
    BOSS_WAVE_INTERVAL: 5,
    DIFFICULTY_SCALING: 0.05, // 5% increase per wave
    MAX_DIFFICULTY: 10, // Cap difficulty at 10x (prevents impossible high waves)
    RARE_SPAWN_EXPLOSIVE: 0.05,
    RARE_SPAWN_HEALER: 0.10,
  },

  // Powerups
  POWERUPS: {
    SIZE: 10,
    DROP_CHANCE: 0.25,
    GUARANTEED_DROP_KILLS: 10,
    DURATION: 5000, // milliseconds
    HEAL_AMOUNT: 20,
    MAGNET_RANGE: 100,
    MAGNET_STRENGTH: 0.7,
  },

  // Progression
  PROGRESSION: {
    RANK_VETERAN: 250,    // 5x increase (was 50)
    RANK_ELITE: 1000,     // 10x increase (was 100)
    RANK_LEGEND: 5000,    // 25x increase (was 200)
    COMBO_WINDOW: 2000, // milliseconds
    COMBO_THRESHOLD: 3,
    COMBO_BONUS: 5,
    CURRENCY_BASE: 10, // Increased from 5 for better early game economy
    CURRENCY_SCALING: true, // Enable exponential scaling
    ACHIEVEMENT_VETERAN_WAVE: 10,
  },

  // Bullets
  BULLET: {
    SIZE: 3,
    SPEED: 5,
    MULTISHOT_ANGLE: 0.2,
  },

  // Visual Effects
  PARTICLES: {
    DUST_LIFETIME: 30,
    TRAIL_LIFETIME: 20,
    SPARKLE_LIFETIME: 30,
    BLOOD_LIFETIME: 25,
    NOTICE_LIFETIME: 40,
  },

  // Object Pooling
  POOL: {
    BULLETS_SIZE: 50,
    PARTICLES_SIZE: 100,
  },

  // Companions
  COMPANIONS: {
    DRONE: {
      SIZE: 6,
      SPEED: 3.5,
      ORBIT_RADIUS: 40,
      ORBIT_SPEED: 0.05,
      FIRE_RATE: 500,
      DAMAGE: 0.5,
      HEALTH: 20,
      UNLOCK_WAVE: 10,
      UPGRADE_COST: 500,
    },
    ROBOT: {
      SIZE: 8,
      SPEED: 2.0,
      FOLLOW_DISTANCE: 30,
      FIRE_RATE: 400,
      DAMAGE: 1.0,
      HEALTH: 40,
      UNLOCK_WAVE: 25,
      UPGRADE_COST: 750,
    },
    TURRET: {
      SIZE: 10,
      SPEED: 0,
      FIRE_RATE: 300,
      DAMAGE: 1.5,
      HEALTH: 60,
      RANGE: 150,
      UNLOCK_WAVE: 50,
      UPGRADE_COST: 1000,
    },
    MEDIC: {
      SIZE: 7,
      SPEED: 2.5,
      FOLLOW_DISTANCE: 25,
      HEAL_RATE: 0.5,
      HEAL_INTERVAL: 2000,
      HEALTH: 30,
      UNLOCK_WAVE: 75,
      UPGRADE_COST: 1250,
    },
    TANK: {
      SIZE: 12,
      SPEED: 1.5,
      FOLLOW_DISTANCE: 20,
      FIRE_RATE: 600,
      DAMAGE: 0.8,
      HEALTH: 100,
      TAUNT_RADIUS: 50,
      UNLOCK_WAVE: 100,
      UPGRADE_COST: 1500,
    },
  },

  // Fortress Structures
  FORTRESS: {
    FENCE: {
      HEALTH: 150, // Increased from 50
      SLOW_EFFECT: 0.3, // Slows zombies by 30%
      BLOCKAGE: 1.5, // Increased pushback strength to prevent passing through
      DETERIORATION_RATE: 0.1, // HP lost per second
      DAMAGE_RESISTANCE: 0.2, // Reduces incoming damage by 20%
      UPGRADE_COST: 100, // Cost to upgrade
      UPGRADE_HEALTH_BONUS: 50, // Additional health per upgrade level
    },
    WALL: {
      HEALTH: 300, // Increased from 150
      SLOW_EFFECT: 0.5,
      BLOCKAGE: 2.0,
      DETERIORATION_RATE: 0.05,
      DAMAGE_RESISTANCE: 0.5,
      UPGRADE_COST: 300,
      UPGRADE_HEALTH_BONUS: 100,
    },
    BARRICADE: {
      HEALTH: 200, // Increased from 80
      SLOW_EFFECT: 0.4,
      BLOCKAGE: 1.5,
      DETERIORATION_RATE: 0.2,
      DAMAGE_RESISTANCE: 0.3,
      UPGRADE_COST: 200,
      UPGRADE_HEALTH_BONUS: 75,
    },
    TOWER: {
      HEALTH: 500, // Increased from 200
      SLOW_EFFECT: 0,
      BLOCKAGE: 3.0,
      DETERIORATION_RATE: 0.02,
      DAMAGE_RESISTANCE: 0.6,
      UPGRADE_COST: 500,
      UPGRADE_HEALTH_BONUS: 150,
      // Tower shooting properties
      FIRE_RATE: 800, // milliseconds between shots
      DAMAGE: 1.0, // Base damage per shot
      RANGE: 200, // Shooting range in pixels
      UPGRADE_DAMAGE_BONUS: 0.5, // Additional damage per upgrade level
    },
    GATE: {
      HEALTH: 250, // Increased from 100
      SLOW_EFFECT: 0.2,
      BLOCKAGE: 1.0,
      DETERIORATION_RATE: 0.08,
      DAMAGE_RESISTANCE: 0.4,
      UPGRADE_COST: 250,
      UPGRADE_HEALTH_BONUS: 100,
    },
  },
};
