// Main Game Class - Industry-Leading Architecture

// Canvas scaling utility with device pixel ratio
function setupCanvasScaling(canvas) {
  const container = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  let ctx = null;
  
  function resizeCanvas() {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Set canvas display size (CSS pixels)
    canvas.style.width = containerWidth + 'px';
    canvas.style.height = containerHeight + 'px';
    
    // Set canvas internal resolution (actual pixels)
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    
    // Get or reuse context and reset transform, then scale for device pixel ratio
    ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.scale(dpr, dpr);
    
    // Update CONFIG with actual display dimensions (CSS pixels)
    CONFIG.CANVAS_WIDTH = containerWidth;
    CONFIG.CANVAS_HEIGHT = containerHeight;
  }
  
  // Initial resize
  resizeCanvas();
  
  // Resize on window resize
  window.addEventListener('resize', resizeCanvas);
  
  // Return resize function for manual calls
  return resizeCanvas;
}

class SpaceShooterGame {
  constructor(canvas) {
    this.canvas = canvas;
    
    // Setup responsive canvas scaling with device pixel ratio
    this.resizeCanvas = setupCanvasScaling(canvas);
    // Get context after scaling setup (context is scaled by DPR now)
    this.ctx = canvas.getContext('2d');

    // Space background stars
    this.stars = [];
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.5 + 0.5
      });
    }

    // Core entities
    this.player = null;
    this.controls = new Controls(canvas, (isPaused) => this.handlePauseToggle(isPaused));

    // Managers (Industry-leading separation of concerns)
    this.audioManager = new AudioManager();
    this.screenEffects = new ScreenEffects();
    this.particleManager = new ParticleManager();
    this.scoreManager = new ScoreManager();
    this.statisticsManager = new StatisticsManager();
    this.inventoryManager = new InventoryManager();
    this.achievementManager = new AchievementManager(this.scoreManager);
    this.shopManager = new ShopManager(this.inventoryManager, this.scoreManager, this.achievementManager);
    this.powerupManager = new PowerupManager(canvas, this.particleManager, this.audioManager);
    this.waveManager = new WaveManager(canvas);
    this.enemyManager = new EnemyManager(canvas, this.particleManager);
    this.fortressManager = new FortressManager(canvas, this.achievementManager, this.particleManager, this.audioManager);

    // Object pools for performance (must be created before companionManager)
    this.bulletPool = new ObjectPool(
      () => new Bullet(),
      (bullet) => bullet.reset(),
      CONFIG.POOL.BULLETS_SIZE
    );
    
    // Set fortress manager references for tower shooting
    this.fortressManager.setReferences(this.bulletPool, this.enemyManager);
    
    // Companion manager needs bulletPool, so create it after
    this.companionManager = new CompanionManager(canvas, this.bulletPool);

    // Game state
    this.gameOver = false;
    this.lastShotTime = 0;
    this.lastRegenTime = 0;
    this.lastRank = 'Soldier';
    this.startingCurrency = this.scoreManager.currency; // Store starting currency for coins earned calculation
    this.ammoDepletedNotified = false; // Track ammo depletion notifications
    this.lastTrackedPowerupCount = 0; // Track powerup collection for achievements

    // Performance monitoring
    this.fps = 60;
    this.fpsFrames = [];
    this.fpsLastTime = performance.now();
    this.showFPS = localStorage.getItem('showFPS') === 'true'; // Load FPS display preference

    // UI elements
    this.initUIElements();

    // Update best score display
    this.updateBestDisplay();
  }

  initUIElements() {
    this.healthFill = document.getElementById('healthfill') || document.querySelector('.health-fill');
    this.damageFlash = document.getElementById('damageFlash');
  }

  reset() {
    // Sync inventory from temporary managers if they exist (for menu purchases)
    if (window.tempInventoryManager) {
      this.inventoryManager.inventory = JSON.parse(JSON.stringify(window.tempInventoryManager.inventory));
      this.inventoryManager.saveInventory();
    }
    if (window.tempShopManager && window.tempShopManager.scoreManager) {
      this.scoreManager.currency = window.tempShopManager.scoreManager.currency;
      this.scoreManager.addCurrency(0); // Save to localStorage
    }

    // Reset player
    this.player = new Player(this.canvas);

    // Phase 3: Reset spawn animation
    this.player.resetSpawn();

    // Apply equipped armor max health boost
    const boosts = this.shopManager.getEquippedStatBoosts();
    const maxHealth = CONFIG.PLAYER.MAX_HEALTH + boosts.maxHealth;
    this.player.health = maxHealth;

    // Reset all managers
    this.enemyManager.reset();
    this.waveManager.reset();
    this.scoreManager.reset();
    this.powerupManager.reset();
    this.particleManager.clear();
    this.bulletPool.releaseAll();
    this.companionManager.reset();
    this.fortressManager.reset();

    // Reset game state
    this.gameOver = false;
    this.lastRegenTime = 0;
    this.lastRank = 'Soldier';
    this.startingCurrency = this.scoreManager.currency; // Store starting currency for coins earned calculation
    this.ammoDepletedNotified = false; // Reset ammo notification flag
    this.fortressTiersBuilt = new Set(); // Reset fortress tiers

    // Start statistics tracking
    this.statisticsManager.startGame();
    this.achievementManager.trackGamePlayed();
    const equipped = this.inventoryManager.getEquippedItems();
    this.statisticsManager.updateEquipment(equipped.weapon, equipped.armor);

    // Hide game over screen
    if (screenManager) {
      screenManager.hideOverlay('gameOverScreen');
    }

    // Resume audio context and start music
    this.audioManager.resume();
    this.audioManager.playMusic('gameplay');

    // Spawn first wave
    const enemies = this.waveManager.spawnWave();
    this.enemyManager.addEnemies(enemies);

    // Start game loop
    requestAnimationFrame(() => this.loop());
  }

  handlePauseToggle(isPaused) {
    if (!isPaused && !this.gameOver) {
      requestAnimationFrame(() => this.loop());
    }
  }

  autoShoot() {
    const now = Date.now();

    // Get equipped stat boosts
    const boosts = this.shopManager.getEquippedStatBoosts();
    const baseFireRate = CONFIG.PLAYER.FIRE_RATE;
    let fireRate = baseFireRate * boosts.fireRate;

    // Apply fire rate powerup (2x fire rate = 50% faster)
    if (this.powerupManager.isFireRateActive()) {
      fireRate = fireRate * 0.5; // Half the time between shots = 2x fire rate
    }

    if (now - this.lastShotTime < fireRate) return;

    const target = this.enemyManager.findNearest(this.player.x, this.player.y);
    if (!target) return;

    const dx = target.x - this.player.x;
    const dy = target.y - this.player.y;
    const angle = Math.atan2(dy, dx);

    // Get equipped ammo
    const equipped = this.inventoryManager.getEquippedItems();
    let ammoType = null;
    let ammoConsumed = false;

    if (equipped.ammo && this.inventoryManager.hasItem(equipped.ammo)) {
      const ammoItem = this.shopManager.getItem(equipped.ammo);
      if (ammoItem && ammoItem.type === 'ammunition') {
        // Check weapon compatibility (get equipped weapon model)
        const equippedWeapon = equipped.weapon ? this.shopManager.getItem(equipped.weapon) : null;
        const weaponModel = equippedWeapon ? equippedWeapon.weaponModel : 'assault_rifle';

        // Check if ammo is compatible with weapon (or if no weapon, allow all ammo)
        if (!equippedWeapon || !ammoItem.compatibleWeapons || ammoItem.compatibleWeapons.includes(weaponModel)) {
          ammoType = ammoItem;
          // Consume ammo - will consume once per bullet fired
        }
      }
    }
    
    // Stack equipped multishot with powerup multishot
    let bulletCount = 1 + Math.floor(boosts.multishot || 0);
    if (this.powerupManager.isMultishotActive()) {
      bulletCount += (CONFIG.PLAYER.MULTISHOT_COUNT - 1); // Add +2 more bullets
    }

    // Check if we have enough ammo before firing
    if (ammoType && equipped.ammo) {
      const ammoNeeded = bulletCount;
      const ammoQuantity = this.inventoryManager.getItemQuantity(equipped.ammo);

      if (ammoQuantity < ammoNeeded) {
        // Not enough ammo - use default ammo
        ammoType = null;

        // Show notification if not already shown
        if (!this.ammoDepletedNotified) {
          const ammoItem = this.shopManager.getItem(equipped.ammo);
          this.showAmmoDepletedNotification(ammoItem ? ammoItem.name : 'Special Ammo');
          this.ammoDepletedNotified = true;

          // Reset notification flag after 3 seconds
          setTimeout(() => {
            this.ammoDepletedNotified = false;
          }, 3000);
        }
      }
    }

    // Get upgrade boosts for bullet stats (crit chance, crit multiplier)
    const bulletBoosts = this.shopManager.getEquippedStatBoosts();

    let bulletsCreated = 0;
    for (let i = 0; i < bulletCount; i++) {
      const bullet = this.bulletPool.get();
      if (!bullet) continue; // Pool exhausted, skip

      const spreadAngle = bulletCount > 1 ? angle + (i - 1) * 0.15 : angle;
      bullet.init(this.player.x, this.player.y, spreadAngle, ammoType, bulletBoosts);
      bullet.isPlayerBullet = true; // Mark as player bullet

      // Apply damage boost powerup (+50% damage)
      if (this.powerupManager.isDamageActive()) {
        bullet.damage = Math.ceil(bullet.damage * 1.5);
      }

      // Mark bullet as explosive if powerup is active
      bullet.explosivePowerup = this.powerupManager.isExplosiveActive();

      // Mark bullet as homing if powerup is active
      bullet.homingPowerup = this.powerupManager.isHomingActive();

      // Consume ammo AFTER successful bullet creation
      if (ammoType && equipped.ammo) {
        this.inventoryManager.removeItem(equipped.ammo, 1);
        ammoConsumed = true;
      }

      // Track bullet fired
      this.statisticsManager.trackBulletFired();
      this.achievementManager.trackBulletFired();
      bulletsCreated++;
    }

    // Check if ammo depleted after firing
    if (ammoType && equipped.ammo && ammoConsumed) {
      const remainingAmmo = this.inventoryManager.getItemQuantity(equipped.ammo);
      if (remainingAmmo === 0 && !this.ammoDepletedNotified) {
        this.showAmmoDepletedNotification(ammoType.name);
        this.ammoDepletedNotified = true;

        // Reset notification flag after 3 seconds
        setTimeout(() => {
          this.ammoDepletedNotified = false;
        }, 3000);
      }
    }

    // Spawn multishot energy particles when multishot is active
    if (bulletCount > 1) {
      this.particleManager.spawnMultishotEnergy(this.player.x, this.player.y, angle);
    }

    // Play shoot sound (higher pitch for multishot)
    if (bulletsCreated > 0) {
      this.audioManager.playSound('shoot_laser', 0.3, bulletCount > 1 ? 1.2 : 1.0);

      // Spawn muzzle flash particles
      for (let i = 0; i < 3; i++) {
        const spread = (Math.random() - 0.5) * 0.3;
        const flashAngle = angle + spread;
        const flashDist = 20 + Math.random() * 10;
        this.particleManager.sparkleParticles.add({
          x: this.player.x + Math.cos(flashAngle) * flashDist,
          y: this.player.y + Math.sin(flashAngle) * flashDist,
          dx: Math.cos(flashAngle) * 2,
          dy: Math.sin(flashAngle) * 2,
          life: 5,
          maxLife: 5,
          size: Math.random() * 3 + 2,
          color: '#ffff00'
        });
      }
    }

    this.player.reloadProgress = 1;
    this.lastShotTime = now;
  }

  handleBulletCollisions() {
    this.enemyManager.checkBulletCollisions(
      this.bulletPool,
      (enemy, index, damageDealt, bullet) => this.onEnemyHit(enemy, index, damageDealt, bullet)
    );
  }

  onEnemyHit(enemy, index, damageDealt, bullet = null) {
    // Track bullet hit
    this.statisticsManager.trackBulletHit();

    // Track damage dealt and critical hits for achievements
    this.achievementManager.trackDamageDealt(damageDealt);

    // Play hit sound
    this.audioManager.playSound('enemy_hit', 0.2, 1.0 + Math.random() * 0.2);

    // Spawn impact particles
    if (bullet && this.particleManager) {
      const hitAngle = Math.atan2(bullet.dy, bullet.dx);
      for (let i = 0; i < 5; i++) {
        const spread = (Math.random() - 0.5) * 0.5;
        const particleAngle = hitAngle + spread;
        this.particleManager.explosionParticles.add({
          x: enemy.x,
          y: enemy.y,
          dx: Math.cos(particleAngle) * (2 + Math.random() * 2),
          dy: Math.sin(particleAngle) * (2 + Math.random() * 2),
          life: 10,
          maxLife: 10,
          size: Math.random() * 2 + 1,
          color: '#ffaa00'
        });
      }
    }

    // Spawn damage number for tower shots
    const isTowerShot = bullet && bullet.towerShot;
    if (isTowerShot && this.particleManager) {
      this.particleManager.spawnDamageNumber(enemy.x, enemy.y, damageDealt, true);
    }

    // Critical hit visual feedback
    const isCritical = bullet && bullet.critical;
    if (isCritical) {
      this.achievementManager.trackCriticalHit();
      // Golden flash for critical hits
      this.ctx.save();
      this.ctx.globalAlpha = 0.8;
      this.ctx.fillStyle = '#FFD700';
      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, enemy.size * 1.8, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      // Spawn critical hit particles (gold sparkles)
      if (this.particleManager) {
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 / 8) * i;
          const speed = 2 + Math.random() * 2;
          this.particleManager.sparkleParticles.add({
            x: enemy.x,
            y: enemy.y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            life: 20,
            maxLife: 20,
            size: Math.random() * 3 + 2,
            color: '#FFD700'
          });
        }
      }
    } else {
      // Normal hit flash effect
      this.ctx.save();
      this.ctx.globalAlpha = 0.5;
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, enemy.size * 1.2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Apply lifesteal if player has it from upgrades
    const boosts = this.shopManager.getEquippedStatBoosts();
    if (boosts.lifesteal > 0 && damageDealt > 0) {
      const healAmount = damageDealt * boosts.lifesteal;
      const maxHealth = CONFIG.PLAYER.MAX_HEALTH + boosts.maxHealth;
      this.player.health = Math.min(maxHealth, this.player.health + healAmount);

      // Spawn small heal particles for visual feedback
      if (this.particleManager && healAmount > 0.5) {
        this.particleManager.spawnHealPlus(this.player.x, this.player.y);
      }
    }

    // Enemy killed
    if (enemy.health <= 0) {
      this.handleEnemyKill(enemy, index, bullet);
    }
  }

  handleEnemyKill(enemy, index, bullet = null) {
    // Calculate hit angle for death animation
    const dx = enemy.x - this.player.x;
    const dy = enemy.y - this.player.y;
    const hitAngle = Math.atan2(dy, dx);

    // Play death sound (different for boss)
    if (enemy.type === 'boss') {
      this.audioManager.playSound('boss_death', 1.0);
      // Heavy screen shake for boss death
      this.screenEffects.shake(15, 20);
    } else {
      this.audioManager.playSound('enemy_death', 0.4, 0.9 + Math.random() * 0.3);
      // Small shake for normal enemy death
      this.screenEffects.shake(2, 5);
    }

    // Track tower kill if killed by tower bullet
    const isTowerKill = bullet && bullet.towerShot;

    // Kill enemy (start death animation)
    this.enemyManager.killEnemy(index, hitAngle, (killedEnemy) => {
      // Track kill in achievement manager
      this.achievementManager.trackKill(killedEnemy);

      // Track tower kill separately
      if (isTowerKill) {
        this.achievementManager.trackTowerKill();
      }

      // Track kill in statistics
      this.statisticsManager.trackKill();

      // Add score with upgrade multiplier
      const boosts = this.shopManager.getEquippedStatBoosts();
      const oldCombo = this.scoreManager.comboCount;
      this.scoreManager.addKill(boosts.scoreMultiplier);

      // Trigger combo glow if combo increased
      const newCombo = this.scoreManager.comboCount;
      if (newCombo > oldCombo && newCombo > 0) {
        this.player.triggerComboGlow();
      }

      // Track combo in statistics
      this.statisticsManager.trackCombo(this.scoreManager.comboCount);

      // Track multikill
      this.player.addKill();

      // Spawn blood particles
      const particleCount = killedEnemy.type === 'boss' ? 30 : 12;
      const isHealer = killedEnemy.type === 'healer';
      this.particleManager.spawnBloodSpray(killedEnemy.x, killedEnemy.y, hitAngle, particleCount, killedEnemy.type === 'boss', isHealer);

      // Boss explosion effects
      if (killedEnemy.type === 'boss') {
        this.particleManager.spawnBossExplosionRing(killedEnemy.x, killedEnemy.y);
        this.screenShake(12, 5);
        // Boss guaranteed powerup drop (always spawn, skip normal drop check)
        this.powerupManager.spawn(killedEnemy.x, killedEnemy.y);
      } else {
        // Normal powerup drop (chance-based)
        if (this.powerupManager.checkDropChance(this.enemyManager.getKillCount())) {
          this.powerupManager.spawn(killedEnemy.x, killedEnemy.y);
        }
      }

      // Check for rank change
      this.checkRankChange();

      // Check achievements
      const scoreData = this.scoreManager.getData();
      this.achievementManager.check(
        this.waveManager.getWave(),
        scoreData.score,
        scoreData.rank,
        scoreData.combo
      );
    });
  }

  checkRankChange() {
    const currentRank = this.scoreManager.getRank();
    if (currentRank !== this.lastRank) {
      // Enhanced rank-up animation
      this.showRankUpAnimation(currentRank);

      // Enhanced particle burst - multiple waves for dramatic effect
      const rankColor = this.scoreManager.getRankColor();
      this.particleManager.spawnRankUpSparkles(this.player.x, this.player.y, rankColor);

      // Second burst delayed slightly for cascading effect
      setTimeout(() => {
        this.particleManager.spawnRankUpSparkles(this.player.x, this.player.y, rankColor);
      }, 150);

      // Extra burst for Legend rank
      if (currentRank === 'Legend') {
        setTimeout(() => {
          this.particleManager.spawnRankUpSparkles(this.player.x, this.player.y, rankColor);
        }, 300);
      }

      // Screen shake for extra impact
      const shakeIntensity = currentRank === 'Legend' ? 8 : (currentRank === 'Elite' ? 6 : 4);
      this.screenShake(10, shakeIntensity);

      this.lastRank = currentRank;
    }
  }

  showRankUpAnimation(newRank) {
    // Enhanced screen flash effect - more dramatic
    const flashElement = document.getElementById('rankUpFlash');
    if (flashElement) {
      const rankColor = this.scoreManager.getRankColor();
      flashElement.style.background = rankColor;
      flashElement.style.opacity = '0.8'; // Increased from 0.6 for more impact
      flashElement.style.display = 'block';

      // Double flash for extra emphasis
      setTimeout(() => {
        flashElement.style.opacity = '0.4';
        setTimeout(() => {
          flashElement.style.opacity = '0.8';
          setTimeout(() => {
            flashElement.style.opacity = '0';
            setTimeout(() => {
              flashElement.style.display = 'none';
            }, 500);
          }, 150);
        }, 100);
      }, 200);
    }

    // Enhanced rank-up notification banner
    const notification = document.getElementById('rankUpNotification');
    const rankIcon = document.getElementById('rankUpIcon');
    const rankText = document.getElementById('rankUpRank');

    if (notification && rankIcon && rankText) {
      const rankIcons = {
        'Soldier': '🎖️',
        'Veteran': '⭐',
        'Elite': '💎',
        'Legend': '👑'
      };

      rankIcon.textContent = rankIcons[newRank] || '⭐';
      rankText.textContent = newRank;

      notification.style.display = 'flex';
      notification.classList.add('rank-up-show');

      // Notification stays longer for higher ranks
      const displayDuration = newRank === 'Legend' ? 4000 : (newRank === 'Elite' ? 3000 : 2500);

      setTimeout(() => {
        notification.classList.remove('rank-up-show');
        setTimeout(() => {
          notification.style.display = 'none';
        }, 500);
      }, displayDuration);
    }
  }

  screenShake(frames, intensity) {
    const originalTransform = this.canvas.style.transform;
    let shakeFrame = 0;
    const shake = setInterval(() => {
      if (shakeFrame++ > frames) {
        clearInterval(shake);
        this.canvas.style.transform = originalTransform;
      } else {
        const offset = (shakeFrame % 2 === 0 ? 1 : -1) * intensity;
        this.canvas.style.transform = `translate(${offset}px, ${offset}px)`;
      }
    }, 30);
  }

  flashDamage() {
    this.damageFlash.style.opacity = '1';
    setTimeout(() => {
      this.damageFlash.style.opacity = '0';
    }, 100);
  }

  showAmmoDepletedNotification(ammoName) {
    // Use achievement notification system for consistency
    if (this.achievementNotification) {
      this.achievementNotification.textContent = `⚠️ ${ammoName} Depleted!`;
      this.achievementNotification.style.display = 'block';
      this.achievementNotification.style.background = 'linear-gradient(135deg, #ff6b35 0%, #ff9068 100%)';

      setTimeout(() => {
        this.achievementNotification.style.display = 'none';
        this.achievementNotification.style.background = ''; // Reset to default
      }, 2000);
    }
  }

  showCompanionUnlockNotification(companionType) {
    const names = {
      drone: 'Attack Drone',
      robot: 'Combat Robot',
      turret: 'Auto Turret',
      medic: 'Medical Drone',
      tank: 'Tank Companion'
    };

    if (this.achievementNotification) {
      this.achievementNotification.textContent = `🤖 ${names[companionType] || companionType} Unlocked!`;
      this.achievementNotification.style.display = 'block';
      this.achievementNotification.style.background = 'linear-gradient(135deg, #00d4ff 0%, #0080ff 100%)';

      setTimeout(() => {
        this.achievementNotification.style.display = 'none';
        this.achievementNotification.style.background = ''; // Reset to default
      }, 3000);
    }
  }

  showFortressUnlockNotification(fortressName, structureType = null) {
    if (this.achievementNotification) {
      // Get structure stats for enhanced notification
      let stats = '';
      if (structureType) {
        const config = CONFIG.FORTRESS[structureType.toUpperCase()];
        if (config) {
          stats = `\n${config.HEALTH} HP | ${(config.DAMAGE_RESISTANCE * 100).toFixed(0)}% Resist`;
          if (structureType === 'tower') {
            stats += ` | ${config.DAMAGE} DMG`;
          }
        }
      }

      this.achievementNotification.textContent = `🏰 ${fortressName} Built!${stats}`;
      this.achievementNotification.style.display = 'block';
      this.achievementNotification.style.background = 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)';
      this.achievementNotification.style.whiteSpace = 'pre-line'; // Allow multiline

      setTimeout(() => {
        this.achievementNotification.style.display = 'none';
        this.achievementNotification.style.background = ''; // Reset to default
        this.achievementNotification.style.whiteSpace = ''; // Reset
      }, 3500); // Increased duration for more info
    }
  }

  checkFortressTierUnlocks(wave) {
    // Track what's been built
    if (!this.fortressTiersBuilt) {
      this.fortressTiersBuilt = new Set();
    }

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    // Reduced radius to keep structures within visible screen bounds
    // Canvas is 360x600, so max safe distance from center is ~150px
    const radius = 50; // Reduced from 80 to keep structures visible and closer to center

    // Tier 1: Wave 5 - Fence perimeter (250x250 square, centered, continuous)
    if (wave >= 5 && !this.fortressTiersBuilt.has('tier1')) {
      this.fortressTiersBuilt.add('tier1');

      // Build 250x250 square fence centered on the map
      const fenceSize = 250; // 250x250 square (1:1 ratio)
      const fenceHeight = 10; // Thickness of fence segments
      
      // Calculate center position for the square
      const fenceCenterX = centerX;
      const fenceCenterY = centerY;
      
      // Calculate top-left corner of the square
      const fenceX = fenceCenterX - fenceSize / 2;
      const fenceY = fenceCenterY - fenceSize / 2;
      
      // Ensure fence stays within canvas bounds
      const clampedFenceX = Math.max(0, Math.min(fenceX, this.canvas.width - fenceSize));
      const clampedFenceY = Math.max(0, Math.min(fenceY, this.canvas.height - fenceSize));
      
      // Top fence - spans full width of square
      const topFenceX = clampedFenceX;
      const topFenceY = clampedFenceY;
      const topFenceWidth = fenceSize;
      this.fortressManager.addStructure('fence', topFenceX, topFenceY, topFenceWidth, fenceHeight);
      
      // Bottom fence - spans full width of square
      const bottomFenceX = clampedFenceX;
      const bottomFenceY = clampedFenceY + fenceSize - fenceHeight;
      const bottomFenceWidth = fenceSize;
      this.fortressManager.addStructure('fence', bottomFenceX, bottomFenceY, bottomFenceWidth, fenceHeight);
      
      // Left fence - connects top to bottom (starts after top fence, ends before bottom fence)
      const leftFenceX = clampedFenceX;
      const leftFenceY = clampedFenceY + fenceHeight;
      const leftFenceHeight = fenceSize - (fenceHeight * 2); // Height minus top and bottom
      if (leftFenceHeight > 0) {
        this.fortressManager.addStructure('fence', leftFenceX, leftFenceY, fenceHeight, leftFenceHeight);
      }
      
      // Right fence - connects top to bottom (starts after top fence, ends before bottom fence)
      const rightFenceX = clampedFenceX + fenceSize - fenceHeight;
      const rightFenceY = clampedFenceY + fenceHeight;
      const rightFenceHeight = fenceSize - (fenceHeight * 2); // Height minus top and bottom
      if (rightFenceHeight > 0) {
        this.fortressManager.addStructure('fence', rightFenceX, rightFenceY, fenceHeight, rightFenceHeight);
      }

      this.showFortressUnlockNotification('Wooden Fence Perimeter', 'fence');
    }

    // Tier 2: Wave 15 - Barricade corners
    if (wave >= 15 && !this.fortressTiersBuilt.has('tier2')) {
      this.fortressTiersBuilt.add('tier2');

      const barricadeSize = 25;
      const offset = radius * 0.7; // ~35px from center

      // 4 corner barricades - ensure all within bounds
      const topLeftX = Math.max(0, centerX - offset - barricadeSize/2);
      const topLeftY = Math.max(0, centerY - offset - barricadeSize/2);
      const topRightX = Math.min(this.canvas.width - barricadeSize, centerX + offset - barricadeSize/2);
      const topRightY = Math.max(0, centerY - offset - barricadeSize/2);
      const bottomLeftX = Math.max(0, centerX - offset - barricadeSize/2);
      const bottomLeftY = Math.min(this.canvas.height - barricadeSize, centerY + offset - barricadeSize/2);
      const bottomRightX = Math.min(this.canvas.width - barricadeSize, centerX + offset - barricadeSize/2);
      const bottomRightY = Math.min(this.canvas.height - barricadeSize, centerY + offset - barricadeSize/2);

      this.fortressManager.addStructure('barricade', topLeftX, topLeftY, barricadeSize, barricadeSize);
      this.fortressManager.addStructure('barricade', topRightX, topRightY, barricadeSize, barricadeSize);
      this.fortressManager.addStructure('barricade', bottomLeftX, bottomLeftY, barricadeSize, barricadeSize);
      this.fortressManager.addStructure('barricade', bottomRightX, bottomRightY, barricadeSize, barricadeSize);

      this.showFortressUnlockNotification('Corner Barricades', 'barricade');
    }

    // Tier 3: Wave 30 - Gate entrances
    if (wave >= 30 && !this.fortressTiersBuilt.has('tier3')) {
      this.fortressTiersBuilt.add('tier3');

      const gateWidth = 30;
      const gateHeight = 15;
      const gateRadius = radius + 10; // Reduced from +15

      // Top and bottom gates - ensure within bounds
      const topGateY = Math.max(0, centerY - gateRadius);
      const bottomGateY = Math.min(this.canvas.height - gateHeight, centerY + gateRadius - gateHeight);
      this.fortressManager.addStructure('gate', centerX - gateWidth/2, topGateY, gateWidth, gateHeight);
      this.fortressManager.addStructure('gate', centerX - gateWidth/2, bottomGateY, gateWidth, gateHeight);

      this.showFortressUnlockNotification('Reinforced Gates', 'gate');
    }

    // Tier 4: Wave 50 - Stone walls (continuous, no gaps)
    if (wave >= 50 && !this.fortressTiersBuilt.has('tier4')) {
      this.fortressTiersBuilt.add('tier4');

      const wallHeight = 12;
      const wallRadius = radius + 15; // Reduced from +25

      // Build continuous wall perimeter - forms a complete square
      // Top wall - spans full width
      const topWallY = Math.max(0, centerY - wallRadius);
      this.fortressManager.addStructure('wall', 0, topWallY, this.canvas.width, wallHeight);
      
      // Bottom wall - spans full width
      const bottomWallY = Math.min(this.canvas.height - wallHeight, centerY + wallRadius - wallHeight);
      this.fortressManager.addStructure('wall', 0, bottomWallY, this.canvas.width, wallHeight);
      
      // Left wall - connects top to bottom
      const leftWallX = 0;
      const leftWallY = topWallY + wallHeight;
      const leftWallHeight = Math.max(0, bottomWallY - leftWallY);
      if (leftWallHeight > 0) {
        this.fortressManager.addStructure('wall', leftWallX, leftWallY, wallHeight, leftWallHeight);
      }
      
      // Right wall - connects top to bottom
      const rightWallX = this.canvas.width - wallHeight;
      const rightWallY = topWallY + wallHeight;
      const rightWallHeight = Math.max(0, bottomWallY - rightWallY);
      if (rightWallHeight > 0) {
        this.fortressManager.addStructure('wall', rightWallX, rightWallY, wallHeight, rightWallHeight);
      }

      this.showFortressUnlockNotification('Stone Wall Fortifications', 'wall');
    }

    // Tier 5: Wave 75 - Guard towers at fence intersection corners
    // Towers are placed at the 4 corners where fence segments intersect (fence remains, towers are added)
    if (wave >= 75 && !this.fortressTiersBuilt.has('tier5')) {
      this.fortressTiersBuilt.add('tier5');

      const towerSize = 20;
      
      // Calculate fence positions (same as Tier 1 fence - 250x250 square centered)
      const fenceSize = 250; // Same as fence square size
      const fenceHeight = 10; // Thickness of fence segments
      const fenceCenterX = centerX;
      const fenceCenterY = centerY;
      const fenceX = fenceCenterX - fenceSize / 2;
      const fenceY = fenceCenterY - fenceSize / 2;
      
      // Ensure fence coordinates stay within bounds
      const clampedFenceX = Math.max(0, Math.min(fenceX, this.canvas.width - fenceSize));
      const clampedFenceY = Math.max(0, Math.min(fenceY, this.canvas.height - fenceSize));
      
      // Place towers at the 4 intersection corners where fence segments meet:
      // Top-left: where top fence and left fence intersect
      const topLeftTowerX = clampedFenceX - towerSize / 2;
      const topLeftTowerY = clampedFenceY - towerSize / 2;
      
      // Top-right: where top fence and right fence intersect
      const topRightTowerX = clampedFenceX + fenceSize - towerSize / 2;
      const topRightTowerY = clampedFenceY - towerSize / 2;
      
      // Bottom-left: where bottom fence and left fence intersect
      const bottomLeftTowerX = clampedFenceX - towerSize / 2;
      const bottomLeftTowerY = clampedFenceY + fenceSize - towerSize / 2;
      
      // Bottom-right: where bottom fence and right fence intersect
      const bottomRightTowerX = clampedFenceX + fenceSize - towerSize / 2;
      const bottomRightTowerY = clampedFenceY + fenceSize - towerSize / 2;
      
      // Ensure towers stay within canvas bounds
      const topLeftX = Math.max(0, Math.min(topLeftTowerX, this.canvas.width - towerSize));
      const topLeftY = Math.max(0, Math.min(topLeftTowerY, this.canvas.height - towerSize));
      const topRightX = Math.max(0, Math.min(topRightTowerX, this.canvas.width - towerSize));
      const topRightY = Math.max(0, Math.min(topRightTowerY, this.canvas.height - towerSize));
      const bottomLeftX = Math.max(0, Math.min(bottomLeftTowerX, this.canvas.width - towerSize));
      const bottomLeftY = Math.max(0, Math.min(bottomLeftTowerY, this.canvas.height - towerSize));
      const bottomRightX = Math.max(0, Math.min(bottomRightTowerX, this.canvas.width - towerSize));
      const bottomRightY = Math.max(0, Math.min(bottomRightTowerY, this.canvas.height - towerSize));

      // Add towers at fence intersection corners (fence remains in place)
      this.fortressManager.addStructure('tower', topLeftX, topLeftY, towerSize, towerSize);
      this.fortressManager.addStructure('tower', topRightX, topRightY, towerSize, towerSize);
      this.fortressManager.addStructure('tower', bottomLeftX, bottomLeftY, towerSize, towerSize);
      this.fortressManager.addStructure('tower', bottomRightX, bottomRightY, towerSize, towerSize);

      this.showFortressUnlockNotification('Guard Tower Defense Grid', 'tower');
    }
  }

  update() {
    if (this.controls.isPaused || this.gameOver) return;

    // Update animated stars
    this.updateStars();

    // Phase 3: Skip controls and combat during death animation
    const isDying = this.player.dying;

    // Update controls (apply keyboard input to player) - skip during death
    if (!isDying) {
      this.controls.updatePlayer(this.player);
    }

    // Update powerup manager (handles timer updates and powerup logic)
    this.powerupManager.updatePlayerSpeed(this.player, this.shopManager);
    this.powerupManager.update(this.player, this.shopManager);

    // Update player
    this.player.update();

    // Update zombies and handle collision - skip damage during death
    const damage = this.enemyManager.update(
      this.player.x,
      this.player.y,
      this.powerupManager.isShieldActive(),
      this.powerupManager.isTimeSlowActive()
    );

    // Apply damage only if not dying AND spawn animation is complete AND not invincible
    if (damage > 0 && !isDying && this.player.spawnProgress >= 1 && !this.powerupManager.isInvincibilityActive()) {
      this.player.health -= damage;
      this.player.takeHit();
      this.flashDamage();
      this.achievementManager.trackDamageTaken(damage);
      this.audioManager.playSound('player_damage', 0.5);
      // Screen shake and hit flash on damage
      this.screenEffects.shake(8, 12);
      this.screenEffects.flashHit(0.4);
    }

    // Update companions
    const boosts = this.shopManager.getEquippedStatBoosts();
    this.companionManager.update(
      this.player.x,
      this.player.y,
      this.enemyManager,
      this.player,
      boosts
    );

    // Check companion-zombie collisions
    this.companionManager.checkEnemyCollisions(this.enemyManager.enemies);

    // Update fortress structures
    this.fortressManager.update();

    // Handle fortress-zombie collisions
    this.fortressManager.handleEnemyCollisions(this.enemyManager.enemies);

    // Handle bullet collisions with fortress structures
    this.fortressManager.handleBulletCollisions(this.bulletPool);

    // Update bullets
    for (const bullet of this.bulletPool.getInUse()) {
      // Homing powerup: Steer bullets towards nearest enemy
      if (bullet.homingPowerup) {
        const nearestEnemy = this.enemyManager.findNearest(bullet.x, bullet.y);
        if (nearestEnemy && !nearestEnemy.dying) {
          // Calculate direction to enemy
          const dx = nearestEnemy.x - bullet.x;
          const dy = nearestEnemy.y - bullet.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 0) {
            // Gradually steer towards enemy (30% tracking strength)
            const trackingStrength = 0.3;
            const targetDx = (dx / dist) * CONFIG.BULLET.SPEED;
            const targetDy = (dy / dist) * CONFIG.BULLET.SPEED;

            bullet.dx += (targetDx - bullet.dx) * trackingStrength;
            bullet.dy += (targetDy - bullet.dy) * trackingStrength;

            // Normalize speed to maintain consistent bullet speed
            const currentSpeed = Math.hypot(bullet.dx, bullet.dy);
            bullet.dx = (bullet.dx / currentSpeed) * CONFIG.BULLET.SPEED;
            bullet.dy = (bullet.dy / currentSpeed) * CONFIG.BULLET.SPEED;
          }
        }
      }

      bullet.update(this.canvas.width, this.canvas.height);
    }

    // Auto-shoot - skip during death
    if (!isDying) {
      this.autoShoot();

      // Handle bullet collisions
      this.handleBulletCollisions();

      // Health regeneration (with equipped armor boosts) - skip during death
      const boosts = this.shopManager.getEquippedStatBoosts();
      const maxHealth = CONFIG.PLAYER.MAX_HEALTH + boosts.maxHealth;
      const regenRate = CONFIG.PLAYER.REGEN_RATE * boosts.regenRate;
      const now = Date.now();
      if (this.player.health < maxHealth && this.player.health > 0) {
        if (now - this.lastRegenTime >= CONFIG.PLAYER.REGEN_INTERVAL) {
          this.player.health = Math.min(maxHealth, this.player.health + regenRate);
          this.lastRegenTime = now;
        }
      } else if (this.player.health >= maxHealth) {
        // Keep timer current when at max health
        this.lastRegenTime = now;
      }
      // Cap health at current max
      this.player.health = Math.min(maxHealth, this.player.health);
    }

    // Wave completion check
    const aliveEnemies = this.enemyManager.getAliveCount();
    if (this.waveManager.isWaveComplete(aliveEnemies)) {
      const scoreData = this.scoreManager.getData();
      const currencyBefore = this.scoreManager.currency;
      this.waveManager.completeWave(scoreData.score, this.scoreManager, this.shopManager);
      const currencyAfter = this.scoreManager.currency;
      const coinsEarned = currencyAfter - currencyBefore;

      // Track wave completion in statistics and achievements
      this.statisticsManager.waveCompleted();
      this.achievementManager.trackWaveComplete();
      this.achievementManager.trackCoinsEarned(coinsEarned);

      // Restore all fortress structures to full health
      this.fortressManager.restoreAll();

      // Restore all companions to full health (revive dying ones)
      this.companionManager.restoreAll();

      // Check for companion unlocks
      const currentWave = this.waveManager.getWave();
      const unlocked = this.companionManager.checkUnlocks(currentWave);
      if (unlocked.length > 0) {
        for (const type of unlocked) {
          // Auto-spawn newly unlocked companion at player position
          this.companionManager.spawn(type, this.player.x, this.player.y);
          this.showCompanionUnlockNotification(type);
        }
      }
      
      // Respawn all previously unlocked companions that died during the wave
      // (Only respawn if they're unlocked in THIS game session and not already spawned)
      // Only respawn companions that were unlocked at or before the current wave
      const companionTypes = ['drone', 'robot', 'turret', 'medic', 'tank'];
      for (const type of companionTypes) {
        const config = CONFIG.COMPANIONS[type.toUpperCase()];
        // Only respawn if companion is unlocked AND the current wave is >= unlock wave
        if (this.companionManager.isUnlocked(type) && currentWave >= config.UNLOCK_WAVE) {
          // Check if this companion type is already spawned and alive
          const alreadySpawned = this.companionManager.companions.some(
            c => c.type === type && !c.dying
          );
          if (!alreadySpawned) {
            // Respawn at player position (companion died during wave)
            this.companionManager.spawn(type, this.player.x, this.player.y);
          }
        }
      }

      // Check for fortress tier unlocks and auto-build
      this.checkFortressTierUnlocks(currentWave);
    }

    // Start next wave (only after wave completion delay and if no zombies)
    // Only spawn if wave is not pending and there are truly no zombies (alive or dying)
    if (!this.waveManager.isPending() && aliveEnemies === 0 && this.enemyManager.getTotalCount() === 0 && this.waveManager.waveStarted === false) {
      const enemies = this.waveManager.spawnWave();
      if (enemies && enemies.length > 0) {
        this.enemyManager.addEnemies(enemies);
        // Update powerup manager with current wave for scaling
        this.powerupManager.currentWave = this.waveManager.getWave();
      }
    }

    // Game over check - Phase 3: Start death animation instead of immediate game over
    if (this.player.health <= 0 && !this.gameOver && !this.player.dying) {
      this.player.startDeath();
      // Play death sound
      this.audioManager.playSound('player_death', 0.8);
      // Spawn death particles
      this.particleManager.spawnBloodSpray(this.player.x, this.player.y, 0, 20, false, false);
      // Spawn explosion ring
      this.particleManager.spawnBossExplosionRing(this.player.x, this.player.y);
    }
    
    // Phase 3: Check if death animation is complete, then show game over
    if (this.player.isDeathComplete() && !this.gameOver) {
      this.gameOver = true;
      this.showGameOver();
      return;
    }

    // Spawn footstep dust particles - skip during death
    if (!isDying && Math.abs(this.player.vx) + Math.abs(this.player.vy) > 0 && Math.random() < 0.3) {
      this.particleManager.spawnDust(this.player.x, this.player.y);
    }

    // Spawn speed energy particles (motion streaks) - skip during death
    if (!isDying && this.powerupManager.isSpeedActive() && Math.abs(this.player.vx) + Math.abs(this.player.vy) > 0 && Math.random() < 0.7) {
      this.particleManager.spawnSpeedEnergy(this.player.x, this.player.y, this.player.vx, this.player.vy);
    }

    // Update all particle systems
    this.particleManager.update();

    // Update screen effects
    this.screenEffects.update();

    // Track powerup collection for achievements (only when count increases)
    if (this.powerupManager.collectedCount > this.lastTrackedPowerupCount) {
      const newCollections = this.powerupManager.collectedCount - this.lastTrackedPowerupCount;
      for (let i = 0; i < newCollections; i++) {
        this.achievementManager.trackPowerup();
      }
      this.lastTrackedPowerupCount = this.powerupManager.collectedCount;
    }

    // Update HUD
    this.updateHUD();
  }

  updateHUD() {
    const scoreData = this.scoreManager.getData();

    // Update score, wave, currency
    document.getElementById('wave').textContent = this.waveManager.getWave();
    document.getElementById('score').textContent = scoreData.score.toLocaleString();
    document.getElementById('coinCount').textContent = scoreData.currency.toLocaleString();

    // Update rank with visual styling
    const rank = scoreData.rank;
    const rankElement = document.getElementById('rank');
    const rankCard = document.getElementById('rankCard');
    const rankIcon = document.getElementById('rankIcon');
    
    rankElement.textContent = rank;
    
    // Remove all rank classes
    rankCard.className = 'hud-stat-card rank-card';
    
    // Apply rank-specific styling
    const rankLower = rank.toLowerCase();
    rankCard.classList.add(rankLower);
    
    // Update rank icon
    const rankIcons = {
      'Soldier': '🎖️',
      'Veteran': '⭐',
      'Elite': '💎',
      'Legend': '👑'
    };
    rankIcon.textContent = rankIcons[rank] || '🎖️';

    // Update rank progress
    const progressContainer = document.getElementById('rankProgressContainer');
    const progressFill = document.getElementById('rankProgressFill');
    const progressText = document.getElementById('rankProgressText');
    
    const nextRankName = this.scoreManager.getNextRankName();
    if (nextRankName && progressContainer && progressFill && progressText) {
      const progress = this.scoreManager.getRankProgress();
      const pointsNeeded = this.scoreManager.getPointsToNextRank();
      
      progressContainer.style.display = 'block';
      progressFill.style.width = `${progress * 100}%`;
      progressText.textContent = `${pointsNeeded} to ${nextRankName}`;
    } else if (progressContainer) {
      progressContainer.style.display = 'none';
    }

    // Update combo display
    const comboDisplay = document.getElementById('comboDisplay');
    const comboCount = document.getElementById('comboCount');

    if (this.scoreManager.isComboActive()) {
      comboDisplay.style.display = 'flex';
      comboCount.textContent = scoreData.combo;
    } else {
      comboDisplay.style.display = 'none';
    }

    // Update powerup indicator
    const powerupIndicator = document.getElementById('powerupIndicator');
    const activePowerup = this.powerupManager.getCurrentPowerup();
    const powerupIcon = document.getElementById('powerupIcon');
    const powerupName = document.getElementById('activePowerup');
    const powerupTimer = document.getElementById('powerupTimer');

    if (activePowerup !== 'None') {
      powerupIndicator.style.display = 'flex';
      
      // Powerup icons
      const powerupIcons = {
        'SHIELD': '🛡️',
        'SPEED': '⚡',
        'MULTISHOT': '🔫'
      };
      powerupIcon.textContent = powerupIcons[activePowerup] || '⚡';
      powerupName.textContent = activePowerup;
      
      // Calculate remaining time
      let remainingTime = 0;
      if (activePowerup === 'SHIELD' && this.powerupManager.isShieldActive()) {
        remainingTime = this.powerupManager.timers.shield;
      } else if (activePowerup === 'SPEED' && this.powerupManager.isSpeedActive()) {
        remainingTime = this.powerupManager.timers.speed;
      } else if (activePowerup === 'MULTISHOT' && this.powerupManager.isMultishotActive()) {
        remainingTime = this.powerupManager.timers.multishot;
      }
      
      if (remainingTime > Date.now()) {
        const seconds = Math.ceil((remainingTime - Date.now()) / 1000);
        powerupTimer.textContent = `${seconds}s`;
      } else {
        powerupTimer.textContent = '';
      }
    } else {
      powerupIndicator.style.display = 'none';
    }

    // Update health with color coding (account for equipped armor max health boost)
    const boosts = this.shopManager.getEquippedStatBoosts();
    const maxHealth = CONFIG.PLAYER.MAX_HEALTH + boosts.maxHealth;
    const health = Math.max(0, Math.floor(this.player.health));
    const healthElement = document.getElementById('health');
    const healthMaxElement = document.querySelector('.health-max');
    const healthPercent = maxHealth > 0 ? (this.player.health / maxHealth) * 100 : 0;
    
    if (healthElement) {
      healthElement.textContent = health;
    }
    if (healthMaxElement) {
      healthMaxElement.textContent = `/${maxHealth}`;
    }
    
    // Update health bar if element exists
    if (this.healthFill) {
      this.healthFill.style.width = Math.max(0, healthPercent) + '%';

      // Check if shield is active
      const isShieldActive = this.powerupManager.isShieldActive();

      // Health bar color based on shield status and health level
      if (isShieldActive) {
        // Shield active: cyan/blue with pulsing glow
        this.healthFill.style.background = 'linear-gradient(90deg, #00ffff 0%, #00ccff 50%, #00ffff 100%)';
        this.healthFill.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.9), 0 0 30px rgba(0, 255, 255, 0.6)';
      } else if (healthPercent > 60) {
        this.healthFill.style.background = 'linear-gradient(90deg, #00ff00 0%, #7fff00 50%, #00ff00 100%)';
        this.healthFill.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.6), 0 0 20px rgba(0, 255, 0, 0.3)';
      } else if (healthPercent > 30) {
        this.healthFill.style.background = 'linear-gradient(90deg, #ffaa00 0%, #ff8800 50%, #ffaa00 100%)';
        this.healthFill.style.boxShadow = '0 0 10px rgba(255, 170, 0, 0.6), 0 0 20px rgba(255, 170, 0, 0.3)';
      } else {
        this.healthFill.style.background = 'linear-gradient(90deg, #ff0000 0%, #cc0000 50%, #ff0000 100%)';
        this.healthFill.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.8), 0 0 20px rgba(255, 0, 0, 0.5)';
      }
    }
    
    // Health text color
    if (healthElement) {
      if (healthPercent > 60) {
        healthElement.style.color = '#ffeb3b';
      } else if (healthPercent > 30) {
        healthElement.style.color = '#ff9800';
      } else {
        healthElement.style.color = '#ff4444';
        // Pulse animation for low health
        healthElement.style.animation = healthPercent > 0 ? 'pulse 0.5s ease-in-out infinite' : 'none';
      }
    }
  }

  updateBestDisplay() {
    const scoreData = this.scoreManager.getData();
    const bestScoreEl = document.getElementById('bestScore');
    if (bestScoreEl) {
      bestScoreEl.textContent = scoreData.bestScore;
    }
    const menuBestEl = document.getElementById('menuBest');
    if (menuBestEl) {
      menuBestEl.textContent = scoreData.bestScore;
    }
  }

  updateStars() {
    for (const star of this.stars) {
      star.y += star.speed;
      if (star.y > this.canvas.height) {
        star.y = 0;
        star.x = Math.random() * this.canvas.width;
      }
    }
  }

  drawStars() {
    this.ctx.save();
    for (const star of this.stars) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    this.ctx.restore();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply screen shake
    const shake = this.screenEffects.getShakeOffset();
    this.ctx.save();
    this.ctx.translate(shake.x, shake.y);

    // Draw animated stars background
    this.drawStars();

    // Draw all particle systems (background layer)
    this.particleManager.draw(this.ctx);

    // Draw fortress structures (behind zombies)
    this.fortressManager.draw(this.ctx);

    // Draw zombies
    this.enemyManager.draw(this.ctx);

    // Draw companions
    this.companionManager.draw(this.ctx);

    // Draw player
    const target = this.enemyManager.findNearest(this.player.x, this.player.y);
    const scoreData = this.scoreManager.getData();

    // Get equipped weapon model
    let weaponModel = 'assault_rifle'; // default
    if (this.shopManager && this.inventoryManager) {
      const equippedWeapon = this.inventoryManager.getEquipped('weapon');
      if (equippedWeapon) {
        const weaponItem = this.shopManager.getItem(equippedWeapon);
        if (weaponItem && weaponItem.weaponModel) {
          weaponModel = weaponItem.weaponModel;
        }
      }
    }

    // Get equipped armor model
    let armorModel = 'light'; // default
    if (this.shopManager && this.inventoryManager) {
      const equippedArmor = this.inventoryManager.getEquipped('armor');
      if (equippedArmor) {
        const armorItem = this.shopManager.getItem(equippedArmor);
        if (armorItem && armorItem.armorModel) {
          armorModel = armorItem.armorModel;
        }
      }
    }

    this.player.drawArm(this.ctx, target, weaponModel);
    // Get max health with boosts for accurate health percentage
    const boosts = this.shopManager.getEquippedStatBoosts();
    const maxHealth = CONFIG.PLAYER.MAX_HEALTH + boosts.maxHealth;
    this.player.draw(this.ctx, scoreData.rank, this.powerupManager, armorModel, maxHealth);

    // Draw shield effect
    this.powerupManager.drawShieldEffect(this.ctx, this.player);

    // Draw bullets
    for (const bullet of this.bulletPool.getInUse()) {
      if (bullet.active) bullet.draw(this.ctx);
    }

    // Draw powerups and notices
    this.powerupManager.draw(this.ctx);

    // Draw low health screen border warning (≤20% health)
    this.drawLowHealthWarning();

    // Restore shake transform
    this.ctx.restore();

    // Draw hit flash (after shake restore, so it covers full screen)
    this.screenEffects.drawHitFlash(this.ctx, this.canvas);

    // Draw FPS counter (if enabled)
    if (this.showFPS) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.ctx.fillRect(this.canvas.width - 75, 5, 70, 25);
      this.ctx.fillStyle = this.fps < 30 ? '#ff4444' : (this.fps < 50 ? '#ffaa00' : '#00ff00');
      this.ctx.font = 'bold 16px sans-serif';
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(`FPS: ${this.fps}`, this.canvas.width - 10, 10);
      this.ctx.restore();
    }
  }

  drawLowHealthWarning() {
    // Check if health is ≤ 20%
    const boosts = this.shopManager.getEquippedStatBoosts();
    const maxHealth = CONFIG.PLAYER.MAX_HEALTH + boosts.maxHealth;
    const healthPercent = (this.player.health / maxHealth) * 100;

    if (healthPercent <= 20) {
      const pulseTime = performance.now() / 500;
      const alpha = 0.3 + Math.sin(pulseTime) * 0.3; // Pulse between 0.3 and 0.6

      this.ctx.save();
      this.ctx.fillStyle = `rgba(255,0,0,${alpha})`;
      
      // Draw vignette border (edges of screen)
      const borderWidth = 20;
      // Top border
      this.ctx.fillRect(0, 0, this.canvas.width, borderWidth);
      // Bottom border
      this.ctx.fillRect(0, this.canvas.height - borderWidth, this.canvas.width, borderWidth);
      // Left border
      this.ctx.fillRect(0, 0, borderWidth, this.canvas.height);
      // Right border
      this.ctx.fillRect(this.canvas.width - borderWidth, 0, borderWidth, this.canvas.height);

      this.ctx.restore();
    }
  }

  showGameOver() {
    // Hide pause button
    const pauseButton = document.querySelector('.pause-button');
    if (pauseButton) {
      pauseButton.classList.remove('show');
    }

    // Update best score
    const wasNewRecord = this.scoreManager.updateBestScore();
    this.updateBestDisplay();

    // Get final stats
    const scoreData = this.scoreManager.getData();
    const finalWave = this.waveManager.getWave();
    const enemiesKilled = this.enemyManager.getKillCount();
    const coinsEarned = scoreData.currency - this.startingCurrency;

    // Update persistent rank
    this.scoreManager.updatePersistentRank(finalWave, enemiesKilled);

    // Update statistics
    this.statisticsManager.endGame(scoreData.score, finalWave, enemiesKilled, coinsEarned);

    // Update UI elements
    document.getElementById('finalScore').textContent = scoreData.score.toLocaleString();
    const bestScoreEl = document.getElementById('bestScoreDisplay');
    if (bestScoreEl) {
      bestScoreEl.innerHTML = scoreData.bestScore.toLocaleString();
      if (wasNewRecord) {
        const newRecordEl = document.getElementById('newRecord');
        if (newRecordEl) {
          newRecordEl.style.display = 'inline';
        } else {
          bestScoreEl.innerHTML += ' <span id="newRecord" class="new-record">⭐</span>';
        }
      }
    }
    document.getElementById('finalWave').textContent = finalWave;
    document.getElementById('finalKills').textContent = enemiesKilled;
    document.getElementById('coinsEarned').textContent = `+${Math.max(0, coinsEarned)}`;
    
    // Show game over screen
    if (screenManager) {
      screenManager.showOverlay('gameOverScreen');
    }
  }

  loop() {
    // Calculate FPS
    const now = performance.now();
    const delta = now - this.fpsLastTime;
    this.fpsLastTime = now;

    // Track frame times (last 60 frames)
    this.fpsFrames.push(delta);
    if (this.fpsFrames.length > 60) {
      this.fpsFrames.shift();
    }

    // Calculate average FPS
    if (this.fpsFrames.length > 0) {
      const avgDelta = this.fpsFrames.reduce((a, b) => a + b) / this.fpsFrames.length;
      this.fps = Math.round(1000 / avgDelta);
    }

    this.update();
    this.draw();

    // Phase 3: Continue loop during death animation, stop only after game over screen shows
    if (!this.controls.isPaused && (!this.gameOver || this.player.dying)) {
      requestAnimationFrame(() => this.loop());
    }
  }
}

