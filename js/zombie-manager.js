// Zombie Manager - Handles zombie array management and updates

class ZombieManager {
  constructor(canvas, particleManager = null) {
    this.canvas = canvas;
    this.particleManager = particleManager;
    this.zombies = [];
    this.killCount = 0;
  }

  // Add zombies from wave spawn
  addZombies(zombieArray) {
    this.zombies.push(...zombieArray);
  }

  // Find nearest zombie to player
  findNearest(playerX, playerY) {
    let nearest = null;
    let minDist = Infinity;

    for (const zombie of this.zombies) {
      // Skip dying zombies
      if (zombie.dying) continue;

      const dist = Math.hypot(zombie.x - playerX, zombie.y - playerY);
      if (dist < minDist) {
        minDist = dist;
        nearest = zombie;
      }
    }
    return nearest;
  }

  // Find priority target for companions (prioritizes elite/boss zombies)
  findPriorityTarget(companionX, companionY, maxRange = 300) {
    let bestTarget = null;
    let bestScore = -Infinity;

    for (const zombie of this.zombies) {
      // Skip dying zombies
      if (zombie.dying) continue;

      const dist = Math.hypot(zombie.x - companionX, zombie.y - companionY);

      // Skip zombies out of range
      if (dist > maxRange) continue;

      // Calculate priority score
      // Higher score = better target
      let score = 0;

      // Priority by type (higher is better)
      if (zombie.type === 'boss') {
        score += 1000; // Highest priority: bosses
      } else if (zombie.type === 'healer') {
        score += 800; // High priority: healers (they buff other zombies)
      } else if (zombie.type === 'explosive') {
        score += 600; // Medium-high priority: explosives are dangerous
      } else if (zombie.type === 'tank') {
        score += 400; // Medium priority: tanks are tanky
      } else if (zombie.type === 'runner') {
        score += 300; // Medium-low priority: runners are fast but weak
      } else {
        score += 100; // Low priority: normal zombies
      }

      // Bonus for elite zombies
      if (zombie.elite) {
        score += 500;
      }

      // Penalty for distance (closer targets are preferred within same priority tier)
      score -= dist * 0.5;

      // Bonus for low health (finish off wounded targets)
      const healthPercent = zombie.health / zombie.maxHealth;
      if (healthPercent < 0.3) {
        score += 200; // Almost dead, prioritize to finish
      }

      if (score > bestScore) {
        bestScore = score;
        bestTarget = zombie;
      }
    }

    // Fallback to nearest if no priority target found in range
    if (!bestTarget) {
      return this.findNearest(companionX, companionY);
    }

    return bestTarget;
  }

  // Update all zombies
  update(playerX, playerY, shieldActive) {
    let totalDamage = 0;

    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const zombie = this.zombies[i];

      // Update death animations
      if (zombie.dying) {
        const finished = zombie.updateDeath();
        if (finished) {
          this.zombies.splice(i, 1);
        }
        continue; // Skip normal update for dying zombies
      }

      // Normal zombie update
      const damage = zombie.update(playerX, playerY, shieldActive);
      if (damage > 0) {
        totalDamage += damage;
      }

      // Spawn aura particles for special zombies
      if (this.particleManager && Math.random() < 0.2) {
        if (zombie.elite) {
          this.particleManager.spawnEliteAura(zombie.x, zombie.y);
        }
        if (zombie.type === 'boss') {
          this.particleManager.spawnBossAura(zombie.x, zombie.y);
        } else if (zombie.type === 'explosive') {
          this.particleManager.spawnExplosiveGlow(zombie.x, zombie.y);
        } else if (zombie.type === 'healer') {
          this.particleManager.spawnHealerAura(zombie.x, zombie.y);
        }
      }

      // Boss minion spawning (with cap)
      if (zombie.type === 'boss' && Date.now() > zombie.nextMinionTime) {
        // Initialize minion count if not set
        if (typeof zombie.minionCount === 'undefined') {
          zombie.minionCount = 0;
        }

        // Only spawn if under cap
        if (zombie.minionCount < CONFIG.ZOMBIES.BOSS.MAX_MINIONS) {
          const minion = new Zombie(this.canvas, 'normal');
          minion.x = zombie.x;
          minion.y = zombie.y;
          minion.isBossMinion = true; // Mark as boss minion
          minion.parentBoss = zombie; // Link to parent boss
          this.zombies.push(minion);
          zombie.minionCount++;
        }
        zombie.nextMinionTime = Date.now() + zombie.minionInterval;
      }
    }

