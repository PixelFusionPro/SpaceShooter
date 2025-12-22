// Fortress Manager - Defensive structures that slow/block enemies

class FortressStructure {
  constructor(type, x, y, width, height) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    const config = CONFIG.FORTRESS[type.toUpperCase()];
    this.baseHealth = config.HEALTH;
    this.upgradeLevel = 0; // Track upgrade level
    this.maxHealth = this.baseHealth + (this.upgradeLevel * (config.UPGRADE_HEALTH_BONUS || 0));
    this.health = this.maxHealth;
    this.slowEffect = config.SLOW_EFFECT || 0;
    this.blockage = config.BLOCKAGE || 0;
    this.deteriorationRate = config.DETERIORATION_RATE || 0;
    this.damageResistance = config.DAMAGE_RESISTANCE || 0;
    this.upgradeCost = config.UPGRADE_COST || 100;
    this.upgradeHealthBonus = config.UPGRADE_HEALTH_BONUS || 50;

    // Tower shooting properties
    if (type === 'tower') {
      this.fireRate = config.FIRE_RATE || 800;
      this.baseDamage = config.DAMAGE || 1.0;
      this.damage = this.baseDamage; // Current damage (upgraded)
      this.range = config.RANGE || 200;
      this.upgradeDamageBonus = config.UPGRADE_DAMAGE_BONUS || 0.5;
      this.lastShotTime = 0;
      this.bulletPool = null; // Will be set by FortressManager
      this.enemyManager = null; // Will be set by FortressManager
    }

