// Enemy Manager - Handles enemy array management and updates

class EnemyManager {
  constructor(canvas, particleManager = null) {
    this.canvas = canvas;
    this.particleManager = particleManager;
    this.enemies = [];
    this.killCount = 0;
  }

  // Add enemies from wave spawn
  addEnemies(enemyArray) {
    this.enemies.push(...enemyArray);
  }

  // Find nearest enemy to player
  findNearest(playerX, playerY) {
    let nearest = null;
    let minDist = Infinity;

    for (const enemy of this.enemies) {
      // Skip dying enemies
      if (enemy.dying) continue;

      const dist = Math.hypot(enemy.x - playerX, enemy.y - playerY);
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }
    return nearest;
  }

  // Find priority target for companions (prioritizes elite/boss enemies)
  findPriorityTarget(companionX, companionY, maxRange = 300) {
    let bestTarget = null;
    let bestScore = -Infinity;

    for (const enemy of this.enemies) {
      // Skip dying enemies
      if (enemy.dying) continue;

      const dist = Math.hypot(enemy.x - companionX, enemy.y - companionY);

      // Skip enemies out of range
      if (dist > maxRange) continue;

      // Calculate priority score
      // Higher score = better target
      let score = 0;

      // Priority by type (higher is better)
      if (enemy.type === 'boss') {
        score += 1000; // Highest priority: bosses
      } else if (enemy.type === 'healer') {
        score += 800; // High priority: healers (they buff other enemies)
      } else if (enemy.type === 'explosive') {
        score += 600; // Medium-high priority: explosives are dangerous
      } else if (enemy.type === 'tank') {
        score += 400; // Medium priority: tanks are tanky
      } else if (enemy.type === 'runner') {
        score += 300; // Medium-low priority: runners are fast but weak
      } else {
        score += 100; // Low priority: normal enemies
      }

      // Bonus for elite enemies
      if (enemy.elite) {
        score += 500;
      }

      // Penalty for distance (closer targets are preferred within same priority tier)
      score -= dist * 0.5;

      // Bonus for low health (finish off wounded targets)
      const healthPercent = enemy.health / enemy.maxHealth;
      if (healthPercent < 0.3) {
        score += 200; // Almost dead, prioritize to finish
      }

      if (score > bestScore) {
        bestScore = score;
        bestTarget = enemy;
      }
    }

    // Fallback to nearest if no priority target found in range
    if (!bestTarget) {
      return this.findNearest(companionX, companionY);
    }

    return bestTarget;
  }

  // Update all enemies
  update(playerX, playerY, shieldActive, timeSlowActive = false) {
    let totalDamage = 0;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      // Update death animations
      if (enemy.dying) {
        const finished = enemy.updateDeath();
        if (finished) {
          this.enemies.splice(i, 1);
        }
        continue; // Skip normal update for dying enemies
      }

      // Apply time slow powerup (50% speed reduction)
      const originalSpeed = enemy.speed;
      if (timeSlowActive) {
        enemy.speed = enemy.speed * 0.5;
      }

      // Normal enemy update (pass all enemies for separation)
      const damage = enemy.update(playerX, playerY, shieldActive, this.enemies);

      // Restore original speed after update
      if (timeSlowActive) {
        enemy.speed = originalSpeed;
      }
      if (damage > 0) {
        totalDamage += damage;
      }

      // Spawn aura particles for special enemies
      if (this.particleManager && Math.random() < 0.2) {
        if (enemy.elite) {
          this.particleManager.spawnEliteAura(enemy.x, enemy.y);
        }
        if (enemy.type === 'boss') {
          this.particleManager.spawnBossAura(enemy.x, enemy.y);
        } else if (enemy.type === 'explosive') {
          this.particleManager.spawnExplosiveGlow(enemy.x, enemy.y);
        } else if (enemy.type === 'healer') {
          this.particleManager.spawnHealerAura(enemy.x, enemy.y);
        }
      }

      // Boss minion spawning (with cap and recount)
      if (enemy.type === 'boss' && Date.now() > enemy.nextMinionTime) {
        // Recount actual alive minions for accuracy
        const actualMinions = this.enemies.filter(e =>
          e.isBossMinion && e.parentBoss === enemy && !e.dying
        ).length;
        enemy.minionCount = actualMinions;

        // Only spawn if under cap
        if (enemy.minionCount < CONFIG.ENEMIES.BOSS.MAX_MINIONS) {
          const minion = new EnemyShip(this.canvas, 'normal');
          minion.x = enemy.x;
          minion.y = enemy.y;
          minion.isBossMinion = true; // Mark as boss minion
          minion.parentBoss = enemy; // Link to parent boss
          this.enemies.push(minion);
          enemy.minionCount++;
        }
        enemy.nextMinionTime = Date.now() + enemy.minionInterval;
      }
    }