// Global game instance
let Game;

// Screen management functions
function startGame() {
  if (screenManager) {
    screenManager.showScreen('GAMEPLAY');
  }
  // Show pause button
  const pauseButton = document.querySelector('.pause-button');
  if (pauseButton) {
    pauseButton.classList.add('show');
  }
  const canvas = document.getElementById('game');
  Game = new SpaceShooterGame(canvas);
  Game.reset();
}

function resumeGame() {
  if (!Game) return;
  Game.controls.togglePause();
  if (screenManager) {
    screenManager.hideOverlay('pauseScreen');
  }
}

function pauseToMainMenu() {
  if (screenManager) {
    screenManager.showScreen('MAIN_MENU');
  }
  // Hide pause button
  const pauseButton = document.querySelector('.pause-button');
  if (pauseButton) {
    pauseButton.classList.remove('show');
  }
  Game = null; // Clean up game instance
}

function returnToMainMenu() {
  if (screenManager) {
    screenManager.showScreen('MAIN_MENU');
  }
  // Hide pause button
  const pauseButton = document.querySelector('.pause-button');
  if (pauseButton) {
    pauseButton.classList.remove('show');
  }
  Game = null; // Clean up game instance
  if (typeof updateMenuCoins === 'function') {
    updateMenuCoins();
  }
}

