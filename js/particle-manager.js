// Particle Manager - Handles all particle systems

class ParticleManager {
  constructor() {
    // Initialize all particle pools
    this.dustParticles = new ParticlePool(CONFIG.POOL.PARTICLES_SIZE);
    this.trailParticles = new ParticlePool(CONFIG.POOL.PARTICLES_SIZE);
    this.sparkleParticles = new ParticlePool(CONFIG.POOL.PARTICLES_SIZE);
    this.debrisParticles = new ParticlePool(CONFIG.POOL.PARTICLES_SIZE);
    this.speedEnergyParticles = new ParticlePool(CONFIG.POOL.PARTICLES_SIZE);
    this.multishotParticles = new ParticlePool(CONFIG.POOL.PARTICLES_SIZE);
    this.healParticles = new ParticlePool(CONFIG.POOL.PARTICLES_SIZE);
    // Enemy-specific particle pools
    this.eliteAuraParticles = new ParticlePool(CONFIG.POOL.PARTICLES_SIZE);
    this.bossAuraParticles = new ParticlePool(CONFIG.POOL.PARTICLES_SIZE);
    this.explosiveGlowParticles = new ParticlePool(CONFIG.POOL.PARTICLES_SIZE);
    this.healerAuraParticles = new ParticlePool(CONFIG.POOL.PARTICLES_SIZE);
    // Player rank particles
    this.rankParticles = new ParticlePool(CONFIG.POOL.PARTICLES_SIZE);
  }

  // Spawn dust particles (footsteps)
  spawnDust(x, y) {
    for (let i = 0; i < 2; i++) {
      this.dustParticles.add({
        x: x + (Math.random() - 0.5) * 10,
        y: y + 10,
        dx: (Math.random() - 0.5) * 0.5,
        dy: Math.random() * 0.3,
        life: CONFIG.PARTICLES.DUST_LIFETIME,
        maxLife: CONFIG.PARTICLES.DUST_LIFETIME,
        size: Math.random() * 2 + 1,
        color: 'rgba(200, 200, 200, 0.3)'
      });
    }
  }

  // Spawn speed trail particles (legacy - keeping for compatibility)
  spawnSpeedTrail(x, y) {
    this.trailParticles.add({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      life: CONFIG.PARTICLES.TRAIL_LIFETIME,
      maxLife: CONFIG.PARTICLES.TRAIL_LIFETIME,
      size: Math.random() * 3 + 2,
      color: 'rgba(255, 165, 0, 0.5)'
    });
  }

  // Spawn speed energy particles (motion streaks)
  spawnSpeedEnergy(x, y, vx, vy) {
    // Spawn motion streaks trailing behind player
    if (vx === 0 && vy === 0) return; // No movement, no particles
    
    const moveAngle = Math.atan2(vy, vx);
    for (let i = 0; i < 3; i++) {
      const trailAngle = moveAngle + Math.PI + (Math.random() - 0.5) * 0.4; // Behind player
      const speed = Math.random() * 2 + 1.5;
      const offset = Math.random() * 15;
      
      this.speedEnergyParticles.add({
        x: x + Math.cos(moveAngle + Math.PI) * offset,
        y: y + Math.sin(moveAngle + Math.PI) * offset,
        dx: Math.cos(trailAngle) * speed,
        dy: Math.sin(trailAngle) * speed,
        life: 20,
        maxLife: 20,
        size: Math.random() * 3 + 2,
        color: `rgba(255, ${165 + Math.random() * 50}, 0, 0.8)`,
        type: 'speed'
      });
    }
  }

  // Spawn multishot energy particles (bullet sparks)
  spawnMultishotEnergy(x, y, angle) {
    // Spawn energy bursts from gun area
    for (let i = 0; i < 5; i++) {
      const spread = (Math.random() - 0.5) * 0.5;
      const sparkAngle = angle + spread;
      const speed = Math.random() * 2 + 1;
      const gunX = x + Math.cos(angle) * 25;
      const gunY = y + Math.sin(angle) * 25;
      
      this.multishotParticles.add({
        x: gunX,
        y: gunY,
        dx: Math.cos(sparkAngle) * speed,
        dy: Math.sin(sparkAngle) * speed,
        life: 15,
        maxLife: 15,
        size: Math.random() * 2 + 1,
        color: `rgba(255, 255, ${Math.random() * 100}, 0.9)`,
        type: 'multishot'
      });
    }
  }

