class EnemyShip {
  constructor(canvas, type = 'normal') {
    this.canvas = canvas;
    this.type = type;
    const config = CONFIG.ENEMIES[type.toUpperCase()] || CONFIG.ENEMIES.NORMAL;
    this.size = config.SIZE;
    this.speed = config.SPEED;
    this.baseSpeed = config.SPEED; // Store base speed for fortress collision slowdown
    this.health = config.HEALTH;
    this.maxHealth = config.HEALTH;
    this.lastX = 0;
    this.lastY = 0;
    this.stuckTimer = 0;
    this.elite = Math.random() < CONFIG.ENEMIES.ELITE_CHANCE;
    this.variant = Math.random() < CONFIG.ENEMIES.VARIANT_CHANCE ? 'hat' : null;

    // Spaceship rotation - face toward player
    this.angle = 0; // Current rotation angle
    this.rotationSpeed = 0.12; // Rotation speed (radians per frame)

    // Death animation system
    this.dying = false;
    this.deathProgress = 0;
    this.deathType = null;
    this.deathRotation = 0;
    this.deathVelocityX = 0;
    this.deathVelocityY = 0;

    // Animation (for engine glow, etc.)
    this.animationPhase = Math.random() * Math.PI * 2; // Random start phase

    // Boss-specific
    if (type === 'boss') {
      this.minionInterval = CONFIG.ENEMIES.BOSS.MINION_INTERVAL;
      this.nextMinionTime = Date.now() + this.minionInterval;
    }

    // Spawn from random edge
    this.spawnFromEdge();
  }

