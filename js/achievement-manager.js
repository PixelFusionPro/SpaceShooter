// Achievement Manager - Handles achievement tracking and notifications

class AchievementManager {
  constructor() {
    // Load achievements from localStorage
    this.achievements = JSON.parse(localStorage.getItem('achievements')) || {
      veteran: false,          // Survive 10 waves
      centurion: false,        // Score 100
      sharpshooter: false,     // Kill 100 zombies
      survivor: false,         // Reach wave 20
      powerCollector: false,   // Collect 50 powerups
      comboMaster: false,      // Get 10x combo
      eliteHunter: false,      // Kill 10 elite zombies
      bossSlayer: false,       // Kill 5 bosses
      rankLegend: false        // Reach Legend rank
    };

    // Stats tracking
    this.stats = {
      totalKills: 0,
      eliteKills: 0,
      bossKills: 0,
      powerupsCollected: 0
    };

    // Notification element
    this.notificationElement = document.getElementById('achievementNotification');
  }

  // Track a kill
  trackKill(zombie) {
    this.stats.totalKills++;
    if (zombie.elite) this.stats.eliteKills++;
    if (zombie.type === 'boss') this.stats.bossKills++;
  }

  // Track powerup collection
  trackPowerup(count) {
    this.stats.powerupsCollected = count;
  }

  // Check and unlock achievements
  check(wave, score, rank, comboCount) {
    let unlocked = [];

    // Veteran: Survive 10 waves
    if (!this.achievements.veteran && wave >= 10) {
      this.achievements.veteran = true;
      unlocked.push({ title: 'VETERAN', desc: 'Survived 10 Waves!' });
    }

    // Centurion: Score 100
    if (!this.achievements.centurion && score >= 100) {
      this.achievements.centurion = true;
      unlocked.push({ title: 'CENTURION', desc: 'Scored 100 Points!' });
    }

    // Sharpshooter: Kill 100 zombies
    if (!this.achievements.sharpshooter && this.stats.totalKills >= 100) {
      this.achievements.sharpshooter = true;
      unlocked.push({ title: 'SHARPSHOOTER', desc: 'Killed 100 Zombies!' });
    }

    // Survivor: Reach wave 20
    if (!this.achievements.survivor && wave >= 20) {
      this.achievements.survivor = true;
      unlocked.push({ title: 'SURVIVOR', desc: 'Reached Wave 20!' });
    }

    // Power Collector: Collect 50 powerups
    if (!this.achievements.powerCollector && this.stats.powerupsCollected >= 50) {
      this.achievements.powerCollector = true;
      unlocked.push({ title: 'POWER COLLECTOR', desc: 'Collected 50 Powerups!' });
    }

    // Combo Master: Get 10x combo
    if (!this.achievements.comboMaster && comboCount >= 10) {
      this.achievements.comboMaster = true;
      unlocked.push({ title: 'COMBO MASTER', desc: 'Achieved 10x Combo!' });
    }

    // Elite Hunter: Kill 10 elite zombies
    if (!this.achievements.eliteHunter && this.stats.eliteKills >= 10) {
      this.achievements.eliteHunter = true;
      unlocked.push({ title: 'ELITE HUNTER', desc: 'Killed 10 Elite Zombies!' });
    }

    // Boss Slayer: Kill 5 bosses
    if (!this.achievements.bossSlayer && this.stats.bossKills >= 5) {
      this.achievements.bossSlayer = true;
      unlocked.push({ title: 'BOSS SLAYER', desc: 'Defeated 5 Bosses!' });
    }

    // Legend Rank: Reach Legend rank
    if (!this.achievements.rankLegend && rank === 'Legend') {
      this.achievements.rankLegend = true;
      unlocked.push({ title: 'LEGENDARY', desc: 'Reached Legend Rank!' });
    }

    // Show notifications for newly unlocked achievements
    if (unlocked.length > 0) {
      this.save();
      // Show first unlocked achievement
      this.showNotification(unlocked[0].title, unlocked[0].desc);
    }
  }

  // Show achievement notification
  showNotification(title, description) {
    if (!this.notificationElement) return;

    this.notificationElement.innerHTML = `🏆 ${title}<br><small>${description}</small>`;
    this.notificationElement.style.display = 'block';

    // Auto-hide after 4 seconds
    setTimeout(() => {
      this.notificationElement.style.display = 'none';
    }, 4000);
  }

  // Save achievements to localStorage
  save() {
    localStorage.setItem('achievements', JSON.stringify(this.achievements));
  }

  // Get stats
  getStats() {
    return { ...this.stats };
  }
}