function playAgain() {
  if (screenManager) {
    screenManager.showScreen('GAMEPLAY');
  }
  // Show pause button
  const pauseButton = document.querySelector('.pause-button');
  if (pauseButton) {
    pauseButton.classList.add('show');
  }
  if (!Game) {
    const canvas = document.getElementById('game');
    Game = new SpaceShooterGame(canvas);
  }
  Game.reset();
}

// Pause toggle function
function togglePause() {
  if (!Game) return;
  
  const wasPaused = Game.controls.isPaused;
  Game.controls.togglePause();
  
  if (screenManager) {
    if (Game.controls.isPaused && !wasPaused) {
      // Just paused - show pause screen
      updatePauseStats();
      screenManager.showOverlay('pauseScreen');
    } else if (!Game.controls.isPaused && wasPaused) {
      // Just unpaused - hide pause screen
      screenManager.hideOverlay('pauseScreen');
    }
  }
}

function updatePauseStats() {
  if (!Game) return;
  const scoreData = Game.scoreManager.getData();
  const boosts = Game.shopManager.getEquippedStatBoosts();
  const maxHealth = CONFIG.PLAYER.MAX_HEALTH + boosts.maxHealth;
  
  document.getElementById('pauseWave').textContent = Game.waveManager.getWave();
  document.getElementById('pauseScore').textContent = scoreData.score.toLocaleString();
  const pauseRankEl = document.getElementById('pauseRank');
  if (pauseRankEl) {
    pauseRankEl.textContent = scoreData.rank;
  }
  document.getElementById('pauseHealth').textContent = 
    `${Math.floor(Game.player.health)}/${maxHealth}`;
}

