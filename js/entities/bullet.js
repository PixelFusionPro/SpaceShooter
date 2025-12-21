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
    this.color = 'yellow'; // Default color
    this.trailColor = 'orange';
    this.pierceCount = 0; // How many zombies it can pierce
    this.piercedZombies = []; // Track pierced zombies
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
    this.piercedZombies = []; // Reset pierced zombies

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
      this.color = 'yellow';
      this.trailColor = 'orange';
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
    // Draw bullet with ammo color
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw critical hit indicator
    if (this.critical) {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Trail effect for special ammo (simple glow)
    if (this.ammoType && this.ammoType.particleType) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = this.trailColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }

  checkCollision(zombie) {
    // Check if already pierced this zombie
    if (this.piercedZombies.includes(zombie)) {
      return false;
    }
    return Math.hypot(this.x - zombie.x, this.y - zombie.y) < zombie.size;
  }

  markPierced(zombie) {
    // Mark zombie as pierced
    if (!this.piercedZombies.includes(zombie)) {
      this.piercedZombies.push(zombie);
    }
  }

  canPierce() {
    return this.piercedZombies.length < this.pierceCount;
  }
}
