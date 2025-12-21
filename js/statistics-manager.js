// Statistics Manager - Tracks detailed player statistics

class StatisticsManager {
  constructor() {
    this.loadStatistics();

    // Session stats (reset each game)
    this.sessionStats = this.getDefaultSessionStats();
    this.gameStartTime = null;
  }

  // Load statistics from localStorage
  loadStatistics() {
    const stored = localStorage.getItem('gameStatistics');
    if (stored) {
      try {
        this.stats = JSON.parse(stored);
        // Migrate old stats if needed
        this.migrateStats();
      } catch (e) {
        console.error('Failed to load statistics:', e);
        this.stats = this.getDefaultStats();
      }
    } else {
      this.stats = this.getDefaultStats();
    }
  }

  // Get default statistics structure
  getDefaultStats() {
    return {
      // Lifetime totals
      totalPlaytime: 0,
      totalGames: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalScore: 0,
      totalCurrency: 0,
      totalBulletsFired: 0,
      totalBulletsHit: 0,
      totalWaves: 0,

      // Records
      highestScore: 0,
      highestWave: 0,
      highestCombo: 0,
      highestKillsInWave: 0,
      fastestWaveTime: Infinity,
      longestSurvivalTime: 0,

      // Weapon usage (itemId -> usage count)
      weaponUsage: {},
      armorUsage: {},

      // Achievements unlocked
      achievementsUnlocked: [],

      // Recent games history (last 10 games)
      recentGames: []
    };
  }

  // Get default session stats
  getDefaultSessionStats() {
    return {
      bulletsFired: 0,
      bulletsHit: 0,
      killsThisWave: 0,
      maxKillsInWave: 0,
      maxCombo: 0,
      waveStartTime: Date.now(),
      currentWeapon: null,
      currentArmor: null
    };
  }

  // Migrate old stats to new format
  migrateStats() {
    const defaults = this.getDefaultStats();
    for (const key in defaults) {
      if (!(key in this.stats)) {
        this.stats[key] = defaults[key];
      }
    }
  }

  // Save statistics to localStorage
  saveStatistics() {
    try {
      localStorage.setItem('gameStatistics', JSON.stringify(this.stats));
    } catch (e) {
      console.error('Failed to save statistics:', e);
    }
  }

  // Start a new game session
  startGame() {
    this.gameStartTime = Date.now();
    this.sessionStats = this.getDefaultSessionStats();
    this.stats.totalGames++;
  }

  // End game session and update lifetime stats
  endGame(finalScore, finalWave, totalKills, currencyEarned) {
    if (!this.gameStartTime) return;

    const survivalTime = Date.now() - this.gameStartTime;
    const minutes = Math.floor(survivalTime / 60000);

    // Update lifetime totals
    this.stats.totalPlaytime += survivalTime;
    this.stats.totalKills += totalKills;
    this.stats.totalDeaths++;
    this.stats.totalScore += finalScore;
    this.stats.totalCurrency += currencyEarned;
    this.stats.totalWaves += finalWave;

    // Update records
    if (finalScore > this.stats.highestScore) {
      this.stats.highestScore = finalScore;
    }
    if (finalWave > this.stats.highestWave) {
      this.stats.highestWave = finalWave;
    }
    if (this.sessionStats.maxCombo > this.stats.highestCombo) {
      this.stats.highestCombo = this.sessionStats.maxCombo;
    }
    if (this.sessionStats.maxKillsInWave > this.stats.highestKillsInWave) {
      this.stats.highestKillsInWave = this.sessionStats.maxKillsInWave;
    }
    if (survivalTime > this.stats.longestSurvivalTime) {
      this.stats.longestSurvivalTime = survivalTime;
    }

    // Calculate accuracy
    const accuracy = this.sessionStats.bulletsFired > 0 ?
      (this.sessionStats.bulletsHit / this.sessionStats.bulletsFired) * 100 : 0;

    // Add to recent games history
    this.stats.recentGames.unshift({
      timestamp: Date.now(),
      score: finalScore,
      wave: finalWave,
      kills: totalKills,
      survivalTime: survivalTime,
      accuracy: accuracy.toFixed(1),
      currencyEarned: currencyEarned
    });

    // Keep only last 10 games
    if (this.stats.recentGames.length > 10) {
      this.stats.recentGames.pop();
    }

    // Update weapon/armor usage
    if (this.sessionStats.currentWeapon) {
      this.stats.weaponUsage[this.sessionStats.currentWeapon] =
        (this.stats.weaponUsage[this.sessionStats.currentWeapon] || 0) + 1;
    }
    if (this.sessionStats.currentArmor) {
      this.stats.armorUsage[this.sessionStats.currentArmor] =
        (this.stats.armorUsage[this.sessionStats.currentArmor] || 0) + 1;
    }

    this.saveStatistics();
    this.gameStartTime = null;
  }

