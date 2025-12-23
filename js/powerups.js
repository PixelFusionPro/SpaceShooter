// Powerup System

class PowerupManager {
  constructor(canvas, particleManager = null, audioManager = null) {
    this.canvas = canvas;
    this.particleManager = particleManager;
    this.audioManager = audioManager;
    this.powerups = [];
    this.timers = {
      multishot: 0,
      speed: 0,
      shield: 0,
      // Tier 2 powerups
      damage: 0,
      firerate: 0,
      regen: 0,
      // Tier 3 powerups
      invincibility: 0,
      timeslow: 0,
      explosive: 0,
      homing: 0
    };
    this.noDropKillCount = 0;
    this.notices = [];
    this.collectedCount = 0;
    this.currentWave = 1; // Track current wave for scaling
    this.regenTickTime = 0; // For regeneration powerup
  }

  spawn(x, y, rarity = null) {
    // Tier-based powerup pools based on wave progression
    let types = [];

    // Tier 1 powerups (always available)
    const tier1 = ['heal', 'speed', 'multishot', 'shield'];
    types = [...tier1];

    // Tier 2 powerups (unlock at wave 26)
    if (this.currentWave >= 26) {
      const tier2 = ['damage', 'firerate', 'regen'];
      types = [...types, ...tier2];
    }

    // Tier 3 powerups (unlock at wave 51)
    if (this.currentWave >= 51) {
      const tier3 = ['invincibility', 'timeslow', 'explosive', 'homing'];
      types = [...types, ...tier3];
    }

    const type = types[Math.floor(Math.random() * types.length)];
    this.powerups.push({
      x,
      y,
      size: CONFIG.POWERUPS.SIZE,
      type,
      rarity: rarity || 'common',
      spawnTime: performance.now()
    });
  }

  update(player, shopManager = null) {
    // Update powerups (magnet pull + collection)
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];