function openShopFromPause() {
  openShop();
}

function openInventoryFromPause() {
  openInventory();
}

function openShopFromGameOver() {
  openShop();
}

function openInventoryFromGameOver() {
  openInventory();
}

// Audio Control Functions
function updateSFXVolume(value) {
  const volume = value / 100;
  if (Game && Game.audioManager) {
    Game.audioManager.setSFXVolume(volume);
    localStorage.setItem('sfxVolume', value);
    document.getElementById('sfxVolumeValue').textContent = value + '%';
  }
}

function updateMusicVolume(value) {
  const volume = value / 100;
  if (Game && Game.audioManager) {
    Game.audioManager.setMusicVolume(volume);
    localStorage.setItem('musicVolume', value);
    document.getElementById('musicVolumeValue').textContent = value + '%';
  }
}

function toggleMute() {
  if (Game && Game.audioManager) {
    Game.audioManager.toggleMute();
    const isMuted = Game.audioManager.isMuted;
    localStorage.setItem('audioMuted', isMuted ? 'true' : 'false');

    const muteToggle = document.getElementById('muteToggle');
    if (isMuted) {
      muteToggle.textContent = '🔇 Sound Off';
      muteToggle.classList.add('muted');
    } else {
      muteToggle.textContent = '🔊 Sound On';
      muteToggle.classList.remove('muted');
    }
  }
}

