// Wave Manager - Handles wave progression and enemy spawning

class WaveManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.wave = 1;
    this.wavePending = false;
    this.waveStarted = false; // Track if wave has enemies spawned

    // UI elements
    this.waveIntroElement = document.getElementById('waveIntro');
    this.waveNumberElement = document.getElementById('waveNumber');
    this.waveRecapElement = document.getElementById('waveRecap');
  }

  // Check if current wave is a milestone wave
  isMilestoneWave() {
    const milestones = [10, 25, 50, 100, 250, 500, 750, 1000];
    return milestones.includes(this.wave);
  }

  // Get difficulty spike multiplier for milestone waves
  getMilestoneDifficultySpike() {
    if (!this.isMilestoneWave()) return 1.0;

    // Milestone waves are significantly harder
    if (this.wave >= 500) return 1.5; // 50% harder
    if (this.wave >= 100) return 1.4; // 40% harder
    if (this.wave >= 50) return 1.3;  // 30% harder
    if (this.wave >= 10) return 1.2;  // 20% harder
    return 1.0;
  }

  // Spawn enemies for current wave
  spawnWave() {
    const enemies = [];
    this.waveStarted = true; // Mark that wave has started

    // Show wave intro
    this.showWaveIntro();

    let count = this.wave * CONFIG.WAVE.ZOMBIES_PER_WAVE_MULTIPLIER;
    let difficulty = 1 + (this.wave - 1) * CONFIG.WAVE.DIFFICULTY_SCALING;

    // Apply milestone difficulty spike
    const milestoneSpike = this.getMilestoneDifficultySpike();
    difficulty *= milestoneSpike;

    // Milestone waves spawn extra enemies
    if (this.isMilestoneWave()) {
      count = Math.ceil(count * 1.25); // 25% more enemies on milestone waves
    }

    // Spawn regular enemies
    for (let i = 0; i < count; i++) {
      let enemy;

      // Random enemy type based on wave
      if (this.wave >= 15) {
        const types = ['normal', 'tank', 'runner', 'explosive', 'healer'];
        const type = types[Math.floor(Math.random() * types.length)];
        enemy = new EnemyShip(this.canvas, type);
      } else if (this.wave >= 10) {
        const types = ['normal', 'tank', 'runner', 'explosive'];
        const type = types[Math.floor(Math.random() * types.length)];
        enemy = new EnemyShip(this.canvas, type);
      } else if (this.wave >= 5) {
        const types = ['normal', 'tank', 'runner'];
        const type = types[Math.floor(Math.random() * types.length)];
        enemy = new EnemyShip(this.canvas, type);
      } else {
        enemy = new EnemyShip(this.canvas, 'normal');
      }

      // Scale difficulty
      enemy.speed *= difficulty;
      enemy.health = Math.ceil(zombie.health * difficulty);
      enemy.maxHealth = enemy.health;
      enemies.push(zombie);
    }

    // Boss spawn every 5 waves
    if (this.wave % CONFIG.WAVE.BOSS_WAVE_INTERVAL === 0) {
      const boss = new EnemyShip(this.canvas, 'boss');

      // Bosses scale more aggressively than regular enemies
      const bossScaling = 1.2; // 20% extra scaling for bosses
      boss.speed *= (difficulty * bossScaling);
      boss.health = Math.ceil(boss.health * difficulty * bossScaling);
      boss.maxHealth = boss.health;

      // Milestone boss waves: spawn multiple bosses
      if (this.isMilestoneWave()) {
        const extraBosses = this.wave >= 100 ? 2 : 1;
        enemies.push(boss);

        // Spawn additional elite enemies alongside the boss
        for (let i = 0; i < extraBosses; i++) {
          const eliteBoss = new EnemyShip(this.canvas, 'boss');
          eliteBoss.speed *= (difficulty * bossScaling);
          eliteBoss.health = Math.ceil(eliteBoss.health * difficulty * bossScaling * 0.75); // Slightly weaker than main boss
          eliteBoss.maxHealth = eliteBoss.health;
          enemies.push(eliteBoss);
        }
      } else {
        enemies.push(boss);
      }
    }

    return enemies;
  }

  // Show wave intro overlay
  showWaveIntro() {
    if (!this.waveIntroElement || !this.waveNumberElement) return;

    this.waveNumberElement.textContent = this.wave;
    this.waveIntroElement.style.display = 'flex';
    setTimeout(() => {
      this.waveIntroElement.style.display = 'none';
    }, 1500);
  }

  // Complete current wave
  completeWave(score, scoreManager, shopManager = null) {
    this.wavePending = true;
    this.waveStarted = false; // Reset wave started flag

    // Calculate currency gain with exponential scaling for 1000 waves
    // Formula: base * (1 + wave^1.2 / 50) * (1 + score/1000)
    // This provides: Wave 1: ~10 coins, Wave 10: ~25 coins, Wave 100: ~250 coins, Wave 500: ~2000 coins, Wave 1000: ~5000 coins
    const base = CONFIG.PROGRESSION.CURRENCY_BASE;
    const waveMultiplier = 1 + Math.pow(this.wave, 1.2) / 50;
    const scoreMultiplier = 1 + score / 1000;
    let currencyGain = Math.floor(base * waveMultiplier * scoreMultiplier);
    
    // Apply coin multiplier from upgrades
    if (shopManager) {
      const boosts = shopManager.getEquippedStatBoosts();
      currencyGain = Math.floor(currencyGain * boosts.coinMultiplier);
    }

    // Apply rank currency multiplier (persistent rank benefit)
    const rankMultiplier = scoreManager.getRankCurrencyMultiplier();
    currencyGain = Math.floor(currencyGain * rankMultiplier);

    scoreManager.addCurrency(currencyGain);

    // Show wave recap
    this.showWaveRecap(currencyGain);

    // Advance to next wave after delay
    setTimeout(() => {
      this.wave++;
      this.wavePending = false;
    }, 3000);
  }

  // Show wave completion recap
  showWaveRecap(currencyGain) {
    if (!this.waveRecapElement) return;

    this.waveRecapElement.textContent =
      `Wave ${this.wave} Complete!\n+${currencyGain} Coins`;
    this.waveRecapElement.style.display = 'flex';

    setTimeout(() => {
      this.waveRecapElement.style.display = 'none';
    }, 2500);
  }

  // Check if wave is complete
  isWaveComplete(aliveEnemies) {
    // Only allow completion if wave has started and no enemies are alive
    return this.waveStarted && aliveEnemies === 0 && !this.wavePending;
  }

  // Reset for new game
  reset() {
    this.wave = 1;
    this.wavePending = false;
    this.waveStarted = false;
  }

  // Get current wave number
  getWave() {
    return this.wave;
  }

  // Check if wave is pending
  isPending() {
    return this.wavePending;
  }
}
