# 🧟 Zombie Shooter Defense

A modular, optimized zombie defense game with wave-based gameplay, auto-targeting, and progressive difficulty.

## 🚀 Quick Start

```bash
node server.js
why ```

Then open: `http://localhost:7030`

## 📁 Project Structure

```
ZOMBIE/
├── index.html          # Main HTML (2KB)
├── server.js           # Development server
├── css/
│   └── game.css       # All styles (3KB)
└── js/
    ├── config.js      # Game configuration (2KB)
    ├── pool.js        # Object pooling (2KB)
    ├── entities.js    # Player, Zombie, Bullet classes (11KB)
    ├── powerups.js    # Powerup system (5KB)
    ├── controls.js    # Input handling (2KB)
    └── game.js        # Main game loop (15KB)
```

## 🎮 Features

### Gameplay
- **6 Zombie Types**: Normal, Tank, Runner, Explosive, Healer, Boss
- **4 Powerups**: Heal, Speed, Multishot, Shield
- **Rank System**: Soldier → Veteran (50) → Elite (100) → Legend (200)
- **Wave-Based**: Progressive difficulty with boss every 5 waves
- **Auto-Targeting**: Automatically aims and shoots at nearest zombie

### Optimizations
- **Object Pooling**: Bullets and particles reused for performance
- **Particle Systems**: Efficient dust, trails, sparkles, blood effects
- **Modular Code**: Separated concerns for maintainability
- **Smart Collision**: Optimized distance-based detection

### Visual Effects
- Health-based player emotions
- Elite zombie auras
- Rank-up sparkle bursts
- Muzzle flash and gun heat
- Speed trails and footstep dust
- Blood splashes and boss explosions

## 🎯 Controls

- **Movement**: WASD or Arrow Keys
- **Shooting**: Automatic
- **Pause**: P Key or Pause Button
- **Touch**: Swipe to move (mobile)

## 📊 Performance

- **Target**: 60 FPS
- **Object Pools**: 50 bullets, 100 particles each (dust, trails, etc.)
- **Canvas**: 360×600 (mobile-optimized)
- **Smart Updates**: Only active objects processed

## 🔧 Configuration

Edit `js/config.js` to customize:
- Player speed, health, fire rate
- Zombie stats and difficulty scaling
- Powerup drop rates and durations
- Wave progression and boss spawns
- Particle lifetimes and pool sizes

## 📝 Module Details

### config.js
Game constants and configuration values

### pool.js
- `ObjectPool`: Generic object pooling
- `ParticlePool`: Specialized particle management

### entities.js
- `Player`: Player character with animations
- `Zombie`: 6 types with variants
- `Bullet`: Pooled projectiles

### powerups.js
- `PowerupManager`: Handles spawning, collection, effects

### controls.js
- `Controls`: Keyboard and touch input

### game.js
- `ZombieGame`: Main game class
- Game loop, wave management, collision detection
- HUD updates, scoring, achievements

## 🎨 Customization

### Add New Zombie Type
1. Add config in `config.js` ZOMBIES section
2. Update `Zombie` constructor in `entities.js`
3. Add spawn logic in `game.js` spawnWave()

### Add New Powerup
1. Add type to `powerups.js` PowerupManager.spawn()
2. Implement effect in `PowerupManager.collect()`
3. Add icon and color in helper methods

## 🐛 Debug

Open browser console and access:
```javascript
Game.score              // Current score
Game.wave               // Current wave
Game.zombies.length     // Active zombies
Game.player.health      // Player health

// Cheats
Game.player.health = 100
Game.score += 100
```

## 📈 Build Details

- **Total Code**: ~40KB modular JavaScript
- **Load Order**: config → pool → entities → powerups → controls → game
- **Dependencies**: None (vanilla JS)
- **Browser**: Modern browsers with Canvas support

---

**Made with vanilla JavaScript • No frameworks • Optimized for fun! 🎮**
