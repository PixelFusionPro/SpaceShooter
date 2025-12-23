// Companion Manager - AI Companions System

class Companion {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;

    const config = CONFIG.COMPANIONS[type.toUpperCase()];
    this.size = config.SIZE;
    this.speed = config.SPEED;
    this.damage = config.DAMAGE;
    this.maxHealth = config.HEALTH;
    this.health = config.HEALTH;
    this.fireRate = config.FIRE_RATE;

    // Type-specific properties
    this.orbitRadius = config.ORBIT_RADIUS || 0;
    this.orbitSpeed = config.ORBIT_SPEED || 0;
    this.followDistance = config.FOLLOW_DISTANCE || 0;
    this.healRate = config.HEAL_RATE || 0;
    this.healInterval = config.HEAL_INTERVAL || 0;
    this.tauntRadius = config.TAUNT_RADIUS || 0;
    this.range = config.RANGE || 200;

    // State
    this.lastShotTime = 0;
    this.lastHealTime = 0;
    this.orbitAngle = Math.random() * Math.PI * 2;
    this.targetX = x;
    this.targetY = y;
    this.active = true;
    this.dying = false;
    this.deathProgress = 0;

    // Animation
    this.animationTime = 0;
  }

  update(playerX, playerY, enemyManager, player, boosts = {}) {
    if (this.dying) {
      this.deathProgress += 0.05;
      return this.deathProgress >= 1;
    }

    this.animationTime += 0.1;

    // Type-specific behavior
    switch (this.type) {
      case 'drone':
        this.updateDrone(playerX, playerY);
        break;
      case 'robot':
        this.updateRobot(playerX, playerY);
        break;
      case 'turret':
        // Turrets don't move
        break;
      case 'medic':
        this.updateMedic(playerX, playerY, player, boosts);
        break;
      case 'tank':
        this.updateTank(playerX, playerY);
        break;
    }

    // Auto-shoot at priority target (prioritizes elite/boss enemies)
    const target = enemyManager.findPriorityTarget(this.x, this.y, this.range);
    if (target && !target.dying) {
      const dist = Math.hypot(target.x - this.x, target.y - this.y);
      if (dist < this.range) {
        // Pass bulletPool from companion's reference (set by CompanionManager)
        this.shoot(target, enemyManager, this.bulletPool);
      }
    }

    return false; // Not finished
  }

  updateDrone(playerX, playerY) {
    // Orbit around player
    this.orbitAngle += this.orbitSpeed;
    this.x = playerX + Math.cos(this.orbitAngle) * this.orbitRadius;
    this.y = playerY + Math.sin(this.orbitAngle) * this.orbitRadius;
  }

  updateRobot(playerX, playerY) {
    // Follow player at distance
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this.followDistance) {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }
  }

  updateMedic(playerX, playerY, player, boosts) {
    // Follow player closely
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this.followDistance) {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }

    // Heal player periodically
    const now = Date.now();
    if (now - this.lastHealTime > this.healInterval) {
      const maxHealth = CONFIG.PLAYER.MAX_HEALTH + (boosts.maxHealth || 0);
      if (player.health < maxHealth) {
        player.health = Math.min(maxHealth, player.health + this.healRate);
        this.lastHealTime = now;
      }
    }
  }

  updateTank(playerX, playerY) {
    // Follow player at close distance
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this.followDistance) {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }
  }

  shoot(target, enemyManager, bulletPool = null) {
    const now = Date.now();
    if (now - this.lastShotTime < this.fireRate) return;

    // Calculate angle to target
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const angle = Math.atan2(dy, dx);

    // Create visual bullet if bullet pool is available
    if (bulletPool) {
      const bullet = bulletPool.get();
      if (bullet) {
        // Companions use default ammo (no special ammo types)
        bullet.init(this.x, this.y, angle, null, null);
        // Set companion bullet damage (override default damage)
        bullet.damage = this.damage;
        // Make companion bullets visually distinct (orange/red color)
        bullet.color = '#ff6b35'; // Orange color for companion bullets
        bullet.trailColor = '#d45028'; // Orange-red trail
        bullet.size = CONFIG.BULLET.SIZE * 0.8; // Slightly smaller
        bullet.isPlayerBullet = true; // Mark as friendly bullet (will hit enemies)
      }
    } else {
      // Fallback: Direct damage if no bullet pool (for backwards compatibility)
      target.health -= this.damage;

      if (target.health <= 0) {
        const hitAngle = Math.atan2(target.y - this.y, target.x - this.x);
        enemyManager.killEnemy(
          enemyManager.enemies.indexOf(target),
          hitAngle,
          null
        );
      }
    }

    this.lastShotTime = now;
  }

  draw(ctx) {
    if (this.dying) {
      this.drawDeath(ctx);
      return;
    }

    this.drawAlive(ctx);
  }

  // Draw companion when alive (separated to avoid recursion)
  drawAlive(ctx) {
    ctx.save();

    // Draw companion based on type
    switch (this.type) {
      case 'drone':
        this.drawDrone(ctx);
        break;
      case 'robot':
        this.drawRobot(ctx);
        break;
      case 'turret':
        this.drawTurret(ctx);
        break;
      case 'medic':
        this.drawMedic(ctx);
        break;
      case 'tank':
        this.drawTank(ctx);
        break;
    }

    // Health bar
    this.drawHealthBar(ctx);

    ctx.restore();
  }

  drawDrone(ctx) {
    const pulse = Math.sin(this.animationTime) * 0.2 + 1;

    // Body (triangular drone)
    ctx.fillStyle = '#00d4ff';
    ctx.strokeStyle = '#0080ff';
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const angle = (Math.PI * 2 / 3) * i + this.animationTime;
      const x = this.x + Math.cos(angle) * this.size * pulse;
      const y = this.y + Math.sin(angle) * this.size * pulse;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawRobot(ctx) {
    // Body
    ctx.fillStyle = '#ff6b35';
    ctx.strokeStyle = '#d45028';
    ctx.lineWidth = 1;
    ctx.fillRect(this.x - this.size * 0.6, this.y - this.size * 0.6, this.size * 1.2, this.size * 1.2);
    ctx.strokeRect(this.x - this.size * 0.6, this.y - this.size * 0.6, this.size * 1.2, this.size * 1.2);

    // Eye
    const eyeGlow = Math.sin(this.animationTime * 2) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlow})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.size * 0.2, this.size * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Antenna
    ctx.strokeStyle = '#ff6b35';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.size * 0.6);
    ctx.lineTo(this.x, this.y - this.size);
    ctx.stroke();

    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.size, this.size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawTurret(ctx) {
    // Base
    ctx.fillStyle = '#4a4a4a';
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 2;
    ctx.fillRect(this.x - this.size, this.y + this.size * 0.3, this.size * 2, this.size * 0.7);
    ctx.strokeRect(this.x - this.size, this.y + this.size * 0.3, this.size * 2, this.size * 0.7);

    // Turret body
    ctx.fillStyle = '#6a6a6a';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Barrel
    const barrelRotation = Math.sin(this.animationTime * 0.5);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(
      this.x + this.size * 0.7,
      this.y - this.size * 0.2,
      this.size * 0.8,
      this.size * 0.4
    );
    ctx.strokeRect(
      this.x + this.size * 0.7,
      this.y - this.size * 0.2,
      this.size * 0.8,
      this.size * 0.4
    );

    // Muzzle flash when shooting
    if (Date.now() - this.lastShotTime < 100) {
      ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(this.x + this.size * 1.5, this.y, this.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawMedic(ctx) {
    // Body (circle with cross)
    ctx.fillStyle = '#00ff88';
    ctx.strokeStyle = '#00cc66';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Medical cross
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.x - this.size * 0.5, this.y - this.size * 0.15, this.size, this.size * 0.3);
    ctx.fillRect(this.x - this.size * 0.15, this.y - this.size * 0.5, this.size * 0.3, this.size);

    // Healing pulse effect
    if (Date.now() - this.lastHealTime < 500) {
      const pulseAlpha = 1 - (Date.now() - this.lastHealTime) / 500;
      ctx.strokeStyle = `rgba(0, 255, 136, ${pulseAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  drawTank(ctx) {
    // Tank body (large square)
    ctx.fillStyle = '#8b4513';
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.fillRect(this.x - this.size * 0.8, this.y - this.size * 0.6, this.size * 1.6, this.size * 1.2);
    ctx.strokeRect(this.x - this.size * 0.8, this.y - this.size * 0.6, this.size * 1.6, this.size * 1.2);

    // Armor plating
    ctx.strokeStyle = '#a0522d';
    for (let i = 0; i < 3; i++) {
      const yOffset = -this.size * 0.4 + i * this.size * 0.4;
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * 0.6, this.y + yOffset);
      ctx.lineTo(this.x + this.size * 0.6, this.y + yOffset);
      ctx.stroke();
    }

    // Shield icon
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.size * 0.4);
    ctx.lineTo(this.x - this.size * 0.3, this.y);
    ctx.lineTo(this.x - this.size * 0.3, this.y + this.size * 0.4);
    ctx.lineTo(this.x, this.y + this.size * 0.6);
    ctx.lineTo(this.x + this.size * 0.3, this.y + this.size * 0.4);
    ctx.lineTo(this.x + this.size * 0.3, this.y);
    ctx.closePath();
    ctx.fill();
  }

  drawHealthBar(ctx) {
    const barWidth = this.size * 2;
    const barHeight = 3;
    const healthPercent = this.health / this.maxHealth;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 8, barWidth, barHeight);

    // Health
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 8, barWidth * healthPercent, barHeight);
  }

  drawDeath(ctx) {
    ctx.save();
    ctx.globalAlpha = 1 - this.deathProgress;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.deathProgress * Math.PI * 2);
    ctx.scale(1 - this.deathProgress, 1 - this.deathProgress);
    ctx.translate(-this.x, -this.y);

    // Draw fading version - call drawAlive() directly to avoid recursion
    this.drawAlive(ctx);

    ctx.restore();
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.dying = true;
    }
  }
}

class CompanionManager {
  constructor(canvas, bulletPool = null) {
    this.canvas = canvas;
    this.bulletPool = bulletPool;
    this.companions = [];
    this.unlockedTypes = new Set();
    this.upgradeLevels = {}; // Companion type -> upgrade level

    // Load unlocked companions from localStorage
    const saved = localStorage.getItem('unlockedCompanions');
    if (saved) {
      this.unlockedTypes = new Set(JSON.parse(saved));
    }
    
    // Load upgrade levels from localStorage
    this.loadUpgradeLevels();
  }

  // Spawn a companion at position
  spawn(type, x, y) {
    if (!this.isUnlocked(type)) {
      console.warn(`Companion type ${type} is not unlocked yet`);
      return null;
    }

    const companion = new Companion(type, x, y);
    
    // Apply upgrade level to newly spawned companion
    const upgradeLevel = this.getUpgradeLevel(type);
    if (upgradeLevel > 0) {
      const config = CONFIG.COMPANIONS[type.toUpperCase()];
      const damageBonus = upgradeLevel * 0.1; // 10% damage per level
      const healthBonus = upgradeLevel * (config.HEALTH * 0.1); // 10% health per level
      const fireRateBonus = upgradeLevel * 0.05; // 5% faster fire rate per level
      
      companion.upgradeLevel = upgradeLevel;
      companion.damage = config.DAMAGE * (1 + damageBonus);
      companion.maxHealth = Math.floor(config.HEALTH + healthBonus);
      companion.health = companion.maxHealth;
      companion.fireRate = Math.max(100, Math.floor(config.FIRE_RATE * (1 - fireRateBonus))); // Min 100ms fire rate
    }
    
    this.companions.push(companion);
    return companion;
  }

  // Check if companion type is unlocked
  isUnlocked(type) {
    return this.unlockedTypes.has(type.toLowerCase());
  }

  // Unlock a companion type
  unlock(type) {
    this.unlockedTypes.add(type.toLowerCase());
    localStorage.setItem('unlockedCompanions', JSON.stringify([...this.unlockedTypes]));
  }

  // Check wave milestones and unlock companions
  checkUnlocks(wave) {
    const unlocks = [];

    for (const [type, config] of Object.entries(CONFIG.COMPANIONS)) {
      const typeLower = type.toLowerCase();
      if (wave >= config.UNLOCK_WAVE && !this.isUnlocked(typeLower)) {
        this.unlock(typeLower);
        unlocks.push(typeLower);
      }
    }

    return unlocks;
  }

  // Update all companions
  update(playerX, playerY, enemyManager, player, boosts) {
    for (let i = this.companions.length - 1; i >= 0; i--) {
      const companion = this.companions[i];
      // Pass bulletPool to companion so it can create bullets
      companion.bulletPool = this.bulletPool;
      const finished = companion.update(playerX, playerY, enemyManager, player, boosts);

      if (finished) {
        this.companions.splice(i, 1);
      }
    }
  }

  // Handle companion damage from enemies
  checkEnemyCollisions(enemies) {
    for (const companion of this.companions) {
      if (companion.dying) continue;

      for (const enemy of enemies) {
        if (enemy.dying) continue;

        const dist = Math.hypot(companion.x - enemy.x, companion.y - enemy.y);
        if (dist < companion.size + enemy.size) {
          companion.takeDamage(CONFIG.ENEMIES.DAMAGE_PER_FRAME * 2); // Companions take 2x damage
        }
      }
    }
  }

  // Draw all companions
  draw(ctx) {
    for (const companion of this.companions) {
      companion.draw(ctx);
    }
  }

  // Get active companion count
  getActiveCount() {
    return this.companions.filter(c => !c.dying).length;
  }

  // Restore all companions to full health (after wave completion)
  restoreAll() {
    for (const companion of this.companions) {
      if (companion.dying) {
        // Revive dying companions
        companion.dying = false;
        companion.deathProgress = 0;
      }
      companion.health = companion.maxHealth;
    }
  }

  // Remove all companions
  clear() {
    this.companions = [];
  }

  // Reset for new game
  reset() {
    this.companions = [];
  }
  
  // Load upgrade levels from localStorage
  loadUpgradeLevels() {
    const saved = localStorage.getItem('companionUpgradeLevels');
    if (saved) {
      this.upgradeLevels = JSON.parse(saved);
    } else {
      this.upgradeLevels = {}; // Companion type -> upgrade level
    }
  }
  
  // Save upgrade levels to localStorage
  saveUpgradeLevels() {
    localStorage.setItem('companionUpgradeLevels', JSON.stringify(this.upgradeLevels));
  }
  
  // Get upgrade level for a companion type
  getUpgradeLevel(type) {
    return this.upgradeLevels[type.toLowerCase()] || 0;
  }
  
  // Set upgrade level for a companion type (and save)
  setUpgradeLevel(type, level) {
    this.upgradeLevels[type.toLowerCase()] = level;
    this.saveUpgradeLevels();
    // Update all existing companions of this type
    this.updateCompanionsOfType(type, level);
  }
  
  // Update all companions of a given type with new upgrade level
  updateCompanionsOfType(type, level) {
    const typeLower = type.toLowerCase();
    const config = CONFIG.COMPANIONS[type.toUpperCase()];
    if (!config) return;
    
    for (const companion of this.companions) {
      if (companion.type.toLowerCase() === typeLower) {
        companion.upgradeLevel = level;
        // Apply upgrade bonuses (damage, health, fire rate improvements)
        const damageBonus = level * 0.1; // 10% damage per level
        const healthBonus = level * (config.HEALTH * 0.1); // 10% health per level
        const fireRateBonus = level * 0.05; // 5% faster fire rate per level
        
        companion.damage = config.DAMAGE * (1 + damageBonus);
        companion.maxHealth = config.HEALTH + healthBonus;
        companion.health = Math.min(companion.health, companion.maxHealth);
        companion.fireRate = config.FIRE_RATE * (1 - fireRateBonus);
      }
    }
  }
  
  // Upgrade a companion type (check affordability and return result)
  upgradeCompanionType(type) {
    const typeLower = type.toLowerCase();
    const config = CONFIG.COMPANIONS[type.toUpperCase()];
    
    if (!config) {
      return { success: false, message: 'Invalid companion type' };
    }
    
    if (!this.isUnlocked(typeLower)) {
      return { success: false, message: 'Companion not unlocked yet' };
    }
    
    const currentLevel = this.getUpgradeLevel(typeLower);
    const baseCost = config.UPGRADE_COST || 500;
    const upgradeCost = Math.floor(baseCost * (1 + currentLevel * 0.5));
    
    return {
      success: true,
      cost: upgradeCost,
      type: typeLower,
      newLevel: currentLevel + 1
    };
  }
}
