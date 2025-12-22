// Score Manager - Handles score, combo, and currency

class ScoreManager {
  constructor() {
    this.score = 0;
    this.comboCount = 0;
    this.lastKillTime = 0;
    this.currency = parseInt(localStorage.getItem('currency')) || 0;
    this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;

    // Load persistent rank data
    this.loadPersistentRank();
  }

  // Load persistent rank data from localStorage
  loadPersistentRank() {
    const stored = localStorage.getItem('persistentRank');
    if (stored) {
      try {
        this.persistentRank = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load persistent rank:', e);
        this.persistentRank = this.getDefaultPersistentRank();
      }
    } else {
      this.persistentRank = this.getDefaultPersistentRank();
    }
  }

  // Get default persistent rank structure
  getDefaultPersistentRank() {
    return {
      currentRank: 'Soldier',
      highestRank: 'Soldier',
      totalScore: 0,
      totalKills: 0,
      bestWave: 0,
      gamesPlayed: 0,
      rankHistory: [
        { rank: 'Soldier', achievedAt: Date.now() }
      ]
    };
  }

  // Save persistent rank to localStorage
  savePersistentRank() {
    try {
      localStorage.setItem('persistentRank', JSON.stringify(this.persistentRank));
    } catch (e) {
      console.error('Failed to save persistent rank:', e);
    }
  }

  // Get persistent rank (highest rank achieved across all games)
  getPersistentRank() {
    return this.persistentRank.highestRank;
  }

  // Get rank currency multiplier based on persistent rank
  getRankCurrencyMultiplier() {
    const rank = this.getPersistentRank();
    switch(rank) {
      case 'Legend': return 1.25;    // 25% bonus
      case 'Elite': return 1.15;     // 15% bonus
      case 'Veteran': return 1.08;   // 8% bonus
      default: return 1.0;
    }
  }

  // Update persistent rank based on comprehensive game stats
  updatePersistentRank(wave, kills) {
    this.persistentRank.gamesPlayed++;
    this.persistentRank.totalScore += this.score;
    this.persistentRank.totalKills += kills;

    // Update best wave
    if (wave > this.persistentRank.bestWave) {
      this.persistentRank.bestWave = wave;
    }

    // Calculate persistent rank based on comprehensive criteria
    // Uses combination of: best wave reached, total kills, games played
    // This provides clear progression that's easier to understand
    let newRank = 'Soldier';
    const bestWave = this.persistentRank.bestWave;
    const totalKills = this.persistentRank.totalKills;
    const gamesPlayed = this.persistentRank.gamesPlayed;

    // Veteran: Reach wave 25 OR 500 total kills OR play 10 games
    if (bestWave >= 25 || totalKills >= 500 || gamesPlayed >= 10) {
      newRank = 'Veteran';
    }

    // Elite: Reach wave 50 OR 2,000 total kills OR play 25 games
    if (bestWave >= 50 || totalKills >= 2000 || gamesPlayed >= 25) {
      newRank = 'Elite';
    }

    // Legend: Reach wave 100 OR 5,000 total kills OR play 50 games
    if (bestWave >= 100 || totalKills >= 5000 || gamesPlayed >= 50) {
      newRank = 'Legend';
    }

    // Update highest rank achieved
    const rankOrder = ['Soldier', 'Veteran', 'Elite', 'Legend'];
    const currentRankIndex = rankOrder.indexOf(this.persistentRank.highestRank);
    const newRankIndex = rankOrder.indexOf(newRank);

    if (newRankIndex > currentRankIndex) {
      this.persistentRank.highestRank = newRank;
      this.persistentRank.rankHistory.push({
        rank: newRank,
        achievedAt: Date.now(),
        bestWave: bestWave,
        totalKills: totalKills,
        gamesPlayed: gamesPlayed
      });
    }

    this.persistentRank.currentRank = newRank;
    this.savePersistentRank();
  }

  // Get persistent rank data for display
  getPersistentRankData() {
    return {
      rank: this.persistentRank.highestRank,
      totalScore: this.persistentRank.totalScore,
      totalKills: this.persistentRank.totalKills,
      bestWave: this.persistentRank.bestWave,
      gamesPlayed: this.persistentRank.gamesPlayed,
      currencyMultiplier: this.getRankCurrencyMultiplier()
    };
  }

