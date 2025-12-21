# Companion Balance Analysis Report

## Current Companion Stats

### 1. **Drone** (Unlocks: Wave 10)
- **Size**: 6px
- **Speed**: 3.5
- **Damage**: 0.5
- **Health**: 20
- **Fire Rate**: 500ms (2 shots/second)
- **DPS**: ~1.0 damage/second
- **Behavior**: Orbits player at 40px radius

**Balance Assessment:**
- ✅ **Health**: Low but appropriate for early game
- ⚠️ **Damage**: Very low (0.5) - may struggle to kill zombies effectively
- ⚠️ **Fire Rate**: Slow (500ms) - low DPS output
- ✅ **Behavior**: Good defensive positioning (orbits player)

**Recommendations:**
- Increase damage to 0.75-1.0 for better effectiveness
- Reduce fire rate to 400ms for better DPS
- Or increase health to 30 for better survivability

---

### 2. **Robot** (Unlocks: Wave 25)
- **Size**: 8px
- **Speed**: 2.0
- **Damage**: 1.0
- **Health**: 40
- **Fire Rate**: 400ms (2.5 shots/second)
- **DPS**: ~2.5 damage/second
- **Behavior**: Follows player at 30px distance

**Balance Assessment:**
- ✅ **Health**: Good (2x drone)
- ✅ **Damage**: Decent (2x drone)
- ✅ **Fire Rate**: Better than drone
- ✅ **DPS**: 2.5x better than drone
- ✅ **Behavior**: Good positioning

**Recommendations:**
- Balance looks good overall
- Could slightly increase speed to 2.5 for better mobility

---

### 3. **Turret** (Unlocks: Wave 50)
- **Size**: 10px
- **Speed**: 0 (stationary)
- **Damage**: 1.5
- **Health**: 60
- **Fire Rate**: 300ms (3.33 shots/second)
- **DPS**: ~5.0 damage/second
- **Range**: 150px
- **Behavior**: Stationary, shoots at range

**Balance Assessment:**
- ✅ **Health**: High (3x drone)
- ✅ **Damage**: High (3x drone)
- ✅ **Fire Rate**: Fastest
- ✅ **DPS**: Highest (5x drone)
- ⚠️ **Stationary**: Vulnerable to being overwhelmed
- ✅ **Range**: Good coverage

**Recommendations:**
- Balance is strong but appropriate for mid-game
- Consider increasing range to 180px for better coverage
- Health is good for stationary unit

---

### 4. **Medic** (Unlocks: Wave 75)
- **Size**: 7px
- **Speed**: 2.5
- **Health**: 30
- **Heal Rate**: 0.5 HP per 2 seconds
- **Heal DPS**: 0.25 HP/second
- **Behavior**: Follows player closely, heals

**Balance Assessment:**
- ⚠️ **Health**: Low for late game (30 HP)
- ⚠️ **Heal Rate**: Very slow (0.25 HP/sec = 15 HP/min)
- ✅ **Speed**: Good for following player
- ⚠️ **Utility**: Healing may be too weak to matter

**Recommendations:**
- Increase health to 40-50 for better survivability
- Increase heal rate to 1.0 HP per 1.5 seconds (0.67 HP/sec)
- Or increase heal interval frequency

---

### 5. **Tank** (Unlocks: Wave 100)
- **Size**: 12px
- **Speed**: 1.5
- **Damage**: 0.8
- **Health**: 100
- **Fire Rate**: 600ms (1.67 shots/second)
- **DPS**: ~1.33 damage/second
- **Taunt Radius**: 50px
- **Behavior**: Follows player, taunts zombies

**Balance Assessment:**
- ✅ **Health**: Excellent (5x drone, highest)
- ⚠️ **Damage**: Lower than robot despite being later unlock
- ⚠️ **Fire Rate**: Slowest (600ms)
- ⚠️ **DPS**: Lower than robot (1.33 vs 2.5)
- ✅ **Taunt**: Good utility for tanking
- ⚠️ **Speed**: Very slow (1.5)

**Recommendations:**
- Increase damage to 1.2-1.5 to match tank role
- Reduce fire rate to 500ms for better DPS
- Increase speed to 2.0 for better positioning
- Increase taunt radius to 75px for better utility

---

## Overall Balance Issues

### Power Progression Problems:
1. **Tank has lower DPS than Robot** - Should be stronger since it unlocks later
2. **Medic healing is too weak** - May not provide meaningful support
3. **Drone damage is very low** - Struggles to contribute meaningfully
4. **Turret is strongest** - Good, but may overshadow other companions

### Suggested Power Curve:
```
Wave 10 (Drone):     DPS ~1.5,  Health 20-30
Wave 25 (Robot):     DPS ~2.5,  Health 40
Wave 50 (Turret):    DPS ~5.0,  Health 60
Wave 75 (Medic):     Heal ~0.67/sec, Health 40-50
Wave 100 (Tank):     DPS ~3.0,  Health 100
```

### Recommended Changes:

**Drone:**
- Damage: 0.5 → 0.75
- Fire Rate: 500ms → 400ms
- Health: 20 → 25

**Robot:**
- Speed: 2.0 → 2.5 (minor improvement)

**Turret:**
- Range: 150px → 180px (better coverage)

**Medic:**
- Health: 30 → 45
- Heal Rate: 0.5 HP/2s → 1.0 HP/1.5s (0.67 HP/sec)

**Tank:**
- Damage: 0.8 → 1.2
- Fire Rate: 600ms → 500ms
- Speed: 1.5 → 2.0
- Taunt Radius: 50px → 75px

---

## Wave Unlock Issue Investigation

**Problem:** Drone spawns at wave 2 instead of wave 10

**Root Cause Found:**
The respawn logic was running on EVERY wave completion and respawning companions that were previously unlocked (saved in localStorage), even if the current wave was below their unlock wave.

**Fix Applied:**
Modified the respawn logic in `js/game.js` to only respawn companions if:
1. The companion is unlocked
2. **AND** the current wave is >= the companion's unlock wave

This ensures companions only respawn after they've been unlocked in the current game session, not from previous games.

**Code Change:**
```javascript
// Before: Respawned any unlocked companion
if (this.companionManager.isUnlocked(type)) { ... }

// After: Only respawn if wave >= unlock wave
if (this.companionManager.isUnlocked(type) && currentWave >= config.UNLOCK_WAVE) { ... }
```

**Result:**
Companions now only spawn when first unlocked at their specific wave, and only respawn in subsequent waves if they were unlocked in the current game session.

