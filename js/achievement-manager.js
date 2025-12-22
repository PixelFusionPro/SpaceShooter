// Achievement Manager - Comprehensive achievement system with 50+ achievements

class AchievementManager {
  constructor(scoreManager = null) {
    this.scoreManager = scoreManager;

    // Load achievement data from localStorage
    this.loadAchievements();

    // Notification queue
    this.notificationQueue = [];
    this.showingNotification = false;
    this.notificationElement = document.getElementById('achievementNotification');

    // Initialize achievement definitions
    this.initializeAchievementDefinitions();
  }

  // Load achievements from localStorage
  loadAchievements() {
    const stored = localStorage.getItem('achievementsV2');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.unlockedAchievements = data.unlocked || {};
        this.stats = data.stats || this.getDefaultStats();
      } catch (e) {
        console.error('Failed to load achievements:', e);
        this.resetAchievements();
      }
    } else {
      this.resetAchievements();
    }
  }

  // Reset achievements to default state
  resetAchievements() {
    this.unlockedAchievements = {};
    this.stats = this.getDefaultStats();
  }

  // Get default stats structure
  getDefaultStats() {
    return {
      totalKills: 0,
      eliteKills: 0,
      bossKills: 0,
      powerupsCollected: 0,
      companionsUnlocked: 0,
      itemsPurchased: 0,
      wavesCompleted: 0,
      gamesPlayed: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      bulletsUsed: 0,
      criticalHits: 0,
      coinsEarned: 0,
      coinsSpent: 0,
      // Fortress stats
      structuresBuilt: 0,
      towerKills: 0,
      damageBlocked: 0,
      maxUpgradeLevel: 0,
      structuresRepaired: 0,
      fortressCoinsSpent: 0
    };
  }

  // Define all 50+ achievements with rewards
  initializeAchievementDefinitions() {
    this.achievements = {
      // === COMBAT ACHIEVEMENTS (16) ===
      'first_blood': {
        id: 'first_blood',
        title: 'First Blood',
        description: 'Destroy your first enemy',
        category: 'combat',
        tier: 'bronze',
        requirement: { type: 'kills', value: 1 },
        reward: { coins: 50, statBoost: null }
      },
      'killer': {
        id: 'killer',
        title: 'Killer',
        description: 'Destroy 50 enemies',
        category: 'combat',
        tier: 'bronze',
        requirement: { type: 'kills', value: 50 },
        reward: { coins: 100, statBoost: null }
      },
      'sharpshooter': {
        id: 'sharpshooter',
        title: 'Sharpshooter',
        description: 'Destroy 100 enemies',
        category: 'combat',
        tier: 'silver',
        requirement: { type: 'kills', value: 100 },
        reward: { coins: 250, statBoost: { damage: 0.5 } }
      },
      'executioner': {
        id: 'executioner',
        title: 'Executioner',
        description: 'Destroy 500 enemies',
        category: 'combat',
        tier: 'silver',
        requirement: { type: 'kills', value: 500 },
        reward: { coins: 500, statBoost: null }
      },
      'annihilator': {
        id: 'annihilator',
        title: 'Annihilator',
        description: 'Destroy 1,000 enemies',
        category: 'combat',
        tier: 'gold',
        requirement: { type: 'kills', value: 1000 },
        reward: { coins: 1000, statBoost: { damage: 1 } }
      },
      'genocide': {
        id: 'genocide',
        title: 'Genocide',
        description: 'Destroy 5,000 enemies',
        category: 'combat',
        tier: 'platinum',
        requirement: { type: 'kills', value: 5000 },
        reward: { coins: 2500, statBoost: { damage: 2 } }
      },
      'elite_hunter': {
        id: 'elite_hunter',
        title: 'Elite Hunter',
        description: 'Destroy 10 elite enemies',
        category: 'combat',
        tier: 'silver',
        requirement: { type: 'eliteKills', value: 10 },
        reward: { coins: 300, statBoost: null }
      },
      'elite_slayer': {
        id: 'elite_slayer',
        title: 'Elite Slayer',
        description: 'Destroy 50 elite enemies',
        category: 'combat',
        tier: 'gold',
        requirement: { type: 'eliteKills', value: 50 },
        reward: { coins: 750, statBoost: { critChance: 0.05 } }
      },
      'boss_slayer': {
        id: 'boss_slayer',
        title: 'Boss Slayer',
        description: 'Defeat 5 bosses',
        category: 'combat',
        tier: 'silver',
        requirement: { type: 'bossKills', value: 5 },
        reward: { coins: 400, statBoost: null }
      },
      'boss_hunter': {
        id: 'boss_hunter',
        title: 'Boss Hunter',
        description: 'Defeat 25 bosses',
        category: 'combat',
        tier: 'gold',
        requirement: { type: 'bossKills', value: 25 },
        reward: { coins: 1000, statBoost: { maxHealth: 10 } }
      },
      'boss_annihilator': {
        id: 'boss_annihilator',
        title: 'Boss Annihilator',
        description: 'Defeat 100 bosses',
        category: 'combat',
        tier: 'platinum',
        requirement: { type: 'bossKills', value: 100 },
        reward: { coins: 3000, statBoost: { maxHealth: 25 } }
      },
      'critical_striker': {
        id: 'critical_striker',
        title: 'Critical Striker',
        description: 'Land 100 critical hits',
        category: 'combat',
        tier: 'silver',
        requirement: { type: 'criticalHits', value: 100 },
        reward: { coins: 300, statBoost: { critChance: 0.02 } }
      },
      'critical_master': {
        id: 'critical_master',
        title: 'Critical Master',
        description: 'Land 500 critical hits',
        category: 'combat',
        tier: 'gold',
        requirement: { type: 'criticalHits', value: 500 },
        reward: { coins: 800, statBoost: { critMultiplier: 0.25 } }
      },
      'damage_dealer': {
        id: 'damage_dealer',
        title: 'Damage Dealer',
        description: 'Deal 10,000 total damage',
        category: 'combat',
        tier: 'silver',
        requirement: { type: 'totalDamageDealt', value: 10000 },
        reward: { coins: 400, statBoost: null }
      },
      'obliterator': {
        id: 'obliterator',
        title: 'Obliterator',
        description: 'Deal 100,000 total damage',
        category: 'combat',
        tier: 'gold',
        requirement: { type: 'totalDamageDealt', value: 100000 },
        reward: { coins: 1200, statBoost: { damage: 1.5 } }
      },
      'arsenal': {
        id: 'arsenal',
        title: 'Arsenal',
        description: 'Fire 1,000 bullets',
        category: 'combat',
        tier: 'bronze',
        requirement: { type: 'bulletsUsed', value: 1000 },
        reward: { coins: 150, statBoost: null }
      },

      // === SURVIVAL ACHIEVEMENTS (14) ===
      'survivor': {
        id: 'survivor',
        title: 'Survivor',
        description: 'Complete Wave 10',
        category: 'survival',
        tier: 'bronze',
        requirement: { type: 'wave', value: 10 },
        reward: { coins: 200, statBoost: null }
      },
      'veteran': {
        id: 'veteran',
        title: 'Veteran',
        description: 'Complete Wave 25',
        category: 'survival',
        tier: 'silver',
        requirement: { type: 'wave', value: 25 },
        reward: { coins: 500, statBoost: { maxHealth: 5 } }
      },
      'warrior': {
        id: 'warrior',
        title: 'Warrior',
        description: 'Complete Wave 50',
        category: 'survival',
        tier: 'gold',
        requirement: { type: 'wave', value: 50 },
        reward: { coins: 1000, statBoost: { maxHealth: 10 } }
      },
      'champion': {
        id: 'champion',
        title: 'Champion',
        description: 'Complete Wave 100',
        category: 'survival',
        tier: 'gold',
        requirement: { type: 'wave', value: 100 },
        reward: { coins: 2000, statBoost: { regenRate: 0.1 } }
      },
      'legend': {
        id: 'legend',
        title: 'Legend',
        description: 'Complete Wave 250',
        category: 'survival',
        tier: 'platinum',
        requirement: { type: 'wave', value: 250 },
        reward: { coins: 5000, statBoost: { maxHealth: 20, damage: 2 } }
      },
      'immortal': {
        id: 'immortal',
        title: 'Immortal',
        description: 'Complete Wave 500',
        category: 'survival',
        tier: 'platinum',
        requirement: { type: 'wave', value: 500 },
        reward: { coins: 10000, statBoost: { maxHealth: 50, regenRate: 0.2 } }
      },
      'ascended': {
        id: 'ascended',
        title: 'Ascended',
        description: 'Complete Wave 1000',
        category: 'survival',
        tier: 'platinum',
        requirement: { type: 'wave', value: 1000 },
        reward: { coins: 25000, statBoost: { maxHealth: 100, damage: 5, regenRate: 0.5 } }
      },
      'iron_will': {
        id: 'iron_will',
        title: 'Iron Will',
        description: 'Take 1,000 damage and survive',
        category: 'survival',
        tier: 'bronze',
        requirement: { type: 'totalDamageTaken', value: 1000 },
        reward: { coins: 200, statBoost: null }
      },
      'titanium': {
        id: 'titanium',
        title: 'Titanium',
        description: 'Take 10,000 damage and survive',
        category: 'survival',
        tier: 'silver',
        requirement: { type: 'totalDamageTaken', value: 10000 },
        reward: { coins: 500, statBoost: { maxHealth: 15 } }
      },
      'adamantium': {
        id: 'adamantium',
        title: 'Adamantium',
        description: 'Take 50,000 damage and survive',
        category: 'survival',
        tier: 'gold',
        requirement: { type: 'totalDamageTaken', value: 50000 },
        reward: { coins: 1500, statBoost: { maxHealth: 30 } }
      },
      'dedicated': {
        id: 'dedicated',
        title: 'Dedicated',
        description: 'Play 10 games',
        category: 'survival',
        tier: 'bronze',
        requirement: { type: 'gamesPlayed', value: 10 },
        reward: { coins: 250, statBoost: null }
      },
      'persistent': {
        id: 'persistent',
        title: 'Persistent',
        description: 'Play 50 games',
        category: 'survival',
        tier: 'silver',
        requirement: { type: 'gamesPlayed', value: 50 },
        reward: { coins: 750, statBoost: { coinMultiplier: 0.05 } }
      },
      'obsessed': {
        id: 'obsessed',
        title: 'Obsessed',
        description: 'Play 100 games',
        category: 'survival',
        tier: 'gold',
        requirement: { type: 'gamesPlayed', value: 100 },
        reward: { coins: 2000, statBoost: { coinMultiplier: 0.1 } }
      },
      'lifetime_waves': {
        id: 'lifetime_waves',
        title: 'Wave Veteran',
        description: 'Complete 500 total waves',
        category: 'survival',
        tier: 'gold',
        requirement: { type: 'wavesCompleted', value: 500 },
        reward: { coins: 1500, statBoost: null }
      },

      // === PROGRESSION ACHIEVEMENTS (10) ===
      'centurion': {
        id: 'centurion',
        title: 'Centurion',
        description: 'Score 100 points',
        category: 'progression',
        tier: 'bronze',
        requirement: { type: 'score', value: 100 },
        reward: { coins: 100, statBoost: null }
      },
      'high_scorer': {
        id: 'high_scorer',
        title: 'High Scorer',
        description: 'Score 500 points',
        category: 'progression',
        tier: 'silver',
        requirement: { type: 'score', value: 500 },
        reward: { coins: 300, statBoost: { scoreMultiplier: 0.05 } }
      },
      'point_master': {
        id: 'point_master',
        title: 'Point Master',
        description: 'Score 2,500 points',
        category: 'progression',
        tier: 'gold',
        requirement: { type: 'score', value: 2500 },
        reward: { coins: 800, statBoost: { scoreMultiplier: 0.1 } }
      },
      'combo_starter': {
        id: 'combo_starter',
        title: 'Combo Starter',
        description: 'Achieve a 5x combo',
        category: 'progression',
        tier: 'bronze',
        requirement: { type: 'combo', value: 5 },
        reward: { coins: 100, statBoost: null }
      },
      'combo_master': {
        id: 'combo_master',
        title: 'Combo Master',
        description: 'Achieve a 10x combo',
        category: 'progression',
        tier: 'silver',
        requirement: { type: 'combo', value: 10 },
        reward: { coins: 300, statBoost: null }
      },
      'combo_god': {
        id: 'combo_god',
        title: 'Combo God',
        description: 'Achieve a 25x combo',
        category: 'progression',
        tier: 'gold',
        requirement: { type: 'combo', value: 25 },
        reward: { coins: 1000, statBoost: { fireRate: 0.05 } }
      },
      'rank_veteran': {
        id: 'rank_veteran',
        title: 'Rank: Veteran',
        description: 'Reach Veteran rank',
        category: 'progression',
        tier: 'silver',
        requirement: { type: 'rank', value: 'Veteran' },
        reward: { coins: 300, statBoost: null }
      },
      'rank_elite': {
        id: 'rank_elite',
        title: 'Rank: Elite',
        description: 'Reach Elite rank',
        category: 'progression',
        tier: 'gold',
        requirement: { type: 'rank', value: 'Elite' },
        reward: { coins: 800, statBoost: null }
      },
      'rank_legend': {
        id: 'rank_legend',
        title: 'Rank: Legend',
        description: 'Reach Legend rank',
        category: 'progression',
        tier: 'platinum',
        requirement: { type: 'rank', value: 'Legend' },
        reward: { coins: 2000, statBoost: { maxHealth: 15, damage: 2 } }
      },
      'power_collector': {
        id: 'power_collector',
        title: 'Power Collector',
        description: 'Collect 50 powerups',
        category: 'progression',
        tier: 'silver',
        requirement: { type: 'powerupsCollected', value: 50 },
        reward: { coins: 250, statBoost: null }
      },

      // === ECONOMY ACHIEVEMENTS (8) ===
      'shopper': {
        id: 'shopper',
        title: 'Shopper',
        description: 'Purchase 10 items',
        category: 'economy',
        tier: 'bronze',
        requirement: { type: 'itemsPurchased', value: 10 },
        reward: { coins: 200, statBoost: null }
      },
      'collector': {
        id: 'collector',
        title: 'Collector',
        description: 'Purchase 50 items',
        category: 'economy',
        tier: 'silver',
        requirement: { type: 'itemsPurchased', value: 50 },
        reward: { coins: 500, statBoost: null }
      },
      'hoarder': {
        id: 'hoarder',
        title: 'Hoarder',
        description: 'Purchase 100 items',
        category: 'economy',
        tier: 'gold',
        requirement: { type: 'itemsPurchased', value: 100 },
        reward: { coins: 1000, statBoost: { coinMultiplier: 0.1 } }
      },
      'money_maker': {
        id: 'money_maker',
        title: 'Money Maker',
        description: 'Earn 5,000 total coins',
        category: 'economy',
        tier: 'silver',
        requirement: { type: 'coinsEarned', value: 5000 },
        reward: { coins: 500, statBoost: null }
      },
      'tycoon': {
        id: 'tycoon',
        title: 'Tycoon',
        description: 'Earn 25,000 total coins',
        category: 'economy',
        tier: 'gold',
        requirement: { type: 'coinsEarned', value: 25000 },
        reward: { coins: 1500, statBoost: { coinMultiplier: 0.15 } }
      },
      'big_spender': {
        id: 'big_spender',
        title: 'Big Spender',
        description: 'Spend 10,000 total coins',
        category: 'economy',
        tier: 'silver',
        requirement: { type: 'coinsSpent', value: 10000 },
        reward: { coins: 500, statBoost: null }
      },
      'whale': {
        id: 'whale',
        title: 'Whale',
        description: 'Spend 50,000 total coins',
        category: 'economy',
        tier: 'gold',
        requirement: { type: 'coinsSpent', value: 50000 },
        reward: { coins: 2000, statBoost: null }
      },
      'companion_master': {
        id: 'companion_master',
        title: 'Companion Master',
        description: 'Unlock all companions',
        category: 'economy',
        tier: 'gold',
        requirement: { type: 'companionsUnlocked', value: 8 },
        reward: { coins: 1000, statBoost: { fireRate: 0.1 } }
      },

      // === FORTRESS ACHIEVEMENTS (10) ===
      'first_builder': {
        id: 'first_builder',
        title: 'First Builder',
        description: 'Build your first fortress structure',
        category: 'fortress',
        tier: 'bronze',
        requirement: { type: 'structuresBuilt', value: 1 },
        reward: { coins: 100, statBoost: null }
      },
      'master_builder': {
        id: 'master_builder',
        title: 'Master Builder',
        description: 'Build 10 fortress structures',
        category: 'fortress',
        tier: 'silver',
        requirement: { type: 'structuresBuilt', value: 10 },
        reward: { coins: 300, statBoost: null }
      },
      'fortress_architect': {
        id: 'fortress_architect',
        title: 'Fortress Architect',
        description: 'Build 25 fortress structures',
        category: 'fortress',
        tier: 'gold',
        requirement: { type: 'structuresBuilt', value: 25 },
        reward: { coins: 800, statBoost: { maxHealth: 10 } }
      },
      'tower_defense': {
        id: 'tower_defense',
        title: 'Tower Defense',
        description: 'Towers kill 100 enemies',
        category: 'fortress',
        tier: 'silver',
        requirement: { type: 'towerKills', value: 100 },
        reward: { coins: 400, statBoost: null }
      },
      'tower_master': {
        id: 'tower_master',
        title: 'Tower Master',
        description: 'Towers kill 500 enemies',
        category: 'fortress',
        tier: 'gold',
        requirement: { type: 'towerKills', value: 500 },
        reward: { coins: 1000, statBoost: { damage: 1 } }
      },
      'fortress_stands': {
        id: 'fortress_stands',
        title: 'The Fortress Stands',
        description: 'Block 10,000 total damage with structures',
        category: 'fortress',
        tier: 'gold',
        requirement: { type: 'damageBlocked', value: 10000 },
        reward: { coins: 1200, statBoost: { maxHealth: 15 } }
      },
      'upgrade_master': {
        id: 'upgrade_master',
        title: 'Upgrade Master',
        description: 'Upgrade a structure type to level 5',
        category: 'fortress',
        tier: 'silver',
        requirement: { type: 'maxUpgradeLevel', value: 5 },
        reward: { coins: 500, statBoost: null }
      },
      'fortress_legend': {
        id: 'fortress_legend',
        title: 'Fortress Legend',
        description: 'Upgrade a structure type to level 10',
        category: 'fortress',
        tier: 'gold',
        requirement: { type: 'maxUpgradeLevel', value: 10 },
        reward: { coins: 1500, statBoost: { maxHealth: 20 } }
      },
      'repair_specialist': {
        id: 'repair_specialist',
        title: 'Repair Specialist',
        description: 'Repair structures 50 times',
        category: 'fortress',
        tier: 'silver',
        requirement: { type: 'structuresRepaired', value: 50 },
        reward: { coins: 400, statBoost: null }
      },
      'fortress_veteran': {
        id: 'fortress_veteran',
        title: 'Fortress Veteran',
        description: 'Spend 10,000 coins on fortress upgrades',
        category: 'fortress',
        tier: 'gold',
        requirement: { type: 'fortressCoinsSpent', value: 10000 },
        reward: { coins: 2000, statBoost: { coinMultiplier: 0.05 } }
      }
    };
  }

  // Track a kill
  trackKill(enemy) {
    this.stats.totalKills++;
    if (enemy.elite) this.stats.eliteKills++;
    if (enemy.type === 'boss') this.stats.bossKills++;
    this.saveAchievements();
  }

  // Track powerup collection
  trackPowerup() {
    this.stats.powerupsCollected++;
    this.saveAchievements();
  }

  // Track item purchase
  trackPurchase(cost) {
    this.stats.itemsPurchased++;
    this.stats.coinsSpent += cost;
    this.saveAchievements();
  }

  // Track companion unlock
  trackCompanionUnlock() {
    this.stats.companionsUnlocked++;
    this.saveAchievements();
  }

  // Track damage dealt
  trackDamageDealt(amount) {
    this.stats.totalDamageDealt += amount;
  }

  // Track damage taken
  trackDamageTaken(amount) {
    this.stats.totalDamageTaken += amount;
  }

  // Track bullet fired
  trackBulletFired() {
    this.stats.bulletsUsed++;
  }

  // Track critical hit
  trackCriticalHit() {
    this.stats.criticalHits++;
  }

  // Track coins earned
  trackCoinsEarned(amount) {
    this.stats.coinsEarned += amount;
  }

  // Track wave completion
  trackWaveComplete() {
    this.stats.wavesCompleted++;
    this.saveAchievements();
  }

  // Track game played
  trackGamePlayed() {
    this.stats.gamesPlayed++;
    this.saveAchievements();
  }

  // Track structure built
  trackStructureBuilt() {
    this.stats.structuresBuilt++;
    this.saveAchievements();
  }

  // Track tower kill
  trackTowerKill() {
    this.stats.towerKills++;
  }

  // Track damage blocked by structures
  trackDamageBlocked(amount) {
    this.stats.damageBlocked += amount;
  }

  // Track structure upgrade level
  trackUpgradeLevel(level) {
    if (level > this.stats.maxUpgradeLevel) {
      this.stats.maxUpgradeLevel = level;
      this.saveAchievements();
    }
  }

  // Track structure repair
  trackStructureRepair() {
    this.stats.structuresRepaired++;
    this.saveAchievements();
  }

  // Track fortress coins spent
  trackFortressCoinsSpent(amount) {
    this.stats.fortressCoinsSpent += amount;
    this.saveAchievements();
  }

  // Check and unlock achievements
  check(wave, score, rank, comboCount) {
    const unlocked = [];

    for (const [id, achievement] of Object.entries(this.achievements)) {
      // Skip if already unlocked
      if (this.unlockedAchievements[id]) continue;

      // Check requirement
      let requirementMet = false;
      const req = achievement.requirement;

      switch (req.type) {
        case 'kills':
          requirementMet = this.stats.totalKills >= req.value;
          break;
        case 'eliteKills':
          requirementMet = this.stats.eliteKills >= req.value;
          break;
        case 'bossKills':
          requirementMet = this.stats.bossKills >= req.value;
          break;
        case 'wave':
          requirementMet = wave >= req.value;
          break;
        case 'score':
          requirementMet = score >= req.value;
          break;
        case 'combo':
          requirementMet = comboCount >= req.value;
          break;
        case 'rank':
          requirementMet = rank === req.value;
          break;
        case 'powerupsCollected':
          requirementMet = this.stats.powerupsCollected >= req.value;
          break;
        case 'itemsPurchased':
          requirementMet = this.stats.itemsPurchased >= req.value;
          break;
        case 'companionsUnlocked':
          requirementMet = this.stats.companionsUnlocked >= req.value;
          break;
        case 'totalDamageDealt':
          requirementMet = this.stats.totalDamageDealt >= req.value;
          break;
        case 'totalDamageTaken':
          requirementMet = this.stats.totalDamageTaken >= req.value;
          break;
        case 'bulletsUsed':
          requirementMet = this.stats.bulletsUsed >= req.value;
          break;
        case 'criticalHits':
          requirementMet = this.stats.criticalHits >= req.value;
          break;
        case 'coinsEarned':
          requirementMet = this.stats.coinsEarned >= req.value;
          break;
        case 'coinsSpent':
          requirementMet = this.stats.coinsSpent >= req.value;
          break;
        case 'gamesPlayed':
          requirementMet = this.stats.gamesPlayed >= req.value;
          break;
        case 'wavesCompleted':
          requirementMet = this.stats.wavesCompleted >= req.value;
          break;
        case 'structuresBuilt':
          requirementMet = this.stats.structuresBuilt >= req.value;
          break;
        case 'towerKills':
          requirementMet = this.stats.towerKills >= req.value;
          break;
        case 'damageBlocked':
          requirementMet = this.stats.damageBlocked >= req.value;
          break;
        case 'maxUpgradeLevel':
          requirementMet = this.stats.maxUpgradeLevel >= req.value;
          break;
        case 'structuresRepaired':
          requirementMet = this.stats.structuresRepaired >= req.value;
          break;
        case 'fortressCoinsSpent':
          requirementMet = this.stats.fortressCoinsSpent >= req.value;
          break;
      }

      if (requirementMet) {
        this.unlockAchievement(id);
        unlocked.push(achievement);
      }
    }

    // Queue notifications
    if (unlocked.length > 0) {
      this.queueNotifications(unlocked);
    }

    return unlocked;
  }

  // Unlock an achievement and grant rewards
  unlockAchievement(id) {
    const achievement = this.achievements[id];
    if (!achievement || this.unlockedAchievements[id]) return;

    this.unlockedAchievements[id] = {
      unlockedAt: Date.now(),
      tier: achievement.tier
    };

    // Grant coin reward
    if (achievement.reward.coins > 0 && this.scoreManager) {
      this.scoreManager.addCurrency(achievement.reward.coins);
    }

    this.saveAchievements();
  }

  // Get total stat boosts from all unlocked achievements
  getAchievementStatBoosts() {
    const boosts = {
      damage: 0,
      maxHealth: 0,
      regenRate: 0,
      fireRate: 0,
      critChance: 0,
      critMultiplier: 0,
      scoreMultiplier: 0,
      coinMultiplier: 0
    };

    for (const [id, unlockData] of Object.entries(this.unlockedAchievements)) {
      const achievement = this.achievements[id];
      if (achievement && achievement.reward.statBoost) {
        const statBoost = achievement.reward.statBoost;
        if (statBoost.damage) boosts.damage += statBoost.damage;
        if (statBoost.maxHealth) boosts.maxHealth += statBoost.maxHealth;
        if (statBoost.regenRate) boosts.regenRate += statBoost.regenRate;
        if (statBoost.fireRate) boosts.fireRate += statBoost.fireRate;
        if (statBoost.critChance) boosts.critChance += statBoost.critChance;
        if (statBoost.critMultiplier) boosts.critMultiplier += statBoost.critMultiplier;
        if (statBoost.scoreMultiplier) boosts.scoreMultiplier += statBoost.scoreMultiplier;
        if (statBoost.coinMultiplier) boosts.coinMultiplier += statBoost.coinMultiplier;
      }
    }

    return boosts;
  }

  // Queue achievement notifications
  queueNotifications(achievements) {
    this.notificationQueue.push(...achievements);
    if (!this.showingNotification) {
      this.showNextNotification();
    }
  }

  // Show next notification in queue
  showNextNotification() {
    if (this.notificationQueue.length === 0) {
      this.showingNotification = false;
      return;
    }

    this.showingNotification = true;
    const achievement = this.notificationQueue.shift();

    // Get tier emoji
    const tierEmoji = {
      'bronze': '🥉',
      'silver': '🥈',
      'gold': '🥇',
      'platinum': '💎'
    }[achievement.tier] || '🏆';

    const coinReward = achievement.reward.coins > 0 ? `\n+${achievement.reward.coins} coins` : '';

    this.showNotification(
      `${tierEmoji} ${achievement.title}`,
      `${achievement.description}${coinReward}`
    );

    // Show next notification after delay
    setTimeout(() => {
      this.showNextNotification();
    }, 4500);
  }

  // Show achievement notification
  showNotification(title, description) {
    if (!this.notificationElement) return;

    this.notificationElement.innerHTML = `${title}<br><small>${description}</small>`;
    this.notificationElement.style.display = 'block';

    // Auto-hide after 4 seconds
    setTimeout(() => {
      this.notificationElement.style.display = 'none';
    }, 4000);
  }

  // Save achievements to localStorage
  saveAchievements() {
    try {
      const data = {
        unlocked: this.unlockedAchievements,
        stats: this.stats
      };
      localStorage.setItem('achievementsV2', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save achievements:', e);
    }
  }

  // Get achievement progress (for UI)
  getProgress() {
    const total = Object.keys(this.achievements).length;
    const unlocked = Object.keys(this.unlockedAchievements).length;
    return {
      total: total,
      unlocked: unlocked,
      percentage: Math.round((unlocked / total) * 100)
    };
  }

  // Get achievements by category
  getAchievementsByCategory(category) {
    return Object.values(this.achievements).filter(a => a.category === category);
  }

  // Get all achievements with unlock status
  getAllAchievementsWithStatus() {
    return Object.entries(this.achievements).map(([id, achievement]) => ({
      ...achievement,
      unlocked: !!this.unlockedAchievements[id],
      unlockedAt: this.unlockedAchievements[id]?.unlockedAt || null
    }));
  }

  // Get stats
  getStats() {
    return { ...this.stats };
  }
}
