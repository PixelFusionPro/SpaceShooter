# 🎨 Powerup Particle Effects - Implementation Plan

## Goal
Replace glow auras with dynamic particle effects for better visual feedback.

---

## 📋 Plan

### 1. **Speed Powerup** - Motion Energy Particles
- **Effect**: Orange energy streaks/motion lines trailing behind player
- **Style**: Fast-moving streaks that show speed boost
- **Color**: Orange gradient (255,165,0)
- **Behavior**: Spawn behind player, trail outward
- **Spawn Rate**: Continuous while moving

### 2. **Multishot Powerup** - Bullet Energy Particles  
- **Effect**: Yellow bullet sparks/gun energy bursts
- **Style**: Small energy particles radiating from gun area
- **Color**: Yellow/gold (255,255,0)
- **Behavior**: Spawn near gun position, small bursts
- **Spawn Rate**: On each shot or continuous subtle effect

### 3. **Heal Powerup** - Plus Sign Particles
- **Effect**: Green plus signs floating upward
- **Style**: Healing symbols rising from player
- **Color**: Green (0,255,0)
- **Behavior**: Spawn around player, float upward
- **Spawn Rate**: Burst on collection, then fade

---

## 🛠️ Implementation Steps

1. Add new particle pools to ParticleManager
2. Create spawn methods for each effect
3. Remove glow code from Player.draw()
4. Add particle spawning in game update loop
5. Update draw method to render new particles

---

## ✅ Implementation Ready