    return totalDamage;
  }

  // Check bullet collisions with enemies
  checkBulletCollisions(bulletPool, onHit) {
    for (const bullet of bulletPool.getInUse()) {
      if (!bullet.active) {
        bulletPool.release(bullet);
        continue;
      }

      let bulletHit = false;
      let shouldReleaseBullet = false;

      // Check collision with enemies
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];

        // Skip dying enemies
        if (enemy.dying) continue;

        if (bullet.checkCollision(enemy)) {
          bulletHit = true;

          // Apply bullet damage
          const damageDealt = bullet.damage;
          enemy.health -= damageDealt;

          // Mark enemy as pierced
          bullet.markPierced(enemy);

          // Explosive powerup: AoE damage to nearby enemies
          if (bullet.explosivePowerup) {
            const aoeRadius = 80; // AoE radius in pixels
            const aoeDamage = Math.ceil(bullet.damage * 0.5); // 50% of bullet damage

            for (let k = 0; k < this.enemies.length; k++) {
              const nearbyEnemy = this.enemies[k];
              if (nearbyEnemy === enemy || nearbyEnemy.dying) continue;

              const dist = Math.hypot(nearbyEnemy.x - enemy.x, nearbyEnemy.y - enemy.y);
              if (dist <= aoeRadius) {
                nearbyEnemy.health -= aoeDamage;
                // Call hit callback for AoE damage
                if (onHit) {
                  onHit(nearbyEnemy, k, aoeDamage, bullet);
                }
              }
            }
          }

          // Call hit callback with damage amount
          if (onHit) {
            onHit(enemy, j, damageDealt, bullet);
          }
          
          // Check if bullet can continue piercing
          if (!bullet.canPierce()) {
            // Bullet has pierced max enemies, release it
            shouldReleaseBullet = true;
            break;
          }
          // Otherwise continue checking for more enemies to pierce
        }
      }
      
      // Release bullet if it hit and can't pierce more
      if (shouldReleaseBullet) {
        bulletPool.release(bullet);
      }
    }
  }

  // Kill a enemy (start death animation)
  killEnemy(index, hitAngle, onKill) {
    if (index < 0 || index >= this.enemies.length) return null;

    const enemy = this.enemies[index];
    this.killCount++;

    // If this is a boss minion, decrement parent boss's minion count
    if (enemy.isBossMinion && enemy.parentBoss) {
      if (typeof enemy.parentBoss.minionCount !== 'undefined') {
        enemy.parentBoss.minionCount = Math.max(0, enemy.parentBoss.minionCount - 1);
      }
    }

    // Start death animation
    enemy.startDeath(hitAngle);

    // Call kill callback
    if (onKill) {
      onKill(enemy);
    }

    return enemy;
  }

  // Draw all enemies
  draw(ctx) {
    for (const enemy of this.enemies) {
      if (enemy.dying) {
        enemy.drawDeath(ctx);
      } else {
        enemy.draw(ctx);

        // Draw minion counter for bosses
        if (enemy.type === 'boss') {
          const minionCount = typeof enemy.minionCount !== 'undefined' ? enemy.minionCount : 0;
          const maxMinions = CONFIG.ENEMIES.BOSS.MAX_MINIONS;
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
          ctx.strokeText(text, enemy.x, enemy.y - enemy.size - 5);
          ctx.fillText(text, enemy.x, enemy.y - enemy.size - 5);
          ctx.restore();
        }
      }
    }
  }

  // Get count of alive (non-dying) enemies
  getAliveCount() {
    return this.enemies.filter(enemy => !enemy.dying).length;
  }

  // Get total enemy count (including dying)
  getTotalCount() {
    return this.enemies.length;
  }

  // Get kill count
  getKillCount() {
    return this.killCount;
  }

  // Reset for new game
  reset() {
    this.enemies = [];
    this.killCount = 0;
  }
}