  // Spawn heal plus sign particles
  spawnHealPlus(x, y) {
    // Spawn green plus signs floating upward
    for (let i = 0; i < 8; i++) {
      const offsetX = (Math.random() - 0.5) * 30;
      const offsetY = (Math.random() - 0.5) * 30;
      
      this.healParticles.add({
        x: x + offsetX,
        y: y + offsetY,
        dx: (Math.random() - 0.5) * 0.5,
        dy: -Math.random() * 1.5 - 0.5,
        life: 40,
        maxLife: 40,
        size: 8,
        color: `rgba(0, 255, ${100 + Math.random() * 50}, 0.9)`,
        type: 'heal',
        rotation: Math.random() * Math.PI * 2
      });
    }
  }

  // Spawn rank-up sparkles
  spawnRankUpSparkles(x, y, color) {
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 / 15) * i;
      const speed = Math.random() * 2 + 1;
      this.sparkleParticles.add({
        x,
        y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: CONFIG.PARTICLES.SPARKLE_LIFETIME,
        maxLife: CONFIG.PARTICLES.SPARKLE_LIFETIME,
        size: Math.random() * 3 + 2,
        color: color
      });
    }
  }

  // Spawn directional debris spray
  spawnDebrisSpray(x, y, hitAngle, count, isBoss = false, isHealer = false) {
    const particleCount = count || (isBoss ? 30 : 12);
    const baseColor = isHealer ? 'rgba(0,180,100,0.7)' : 'rgba(150,150,150,0.7)'; // Gray debris instead of red blood

    for (let i = 0; i < particleCount; i++) {
      // Spray in the hit direction (away from player)
      const spread = Math.PI / 3; // 60 degree spread
      const angle = hitAngle + (Math.random() - 0.5) * spread;
      const speed = Math.random() * 4 + 2;
      const size = isBoss ? Math.random() * 3 + 3 : Math.random() * 2 + 1;

      this.debrisParticles.add({
        x,
        y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: CONFIG.PARTICLES.DEBRIS_LIFETIME,
        maxLife: CONFIG.PARTICLES.DEBRIS_LIFETIME,
        size: size,
        color: baseColor
      });
    }
  }

  // Spawn boss explosion ring
  spawnBossExplosionRing(x, y) {
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 / 20) * i;
      const speed = Math.random() * 2 + 3;
      this.debrisParticles.add({
        x,
        y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: CONFIG.PARTICLES.DEBRIS_LIFETIME * 1.5,
        maxLife: CONFIG.PARTICLES.DEBRIS_LIFETIME * 1.5,
        size: 5,
        color: 'rgba(255,200,0,0.8)' // Orange/yellow explosion debris
      });
    }
  }

  // Spawn player rank particles (orbiting glow effect)
  spawnRankParticles(x, y, rankColor) {
    // Spawn a few particles each time to create continuous orbiting effect
    const particleCount = 2; // Spawn 2 particles per call for smooth effect
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / 8) * (this.rankParticles.particles.length % 8) + performance.now() / 500;
      const radius = 30;
      
      this.rankParticles.add({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        dx: 0,
        dy: 0,
        life: 60,
        maxLife: 60,
        size: Math.random() * 3 + 2,
        color: rankColor,
        angle: angle,
        radius: radius,
        centerX: x,
        centerY: y
      });
    }
  }

  // Spawn elite zombie aura particles (rotating energy rings)
  spawnEliteAura(x, y) {
    // Spawn a few particles each time for smooth rotating effect
    const particleCount = 2;
    for (let i = 0; i < particleCount; i++) {
      const baseAngle = (Math.PI * 2 / 12) * (this.eliteAuraParticles.particles.length % 12);
      const angle = baseAngle + performance.now() / 800;
      const radius = 38;
      
      this.eliteAuraParticles.add({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        dx: 0,
        dy: 0,
        life: 80,
        maxLife: 80,
        size: 3,
        color: 'rgba(0,255,255,0.8)',
        angle: baseAngle,
        radius: radius,
        centerX: x,
        centerY: y
      });
    }
  }

  // Spawn boss aura particles (dark pulsing energy bursts)
  spawnBossAura(x, y) {
    // Spawn a few particles each time for smooth pulsing effect
    const particleCount = 3;
    for (let i = 0; i < particleCount; i++) {
      const baseAngle = (Math.PI * 2 / 16) * (this.bossAuraParticles.particles.length % 16);
      const angle = baseAngle + performance.now() / 1000;
      const radius = 50;
      
      this.bossAuraParticles.add({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        dx: 0,
        dy: 0,
        life: 100,
        maxLife: 100,
        size: 4,
        color: 'rgba(100,0,0,0.7)',
        angle: baseAngle,
        radius: radius,
        centerX: x,
        centerY: y,
        pulse: true,
        type: 'boss'
      });
    }
  }

  // Spawn explosive zombie glow particles (warning pulses)
  spawnExplosiveGlow(x, y) {
    // Spawn a few particles each time for pulsing effect
    const particleCount = 2;
    for (let i = 0; i < particleCount; i++) {
      const baseAngle = (Math.PI * 2 / 10) * (this.explosiveGlowParticles.particles.length % 10);
      const angle = baseAngle;
      const radius = 30;
      
      this.explosiveGlowParticles.add({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        dx: 0,
        dy: 0,
        life: 50,
        maxLife: 50,
        size: 3,
        color: 'rgba(255,100,0,0.7)',
        angle: baseAngle,
        radius: radius,
        centerX: x,
        centerY: y,
        pulse: true,
        type: 'explosive'
      });
    }
  }

  // Spawn healer zombie aura particles (floating healing energy)
  spawnHealerAura(x, y) {
    // Spawn a few floating particles each time
    const particleCount = 2;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / 6) * (this.healerAuraParticles.particles.length % 6);
      const offset = Math.sin(performance.now() / 200 + i) * 5;
      
      this.healerAuraParticles.add({
        x: x + Math.cos(angle) * (25 + offset),
        y: y + Math.sin(angle) * (25 + offset),
        dx: 0,
        dy: -0.3,
        life: 40,
        maxLife: 40,
        size: Math.random() * 2 + 2,
        color: `rgba(0,255,${150 + Math.random() * 50},0.7)`,
        float: true
      });
    }
  }

  // Update all particles
  update() {
    this.dustParticles.update();
    this.trailParticles.update();
    this.sparkleParticles.update();
    this.debrisParticles.update();
    this.speedEnergyParticles.update();
    this.multishotParticles.update();
    this.healParticles.update();
    // New particle systems
    this.rankParticles.update();
    this.eliteAuraParticles.update();
    this.bossAuraParticles.update();
    this.explosiveGlowParticles.update();
    this.healerAuraParticles.update();
  }

  // Draw all particles
  draw(ctx) {
    this.dustParticles.draw(ctx);
    this.trailParticles.draw(ctx);
    this.debrisParticles.draw(ctx);
    this.speedEnergyParticles.draw(ctx);
    this.multishotParticles.draw(ctx);
    this.healParticles.draw(ctx);
    // Draw enemy aura particles before sparkles (below player and other effects)
    this.eliteAuraParticles.draw(ctx);
    this.bossAuraParticles.draw(ctx);
    this.explosiveGlowParticles.draw(ctx);
    this.healerAuraParticles.draw(ctx);
    // Draw rank particles after enemies but before sparkles
    this.rankParticles.draw(ctx);
    this.sparkleParticles.draw(ctx); // Draw sparkles last (on top)
  }

  // Clear all particles
  clear() {
    this.dustParticles.clear();
    this.trailParticles.clear();
    this.sparkleParticles.clear();
    this.debrisParticles.clear();
    this.speedEnergyParticles.clear();
    this.multishotParticles.clear();
    this.healParticles.clear();
    this.rankParticles.clear();
    this.eliteAuraParticles.clear();
    this.bossAuraParticles.clear();
    this.explosiveGlowParticles.clear();
    this.healerAuraParticles.clear();
  }
}
