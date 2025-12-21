# Companion System Analysis & Fix

## Current State

### How Companions Work:
1. **Unlocking:** Companions unlock at specific wave milestones:
   - Drone: Wave 10
   - Robot: Wave 25
   - Turret: Wave 50
   - Medic: Wave 75
   - Tank: Wave 100

2. **Spawning:** Companions are auto-spawned when first unlocked during wave completion

3. **Persistence:** Unlocked companions are saved to localStorage

4. **Reset Behavior:** When game resets, companions are cleared and NOT respawned (correct behavior)

5. **Respawn Behavior:** After each wave completion, previously unlocked companions that died are respawned

---

## Correct Behavior

**Companion Spawning Rules:**
1. ✅ Companions ONLY spawn when first unlocked at their specific wave
2. ✅ After being unlocked, companions respawn every wave after completion (if they died)
3. ✅ Companions NEVER spawn on first game load
4. ✅ Companions NEVER spawn before they're unlocked

---

## Implementation

### Companion Unlock & First Spawn ✅
**File:** `js/game.js` (Wave Completion Handler)

**Code:**
```javascript
// Check for companion unlocks
const currentWave = this.waveManager.getWave();
const unlocked = this.companionManager.checkUnlocks(currentWave);
if (unlocked.length > 0) {
  for (const type of unlocked) {
    // Auto-spawn newly unlocked companion at player position
    this.companionManager.spawn(type, this.player.x, this.player.y);
    this.showCompanionUnlockNotification(type);
  }
}
```

### Companion Respawn After Wave Completion ✅
**File:** `js/game.js` (Wave Completion Handler)

**Code:**
```javascript
// Respawn all previously unlocked companions that died during the wave
// (Only respawn if they're unlocked and not already spawned)
const companionTypes = ['drone', 'robot', 'turret', 'medic', 'tank'];
for (const type of companionTypes) {
  if (this.companionManager.isUnlocked(type)) {
    // Check if this companion type is already spawned and alive
    const alreadySpawned = this.companionManager.companions.some(
      c => c.type === type && !c.dying
    );
    if (!alreadySpawned) {
      // Respawn at player position (companion died during wave)
      this.companionManager.spawn(type, this.player.x, this.player.y);
    }
  }
}
```

---

## Companion System Status

### ✅ Working:
- Companions unlock at correct waves
- Companions spawn when first unlocked
- Companions are saved to localStorage
- Companions update and draw correctly
- Companions shoot at zombies
- Companions take damage from zombies
- Companions are restored after wave completion

### ✅ Fixed:
- Companions now respawn after each wave completion if they died (only if previously unlocked)
- Companions do NOT spawn on game start (correct behavior)

---

## Companion Types & Behavior

### 1. Drone (Wave 10)
- **Behavior:** Orbits around player
- **Size:** 6px
- **Speed:** 3.5
- **Damage:** 0.5
- **Health:** 20
- **Fire Rate:** 500ms

### 2. Robot (Wave 25)
- **Behavior:** Follows player at distance
- **Size:** 8px
- **Speed:** 2.0
- **Damage:** 1.0
- **Health:** 40
- **Fire Rate:** 400ms

### 3. Turret (Wave 50)
- **Behavior:** Stationary, shoots at range
- **Size:** 10px
- **Speed:** 0 (stationary)
- **Damage:** 1.5
- **Health:** 60
- **Fire Rate:** 300ms
- **Range:** 150px

### 4. Medic (Wave 75)
- **Behavior:** Follows player closely, heals
- **Size:** 7px
- **Speed:** 2.5
- **Heal Rate:** 0.5 HP per 2 seconds
- **Health:** 30

### 5. Tank (Wave 100)
- **Behavior:** Follows player, taunts zombies
- **Size:** 12px
- **Speed:** 1.5
- **Damage:** 0.8
- **Health:** 100
- **Fire Rate:** 600ms
- **Taunt Radius:** 50px

---

## Summary

**Correct Behavior:**
- Companions spawn ONLY when first unlocked at their specific wave
- After being unlocked, companions respawn after each wave completion if they died
- Companions do NOT spawn on game start/reset
- Companions do NOT spawn before they're unlocked

**Implementation:**
- Removed companion spawning on game reset
- Added companion respawn logic after wave completion
- Companions are restored to full health after each wave (if alive)
- Dead companions are respawned after each wave completion (if unlocked)