  // Add points for a kill
  addKill(scoreMultiplier = 1) {
    const baseScoreGain = 1;
    const multipliedScore = Math.floor(baseScoreGain * scoreMultiplier);
    this.score += multipliedScore;

    // Combo system
    if (Date.now() - this.lastKillTime < CONFIG.PROGRESSION.COMBO_WINDOW) {
      this.comboCount++;
      if (this.comboCount >= CONFIG.PROGRESSION.COMBO_THRESHOLD) {
        const multipliedBonus = Math.floor(CONFIG.PROGRESSION.COMBO_BONUS * scoreMultiplier);
        this.score += multipliedBonus;
        this.comboCount = 0;
      }
    } else {
      this.comboCount = 1;
    }
    this.lastKillTime = Date.now();
  }

  // Add currency
  addCurrency(amount) {
    this.currency += amount;
    localStorage.setItem('currency', this.currency);
  }

  // Update best score - returns true if new record
  updateBestScore() {
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('bestScore', this.bestScore);
      return true;
    }
    return false;
  }

  // Get current rank based on score
  getRank() {
    if (this.score >= CONFIG.PROGRESSION.RANK_LEGEND) return 'Legend';
    if (this.score >= CONFIG.PROGRESSION.RANK_ELITE) return 'Elite';
    if (this.score >= CONFIG.PROGRESSION.RANK_VETERAN) return 'Veteran';
    return 'Soldier';
  }

  // Get next rank threshold
  getNextRankThreshold() {
    const currentRank = this.getRank();
    if (currentRank === 'Legend') return null; // Max rank reached
    if (currentRank === 'Elite') return CONFIG.PROGRESSION.RANK_LEGEND;
    if (currentRank === 'Veteran') return CONFIG.PROGRESSION.RANK_ELITE;
    if (currentRank === 'Soldier') return CONFIG.PROGRESSION.RANK_VETERAN;
    return null;
  }

  // Get next rank name
  getNextRankName() {
    const currentRank = this.getRank();
    if (currentRank === 'Legend') return null;
    if (currentRank === 'Elite') return 'Legend';
    if (currentRank === 'Veteran') return 'Elite';
    if (currentRank === 'Soldier') return 'Veteran';
    return null;
  }

  // Get current rank threshold
  getCurrentRankThreshold() {
    const currentRank = this.getRank();
    if (currentRank === 'Legend') return CONFIG.PROGRESSION.RANK_LEGEND;
    if (currentRank === 'Elite') return CONFIG.PROGRESSION.RANK_ELITE;
    if (currentRank === 'Veteran') return CONFIG.PROGRESSION.RANK_VETERAN;
    return 0;
  }

  // Calculate progress to next rank (0-1)
  getRankProgress() {
    const nextThreshold = this.getNextRankThreshold();
    if (!nextThreshold) return 1; // Max rank

    const currentThreshold = this.getCurrentRankThreshold();
    const progress = (this.score - currentThreshold) / (nextThreshold - currentThreshold);
    return Math.max(0, Math.min(1, progress));
  }

  // Get points needed to reach next rank
  getPointsToNextRank() {
    const nextThreshold = this.getNextRankThreshold();
    if (!nextThreshold) return 0;
    return Math.max(0, nextThreshold - this.score);
  }

  // Get rank color for particles
  getRankColor() {
    const rank = this.getRank();
    if (rank === 'Legend') return 'rgba(0,255,255,0.7)';
    if (rank === 'Elite') return 'rgba(0,255,0,0.7)';
    if (rank === 'Veteran') return 'rgba(255,255,0,0.7)';
    return 'rgba(255,255,255,0.5)';
  }

  // Check if combo is active
  isComboActive() {
    return this.comboCount > 0 && Date.now() - this.lastKillTime < CONFIG.PROGRESSION.COMBO_WINDOW;
  }

  // Get combo bonus status
  isComboBonus() {
    return this.comboCount >= CONFIG.PROGRESSION.COMBO_THRESHOLD;
  }

  // Reset for new game
  reset() {
    this.score = 0;
    this.comboCount = 0;
    this.lastKillTime = 0;
  }

  // Get current score data
  getData() {
    return {
      score: this.score,
      combo: this.comboCount,
      currency: this.currency,
      bestScore: this.bestScore,
      rank: this.getRank()
    };
  }
}