  // Track bullet fired
  trackBulletFired() {
    this.sessionStats.bulletsFired++;
    this.stats.totalBulletsFired++;
  }

  // Track bullet hit
  trackBulletHit() {
    this.sessionStats.bulletsHit++;
    this.stats.totalBulletsHit++;
  }

  // Track kill
  trackKill() {
    this.sessionStats.killsThisWave++;
  }

  // Track combo
  trackCombo(comboCount) {
    if (comboCount > this.sessionStats.maxCombo) {
      this.sessionStats.maxCombo = comboCount;
    }
  }

  // Wave completed - reset wave stats
  waveCompleted() {
    if (this.sessionStats.killsThisWave > this.sessionStats.maxKillsInWave) {
      this.sessionStats.maxKillsInWave = this.sessionStats.killsThisWave;
    }

    // Calculate wave time
    const waveTime = Date.now() - this.sessionStats.waveStartTime;
    if (waveTime < this.stats.fastestWaveTime) {
      this.stats.fastestWaveTime = waveTime;
    }

    // Reset for next wave
    this.sessionStats.killsThisWave = 0;
    this.sessionStats.waveStartTime = Date.now();
  }

  // Update equipped items
  updateEquipment(weapon, armor) {
    if (weapon) this.sessionStats.currentWeapon = weapon;
    if (armor) this.sessionStats.currentArmor = armor;
  }

  // Get lifetime accuracy
  getLifetimeAccuracy() {
    if (this.stats.totalBulletsFired === 0) return 0;
    return (this.stats.totalBulletsHit / this.stats.totalBulletsFired) * 100;
  }

  // Get session accuracy
  getSessionAccuracy() {
    if (this.sessionStats.bulletsFired === 0) return 0;
    return (this.sessionStats.bulletsHit / this.sessionStats.bulletsFired) * 100;
  }

  // Get favorite weapon
  getFavoriteWeapon() {
    let maxUses = 0;
    let favorite = null;
    for (const [weapon, uses] of Object.entries(this.stats.weaponUsage)) {
      if (uses > maxUses) {
        maxUses = uses;
        favorite = weapon;
      }
    }
    return favorite;
  }

  // Get favorite armor
  getFavoriteArmor() {
    let maxUses = 0;
    let favorite = null;
    for (const [armor, uses] of Object.entries(this.stats.armorUsage)) {
      if (uses > maxUses) {
        maxUses = uses;
        favorite = armor;
      }
    }
    return favorite;
  }

  // Get formatted playtime
  getFormattedPlaytime() {
    const hours = Math.floor(this.stats.totalPlaytime / 3600000);
    const minutes = Math.floor((this.stats.totalPlaytime % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  // Get formatted fastest wave time
  getFormattedFastestWave() {
    if (this.stats.fastestWaveTime === Infinity) return 'N/A';
    const seconds = Math.floor(this.stats.fastestWaveTime / 1000);
    return `${seconds}s`;
  }

  // Get formatted longest survival
  getFormattedLongestSurvival() {
    const minutes = Math.floor(this.stats.longestSurvivalTime / 60000);
    const seconds = Math.floor((this.stats.longestSurvivalTime % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  // Get all statistics for display
  getAllStats() {
    return {
      lifetime: {
        playtime: this.getFormattedPlaytime(),
        games: this.stats.totalGames,
        kills: this.stats.totalKills,
        deaths: this.stats.totalDeaths,
        score: this.stats.totalScore,
        currency: this.stats.totalCurrency,
        waves: this.stats.totalWaves,
        accuracy: this.getLifetimeAccuracy().toFixed(1) + '%',
        kd: this.stats.totalDeaths > 0 ? (this.stats.totalKills / this.stats.totalDeaths).toFixed(2) : this.stats.totalKills
      },
      records: {
        highestScore: this.stats.highestScore,
        highestWave: this.stats.highestWave,
        highestCombo: this.stats.highestCombo,
        mostKillsInWave: this.stats.highestKillsInWave,
        fastestWave: this.getFormattedFastestWave(),
        longestSurvival: this.getFormattedLongestSurvival()
      },
      favorites: {
        weapon: this.getFavoriteWeapon(),
        armor: this.getFavoriteArmor()
      },
      session: {
        accuracy: this.getSessionAccuracy().toFixed(1) + '%',
        bulletsFired: this.sessionStats.bulletsFired,
        bulletsHit: this.sessionStats.bulletsHit,
        maxCombo: this.sessionStats.maxCombo,
        maxKillsInWave: this.sessionStats.maxKillsInWave
      },
      recentGames: this.stats.recentGames
    };
  }

  // Reset all statistics (for testing or user request)
  resetAll() {
    this.stats = this.getDefaultStats();
    this.sessionStats = this.getDefaultSessionStats();
    this.saveStatistics();
  }
}