    return totalDamage;
  }

  // Check bullet collisions with zombies
  checkBulletCollisions(bulletPool, onHit) {
    for (const bullet of bulletPool.getInUse()) {
      if (!bullet.active) {
        bulletPool.release(bullet);
        continue;
      }

      let bulletHit = false;
      let shouldReleaseBullet = false;

      // Check collision with zombies
      for (let j = this.zombies.length - 1; j >= 0; j--) {
        const zombie = this.zombies[j];

        // Skip dying zombies
        if (zombie.dying) continue;

        if (bullet.checkCollision(zombie)) {
          bulletHit = true;

          // Apply bullet damage
          const damageDealt = bullet.damage;
          zombie.health -= damageDealt;

          // Mark zombie as pierced
          bullet.markPierced(zombie);

          // Call hit callback with damage amount
          if (onHit) {
            onHit(zombie, j, damageDealt);
          }
          
          // Check if bullet can continue piercing
          if (!bullet.canPierce()) {
            // Bullet has pierced max zombies, release it
            shouldReleaseBullet = true;
            break;
          }
          // Otherwise continue checking for more zombies to pierce
        }
      }
      
      // Release bullet if it hit and can't pierce more
      if (shouldReleaseBullet) {
        bulletPool.release(bullet);
      }
    }
  }

  // Kill a zombie (start death animation)
  killZombie(index, hitAngle, onKill) {
    if (index < 0 || index >= this.zombies.length) return null;

    const zombie = this.zombies[index];
    this.killCount++;

    // If this is a boss minion, decrement parent boss's minion count
    if (zombie.isBossMinion && zombie.parentBoss) {
      if (typeof zombie.parentBoss.minionCount !== 'undefined') {
        zombie.parentBoss.minionCount = Math.max(0, zombie.parentBoss.minionCount - 1);
      }
    }

    // Start death animation
    zombie.startDeath(hitAngle);

    // Call kill callback
    if (onKill) {
      onKill(zombie);
    }

    return zombie;
  }

  // Draw all zombies
  draw(ctx) {
    for (const zombie of this.zombies) {
      if (zombie.dying) {
        zombie.drawDeath(ctx);
      } else {
        zombie.draw(ctx);

        // Draw minion counter for bosses
        if (zombie.type === 'boss') {
          const minionCount = typeof zombie.minionCount !== 'undefined' ? zombie.minionCount : 0;
          const maxMinions = CONFIG.ZOMBIES.BOSS.MAX_MINIONS;
          const remaining = maxMinions - minionCount;

          // Draw counter above boss
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.lineWidth = 2;
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          const text = `⚡${remaining}`;
          ctx.strokeText(text, zombie.x, zombie.y - zombie.size - 5);
          ctx.fillText(text, zombie.x, zombie.y - zombie.size - 5);
          ctx.restore();
        }
      }
    }
  }

  // Get count of alive (non-dying) zombies
  getAliveCount() {
    return this.zombies.filter(z => !z.dying).length;
  }

  // Get total zombie count (including dying)
  getTotalCount() {
    return this.zombies.length;
  }

  // Get kill count
  getKillCount() {
    return this.killCount;
  }

  // Reset for new game
  reset() {
    this.zombies = [];
    this.killCount = 0;
  }
}