  spawnFromEdge() {
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) {
      this.x = Math.random() * this.canvas.width;
      this.y = -20;
    } else if (edge === 1) {
      this.x = this.canvas.width + 20;
      this.y = Math.random() * this.canvas.height;
    } else if (edge === 2) {
      this.x = Math.random() * this.canvas.width;
      this.y = this.canvas.height + 20;
    } else {
      this.x = -20;
      this.y = Math.random() * this.canvas.height;
    }
    this.lastX = this.x;
    this.lastY = this.y;
  }

  update(playerX, playerY, shieldActive) {
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy);

    // Calculate target angle to face player
    const targetAngle = Math.atan2(dy, dx);
    
    // Smoothly rotate toward target angle
    let angleDiff = targetAngle - this.angle;
    // Normalize angle difference to [-PI, PI]
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    
    // Rotate toward target
    if (Math.abs(angleDiff) > 0.01) {
      this.angle += Math.sign(angleDiff) * Math.min(this.rotationSpeed, Math.abs(angleDiff));
    } else {
      this.angle = targetAngle;
    }
    
    // Normalize angle to [0, 2*PI]
    while (this.angle < 0) this.angle += Math.PI * 2;
    while (this.angle >= Math.PI * 2) this.angle -= Math.PI * 2;

    // Move toward player
    this.x += (dx / dist) * this.speed;
    this.y += (dy / dist) * this.speed;

    // Update animation phase for engine effects
    this.animationPhase += 0.1;

    // Check collision with player
    const collisionDist = dist < (this.size + CONFIG.PLAYER.SIZE);
    if (collisionDist && !shieldActive) {
      return CONFIG.ENEMIES.DAMAGE_PER_FRAME; // Return damage dealt
    }

    // Anti-stuck system
    const moved = Math.hypot(this.x - this.lastX, this.y - this.lastY);
    if (moved < 0.5) {
      this.stuckTimer++;
      if (this.stuckTimer > CONFIG.ENEMIES.STUCK_THRESHOLD) {
        this.spawnFromEdge();
        this.stuckTimer = 0;
      }
    } else {
      this.stuckTimer = 0;
    }
    this.lastX = this.x;
    this.lastY = this.y;

    return 0;
  }

  drawEliteAura(ctx, bodyY) {
    // Elite aura glow removed - using particles instead
  }

  draw(ctx) {
    // Apply rotation transform for spaceship
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.translate(-this.x, -this.y);

    // Boss rendering
    if (this.type === 'boss') {
      this.drawBoss(ctx);
      ctx.restore();
      return;
    }

    // Type-specific spaceship rendering
    switch (this.type) {
      case 'tank': this.drawTank(ctx); break;
      case 'runner': this.drawRunner(ctx); break;
      case 'explosive': this.drawExplosive(ctx); break;
      case 'healer': this.drawHealer(ctx); break;
      default: this.drawNormal(ctx);
    }
    
    ctx.restore();
  }

  drawBoss(ctx) {
    // BOSS - Massive capital ship (enhanced)
    const pulse = Math.sin(performance.now() / 200) * 0.1;
    const engineGlow = Math.sin(this.animationPhase) * 0.3 + 0.7;
    const weaponPulse = Math.sin(this.animationPhase * 3) * 0.3 + 0.7;

    // Main hull - large battleship design with gradient
    const hullGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 1.6);
    hullGradient.addColorStop(0, '#2a1a2a');
    hullGradient.addColorStop(0.4, '#1a1a1a');
    hullGradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = hullGradient;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 1.6, this.size * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Hull outline with pulsing effect
    ctx.strokeStyle = `rgba(255,0,255,${0.8 + pulse})`;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Central command structure with detail
    const commandGradient = ctx.createRadialGradient(this.x, this.y - this.size * 0.3, 0, this.x, this.y - this.size * 0.3, this.size * 0.9);
    commandGradient.addColorStop(0, '#3a2a3a');
    commandGradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = commandGradient;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y - this.size * 0.3, this.size * 0.85, this.size * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Command center window
    ctx.fillStyle = '#0ff';
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.size * 0.3, this.size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Multiple weapon turrets (glowing red, pulsing)
    const turrets = [
      { x: -this.size * 0.85, y: -this.size * 0.5 },
      { x: this.size * 0.85, y: -this.size * 0.5 },
      { x: -this.size * 0.65, y: this.size * 0.3 },
      { x: this.size * 0.65, y: this.size * 0.3 }
    ];
    turrets.forEach(turret => {
      // Outer glow
      const turretGradient = ctx.createRadialGradient(
        this.x + turret.x, this.y + turret.y, 0,
        this.x + turret.x, this.y + turret.y, 10
      );
      turretGradient.addColorStop(0, `rgba(255,0,0,${weaponPulse * 0.8})`);
      turretGradient.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = turretGradient;
      ctx.beginPath();
      ctx.arc(this.x + turret.x, this.y + turret.y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Turret body
      ctx.fillStyle = `rgba(255,0,0,${weaponPulse})`;
      ctx.beginPath();
      ctx.arc(this.x + turret.x, this.y + turret.y, 7, 0, Math.PI * 2);
      ctx.fill();
      
      // Turret core
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(this.x + turret.x, this.y + turret.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Engine pods (4 large engines) with enhanced visuals
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 / 4) * i;
      const engineX = this.x + Math.cos(angle) * this.size * 1.15;
      const engineY = this.y + Math.sin(angle) * this.size * 0.85;
      
      // Engine outer glow
      const engineGradient = ctx.createRadialGradient(engineX, engineY, 0, engineX, engineY, this.size * 0.5);
      engineGradient.addColorStop(0, `rgba(255,0,255,${engineGlow})`);
      engineGradient.addColorStop(0.6, `rgba(255,0,255,${engineGlow * 0.5})`);
      engineGradient.addColorStop(1, 'rgba(255,0,255,0)');
      ctx.fillStyle = engineGradient;
      ctx.beginPath();
      ctx.arc(engineX, engineY, this.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Engine core
      ctx.fillStyle = `rgba(255,0,255,${engineGlow})`;
      ctx.beginPath();
      ctx.arc(engineX, engineY, this.size * 0.35, 0, Math.PI * 2);
      ctx.fill();
      
      // Engine bright center
      ctx.fillStyle = '#ff00ff';
      ctx.beginPath();
      ctx.arc(engineX, engineY, this.size * 0.2, 0, Math.PI * 2);
      ctx.fill();
      
      // Engine trail with gradient
      const trailGradient = ctx.createLinearGradient(
        engineX, engineY,
        engineX + Math.cos(angle + Math.PI) * this.size * 1.0,
        engineY + Math.sin(angle + Math.PI) * this.size * 1.0
      );
      trailGradient.addColorStop(0, `rgba(255,0,255,${engineGlow * 0.8})`);
      trailGradient.addColorStop(0.5, `rgba(255,0,255,${engineGlow * 0.4})`);
      trailGradient.addColorStop(1, 'rgba(255,0,255,0)');
      ctx.strokeStyle = trailGradient;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(engineX, engineY);
      ctx.lineTo(
        engineX + Math.cos(angle + Math.PI) * this.size * 1.0,
        engineY + Math.sin(angle + Math.PI) * this.size * 1.0
      );
      ctx.stroke();
    }

    // Shield bar
    const barW = this.size * 2.5;
    const barH = 8;
    const ratio = Math.max(0, this.health / this.maxHealth);
    const bx = this.x - barW / 2;
    const by = this.y - this.size * 1.5 - 15;
    ctx.fillStyle = '#001122';
    ctx.fillRect(bx, by, barW, barH);
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(bx, by, barW * ratio, barH);
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, barW, barH);

    // BOSS label
    ctx.fillStyle = '#ff00ff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👾 BOSS 👾', this.x, by - 8);
  }

  drawTank(ctx) {
    // TANK - Heavy armored battleship (enhanced visuals)
    const baseColor = this.elite ? '#0ff' : '#663366';
    const darkColor = this.elite ? '#0aa' : '#551155';
    const engineGlow = Math.sin(this.animationPhase) * 0.3 + 0.7;

    // Elite glow (enhanced)
    if (this.elite) {
      const eliteGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 1.8);
      eliteGradient.addColorStop(0, 'rgba(0,255,255,0.3)');
      eliteGradient.addColorStop(0.5, 'rgba(0,255,255,0.15)');
      eliteGradient.addColorStop(1, 'rgba(0,255,255,0)');
      ctx.fillStyle = eliteGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Main hull with gradient
    const hullGradient = ctx.createRadialGradient(this.x, this.y - this.size * 0.3, 0, this.x, this.y, this.size * 1.2);
    hullGradient.addColorStop(0, baseColor);
    hullGradient.addColorStop(0.7, darkColor);
    hullGradient.addColorStop(1, '#331133');
    ctx.fillStyle = hullGradient;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 1.15, this.size * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Hull outline with highlight
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = this.elite ? '#0ff' : '#884488';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Armor plates (segmented with depth)
    ctx.fillStyle = darkColor;
    for (let i = 0; i < 3; i++) {
      const plateY = this.y - this.size * 0.4 + i * this.size * 0.4;
      ctx.fillRect(this.x - this.size * 0.45, plateY, this.size * 0.9, this.size * 0.3);
      // Plate highlight
      ctx.fillStyle = this.elite ? 'rgba(0,255,255,0.3)' : 'rgba(136,68,136,0.3)';
      ctx.fillRect(this.x - this.size * 0.45, plateY, this.size * 0.9, this.size * 0.1);
      ctx.fillStyle = darkColor;
    }

    // Command center (cockpit) with window
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.size * 0.5, this.size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.elite ? '#0ff' : '#aa66aa';
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.size * 0.5, this.size * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Weapon ports (glowing with pulsing)
    const weaponPulse = Math.sin(this.animationPhase * 2) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255,255,0,${weaponPulse})`;
    ctx.beginPath();
    ctx.arc(this.x - this.size * 0.6, this.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + this.size * 0.3, this.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Large engine pods (rear) with enhanced glow
    const engineColor = this.elite ? `rgba(0,255,255,${engineGlow})` : `rgba(102,51,102,${engineGlow})`;
    ctx.fillStyle = engineColor;
    ctx.beginPath();
    ctx.arc(this.x - this.size * 0.5, this.y + this.size * 0.7, this.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + this.size * 0.5, this.y + this.size * 0.7, this.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Engine core (brighter center)
    ctx.fillStyle = this.elite ? '#0ff' : '#aa66aa';
    ctx.beginPath();
    ctx.arc(this.x - this.size * 0.5, this.y + this.size * 0.7, this.size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + this.size * 0.5, this.y + this.size * 0.7, this.size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Engine trails with gradient
    const trailGradient1 = ctx.createLinearGradient(
      this.x - this.size * 0.5, this.y + this.size * 0.7,
      this.x - this.size * 0.5, this.y + this.size * 1.3
    );
    trailGradient1.addColorStop(0, engineColor);
    trailGradient1.addColorStop(1, 'rgba(102,51,102,0)');
    ctx.strokeStyle = trailGradient1;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(this.x - this.size * 0.5, this.y + this.size * 0.7);
    ctx.lineTo(this.x - this.size * 0.5, this.y + this.size * 1.3);
    ctx.stroke();
    
    const trailGradient2 = ctx.createLinearGradient(
      this.x + this.size * 0.5, this.y + this.size * 0.7,
      this.x + this.size * 0.5, this.y + this.size * 1.3
    );
    trailGradient2.addColorStop(0, engineColor);
    trailGradient2.addColorStop(1, 'rgba(102,51,102,0)');
    ctx.strokeStyle = trailGradient2;
    ctx.beginPath();
    ctx.moveTo(this.x + this.size * 0.5, this.y + this.size * 0.7);
    ctx.lineTo(this.x + this.size * 0.5, this.y + this.size * 1.3);
    ctx.stroke();

    this.drawHealthBar(ctx);
  }

  drawRunner(ctx) {
    // RUNNER - Fast interceptor fighter (enhanced)
    const baseColor = this.elite ? '#0ff' : '#aaa04a';
    const darkColor = this.elite ? '#0aa' : '#888040';
    const engineGlow = Math.sin(this.animationPhase * 1.5) * 0.4 + 0.8; // Faster pulse

    // Elite glow
    if (this.elite) {
      const eliteGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 1.5);
      eliteGradient.addColorStop(0, 'rgba(0,255,255,0.25)');
      eliteGradient.addColorStop(1, 'rgba(0,255,255,0)');
      ctx.fillStyle = eliteGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Speed lines (trailing effect with fade)
    for (let i = 0; i < 5; i++) {
      const alpha = 0.5 - (i * 0.1);
      ctx.strokeStyle = `rgba(170,160,74,${alpha})`;
      ctx.lineWidth = 2 - (i * 0.3);
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * 1.0 - i * 5, this.y);
      ctx.lineTo(this.x - this.size * 1.6 - i * 5, this.y);
      ctx.stroke();
    }

    // Sleek streamlined hull with gradient
    const hullGradient = ctx.createLinearGradient(this.x, this.y - this.size * 0.5, this.x, this.y + this.size * 0.5);
    hullGradient.addColorStop(0, baseColor);
    hullGradient.addColorStop(0.5, darkColor);
    hullGradient.addColorStop(1, '#666030');
    ctx.fillStyle = hullGradient;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 0.65, this.size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Hull outline
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cockpit with window
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.size * 0.3, this.size * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.elite ? '#0ff' : '#e0d090';
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Weapon ports (glowing red with pulse)
    const weaponPulse = Math.sin(this.animationPhase * 3) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(255,0,0,${weaponPulse})`;
    ctx.beginPath();
    ctx.arc(this.x - this.size * 0.3, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + this.size * 0.1, this.y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Twin engines (rear, bright glow) with core
    const engineColor = this.elite ? `rgba(0,255,255,${engineGlow})` : `rgba(170,160,74,${engineGlow})`;
    ctx.fillStyle = engineColor;
    ctx.beginPath();
    ctx.arc(this.x - this.size * 0.3, this.y + this.size * 0.5, this.size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + this.size * 0.3, this.y + this.size * 0.5, this.size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // Engine cores
    ctx.fillStyle = this.elite ? '#0ff' : '#ffaa00';
    ctx.beginPath();
    ctx.arc(this.x - this.size * 0.3, this.y + this.size * 0.5, this.size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + this.size * 0.3, this.y + this.size * 0.5, this.size * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Long engine trails with gradient
    const trailGradient1 = ctx.createLinearGradient(
      this.x - this.size * 0.3, this.y + this.size * 0.5,
      this.x - this.size * 0.3, this.y + this.size * 1.4
    );
    trailGradient1.addColorStop(0, engineColor);
    trailGradient1.addColorStop(0.5, `rgba(170,160,74,${engineGlow * 0.5})`);
    trailGradient1.addColorStop(1, 'rgba(170,160,74,0)');
    ctx.strokeStyle = trailGradient1;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x - this.size * 0.3, this.y + this.size * 0.5);
    ctx.lineTo(this.x - this.size * 0.3, this.y + this.size * 1.4);
    ctx.stroke();
    
    const trailGradient2 = ctx.createLinearGradient(
      this.x + this.size * 0.3, this.y + this.size * 0.5,
      this.x + this.size * 0.3, this.y + this.size * 1.4
    );
    trailGradient2.addColorStop(0, engineColor);
    trailGradient2.addColorStop(0.5, `rgba(170,160,74,${engineGlow * 0.5})`);
    trailGradient2.addColorStop(1, 'rgba(170,160,74,0)');
    ctx.strokeStyle = trailGradient2;
    ctx.beginPath();
    ctx.moveTo(this.x + this.size * 0.3, this.y + this.size * 0.5);
    ctx.lineTo(this.x + this.size * 0.3, this.y + this.size * 1.4);
    ctx.stroke();

    this.drawHealthBar(ctx);
  }

  drawExplosive(ctx) {
    // EXPLOSIVE - Unstable kamikaze ship (enhanced)
    const baseColor = this.elite ? '#0ff' : '#993333';
    const pulse = Math.sin(performance.now() / 150) * 0.15;
    const engineGlow = Math.sin(this.animationPhase) * 0.4 + 0.6;
    const pulseSize = 1.1 + pulse * 0.3;

    // Elite glow
    if (this.elite) {
      const eliteGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 1.6);
      eliteGradient.addColorStop(0, 'rgba(0,255,255,0.25)');
      eliteGradient.addColorStop(1, 'rgba(0,255,255,0)');
      ctx.fillStyle = eliteGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bloated unstable hull (pulsing) with gradient
    const hullGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * pulseSize);
    hullGradient.addColorStop(0, baseColor);
    hullGradient.addColorStop(0.6, '#772222');
    hullGradient.addColorStop(1, '#551111');
    ctx.fillStyle = hullGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * pulseSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Warning outline (pulsing red)
    ctx.strokeStyle = `rgba(255,0,0,${0.8 + pulse})`;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,100,0,${0.6 + pulse})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Warning lights (pulsing red, enhanced)
    ctx.strokeStyle = `rgba(255,0,0,${0.8 + pulse})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(
        this.x + Math.cos(angle) * this.size * 0.95,
        this.y + Math.sin(angle) * this.size * 0.95
      );
      ctx.stroke();
    }

    // Explosive core (glowing yellow, pulsing) with inner core
    const coreGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 0.5);
    coreGradient.addColorStop(0, `rgba(255,255,0,${0.9 + pulse})`);
    coreGradient.addColorStop(0.5, `rgba(255,200,0,${0.7 + pulse})`);
    coreGradient.addColorStop(1, `rgba(255,150,0,${0.5 + pulse})`);
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.45, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner core
    ctx.fillStyle = `rgba(255,255,255,${0.8 + pulse})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Unstable engine (erratic) with multiple exhausts
    const engineColor = this.elite ? `rgba(0,255,255,${engineGlow})` : `rgba(153,51,51,${engineGlow})`;
    ctx.fillStyle = engineColor;
    for (let i = 0; i < 3; i++) {
      const offset = (i - 1) * this.size * 0.2;
      ctx.beginPath();
      ctx.arc(this.x + offset, this.y + this.size * 0.6, this.size * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Erratic engine trails (multiple, wavy)
    ctx.strokeStyle = `rgba(255,0,0,${engineGlow * 0.6})`;
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
      const offset = (i - 1) * this.size * 0.2;
      const waveOffset = Math.sin(this.animationPhase * 2 + i) * 4;
      ctx.beginPath();
      ctx.moveTo(this.x + offset, this.y + this.size * 0.6);
      ctx.lineTo(this.x + offset + waveOffset, this.y + this.size * 1.3);
      ctx.stroke();
    }

    this.drawHealthBar(ctx);
  }

  drawHealer(ctx) {
    // HEALER - Support/medical ship (enhanced)
    const baseColor = this.elite ? '#0ff' : '#66cccc';
    const darkColor = this.elite ? '#0aa' : '#448888';
    const engineGlow = Math.sin(this.animationPhase) * 0.3 + 0.7;
    const healPulse = Math.sin(performance.now() / 300) * 0.2 + 0.8;

    // Elite glow
    if (this.elite) {
      const eliteGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 1.5);
      eliteGradient.addColorStop(0, 'rgba(0,255,255,0.25)');
      eliteGradient.addColorStop(1, 'rgba(0,255,255,0)');
      ctx.fillStyle = eliteGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Thin elongated hull (medical ship design) with gradient
    const hullGradient = ctx.createLinearGradient(this.x, this.y - this.size * 0.8, this.x, this.y + this.size * 0.8);
    hullGradient.addColorStop(0, baseColor);
    hullGradient.addColorStop(0.5, darkColor);
    hullGradient.addColorStop(1, '#336666');
    ctx.fillStyle = hullGradient;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 0.55, this.size * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Hull outline
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Visible structural details (ribs) with highlight
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const ribY = this.y - this.size * 0.4 + i * this.size * 0.3;
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * 0.35, ribY);
      ctx.lineTo(this.x + this.size * 0.35, ribY);
      ctx.stroke();
      // Highlight
      ctx.strokeStyle = this.elite ? 'rgba(0,255,255,0.4)' : 'rgba(136,204,204,0.4)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * 0.35, ribY);
      ctx.lineTo(this.x + this.size * 0.35, ribY);
      ctx.stroke();
      ctx.strokeStyle = darkColor;
      ctx.lineWidth = 1.5;
    }

    // Glowing green healing emitters (pulsing) with glow effect
    const healColor = `rgba(0,255,0,${healPulse})`;
    for (let i = 0; i < 2; i++) {
      const emitterX = this.x - this.size * 0.3 + (i * this.size * 0.6);
      // Outer glow
      const healGradient = ctx.createRadialGradient(emitterX, this.y, 0, emitterX, this.y, this.size * 0.4);
      healGradient.addColorStop(0, healColor);
      healGradient.addColorStop(0.5, `rgba(0,255,0,${healPulse * 0.5})`);
      healGradient.addColorStop(1, 'rgba(0,255,0,0)');
      ctx.fillStyle = healGradient;
      ctx.beginPath();
      ctx.arc(emitterX, this.y, this.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      // Core
      ctx.fillStyle = healColor;
      ctx.beginPath();
      ctx.arc(emitterX, this.y, this.size * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cockpit with window
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.size * 0.4, this.size * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.elite ? '#0ff' : '#aadddd';
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.size * 0.4, this.size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Sensor array (glowing)
    ctx.fillStyle = this.elite ? '#0ff' : '#00ff00';
    ctx.beginPath();
    ctx.arc(this.x - this.size * 0.2, this.y - this.size * 0.4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + this.size * 0.2, this.y - this.size * 0.4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Small engine (rear) with core
    const engineColor = this.elite ? `rgba(0,255,255,${engineGlow})` : `rgba(102,204,204,${engineGlow})`;
    ctx.fillStyle = engineColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y + this.size * 0.6, this.size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.elite ? '#0ff' : '#88ffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y + this.size * 0.6, this.size * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Engine trail with gradient
    const trailGradient = ctx.createLinearGradient(
      this.x, this.y + this.size * 0.6,
      this.x, this.y + this.size * 1.2
    );
    trailGradient.addColorStop(0, engineColor);
    trailGradient.addColorStop(1, 'rgba(102,204,204,0)');
    ctx.strokeStyle = trailGradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.size * 0.6);
    ctx.lineTo(this.x, this.y + this.size * 1.2);
    ctx.stroke();

    // Healing particle trail (more frequent)
    if (Math.random() < 0.4) {
      ctx.fillStyle = `rgba(0,255,100,${healPulse * 0.7})`;
      ctx.beginPath();
      ctx.arc(this.x + (Math.random() - 0.5) * this.size, this.y + this.size * 0.8, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    this.drawHealthBar(ctx);
  }

  drawNormal(ctx) {
    // NORMAL - Basic scout fighter (enhanced)
    const baseColor = this.elite ? '#0ff' : '#4488ff';
    const darkColor = this.elite ? '#0aa' : '#334466';
    const engineGlow = Math.sin(this.animationPhase) * 0.3 + 0.7;

    // Elite glow
    if (this.elite) {
      const eliteGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 1.4);
      eliteGradient.addColorStop(0, 'rgba(0,255,255,0.25)');
      eliteGradient.addColorStop(1, 'rgba(0,255,255,0)');
      ctx.fillStyle = eliteGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Main hull with gradient
    const hullGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 0.7);
    hullGradient.addColorStop(0, darkColor);
    hullGradient.addColorStop(0.6, baseColor);
    hullGradient.addColorStop(1, '#223344');
    ctx.fillStyle = hullGradient;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 0.55, this.size * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    // Energy core (glowing)
    const corePulse = Math.sin(this.animationPhase * 2) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(0,136,255,${corePulse})`;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 0.18, this.size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ship body with outline
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 0.65, this.size * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cockpit with window
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.size * 0.4, this.size * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.elite ? '#0ff' : '#88bbff';
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.size * 0.4, this.size * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Engine lights (glowing) with cores
    const engineColor = this.elite ? `rgba(0,255,255,${engineGlow})` : `rgba(0,136,255,${engineGlow})`;
    ctx.fillStyle = engineColor;
    ctx.beginPath();
    ctx.arc(this.x - this.size * 0.3, this.y + this.size * 0.4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + this.size * 0.1, this.y + this.size * 0.4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.elite ? '#0ff' : '#00aaff';
    ctx.beginPath();
    ctx.arc(this.x - this.size * 0.3, this.y + this.size * 0.4, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + this.size * 0.1, this.y + this.size * 0.4, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Wing thrusters with detail
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x - this.size * 0.5, this.y);
    ctx.lineTo(this.x - this.size * 0.85, this.y + this.size * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.x + this.size * 0.5, this.y);
    ctx.lineTo(this.x + this.size * 0.85, this.y + this.size * 0.5);
    ctx.stroke();
    
    // Wing highlights
    ctx.strokeStyle = this.elite ? '#0ff' : '#6699ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x - this.size * 0.5, this.y);
    ctx.lineTo(this.x - this.size * 0.85, this.y + this.size * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.x + this.size * 0.5, this.y);
    ctx.lineTo(this.x + this.size * 0.85, this.y + this.size * 0.5);
    ctx.stroke();

    // Engine trails with gradient
    const trailGradient1 = ctx.createLinearGradient(
      this.x - this.size * 0.3, this.y + this.size * 0.4,
      this.x - this.size * 0.3, this.y + this.size * 1.0
    );
    trailGradient1.addColorStop(0, engineColor);
    trailGradient1.addColorStop(1, 'rgba(68,136,255,0)');
    ctx.strokeStyle = trailGradient1;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x - this.size * 0.3, this.y + this.size * 0.4);
    ctx.lineTo(this.x - this.size * 0.3, this.y + this.size * 1.0);
    ctx.stroke();
    
    const trailGradient2 = ctx.createLinearGradient(
      this.x + this.size * 0.1, this.y + this.size * 0.4,
      this.x + this.size * 0.1, this.y + this.size * 1.0
    );
    trailGradient2.addColorStop(0, engineColor);
    trailGradient2.addColorStop(1, 'rgba(68,136,255,0)');
    ctx.strokeStyle = trailGradient2;
    ctx.beginPath();
    ctx.moveTo(this.x + this.size * 0.1, this.y + this.size * 0.4);
    ctx.lineTo(this.x + this.size * 0.1, this.y + this.size * 1.0);
    ctx.stroke();

    // Antenna variant (sensor array) - enhanced
    if (this.variant === 'hat') {
      ctx.fillStyle = this.elite ? '#0ff' : '#0088ff';
      ctx.fillRect(this.x - this.size * 0.45, this.y - this.size * 0.85, this.size * 0.9, 4);
      ctx.fillRect(this.x - this.size * 0.3, this.y - this.size * 1.0, this.size * 0.6, 6);
      // Sensor glow
      ctx.fillStyle = `rgba(0,136,255,0.5)`;
      ctx.fillRect(this.x - this.size * 0.45, this.y - this.size * 0.85, this.size * 0.9, 2);
    }

    this.drawHealthBar(ctx);
  }

  drawHealthBar(ctx) {
    // Shield bar (bold for mobile)
    const barW = this.size * 2;
    const barH = 5;
    const ratio = Math.max(0, this.health / this.maxHealth);
    const bx = this.x - barW / 2;
    const by = this.y - this.size * 1.3 - 10;

    // Background
    ctx.fillStyle = '#001122';
    ctx.fillRect(bx, by, barW, barH);

    // Shield energy (color changes)
    if (ratio > 0.6) {
      ctx.fillStyle = '#0ff';
    } else if (ratio > 0.3) {
      ctx.fillStyle = '#00aaff';
    } else {
      ctx.fillStyle = '#ff00ff';
    }
    ctx.fillRect(bx, by, barW * ratio, barH);

    // Border
    ctx.strokeStyle = '#0088ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, barW, barH);
  }

  startDeath(hitAngle = 0) {
    this.dying = true;
    this.deathProgress = 0;

    // Choose death animation based on type
    const deathTypes = ['fall_forward', 'fall_back', 'explode', 'dissolve', 'ragdoll'];

    // Type-specific death preferences (for visual variety)
    if (this.type === 'explosive') {
      this.deathType = 'explode';
    } else if (this.type === 'healer') {
      this.deathType = 'dissolve';
    } else if (this.type === 'boss') {
      this.deathType = 'explode';
    } else {
      // Random for others
      this.deathType = deathTypes[Math.floor(Math.random() * 3)]; // Only first 3 for variety
    }

    // Set physics based on death type
    if (this.deathType === 'fall_forward') {
      this.deathRotation = 0;
      this.deathVelocityX = Math.cos(hitAngle) * 2;
      this.deathVelocityY = Math.sin(hitAngle) * 2;
    } else if (this.deathType === 'fall_back') {
      this.deathRotation = 0;
      this.deathVelocityX = -Math.cos(hitAngle) * 1.5;
      this.deathVelocityY = -Math.sin(hitAngle) * 1.5;
    } else if (this.deathType === 'ragdoll') {
      this.deathRotation = (Math.random() - 0.5) * 0.3;
      this.deathVelocityX = (Math.random() - 0.5) * 3;
      this.deathVelocityY = (Math.random() - 0.5) * 3;
    }
  }

  updateDeath() {
    if (!this.dying) return false;

    this.deathProgress += 0.05; // Animation speed

    // Update based on death type
    switch (this.deathType) {
      case 'fall_forward':
      case 'fall_back':
        this.x += this.deathVelocityX;
        this.y += this.deathVelocityY;
        this.deathVelocityX *= 0.9; // Friction
        this.deathVelocityY *= 0.9;
        break;

      case 'ragdoll':
        this.x += this.deathVelocityX;
        this.y += this.deathVelocityY;
        this.deathVelocityX *= 0.95;
        this.deathVelocityY *= 0.95;
        this.deathRotation += 0.1;
        break;

      case 'explode':
        // Stays in place, just fades/expands
        break;

      case 'dissolve':
        // Stays in place, dissolves
        break;
    }

    // Death complete after progress >= 1
    return this.deathProgress >= 1;
  }

  drawDeath(ctx) {
    if (!this.dying) return;

    const alpha = 1 - this.deathProgress;
    ctx.save();
    ctx.globalAlpha = alpha;

    switch (this.deathType) {
      case 'fall_forward':
        // Rotate and fall forward
        ctx.translate(this.x, this.y);
        ctx.rotate(this.deathProgress * Math.PI / 2);
        ctx.translate(-this.x, -this.y);
        this.draw(ctx);
        break;

      case 'fall_back':
        // Rotate and fall backward
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.deathProgress * Math.PI / 2);
        ctx.translate(-this.x, -this.y);
        this.draw(ctx);
        break;

      case 'explode':
        // Scale up and fade out
        const scale = 1 + this.deathProgress * 1.5;
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);
        ctx.translate(-this.x, -this.y);
        this.draw(ctx);

        // Red explosion effect
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * scale * 1.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'dissolve':
        // Shrink and fade
        const shrink = 1 - this.deathProgress * 0.7;
        ctx.translate(this.x, this.y);
        ctx.scale(shrink, shrink);
        ctx.translate(-this.x, -this.y);
        this.draw(ctx);

        // Green dissolve particles
        if (Math.random() < 0.5) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = '#0f0';
          const px = this.x + (Math.random() - 0.5) * this.size * 2;
          const py = this.y + (Math.random() - 0.5) * this.size * 2;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'ragdoll':
        // Spin and fly
        ctx.translate(this.x, this.y);
        ctx.rotate(this.deathRotation * this.deathProgress * 10);
        ctx.translate(-this.x, -this.y);
        this.draw(ctx);
        break;
    }

    ctx.restore();
  }
}

