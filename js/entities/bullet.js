// Bullet Entity Class

class Bullet {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.size = CONFIG.BULLET.SIZE;
    this.active = false;
    // Ammo properties
    this.ammoType = null;
    this.damage = 1; // Base damage + ammo bonus
    this.color = '#00ffff'; // Default cyan laser
    this.trailColor = '#0088ff';
    this.pierceCount = 0; // How many enemies it can pierce
    this.piercedEnemies = []; // Track pierced enemies
    this.explosiveRadius = 0; // AOE radius
    this.effectType = null; // Special effect type
    this.effectValue = 0; // Effect strength
    this.critical = false; // Critical hit flag
    this.isPlayerBullet = true; // True for player bullets, false for companion bullets
  }

  init(x, y, angle, ammoType = null, upgradeBoosts = null) {
    this.x = x;
    this.y = y;
    this.dx = Math.cos(angle) * CONFIG.BULLET.SPEED;
    this.dy = Math.sin(angle) * CONFIG.BULLET.SPEED;
    this.active = true;
    this.piercedEnemies = []; // Reset pierced enemies

    // Apply ammo properties
    if (ammoType) {
      this.ammoType = ammoType;
      this.damage = 1 + (ammoType.damageBonus || 0);
      this.color = ammoType.color || 'yellow';
      this.trailColor = ammoType.trailColor || 'orange';
      this.size = CONFIG.BULLET.SIZE * (ammoType.size || 1);

      // Handle special effects
      if (ammoType.effect && ammoType.effect.type) {
        this.effectType = ammoType.effect.type;
        this.effectValue = ammoType.effect.value || 0;

        if (ammoType.effect.type === 'piercing') {
          this.pierceCount = ammoType.effect.value || 0;
        } else if (ammoType.effect.type === 'explosive') {
          this.explosiveRadius = ammoType.effect.value || 0;
        } else if (ammoType.effect.type === 'critical') {
          // Critical chance from ammo
          let totalCritChance = ammoType.effect.value || 0;
          let baseCritMultiplier = ammoType.tier >= 5 ? 3 : (ammoType.tier >= 4 ? 2.5 : 2);

          // Add critical chance and multiplier from upgrades
          if (upgradeBoosts) {
            totalCritChance += (upgradeBoosts.critChance || 0);
            baseCritMultiplier += (upgradeBoosts.critMultiplier || 0);
          }

          // Critical chance - determined at init
          this.critical = Math.random() < totalCritChance;
          if (this.critical) {
            this.damage = Math.floor(this.damage * baseCritMultiplier);
          }
        }
      }
    } else {
      // Default ammo - but still check for upgrade crit chance
      this.ammoType = null;
      this.damage = 1;
      this.color = '#00ffff';
      this.trailColor = '#0088ff';
      this.size = CONFIG.BULLET.SIZE;
      this.pierceCount = 0;
      this.explosiveRadius = 0;
      this.effectType = null;
      this.effectValue = 0;

      // Apply upgrade crit chance even without special ammo
      if (upgradeBoosts && (upgradeBoosts.critChance > 0)) {
        this.critical = Math.random() < upgradeBoosts.critChance;
        if (this.critical) {
          const critMultiplier = 1 + (upgradeBoosts.critMultiplier || 0);
          this.damage = Math.floor(this.damage * critMultiplier);
        }
      } else {
        this.critical = false;
      }
    }
  }

  update(canvasWidth, canvasHeight) {
    this.x += this.dx;
    this.y += this.dy;

    // Check if out of bounds
    if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
      this.active = false;
    }
  }

  draw(ctx) {
    // Draw laser energy bolt with glow
    const angle = Math.atan2(this.dy, this.dx);

    // Outer glow
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = this.trailColor;
    ctx.fillRect(-this.size * 2, -this.size * 1.5, this.size * 4, this.size * 3);
    ctx.globalAlpha = 1.0;

    // Core laser beam
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size, -this.size * 0.8, this.size * 2, this.size * 1.6);

    // Bright center
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-this.size * 0.5, -this.size * 0.4, this.size, this.size * 0.8);
    ctx.restore();

    // Draw critical hit indicator
    if (this.critical) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);
      ctx.strokeStyle = '#FF00FF';
      ctx.lineWidth = 2;
      ctx.strokeRect(-this.size * 1.5, -this.size * 1.2, this.size * 3, this.size * 2.4);
      ctx.restore();
    }

    // Enhanced trail for special ammo
    if (this.ammoType && this.ammoType.particleType) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = this.trailColor;
      ctx.fillRect(-this.size * 3, -this.size * 2, this.size * 6, this.size * 4);
      ctx.globalAlpha = 1.0;
      ctx.restore();
    }
  }

  checkCollision(enemy) {
    // Check if already pierced this enemy
    if (this.piercedEnemies.includes(enemy)) {
      return false;
    }
    return Math.hypot(this.x - enemy.x, this.y - enemy.y) < enemy.size;
  }

  markPierced(enemy) {
    // Mark enemy as pierced
    if (!this.piercedEnemies.includes(enemy)) {
      this.piercedEnemies.push(enemy);
    }
  }

  canPierce() {
    return this.piercedEnemies.length < this.pierceCount;
  }
}