    this.active = true;
    this.lastDeteriorationTime = Date.now();
  }

  update() {
    if (!this.active) return;

    // Natural deterioration over time
    const now = Date.now();
    if (now - this.lastDeteriorationTime > 1000) {
      this.health -= this.deteriorationRate;
      this.lastDeteriorationTime = now;

      if (this.health <= 0) {
        this.health = 0;
        this.active = false;
      }
    }
    
    // Tower shooting logic
    if (this.type === 'tower' && this.bulletPool && this.enemyManager) {
      this.updateTowerShooting(now);
    }
  }
  
  // Update tower shooting
  updateTowerShooting(now) {
    if (now - this.lastShotTime < this.fireRate) return;

    // Find best target using priority targeting
    const towerCenterX = this.x + this.width / 2;
    const towerCenterY = this.y + this.height / 2;
    const target = this.findBestTarget(towerCenterX, towerCenterY);

    if (!target || target.dying) return;

    const dx = target.x - towerCenterX;
    const dy = target.y - towerCenterY;
    const dist = Math.hypot(dx, dy);

    if (dist > this.range) return;

    // Lead targeting for fast-moving enemies
    const bulletSpeed = CONFIG.BULLET.SPEED;
    const timeToImpact = dist / bulletSpeed;
    const leadX = target.x + (target.dx || 0) * timeToImpact;
    const leadY = target.y + (target.dy || 0) * timeToImpact;

    // Calculate angle to lead position
    const leadDx = leadX - towerCenterX;
    const leadDy = leadY - towerCenterY;
    const angle = Math.atan2(leadDy, leadDx);

    const bullet = this.bulletPool.get();

    if (bullet) {
      // Correct init signature: init(x, y, angle, ammoType, upgradeBoosts)
      bullet.init(towerCenterX, towerCenterY, angle, null, null);
      bullet.damage = this.damage; // Set tower damage after init
      bullet.color = '#ffaa00'; // Orange color for tower bullets
      bullet.trailColor = '#ff6600'; // Orange-red trail
      bullet.isPlayerBullet = true; // Mark as friendly bullet (prevents damaging player structures)
      bullet.towerShot = true; // Mark as tower bullet for tracking
      this.lastShotTime = now;
    }
  }

  // Find best target using priority system
  findBestTarget(x, y) {
    if (!this.enemyManager || !this.enemyManager.enemies) return null;

    const enemiesInRange = [];

    // Collect all enemies in range
    for (const enemy of this.enemyManager.enemies) {
      if (enemy.dying) continue;

      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const dist = Math.hypot(dx, dy);

      if (dist <= this.range) {
        enemiesInRange.push({ enemy, dist });
      }
    }

    if (enemiesInRange.length === 0) return null;

    // Priority targeting: Boss > Elite > Normal
    // Within same priority, target closest
    let bestTarget = null;
    let bestPriority = -1;
    let bestDist = Infinity;

    for (const { enemy, dist } of enemiesInRange) {
      let priority = 0;
      if (enemy.type === 'boss') priority = 3;
      else if (enemy.elite) priority = 2;
      else priority = 1;

      // Better target if higher priority, or same priority but closer
      if (priority > bestPriority || (priority === bestPriority && dist < bestDist)) {
        bestTarget = enemy;
        bestPriority = priority;
        bestDist = dist;
      }
    }

    return bestTarget;
  }

  takeDamage(amount) {
    const actualDamage = amount * (1 - this.damageResistance);
    const damageBlocked = amount - actualDamage;
    this.health -= actualDamage;

    if (this.health <= 0) {
      this.health = 0;
      this.active = false;
    }

    // Return both actual damage and blocked amount for tracking
    return { actualDamage, damageBlocked };
  }

  repair(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    if (this.health > 0) {
      this.active = true;
    }
  }

  // Upgrade structure - increases max health
  upgrade() {
    this.upgradeLevel++;
    const oldMaxHealth = this.maxHealth;
    this.maxHealth = this.baseHealth + (this.upgradeLevel * this.upgradeHealthBonus);
    // Increase current health proportionally
    const healthPercent = this.health / oldMaxHealth;
    this.health = this.maxHealth * healthPercent;
    if (this.health > 0) {
      this.active = true;
    }
  }

  // Get upgrade cost for next level
  getUpgradeCost() {
    // Cost increases with each level
    return Math.floor(this.upgradeCost * (1 + this.upgradeLevel * 0.5));
  }

  getHealthPercent() {
    return this.health / this.maxHealth;
  }

  draw(ctx) {
    if (!this.active && this.health <= 0) return;

    ctx.save();

    const healthPercent = this.getHealthPercent();
    const opacity = Math.max(0.3, healthPercent);

    // Draw structure based on type
    switch (this.type) {
      case 'fence':
        this.drawFence(ctx, healthPercent, opacity);
        break;
      case 'wall':
        this.drawWall(ctx, healthPercent, opacity);
        break;
      case 'barricade':
        this.drawBarricade(ctx, healthPercent, opacity);
        break;
      case 'tower':
        this.drawTower(ctx, healthPercent, opacity);
        break;
      case 'gate':
        this.drawGate(ctx, healthPercent, opacity);
        break;
    }

    // Health bar
    this.drawHealthBar(ctx);

    ctx.restore();
  }

  drawFence(ctx, healthPercent, opacity) {
    ctx.globalAlpha = opacity;

    // Fence posts
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;

    const postCount = Math.ceil(this.width / 20);
    for (let i = 0; i <= postCount; i++) {
      const postX = this.x + (i * this.width / postCount);
      ctx.fillRect(postX - 2, this.y, 4, this.height);
    }

    // Horizontal bars
    ctx.strokeStyle = '#A0522D';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const barY = this.y + (i + 1) * (this.height / 4);
      ctx.beginPath();
      ctx.moveTo(this.x, barY);
      ctx.lineTo(this.x + this.width, barY);
      ctx.stroke();
    }

    // Damage cracks
    if (healthPercent < 0.5) {
      ctx.strokeStyle = `rgba(0, 0, 0, ${1 - healthPercent})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < (1 - healthPercent) * 5; i++) {
        ctx.beginPath();
        ctx.moveTo(this.x + Math.random() * this.width, this.y + Math.random() * this.height);
        ctx.lineTo(this.x + Math.random() * this.width, this.y + Math.random() * this.height);
        ctx.stroke();
      }
    }
  }

  drawWall(ctx, healthPercent, opacity) {
    ctx.globalAlpha = opacity;

    // Stone wall
    ctx.fillStyle = '#808080';
    ctx.strokeStyle = '#505050';
    ctx.lineWidth = 2;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Stone blocks pattern
    ctx.strokeStyle = '#606060';
    ctx.lineWidth = 1;
    for (let row = 0; row < this.height / 10; row++) {
      for (let col = 0; col < this.width / 20; col++) {
        const offset = row % 2 === 0 ? 0 : 10;
        ctx.strokeRect(
          this.x + col * 20 + offset,
          this.y + row * 10,
          20,
          10
        );
      }
    }

    // Heavy damage
    if (healthPercent < 0.3) {
      ctx.fillStyle = `rgba(0, 0, 0, ${0.5 - healthPercent})`;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  drawBarricade(ctx, healthPercent, opacity) {
    ctx.globalAlpha = opacity;

    // Wooden planks
    ctx.fillStyle = '#D2691E';
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;

    const plankCount = 5;
    for (let i = 0; i < plankCount; i++) {
      const plankY = this.y + (i * this.height / plankCount);
      const plankHeight = this.height / plankCount - 2;

      ctx.save();
      ctx.translate(this.x + this.width / 2, plankY + plankHeight / 2);
      ctx.rotate((Math.random() - 0.5) * 0.1 * (1 - healthPercent));
      ctx.fillRect(-this.width / 2, -plankHeight / 2, this.width, plankHeight);
      ctx.strokeRect(-this.width / 2, -plankHeight / 2, this.width, plankHeight);
      ctx.restore();
    }

    // Nails
    ctx.fillStyle = '#555';
    for (let i = 0; i < plankCount * 2; i++) {
      ctx.fillRect(
        this.x + Math.random() * this.width,
        this.y + Math.random() * this.height,
        2,
        2
      );
    }
  }

  drawTower(ctx, healthPercent, opacity) {
    ctx.globalAlpha = opacity;

    // Tower base
    ctx.fillStyle = '#696969';
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 2;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Tower top
    ctx.fillStyle = '#556B2F';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width / 2, this.y - 10);
    ctx.lineTo(this.x + this.width, this.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Windows
    ctx.fillStyle = '#000';
    const windowCount = Math.floor(this.height / 15);
    for (let i = 0; i < windowCount; i++) {
      ctx.fillRect(
        this.x + this.width / 2 - 3,
        this.y + 10 + i * 15,
        6,
        8
      );
    }
  }

  drawGate(ctx, healthPercent, opacity) {
    ctx.globalAlpha = opacity;

    // Gate frame
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Gate door (metal)
    ctx.fillStyle = '#555';
    ctx.fillRect(this.x + 3, this.y + 3, this.width - 6, this.height - 6);

    // Rivets
    ctx.fillStyle = '#888';
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        ctx.beginPath();
        ctx.arc(
          this.x + 10 + col * (this.width - 20) / 2,
          this.y + 10 + row * (this.height - 20) / 3,
          2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    // Opening percentage based on health (gates open when damaged)
    if (healthPercent < 0.7) {
      const openAmount = (0.7 - healthPercent) / 0.7;
      ctx.clearRect(
        this.x + 3,
        this.y + this.height * (1 - openAmount),
        this.width - 6,
        this.height * openAmount
      );
    }
  }

  drawHealthBar(ctx) {
    const barWidth = this.width;
    const barHeight = 3;
    const healthPercent = this.getHealthPercent();

    // Background
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(this.x, this.y - 8, barWidth, barHeight);

    // Health
    let healthColor = '#00ff00';
    if (healthPercent < 0.5) healthColor = '#ffff00';
    if (healthPercent < 0.25) healthColor = '#ff0000';

    ctx.fillStyle = healthColor;
    ctx.fillRect(this.x, this.y - 8, barWidth * healthPercent, barHeight);
  }

  // Check if a enemy collides with this structure
  checkEnemyCollision(enemy) {
    if (!this.active) return false;

    return enemy.x + enemy.size > this.x &&
           enemy.x - enemy.size < this.x + this.width &&
           enemy.y + enemy.size > this.y &&
           enemy.y - enemy.size < this.y + this.height;
  }

  // Check if a bullet collides with this structure
  checkBulletCollision(bullet) {
    if (!this.active) return false;

    return bullet.x + bullet.size > this.x &&
           bullet.x - bullet.size < this.x + this.width &&
           bullet.y + bullet.size > this.y &&
           bullet.y - bullet.size < this.y + this.height;
  }

  // Check if player can pass through (only gates allow passage)
  allowsPlayerPassage() {
    return this.type === 'gate';
  }
}

class FortressManager {
  constructor(canvas, achievementManager = null) {
    this.canvas = canvas;
    this.structures = [];
    this.placementMode = false;
    this.placementType = null;
    this.achievementManager = achievementManager;

    // Track enemies that have passed through fences (enemy object -> Set of structure indices)
    this.enemiesPassedThrough = new WeakMap();

    // Track enemies that are blocked from fences (enemy object -> Set of structure indices)
    this.enemiesBlockedFrom = new WeakMap();

    // References for tower shooting
    this.bulletPool = null;
    this.enemyManager = null;

    // Load saved upgrade levels from localStorage
    this.loadUpgradeLevels();
  }
  
  // Set references for tower shooting
  setReferences(bulletPool, enemyManager) {
    this.bulletPool = bulletPool;
    this.enemyManager = enemyManager;
    // Update all existing towers
    for (const structure of this.structures) {
      if (structure.type === 'tower') {
        structure.bulletPool = bulletPool;
        structure.enemyManager = enemyManager;
      }
    }
  }
  
  // Load upgrade levels from localStorage
  loadUpgradeLevels() {
    const saved = localStorage.getItem('fortressUpgradeLevels');
    if (saved) {
      this.upgradeLevels = JSON.parse(saved);
    } else {
      this.upgradeLevels = {}; // Structure type -> upgrade level
    }
  }
  
  // Save upgrade levels to localStorage
  saveUpgradeLevels() {
    localStorage.setItem('fortressUpgradeLevels', JSON.stringify(this.upgradeLevels));
  }
  
  // Get upgrade level for a structure type
  getUpgradeLevel(type) {
    return this.upgradeLevels[type.toLowerCase()] || 0;
  }
  
  // Set upgrade level for a structure type (and save)
  setUpgradeLevel(type, level) {
    this.upgradeLevels[type.toLowerCase()] = level;
    this.saveUpgradeLevels();
    // Update all existing structures of this type
    this.updateStructuresOfType(type, level);
  }
  
  // Update all structures of a given type with new upgrade level
  updateStructuresOfType(type, level) {
    const typeLower = type.toLowerCase();
    for (const structure of this.structures) {
      if (structure.type.toLowerCase() === typeLower) {
        // Recalculate max health based on new upgrade level
        const oldMaxHealth = structure.maxHealth;
        structure.upgradeLevel = level;
        structure.maxHealth = structure.baseHealth + (level * structure.upgradeHealthBonus);
        // Maintain health percentage
        const healthPercent = structure.health / oldMaxHealth;
        structure.health = structure.maxHealth * healthPercent;
        if (structure.health > 0) {
          structure.active = true;
        }
        
        // Update tower damage
        if (typeLower === 'tower' && structure.baseDamage !== undefined) {
          structure.damage = structure.baseDamage + (level * structure.upgradeDamageBonus);
        }
      }
    }
  }

  // Add a structure to the fortress
  addStructure(type, x, y, width, height) {
    const structure = new FortressStructure(type, x, y, width, height);

    // Set tower references if available
    if (type === 'tower') {
      structure.bulletPool = this.bulletPool;
      structure.enemyManager = this.enemyManager;
    }

    // Apply saved upgrade level if it exists
    const savedLevel = this.getUpgradeLevel(type);
    if (savedLevel > 0) {
      structure.upgradeLevel = savedLevel;
      structure.maxHealth = structure.baseHealth + (savedLevel * structure.upgradeHealthBonus);
      structure.health = structure.maxHealth; // Start at full health

      // Apply damage upgrade for towers
      if (type === 'tower') {
        structure.damage = structure.baseDamage + (savedLevel * structure.upgradeDamageBonus);
      }
    }

    this.structures.push(structure);

    // Track structure built for achievements
    if (this.achievementManager) {
      this.achievementManager.trackStructureBuilt();
    }

    return structure;
  }

  // Update all structures
  update() {
    for (let i = this.structures.length - 1; i >= 0; i--) {
      const structure = this.structures[i];
      structure.update();

      // Remove completely destroyed structures
      if (!structure.active && structure.health <= 0) {
        // Keep for a bit to show destroyed state
        // Could add removal after time or on wave end
      }
    }
  }

  // Handle enemy-structure collisions
  handleEnemyCollisions(enemies) {
    for (const enemy of enemies) {
      if (enemy.dying) continue;

      // Store original speed if not already stored
      if (enemy.baseSpeed === undefined) {
        enemy.baseSpeed = enemy.speed;
      }

      // Reset speed to base at start of collision check
      enemy.speed = enemy.baseSpeed;

      // Get or create the sets for this enemy
      let passedStructures = this.enemiesPassedThrough.get(enemy);
      if (!passedStructures) {
        passedStructures = new Set();
        this.enemiesPassedThrough.set(enemy, passedStructures);
      }

      let blockedStructures = this.enemiesBlockedFrom.get(enemy);
      if (!blockedStructures) {
        blockedStructures = new Set();
        this.enemiesBlockedFrom.set(enemy, blockedStructures);
      }

      let isColliding = false;
      for (let i = 0; i < this.structures.length; i++) {
        const structure = this.structures[i];
        if (!structure.active) continue;

        if (structure.checkEnemyCollision(enemy)) {
          isColliding = true;

          // Check if this enemy has already been determined for this fence
          const hasPassedThrough = passedStructures.has(i);
          const isBlockedFrom = blockedStructures.has(i);
          
          // Fences: 1 in 20 (5%) chance enemy can pass through (skip slow and block)
          // Other structures: always block
          const isFence = structure.type === 'fence';
          let canPassThrough = false;
          
          if (isFence) {
            if (hasPassedThrough) {
              // Already determined - this enemy can pass through, allow to continue
              canPassThrough = true;
            } else if (isBlockedFrom) {
              // Already determined - this enemy is blocked from this fence
              canPassThrough = false;
            } else {
              // First time hitting this fence - make ONE determination
              // 5% chance to pass through, 95% chance to be blocked forever
              const roll = Math.random();
              canPassThrough = roll < 0.05;
              
              // Mark this enemy's determination for this fence
              if (canPassThrough) {
                passedStructures.add(i);
              } else {
                blockedStructures.add(i);
              }
            }
          }
          
          if (!canPassThrough) {
            // Slow enemy (apply slow effect once per frame)
            if (structure.slowEffect > 0) {
              enemy.speed = enemy.baseSpeed * (1 - structure.slowEffect);
            }

            // Block enemy (strong push back to prevent passing through)
            if (structure.blockage > 0) {
              const pushBackStrength = structure.blockage * 2; // Increased blocking strength
              const dx = enemy.x - (structure.x + structure.width / 2);
              const dy = enemy.y - (structure.y + structure.height / 2);
              const dist = Math.hypot(dx, dy);

              if (dist > 0) {
                // Push enemy away from structure center
                enemy.x += (dx / dist) * pushBackStrength;
                enemy.y += (dy / dist) * pushBackStrength;

                // Additional push to ensure enemy is outside structure bounds
                if (enemy.x + enemy.size > structure.x && enemy.x - enemy.size < structure.x + structure.width &&
                    enemy.y + enemy.size > structure.y && enemy.y - enemy.size < structure.y + structure.height) {
                  // Enemy is still inside, push to nearest edge
                  const distToLeft = enemy.x - structure.x;
                  const distToRight = (structure.x + structure.width) - enemy.x;
                  const distToTop = enemy.y - structure.y;
                  const distToBottom = (structure.y + structure.height) - enemy.y;
                  
                  const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
                  
                  if (minDist === distToLeft) {
                    enemy.x = structure.x - enemy.size - 1;
                  } else if (minDist === distToRight) {
                    enemy.x = structure.x + structure.width + enemy.size + 1;
                  } else if (minDist === distToTop) {
                    enemy.y = structure.y - enemy.size - 1;
                  } else {
                    enemy.y = structure.y + structure.height + enemy.size + 1;
                  }
                }
              }
            }
          } else {
            // Enemy is passing through fence - allow it to move through
            // Check if enemy has moved past the fence bounds
            const isPastFence = 
              enemy.x + enemy.size < structure.x || 
              enemy.x - enemy.size > structure.x + structure.width ||
              enemy.y + enemy.size < structure.y || 
              enemy.y - enemy.size > structure.y + structure.height;
            
            if (isPastFence) {
              // Enemy has passed through, remove from tracking
              passedStructures.delete(i);
            }
          }
          // If canPassThrough is true (fence only), enemy passes through without being slowed or blocked

          // Damage structure from enemy contact (even if enemy passes through)
          const damageResult = structure.takeDamage(CONFIG.ENEMIES.DAMAGE_PER_FRAME * 0.5);

          // Track damage blocked for achievements
          if (this.achievementManager && damageResult.damageBlocked > 0) {
            this.achievementManager.trackDamageBlocked(damageResult.damageBlocked);
          }
        } else {
          // Enemy is not colliding with this structure, remove from tracking if it was
          // (but keep blocked status - once blocked, always blocked for this fence)
          if (passedStructures.has(i)) {
            passedStructures.delete(i);
          }
          // Don't remove from blockedStructures - once blocked, always blocked
        }
      }
    }
  }

  // Handle bullet-structure collisions
  handleBulletCollisions(bulletPool) {
    for (const bullet of bulletPool.getInUse()) {
      if (!bullet.active) continue;

      // Friendly bullets (player, companion, tower) pass through structures
      // Only enemy bullets (if any) would collide with structures
      if (bullet.isPlayerBullet) {
        continue; // Skip collision check for friendly bullets
      }

      for (const structure of this.structures) {
        if (!structure.active) continue;

        if (structure.checkBulletCollision(bullet)) {
          // Companion bullet hits structure - deactivate it
          bullet.active = false;
          bulletPool.release(bullet);
          
          // Structure takes damage from bullet
          structure.takeDamage(bullet.damage);
          break; // Bullet can only hit one structure
        }
      }
    }
  }

  // Draw all structures
  draw(ctx) {
    for (const structure of this.structures) {
      structure.draw(ctx);
    }
  }

  // Get active structure count
  getActiveCount() {
    return this.structures.filter(s => s.active).length;
  }

  // Get total structure count
  getTotalCount() {
    return this.structures.length;
  }

  // Repair all structures
  repairAll(amount) {
    for (const structure of this.structures) {
      structure.repair(amount);
    }
  }

  // Fully restore all structures to max health (after wave completion)
  restoreAll() {
    for (const structure of this.structures) {
      structure.health = structure.maxHealth;
      structure.active = true; // Reactivate destroyed structures
    }
  }

  // Upgrade a specific structure (or all structures of that type)
  upgradeStructure(index) {
    if (index < 0 || index >= this.structures.length) {
      return { success: false, message: 'Invalid structure' };
    }
    
    const structure = this.structures[index];
    const cost = structure.getUpgradeCost();
    const type = structure.type;
    
    return { success: true, structure: structure, cost: cost, type: type };
  }
  
  // Upgrade all structures of a given type
  upgradeStructureType(type) {
    const currentLevel = this.getUpgradeLevel(type);
    const config = CONFIG.FORTRESS[type.toUpperCase()];
    if (!config) {
      return { success: false, message: 'Invalid structure type' };
    }
    
    const baseCost = config.UPGRADE_COST || 100;
    const cost = Math.floor(baseCost * (1 + currentLevel * 0.5));
    
    return { success: true, type: type, cost: cost, currentLevel: currentLevel };
  }

  // Get structure at position (for clicking to upgrade)
  getStructureAt(x, y) {
    for (let i = 0; i < this.structures.length; i++) {
      const structure = this.structures[i];
      if (x >= structure.x && x <= structure.x + structure.width &&
          y >= structure.y && y <= structure.y + structure.height) {
        return { index: i, structure: structure };
      }
    }
    return null;
  }

  // Clear all structures
  clear() {
    this.structures = [];
  }

  // Reset for new game
  reset() {
    // Clear structures but keep upgrade levels (they persist across games)
    this.structures = [];
    this.placementMode = false;
    this.placementType = null;
    // Note: WeakMap automatically cleans up when enemies are garbage collected
    // Note: upgradeLevels are NOT reset - they persist across games
  }
}
