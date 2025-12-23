// Object Pool for Performance Optimization
// Reuses objects instead of creating/destroying them

class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.available = [];
    this.inUse = [];

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.createFn());
    }
  }

  get() {
    let obj;
    if (this.available.length > 0) {
      obj = this.available.pop();
    } else {
      obj = this.createFn();
    }
    this.inUse.push(obj);
    return obj;
  }

  release(obj) {
    const index = this.inUse.indexOf(obj);
    if (index > -1) {
      this.inUse.splice(index, 1);
      this.resetFn(obj);
      this.available.push(obj);
    }
  }

  releaseAll() {
    while (this.inUse.length > 0) {
      this.release(this.inUse[0]);
    }
  }

  getInUse() {
    return this.inUse;
  }
}

// Particle Pool
class ParticlePool {
  constructor(maxSize = 100, manager = null) {
    this.particles = [];
    this.maxSize = maxSize;
    this.manager = manager; // Reference to ParticleManager for quality settings
  }

  add(particle) {
    // Quality control: only add particle based on quality multiplier
    if (this.manager && Math.random() > this.manager.qualityMultiplier) {
      return; // Skip this particle
    }

    if (this.particles.length >= this.maxSize) {
      this.particles.shift(); // Remove oldest
    }
    this.particles.push(particle);
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life--;
      
      // Orbital movement (particles rotating around a center point)
      if (p.angle !== undefined && p.centerX !== undefined && p.centerY !== undefined) {
        p.angle += 0.03; // Rotation speed
        
        // Pulsing effect for boss and explosive particles
        let currentRadius = p.radius;
        if (p.pulse) {
          const pulse = Math.sin(performance.now() / (p.type === 'boss' ? 400 : 150));
          currentRadius = p.radius + pulse * (p.type === 'boss' ? 10 : 8);
        }
        
        p.x = p.centerX + Math.cos(p.angle) * currentRadius;
        p.y = p.centerY + Math.sin(p.angle) * currentRadius;
      }
      // Normal linear movement
      else {
        if (p.dy) p.y += p.dy;
        if (p.dx) p.x += p.dx;
      }
      
      // Float effect (gentle upward drift)
      if (p.float) {
        p.dy = p.dy || 0;
        p.dy -= 0.1;
      }
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color || 'gray';
      
      // Draw plus sign for heal particles
      if (p.type === 'heal') {
        const size = p.size || 8;
        ctx.translate(p.x, p.y);
        if (p.rotation) {
          ctx.rotate(p.rotation);
        }
        // Draw plus sign (vertical and horizontal lines)
        ctx.lineWidth = 2;
        ctx.strokeStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(0, size);
        ctx.moveTo(-size, 0);
        ctx.lineTo(size, 0);
        ctx.stroke();
      } else {
        // Draw circle for other particles
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
  }

  clear() {
    this.particles = [];
  }
}