      // Magnet pull
      const dx = player.x - p.x;
      const dy = player.y - p.y;
      const dist = Math.hypot(dx, dy);
      const isMagnetActive = dist < CONFIG.POWERUPS.MAGNET_RANGE;
      if (isMagnetActive) {
        const pullStrength = CONFIG.POWERUPS.MAGNET_STRENGTH * (1 - dist / CONFIG.POWERUPS.MAGNET_RANGE);
        p.x += dx * pullStrength * 0.05;
        p.y += dy * pullStrength * 0.05;

        // Magnet trail particles (Phase 2)
        if (this.particleManager && Math.random() < 0.4) {
          const trailAngle = Math.atan2(p.y - player.y, p.x - player.x);
          for (let j = 0; j < 3; j++) {
            const offset = (Math.random() - 0.5) * 15;
            const color = this.getPowerupColor(p.type);
            const rgb = this.colorToRgb(color);
            this.particleManager.sparkleParticles.add({
              x: p.x + Math.cos(trailAngle + Math.PI) * offset,
              y: p.y + Math.sin(trailAngle + Math.PI) * offset,
              dx: (Math.random() - 0.5) * 0.5,
              dy: (Math.random() - 0.5) * 0.5,
              life: 15,
              maxLife: 15,
              size: Math.random() * 2 + 1,
              color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`
            });
          }
        }
      }

      // Check collection
      if (Math.hypot(player.x - p.x, player.y - p.y) < player.size + p.size) {
        this.collect(p, player, shopManager);
        this.powerups.splice(i, 1);
      }
    }

    // Update notices (movement and lifetime)
    for (let i = this.notices.length - 1; i >= 0; i--) {
      const n = this.notices[i];
      n.y -= 0.5;
      n.life--;
      if (n.life <= 0) {
        this.notices.splice(i, 1);
      }
    }

    // Regeneration powerup tick (heal over time)
    if (this.isRegenActive()) {
      const now = Date.now();
      if (now - this.regenTickTime >= 500) { // Tick every 0.5 seconds
        let maxHealth = CONFIG.PLAYER.MAX_HEALTH;
        if (shopManager) {
          const boosts = shopManager.getEquippedStatBoosts();
          maxHealth += boosts.maxHealth;
        }
        const healAmount = Math.ceil(maxHealth * 0.02); // 2% of max health per tick
        player.health = Math.min(maxHealth, player.health + healAmount);
        this.regenTickTime = now;

        // Spawn small heal particles
        if (this.particleManager) {
          for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = player.size + Math.random() * 5;
            this.particleManager.healParticles.add({
              x: player.x + Math.cos(angle) * dist,
              y: player.y + Math.sin(angle) * dist,
              dx: (Math.random() - 0.5) * 0.5,
              dy: -0.5 - Math.random() * 0.5,
              life: 20,
              maxLife: 20,
              size: Math.random() * 2 + 1,
              color: '#44ff88'
            });
          }
        }
      }
    }
  }

  draw(ctx) {
    // Draw all powerups with visual effects
    for (const p of this.powerups) {
      this.drawPowerup(ctx, p);
    }

    // Draw notices
    for (const n of this.notices) {
      ctx.save();
      ctx.globalAlpha = n.life / CONFIG.PARTICLES.NOTICE_LIFETIME;
      ctx.fillStyle = n.color;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(n.text, n.x, n.y);
      ctx.restore();
    }
  }

  collect(powerup, player, shopManager = null) {
    this.collectedCount++;

    // Play collect sound first
    if (this.audioManager) {
      this.audioManager.playSound('powerup_collect', 0.5);
    }

    switch (powerup.type) {
      case 'heal':
        // Calculate max health with armor boosts
        let maxHealth = CONFIG.PLAYER.MAX_HEALTH;
        if (shopManager) {
          const boosts = shopManager.getEquippedStatBoosts();
          maxHealth += boosts.maxHealth;
        }
        // Percentage-based healing (25% of max health, minimum 20 HP)
        const healPercent = 0.25;
        const healAmount = Math.max(20, Math.ceil(maxHealth * healPercent));
        player.health = Math.min(maxHealth, player.health + healAmount);
        // Spawn green plus sign particles
        if (this.particleManager) {
          this.particleManager.spawnHealPlus(player.x, player.y);
        }
        // Play heal sound
        if (this.audioManager) {
          this.audioManager.playSound('powerup_heal', 0.6);
        }
        break;
      case 'speed':
        this.timers.speed = Date.now() + this.getScaledDuration();
        player.speed = CONFIG.PLAYER.SPEED_BOOSTED;
        // Play speed sound
        if (this.audioManager) {
          this.audioManager.playSound('powerup_speed', 0.5);
        }
        break;
      case 'multishot':
        this.timers.multishot = Date.now() + this.getScaledDuration();
        // Play multishot sound
        if (this.audioManager) {
          this.audioManager.playSound('powerup_multishot', 0.5);
        }
        break;
      case 'shield':
        this.timers.shield = Date.now() + this.getScaledDuration();
        // Play shield sound
        if (this.audioManager) {
          this.audioManager.playSound('powerup_shield', 0.5);
        }
        break;

      // Tier 2 Powerups
      case 'damage':
        this.timers.damage = Date.now() + this.getScaledDuration() * 0.8; // 80% duration
        if (this.audioManager) {
          this.audioManager.playSound('powerup_damage', 0.5);
        }
        break;
      case 'firerate':
        this.timers.firerate = Date.now() + this.getScaledDuration() * 0.6; // 60% duration
        if (this.audioManager) {
          this.audioManager.playSound('powerup_firerate', 0.5);
        }
        break;
      case 'regen':
        this.timers.regen = Date.now() + this.getScaledDuration() * 2; // 200% duration
        this.regenTickTime = Date.now();
        if (this.audioManager) {
          this.audioManager.playSound('powerup_regen', 0.5);
        }
        break;

      // Tier 3 Powerups
      case 'invincibility':
        this.timers.invincibility = Date.now() + 3000; // Fixed 3 seconds
        if (this.audioManager) {
          this.audioManager.playSound('powerup_invincibility', 0.7);
        }
        break;
      case 'timeslow':
        this.timers.timeslow = Date.now() + this.getScaledDuration();
        if (this.audioManager) {
          this.audioManager.playSound('powerup_timeslow', 0.6);
        }
        break;
      case 'explosive':
        this.timers.explosive = Date.now() + this.getScaledDuration() * 0.5; // 50% duration
        if (this.audioManager) {
          this.audioManager.playSound('powerup_explosive', 0.5);
        }
        break;
      case 'homing':
        this.timers.homing = Date.now() + this.getScaledDuration() * 0.7; // 70% duration
        if (this.audioManager) {
          this.audioManager.playSound('powerup_homing', 0.5);
        }
        break;
    }

    // Add notice
    this.notices.push({
      text: powerup.type.toUpperCase() + ' READY',
      color: this.getPowerupColor(powerup.type),
      x: player.x,
      y: player.y - 20,
      life: CONFIG.PARTICLES.NOTICE_LIFETIME
    });
  }

  getPowerupColor(type) {
    switch (type) {
      // Tier 1
      case 'heal': return 'lime';
      case 'speed': return 'orange';
      case 'multishot': return 'gold';
      case 'shield': return 'cyan';
      // Tier 2
      case 'damage': return '#ff4444';
      case 'firerate': return '#ff8800';
      case 'regen': return '#44ff88';
      // Tier 3
      case 'invincibility': return '#ffff00';
      case 'timeslow': return '#8844ff';
      case 'explosive': return '#ff6600';
      case 'homing': return '#00ffff';
      default: return 'gray';
    }
  }

  // Calculate scaled duration based on current wave
  getScaledDuration() {
    const baseDuration = CONFIG.POWERUPS.DURATION;
    const waveBonusDuration = Math.min(5000, this.currentWave * 50); // +50ms per wave, max +5s
    return baseDuration + waveBonusDuration;
  }

  getPowerupIcon(type) {
    switch (type) {
      // Tier 1
      case 'heal': return '+';
      case 'speed': return '➤';
      case 'multishot': return '⋮';
      case 'shield': return '⛨';
      // Tier 2
      case 'damage': return '⚔';
      case 'firerate': return '⚡';
      case 'regen': return '♥';
      // Tier 3
      case 'invincibility': return '★';
      case 'timeslow': return '⏱';
      case 'explosive': return '💥';
      case 'homing': return '🎯';
      default: return '?';
    }
  }

  colorToRgb(color) {
    const colors = {
      'lime': { r: 0, g: 255, b: 0 },
      'orange': { r: 255, g: 165, b: 0 },
      'gold': { r: 255, g: 215, b: 0 },
      'cyan': { r: 0, g: 255, b: 255 },
      'gray': { r: 128, g: 128, b: 128 }
    };
    return colors[color] || colors.gray;
  }

  drawPowerup(ctx, p) {
    const now = performance.now();
    const powerupColor = this.getPowerupColor(p.type);
    const rgb = this.colorToRgb(powerupColor);

    // Spawn animation (Phase 3)
    const spawnAge = p.spawnTime ? (now - p.spawnTime) / 300 : 1;
    const spawnScale = spawnAge >= 1 ? 1 : Math.min(1, spawnAge * 2 - spawnAge * spawnAge);

    // Pulsing animation (Phase 1)
    const pulseTime = now * 0.005;
    const pulseScale = 1.0 + Math.sin(pulseTime) * 0.15;
    const currentSize = p.size * pulseScale * spawnScale;

    // Floating animation (Phase 1)
    const floatTime = now * 0.003;
    const floatOffset = Math.sin(floatTime) * 3;
    const drawY = p.y + floatOffset;

    // Rotation animation (Phase 2)
    const rotation = (now * 0.001) % (Math.PI * 2);

    // Glow pulse (Phase 1)
    const glowOpacity = 0.4 + (Math.sin(pulseTime) * 0.4);

    // Shimmer angle (Phase 2)
    const shimmerAngle = (now * 0.004) % (Math.PI * 2);
    const shimmerX = p.x + Math.cos(shimmerAngle) * currentSize;
    const shimmerY = drawY + Math.sin(shimmerAngle) * currentSize;

    // Outer ring pulse (Phase 3)
    const ringTime = (now * 0.004) % 1.5;
    const ringRadius = 10 + (ringTime / 1.5) * 15;

    ctx.save();

    // Draw outer ring pulse (Phase 3)
    if (spawnAge >= 1) {
      ctx.beginPath();
      ctx.arc(p.x, drawY, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.5 * (1 - ringTime / 1.5)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw glow effect (Phase 1)
    const gradient = ctx.createRadialGradient(p.x, drawY, 0, p.x, drawY, 20);
    gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${glowOpacity})`);
    gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${glowOpacity * 0.5})`);
    gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, drawY, 20, 0, Math.PI * 2);
    ctx.fill();

    // Apply rotation transform (Phase 2)
    ctx.translate(p.x, drawY);
    ctx.rotate(rotation);
    ctx.translate(-p.x, -drawY);

    // Draw main powerup circle
    ctx.beginPath();
    ctx.arc(p.x, drawY, currentSize, 0, Math.PI * 2);
    ctx.fillStyle = powerupColor;
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Reset rotation for shimmer and icon
    ctx.restore();
    ctx.save();

    // Draw shimmer effect (Phase 2) - in world coordinates
    const shimmerGradient = ctx.createRadialGradient(
      shimmerX, shimmerY, 0,
      shimmerX, shimmerY, currentSize * 1.5
    );
    shimmerGradient.addColorStop(0, 'rgba(255,255,255,0.7)');
    shimmerGradient.addColorStop(0.5, 'rgba(255,255,255,0.3)');
    shimmerGradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shimmerGradient;
    ctx.beginPath();
    ctx.arc(p.x, drawY, currentSize * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Draw enhanced icon (Phase 1)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icon = this.getPowerupIcon(p.type);
    ctx.fillText(icon, p.x, drawY);
    ctx.shadowColor = 'transparent';

    ctx.restore();

    // Color-specific enhancements (Phase 3)
    if (spawnAge >= 1) {
      if (p.type === 'speed') {
        // Speed: motion streaks
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const angle = rotation + (i * Math.PI * 2 / 3);
          ctx.beginPath();
          ctx.moveTo(p.x, drawY);
          ctx.lineTo(
            p.x + Math.cos(angle) * currentSize * 1.5,
            drawY + Math.sin(angle) * currentSize * 1.5
          );
          ctx.stroke();
        }
      } else if (p.type === 'multishot') {
        // Multishot: sparkle particles
        if (this.particleManager && Math.random() < 0.1) {
          for (let i = 0; i < 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const offset = currentSize * 0.8;
            this.particleManager.sparkleParticles.add({
              x: p.x + Math.cos(angle) * offset,
              y: drawY + Math.sin(angle) * offset,
              dx: (Math.random() - 0.5) * 0.3,
              dy: (Math.random() - 0.5) * 0.3,
              life: 10,
              maxLife: 10,
              size: Math.random() * 2 + 1,
              color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`
            });
          }
        }
      } else if (p.type === 'shield') {
        // Shield: orbiting outer particles
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI * 2 / 4) * i + rotation * 2;
          const radius = currentSize * 1.8;
          ctx.beginPath();
          ctx.arc(
            p.x + Math.cos(angle) * radius,
            drawY + Math.sin(angle) * radius,
            2, 0, Math.PI * 2
          );
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
          ctx.fill();
        }
      }
    }
  }

  checkDropChance(killCount) {
    this.noDropKillCount++;

    // Adaptive drop rate based on wave (decreases as waves increase)
    const baseDropRate = CONFIG.POWERUPS.DROP_CHANCE;
    const waveReduction = Math.min(0.15, this.currentWave * 0.001); // -0.1% per wave, max -15%
    const adjustedDropRate = Math.max(0.10, baseDropRate - waveReduction);

    // Adaptive guaranteed drop threshold (increases with wave)
    const guaranteedThreshold = CONFIG.POWERUPS.GUARANTEED_DROP_KILLS + Math.floor(this.currentWave / 10);

    if (Math.random() < adjustedDropRate || this.noDropKillCount >= guaranteedThreshold) {
      this.noDropKillCount = 0;
      return true;
    }
    return false;
  }

  isShieldActive() {
    return this.timers.shield > Date.now();
  }

  isSpeedActive() {
    return this.timers.speed > Date.now();
  }

  isMultishotActive() {
    return this.timers.multishot > Date.now();
  }

  // Tier 2 active checkers
  isDamageActive() {
    return this.timers.damage > Date.now();
  }

  isFireRateActive() {
    return this.timers.firerate > Date.now();
  }

  isRegenActive() {
    return this.timers.regen > Date.now();
  }

  // Tier 3 active checkers
  isInvincibilityActive() {
    return this.timers.invincibility > Date.now();
  }

  isTimeSlowActive() {
    return this.timers.timeslow > Date.now();
  }

  isExplosiveActive() {
    return this.timers.explosive > Date.now();
  }

  isHomingActive() {
    return this.timers.homing > Date.now();
  }

  updatePlayerSpeed(player, shopManager = null) {
    // Base speed (from powerup or normal)
    let baseSpeed = this.isSpeedActive() ?
      CONFIG.PLAYER.SPEED_BOOSTED :
      CONFIG.PLAYER.SPEED_NORMAL;

    // Apply speed multiplier from upgrades
    if (shopManager) {
      const boosts = shopManager.getEquippedStatBoosts();
      baseSpeed *= (boosts.speed || 1.0);
    }

    player.speed = baseSpeed;
  }

  getCurrentPowerup() {
    // Return highest priority active powerup (Tier 3 > Tier 2 > Tier 1)
    if (this.isInvincibilityActive()) return 'INVINCIBILITY';
    if (this.isTimeSlowActive()) return 'TIMESLOW';
    if (this.isExplosiveActive()) return 'EXPLOSIVE';
    if (this.isHomingActive()) return 'HOMING';
    if (this.isDamageActive()) return 'DAMAGE';
    if (this.isFireRateActive()) return 'FIRERATE';
    if (this.isRegenActive()) return 'REGEN';
    if (this.isShieldActive()) return 'SHIELD';
    if (this.isSpeedActive()) return 'SPEED';
    if (this.isMultishotActive()) return 'MULTISHOT';
    return 'None';
  }

  drawShieldEffect(ctx, player) {
    if (!this.isShieldActive()) return;

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i + performance.now() / 500;
      const px = player.x + Math.cos(angle) * (player.size * 1.5);
      const py = player.y + Math.sin(angle) * (player.size * 1.5);
      ctx.fillStyle = 'rgba(0,255,255,0.6)'; // Increased from 0.3 to 0.6 for better visibility
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  reset() {
    this.powerups = [];
    this.timers = {
      multishot: 0,
      speed: 0,
      shield: 0,
      damage: 0,
      firerate: 0,
      regen: 0,
      invincibility: 0,
      timeslow: 0,
      explosive: 0,
      homing: 0
    };
    this.noDropKillCount = 0;
    this.notices = [];
    this.regenTickTime = 0;
  }
}