function loadAudioSettings() {
  // Load SFX volume
  const sfxVolume = localStorage.getItem('sfxVolume') || '70';
  document.getElementById('sfxVolumeSlider').value = sfxVolume;
  document.getElementById('sfxVolumeValue').textContent = sfxVolume + '%';
  if (Game && Game.audioManager) {
    Game.audioManager.setSFXVolume(sfxVolume / 100);
  }

  // Load music volume
  const musicVolume = localStorage.getItem('musicVolume') || '50';
  document.getElementById('musicVolumeSlider').value = musicVolume;
  document.getElementById('musicVolumeValue').textContent = musicVolume + '%';
  if (Game && Game.audioManager) {
    Game.audioManager.setMusicVolume(musicVolume / 100);
  }

  // Load mute state
  const audioMuted = localStorage.getItem('audioMuted') === 'true';
  const muteToggle = document.getElementById('muteToggle');
  if (audioMuted) {
    if (Game && Game.audioManager) {
      Game.audioManager.setMute(true);
    }
    muteToggle.textContent = '🔇 Sound Off';
    muteToggle.classList.add('muted');
  }
}

// Graphics Quality Functions
function updateQuality(quality) {
  localStorage.setItem('graphicsQuality', quality);

  if (Game && Game.particleManager) {
    // Set particle quality multiplier
    switch(quality) {
      case 'low':
        Game.particleManager.qualityMultiplier = 0.3; // 30% particles
        break;
      case 'medium':
        Game.particleManager.qualityMultiplier = 0.7; // 70% particles
        break;
      case 'high':
        Game.particleManager.qualityMultiplier = 1.0; // 100% particles
        break;
    }
  }
}

function loadQualitySettings() {
  const quality = localStorage.getItem('graphicsQuality') || 'medium';
  document.getElementById('qualitySelect').value = quality;

  if (Game && Game.particleManager) {
    switch(quality) {
      case 'low':
        Game.particleManager.qualityMultiplier = 0.3;
        break;
      case 'medium':
        Game.particleManager.qualityMultiplier = 0.7;
        break;
      case 'high':
        Game.particleManager.qualityMultiplier = 1.0;
        break;
    }
  }
}
