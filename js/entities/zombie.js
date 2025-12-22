class Zombie {
  constructor(canvas, type = 'normal') {
    this.canvas = canvas;
    this.type = type;
    const config = CONFIG.ZOMBIES[type.toUpperCase()] || CONFIG.ZOMBIES.NORMAL;
    this.size = config.SIZE;
    this.speed = config.SPEED;
    this.baseSpeed = config.SPEED; // Store base speed for fortress collision slowdown
    this.health = config.HEALTH;
    this.maxHealth = config.HEALTH;
    this.lastX = 0;
    this.lastY = 0;
    this.stuckTimer = 0;
    this.elite = Math.random() < CONFIG.ZOMBIES.ELITE_CHANCE;
    this.variant = Math.random() < CONFIG.ZOMBIES.VARIANT_CHANCE ? 'hat' : null;

    // Damage/missing limbs (calculated once, not every frame)
    this.hasLeftArm = Math.random() > 0.25;
    this.hasRightArm = Math.random() > 0.25;

    // Death animation system
    this.dying = false;
    this.deathProgress = 0;
    this.deathType = null;
    this.deathRotation = 0;
    this.deathVelocityX = 0;
    this.deathVelocityY = 0;

    // Walk animation
    this.walkCycle = Math.random() * Math.PI * 2; // Random start phase
    this.walkBob = 0;
    this.headTilt = 0;
    this.armSwing = 0;

    // Boss-specific
    if (type === 'boss') {
      this.minionInterval = CONFIG.ZOMBIES.BOSS.MINION_INTERVAL;
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

    this.x += (dx / dist) * this.speed;
    this.y += (dy / dist) * this.speed;

    // Update walk animation (speed-based)
    const isMoving = Math.abs(this.x - this.lastX) > 0.1 || Math.abs(this.y - this.lastY) > 0.1;
    if (isMoving) {
      // Type-specific walk speeds
      let walkSpeed = 0.15;
      if (this.type === 'runner') walkSpeed = 0.3; // Fast shamble
      if (this.type === 'tank') walkSpeed = 0.08; // Slow lumber
      if (this.type === 'boss') walkSpeed = 0.05; // Slow menacing

      this.walkCycle += walkSpeed;

      // Body bob (up and down motion)
      if (this.type === 'tank') {
        this.walkBob = Math.sin(this.walkCycle) * 3; // Heavy stomp
      } else if (this.type === 'runner') {
        this.walkBob = Math.sin(this.walkCycle * 1.5) * 2; // Quick bob
      } else {
        this.walkBob = Math.sin(this.walkCycle) * 1.5; // Normal shamble
      }

      // Head tilt (side to side sway)
      this.headTilt = Math.sin(this.walkCycle * 0.7) * 0.15;

      // Arm swing
      this.armSwing = Math.sin(this.walkCycle) * 8;
    }

    // Check collision with player
    const collisionDist = dist < (this.size + CONFIG.PLAYER.SIZE);
    if (collisionDist && !shieldActive) {
      return CONFIG.ZOMBIES.DAMAGE_PER_FRAME; // Return damage dealt
    }

    // Anti-stuck system
    const moved = Math.hypot(this.x - this.lastX, this.y - this.lastY);
    if (moved < 0.5) {
      this.stuckTimer++;
      if (this.stuckTimer > CONFIG.ZOMBIES.STUCK_THRESHOLD) {
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
    // Boss rendering
    if (this.type === 'boss') {
      this.drawBoss(ctx);
      return;
    }

    // Type-specific zombie rendering
    switch (this.type) {
      case 'tank': this.drawTank(ctx); break;
      case 'runner': this.drawRunner(ctx); break;
      case 'explosive': this.drawExplosive(ctx); break;
      case 'healer': this.drawHealer(ctx); break;
      default: this.drawNormal(ctx);
    }
  }

  drawBoss(ctx) {
    // BOSS - Multi-headed monstrosity
    const pulse = Math.sin(performance.now() / 200) * 0.1;

    // Boss aura glow removed - using particles instead

    // Main grotesque body (irregular shape)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 1.2, this.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#600';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Exposed ribs/spine
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.size * 0.5 + i * this.size * 0.3, this.size * 0.7, Math.PI, 0);
      ctx.stroke();
    }

    // Three glowing red eyes (mutated)
    const eyes = [
      { x: -this.size * 0.3, y: -this.size * 0.3 },
      { x: this.size * 0.3, y: -this.size * 0.3 },
      { x: 0, y: -this.size * 0.6 }
    ];
    eyes.forEach(eye => {
      // Eye glow
      ctx.fillStyle = 'rgba(255,0,0,0.6)';
      ctx.beginPath();
      ctx.arc(this.x + eye.x, this.y + eye.y, 8, 0, Math.PI * 2);
      ctx.fill();
      // Eye core
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(this.x + eye.x, this.y + eye.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Tentacles/extra limbs
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 / 4) * i + performance.now() / 1000;
      const tentacleLen = this.size * 1.5;
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.quadraticCurveTo(
        this.x + Math.cos(angle) * tentacleLen * 0.5,
        this.y + Math.sin(angle) * tentacleLen * 0.5 + Math.sin(performance.now() / 300 + i) * 10,
        this.x + Math.cos(angle) * tentacleLen,
        this.y + Math.sin(angle) * tentacleLen
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
    // TANK - Hulking muscular body
    const color = this.elite ? '#0ff' : '#663366';
    const bodyY = this.y + this.walkBob;

    // Elite aura
    this.drawEliteAura(ctx, bodyY);

    // Massive shoulders
    ctx.fillStyle = color;
    ctx.fillRect(this.x - this.size * 1.2, bodyY - this.size * 0.6, this.size * 2.4, this.size * 0.8);

    // Huge torso (wider body)
    ctx.fillRect(this.x - this.size * 0.9, bodyY - this.size * 0.2, this.size * 1.8, this.size * 1.4);

    // Bulging muscles (abs)
    ctx.fillStyle = '#551155';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(this.x - this.size * 0.3, bodyY + i * this.size * 0.4, this.size * 0.6, this.size * 0.35);
    }

    // Small head (hunched) with tilt
    ctx.fillStyle = '#8a668a';
    ctx.save();
    ctx.translate(this.x, bodyY - this.size * 0.8);
    ctx.rotate(this.headTilt * 0.5); // Slow head sway for tank
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Angry eyes
    ctx.fillStyle = '#ff0';
    ctx.fillRect(-4, 0, 3, 3);
    ctx.fillRect(1, 0, 3, 3);
    ctx.restore();

    // HUGE dragging arms (with animated swing)
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    if (this.hasLeftArm) {
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * 1.1, bodyY - this.size * 0.2);
      ctx.lineTo(this.x - this.size * 1.8 + this.armSwing * 0.5, bodyY + this.size * 1.2);
      ctx.stroke();
    }
    if (this.hasRightArm) {
      ctx.beginPath();
      ctx.moveTo(this.x + this.size * 1.1, bodyY - this.size * 0.2);
      ctx.lineTo(this.x + this.size * 1.8 - this.armSwing * 0.5, bodyY + this.size * 1.2);
      ctx.stroke();
    }

    this.drawHealthBar(ctx);
  }

  drawRunner(ctx) {
    // RUNNER - Lean sprinting body
    const color = this.elite ? '#0ff' : '#aaa04a';
    const bodyY = this.y + this.walkBob;

    // Elite aura
    this.drawEliteAura(ctx, bodyY);

    // Lean forward posture (speed lines - more dynamic)
    ctx.strokeStyle = 'rgba(170,160,74,0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const lineOffset = Math.sin(this.walkCycle + i) * 3; // Animated speed lines
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * 1.5 - i * 5, bodyY + lineOffset);
      ctx.lineTo(this.x - this.size * 2.5 - i * 5, bodyY + lineOffset);
      ctx.stroke();
    }

    // Skinny body (athletic build) - lean forward
    const leanAngle = 0.1; // Forward lean
    ctx.save();
    ctx.translate(this.x, bodyY);
    ctx.rotate(leanAngle);

    ctx.fillStyle = color;
    ctx.fillRect(-this.size * 0.5, -this.size * 0.4, this.size, this.size * 1.4);

    // Torn running shirt
    ctx.fillStyle = '#888';
    ctx.fillRect(-this.size * 0.4, -this.size * 0.3, this.size * 0.8, this.size * 0.8);
    // Rips in shirt
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-this.size * 0.2, 0);
    ctx.lineTo(this.size * 0.2, this.size * 0.3);
    ctx.stroke();
    ctx.restore();

    // Head (leaning forward) with wild shaking
    ctx.fillStyle = '#c0c09a';
    ctx.save();
    ctx.translate(this.x + this.size * 0.2, bodyY - this.size * 0.7);
    ctx.rotate(this.headTilt * 1.5); // Wild head movement
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Wild eyes
    ctx.fillStyle = '#f00';
    ctx.fillRect(-this.size * 0.15, 0, 2, 3);
    ctx.fillRect(this.size * 0.05, 0, 2, 3);
    ctx.restore();

    // Thin reaching arms (pumping motion)
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    if (this.hasLeftArm) {
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * 0.4, bodyY);
      ctx.lineTo(this.x - this.size * 1.2, bodyY - this.size * 0.2 - this.armSwing);
      ctx.stroke();
    }
    if (this.hasRightArm) {
      ctx.beginPath();
      ctx.moveTo(this.x + this.size * 0.4, bodyY);
      ctx.lineTo(this.x + this.size * 1.4, bodyY + this.armSwing);
      ctx.stroke();
    }

    this.drawHealthBar(ctx);
  }

  drawExplosive(ctx) {
    // EXPLOSIVE - Bloated pulsing body
    const color = this.elite ? '#0ff' : '#993333';
    const pulse = Math.sin(performance.now() / 150) * 0.15;
    const bodyY = this.y + this.walkBob;

    // Elite aura
    this.drawEliteAura(ctx, bodyY);

    // Explosive warning glow removed - using particles instead

    // Bloated body (bigger) with wobble
    ctx.fillStyle = color;
    ctx.save();
    ctx.translate(this.x, bodyY);
    ctx.rotate(this.headTilt * 0.3); // Slight wobble
    ctx.beginPath();
    ctx.arc(0, 0, this.size * (1.1 + pulse * 0.5), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Pulsing red veins (warning)
    ctx.strokeStyle = `rgba(255,0,0,${0.7 + pulse})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 / 4) * i;
      ctx.beginPath();
      ctx.moveTo(this.x, bodyY);
      ctx.lineTo(
        this.x + Math.cos(angle) * this.size * 0.8,
        bodyY + Math.sin(angle) * this.size * 0.8
      );
      ctx.stroke();
    }

    // Bulging weak spots (glowing)
    ctx.fillStyle = `rgba(255,255,0,${0.6 + pulse})`;
    ctx.beginPath();
    ctx.arc(this.x - this.size * 0.4, bodyY, this.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + this.size * 0.4, bodyY, this.size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Small head with shake
    ctx.fillStyle = '#c08080';
    ctx.save();
    ctx.translate(this.x, bodyY - this.size * 0.8);
    ctx.rotate(this.headTilt);
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Distressed eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(-4, 0, 2, 4);
    ctx.fillRect(2, 0, 2, 4);
    ctx.restore();

    // Unstable arms (with walk swing + random twitch)
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    if (this.hasLeftArm) {
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * 0.7, bodyY);
      ctx.lineTo(this.x - this.size * 1.0, bodyY + this.size * 0.5 + this.armSwing * 0.3);
      ctx.stroke();
    }
    if (this.hasRightArm) {
      ctx.beginPath();
      ctx.moveTo(this.x + this.size * 0.7, bodyY);
      ctx.lineTo(this.x + this.size * 1.0, bodyY + this.size * 0.5 - this.armSwing * 0.3);
      ctx.stroke();
    }

    this.drawHealthBar(ctx);
  }

  drawHealer(ctx) {
    // HEALER - Emaciated dripping body
    const color = this.elite ? '#0ff' : '#66cccc';
    const bodyY = this.y + this.walkBob;

    // Elite aura
    this.drawEliteAura(ctx, bodyY);

    // Healer aura glow removed - using particles instead

    // Skeletal thin body (hunched over)
    ctx.fillStyle = color;
    ctx.save();
    ctx.translate(this.x, bodyY);
    ctx.rotate(this.headTilt * 0.2);
    ctx.fillRect(-this.size * 0.4, -this.size * 0.3, this.size * 0.8, this.size * 1.2);

    // Visible ribs
    ctx.strokeStyle = '#448888';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-this.size * 0.3, -this.size * 0.2 + i * this.size * 0.3);
      ctx.lineTo(this.size * 0.3, -this.size * 0.2 + i * this.size * 0.3);
      ctx.stroke();
    }

    // Glowing green pustules (healing source) - pulsing
    ctx.fillStyle = '#0f0';
    ctx.beginPath();
    ctx.arc(-this.size * 0.3, 0, this.size * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.size * 0.3, this.size * 0.4, this.size * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Gaunt head (with sway)
    ctx.fillStyle = '#8ac8c8';
    ctx.save();
    ctx.translate(this.x, bodyY - this.size * 0.6);
    ctx.rotate(this.headTilt * 0.8); // Droopy head sway
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Hollow eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-3, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Thin drooping arms (swaying)
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    if (this.hasLeftArm) {
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * 0.4, bodyY);
      ctx.lineTo(this.x - this.size * 0.6 - this.armSwing * 0.2, bodyY + this.size * 0.8);
      ctx.stroke();
    }
    if (this.hasRightArm) {
      ctx.beginPath();
      ctx.moveTo(this.x + this.size * 0.4, bodyY);
      ctx.lineTo(this.x + this.size * 0.6 + this.armSwing * 0.2, bodyY + this.size * 0.8);
      ctx.stroke();
    }

    // Dripping green ooze particles
    if (Math.random() < 0.3) {
      ctx.fillStyle = 'rgba(0,255,100,0.6)';
      ctx.beginPath();
      ctx.arc(this.x + (Math.random() - 0.5) * this.size, bodyY + this.size, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    this.drawHealthBar(ctx);
  }

  drawNormal(ctx) {
    // NORMAL - Basic alien scout ship
    const color = this.elite ? '#0ff' : '#4488ff';
    const bodyY = this.y + this.walkBob;

    // Elite aura
    this.drawEliteAura(ctx, bodyY);

    // Main hull
    ctx.fillStyle = '#334466';
    ctx.fillRect(this.x - this.size * 0.5, bodyY - this.size * 0.3, this.size, this.size * 1.2);
    // Energy core
    ctx.fillStyle = '#0088ff';
    ctx.fillRect(this.x - this.size * 0.1, bodyY - this.size * 0.2, this.size * 0.2, this.size * 0.8);

    // Ship body
    ctx.fillStyle = color;
    ctx.fillRect(this.x - this.size * 0.6, bodyY - this.size * 0.5, this.size * 1.2, this.size * 1.4);

    // Cockpit
    ctx.fillStyle = '#6699ff';
    ctx.save();
    ctx.translate(this.x, bodyY - this.size * 0.6);
    ctx.rotate(0.3 + this.headTilt);
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Engine lights
    ctx.fillStyle = '#0ff';
    ctx.fillRect(-4, 0, 2, 2);
    ctx.fillRect(2, 0, 2, 2);
    ctx.restore();

    // Wing thrusters
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    if (this.hasLeftArm) {
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * 0.6, bodyY);
      ctx.lineTo(this.x - this.size * 1.0, bodyY + this.size * 0.4 + this.armSwing * 0.3);
      ctx.stroke();
    }
    if (this.hasRightArm) {
      ctx.beginPath();
      ctx.moveTo(this.x + this.size * 0.6, bodyY);
      ctx.lineTo(this.x + this.size * 1.0, bodyY + this.size * 0.4 - this.armSwing * 0.3);
      ctx.stroke();
    }

    // Antenna variant
    if (this.variant === 'hat') {
      ctx.fillStyle = '#0088ff';
      ctx.fillRect(this.x - this.size * 0.5, bodyY - this.size * 0.95, this.size, 4);
      ctx.fillRect(this.x - this.size * 0.3, bodyY - this.size * 1.1, this.size * 0.6, 6);
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

