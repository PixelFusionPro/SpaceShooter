# Ammunition Special Effects - Implementation TODO

## Overview
Ammunition items define special effects (ice, fire, poison, electric, explosive, armor piercing, critical) but these are not yet fully implemented in the game engine.

## Current Status
✅ **Implemented:**
- Ammunition damage bonuses (work correctly)
- Ammunition piercing values (work correctly)
- Weapon compatibility checking (works correctly)
- Ammunition consumption tracking (works correctly)

❌ **Not Implemented:**
- Ice slow effect
- Fire burn damage over time
- Poison damage over time
- Electric chain damage
- Explosive AOE damage
- Armor piercing percentage
- Critical chance from hollow point rounds
- Visual effects (bullet colors, trails, particles)

## What Needs To Be Done

### 1. Add Status Effect System to Enemies
**File**: `js/entities/enemy-ship.js`

Add properties to EnemyShip class:
```javascript
constructor() {
  // ... existing code ...
  this.statusEffects = []; // Array of active status effects
  this.slowMultiplier = 1.0; // Movement speed multiplier
}

applyStatusEffect(effectType, value, duration) {
  const now = Date.now();
  this.statusEffects.push({
    type: effectType,
    value: value,
    expiresAt: now + duration
  });
}

updateStatusEffects() {
  const now = Date.now();

  // Remove expired effects
  this.statusEffects = this.statusEffects.filter(e => e.expiresAt > now);

  // Apply active effects
  this.slowMultiplier = 1.0;
  this.statusEffects.forEach(effect => {
    switch(effect.type) {
      case 'ice':
        this.slowMultiplier *= (1 - effect.value); // 30% slow = 0.7x speed
        break;
      case 'fire':
      case 'poison':
        this.health -= effect.value / 60; // Damage per frame
        break;
    }
  });
}
```

### 2. Apply Ammo Effects on Bullet Hit
**File**: `js/game.js` - `onEnemyHit()` method

```javascript
onEnemyHit(enemy, index, damageDealt) {
  // ... existing code ...

  // Apply ammo special effects
  const equipped = this.inventoryManager.getEquippedItems();
  if (equipped.ammo) {
    const ammoItem = this.shopManager.getItem(equipped.ammo);
    if (ammoItem && ammoItem.effect) {
      const effect = ammoItem.effect;

      switch(effect.type) {
        case 'ice':
          enemy.applyStatusEffect('ice', effect.value, effect.duration);
          break;
        case 'fire':
          enemy.applyStatusEffect('fire', effect.value, effect.duration);
          break;
        case 'poison':
          enemy.applyStatusEffect('poison', effect.value, effect.duration);
          break;
        case 'electric':
          // Chain to nearby enemies
          this.applyChainDamage(enemy, effect.value, damageDealt);
          break;
        case 'explosive':
          // AOE damage
          this.applyExplosiveDamage(enemy.x, enemy.y, effect.value, damageDealt);
          break;
        case 'armor_piercing':
          // Increase damage based on armor pen %
          // (Needs armor system on enemies first)
          break;
        case 'critical':
          // Roll for critical hit
          if (Math.random() < effect.value) {
            damageDealt *= 2; // Apply crit multiplier
          }
          break;
      }
    }
  }
}
```

### 3. Apply Bullet Visual Effects
**File**: `js/entities/bullet.js`

Add ammo visual properties:
```javascript
constructor(x, y, dx, dy, damage, piercing, ammoData) {
  // ... existing code ...

  // Apply ammo visuals if provided
  if (ammoData) {
    this.color = ammoData.color || '#00ffff';
    this.trailColor = ammoData.trailColor || '#0088ff';
    this.particleType = ammoData.particleType;
    this.size *= (ammoData.size || 1.0);
  }
}

draw(ctx) {
  // Use this.color instead of hardcoded color
  // Use this.trailColor for glow
  // Spawn particles if this.particleType is set
}
```

### 4. Update autoShoot() to Pass Ammo Data
**File**: `js/game.js` - `autoShoot()` method

```javascript
autoShoot() {
  // ... existing code ...

  // Get ammo visual data
  let ammoVisuals = null;
  if (ammoConsumed && ammoType) {
    ammoVisuals = {
      color: ammoType.color,
      trailColor: ammoType.trailColor,
      particleType: ammoType.particleType,
      size: ammoType.size
    };
  }

  // Create bullets with ammo data
  const bullet = this.bulletPool.get();
  bullet.init(x, y, dx, dy, damage, piercing, ammoVisuals);
}
```

### 5. Add Helper Methods for Special Effects
**File**: `js/game.js`

```javascript
applyChainDamage(sourceEnemy, chainCount, baseDamage) {
  const chainRange = 100; // pixels
  const chainDamage = baseDamage * 0.5; // 50% damage to chained enemies
  let chained = 0;

  this.enemyManager.enemies.forEach(enemy => {
    if (enemy === sourceEnemy || enemy.dying) return;
    if (chained >= chainCount) return;

    const dist = Math.hypot(enemy.x - sourceEnemy.x, enemy.y - sourceEnemy.y);
    if (dist < chainRange) {
      enemy.health -= chainDamage;
      chained++;

      // Visual: draw lightning arc
      this.particleManager.spawnLightningArc(sourceEnemy.x, sourceEnemy.y, enemy.x, enemy.y);
    }
  });
}

applyExplosiveDamage(x, y, radius, baseDamage) {
  const aoeDamage = baseDamage * 0.3; // 30% AOE damage

  this.enemyManager.enemies.forEach(enemy => {
    if (enemy.dying) return;

    const dist = Math.hypot(enemy.x - x, enemy.y - y);
    if (dist < radius) {
      enemy.health -= aoeDamage;

      // Visual: spawn explosion particles
      this.particleManager.spawnExplosion(x, y, radius);
    }
  });
}
```

## Testing Checklist

After implementation, test:
- [ ] Ice rounds slow enemies correctly
- [ ] Fire/poison deals damage over time
- [ ] Electric chains to nearby enemies
- [ ] Explosive creates AOE damage
- [ ] Armor piercing increases damage
- [ ] Critical hits proc at correct rate
- [ ] Bullet colors match ammo type
- [ ] Particle effects display correctly
- [ ] Effects stack/don't stack appropriately
- [ ] Effects expire correctly

## Estimated Time
- Status effect system: 30 minutes
- Ammo effect application: 20 minutes
- Visual effects: 20 minutes
- Helper methods: 30 minutes
- Testing & debugging: 30 minutes
- **Total: ~2 hours**

## Priority
Medium - The ammunition system works functionally (damage, piercing, compatibility). Special effects would enhance gameplay but aren't critical.
