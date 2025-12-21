# Ammunition System Implementation Plan

## Overview
Add a comprehensive ammunition system that includes different ammo types, tiers, special effects, and visual feedback. Ammo will be consumed when firing and can be purchased from the shop.

## 1. Ammunition Categories & Types

### 1.1 Basic Ammo Types (Standard Rounds)
- **Standard Rounds** (Pistol/Rifle compatible)
  - Basic: +0 damage, standard yellow bullets
  - Enhanced: +1 damage, brighter yellow
  - Advanced: +2 damage, gold color
  
- **Shotgun Shells** (Shotgun compatible)
  - Basic: +0 damage, spread pattern
  - Enhanced: +1 damage per pellet
  - Advanced: +2 damage per pellet

- **Sniper Rounds** (Sniper/Crossbow compatible)
  - Basic: +1 damage, piercing (1 zombie)
  - Enhanced: +2 damage, piercing (2 zombies)
  - Advanced: +3 damage, piercing (3 zombies)

- **SMG Rounds** (SMG compatible)
  - Basic: +0 damage, high fire rate compatible
  - Enhanced: +0.5 damage
  - Advanced: +1 damage

### 1.2 Special Ammo Types (Unique Effects)
- **Explosive Rounds**
  - Tier 1: +2 damage, small AOE (50px radius)
  - Tier 2: +3 damage, medium AOE (75px radius)
  - Tier 3: +5 damage, large AOE (100px radius)
  - Color: Orange/Red with fire particles
  - Compatible: Heavy weapons (Cannon, Rocket Launcher, Minigun)

- **Piercing Rounds**
  - Tier 1: +1 damage, pierces 2 zombies
  - Tier 2: +2 damage, pierces 3 zombies
  - Tier 3: +3 damage, pierces 5 zombies
  - Color: Silver/Gray with shine effect
  - Compatible: Rifle, Sniper, Railgun

- **Ice Rounds** (Freeze Effect)
  - Tier 1: +1 damage, slows zombies by 30% for 2s
  - Tier 2: +2 damage, slows zombies by 50% for 3s
  - Tier 3: +3 damage, slows zombies by 70% for 4s
  - Color: Cyan/Light Blue with frost particles
  - Compatible: All weapons

- **Fire Rounds** (Burn Effect)
  - Tier 1: +1 damage, 1 damage over 2s
  - Tier 2: +2 damage, 2 damage over 3s
  - Tier 3: +3 damage, 3 damage over 4s
  - Color: Red/Orange with fire trail
  - Compatible: All weapons

- **Electric Rounds** (Chain Damage)
  - Tier 1: +1 damage, chains to 1 nearby zombie (50% damage)
  - Tier 2: +2 damage, chains to 2 nearby zombies (50% damage)
  - Tier 3: +3 damage, chains to 3 nearby zombies (60% damage)
  - Color: Bright Yellow/White with electric sparks
  - Compatible: Plasma Rifle, Tesla Cannon, Energy weapons

- **Poison Rounds** (DOT Effect)
  - Tier 1: +1 damage, 1 damage over 4s
  - Tier 2: +2 damage, 2 damage over 5s
  - Tier 3: +3 damage, 3 damage over 6s
  - Color: Green/Purple with poison clouds
  - Compatible: Crossbow, Pistol, SMG

- **Armor-Piercing Rounds**
  - Tier 1: +2 damage, ignores 25% armor
  - Tier 2: +3 damage, ignores 50% armor
  - Tier 3: +4 damage, ignores 75% armor
  - Color: Dark Gray/Black with metallic shine
  - Compatible: Sniper, Railgun, Heavy weapons

- **Hollow Point Rounds** (Critical Damage)
  - Tier 1: +1 damage, 20% crit chance (2x damage)
  - Tier 2: +2 damage, 30% crit chance (2.5x damage)
  - Tier 3: +3 damage, 40% crit chance (3x damage)
  - Color: Black with red tip
  - Compatible: Pistol, SMG, Shotgun

## 2. Ammunition Properties Structure

### Ammo Object Schema:
```javascript
{
  id: 'ammo_standard_basic',
  name: 'Standard Rounds (Basic)',
  type: 'ammunition',
  category: 'standard', // standard, special
  icon: '🔸',
  description: 'Standard ammunition, compatible with pistols and rifles',
  price: 25, // Price per pack
  packSize: 50, // Ammo quantity per purchase
  tier: 1,
  
  // Combat Properties
  damageBonus: 0, // Additional damage per bullet
  compatibleWeapons: ['pistol', 'assault_rifle', 'smg', 'dual_pistols'], // weaponModel values
  
  // Special Effects
  effect: {
    type: null, // explosive, piercing, ice, fire, electric, poison, armor_piercing, critical
    value: 0, // Effect strength/radius/chance
    duration: 0 // Effect duration in ms (for DOT/slow)
  },
  
  // Visual Properties
  color: '#FFD700', // Bullet color
  trailColor: '#FFA500', // Trail color
  particleType: null, // fire, ice, electric, poison, etc.
  size: 3, // Bullet size multiplier (1.0 = normal)
  
  // Audio (optional)
  soundEffect: null
}
```

## 3. Shop Integration

### 3.1 Shop Category
- Add "Ammunition" as 5th category tab (after Weapons, Armor, Consumables, Upgrades)
- Display ammo in grid/list format similar to other categories
- Show:
  - Ammo icon
  - Name
  - Pack size (e.g., "50 rounds")
  - Price
  - Compatibility icons
  - Special effect description

### 3.2 Pricing Structure
- **Basic Standard Rounds**: 25 coins (50 rounds)
- **Enhanced Standard Rounds**: 60 coins (50 rounds)
- **Advanced Standard Rounds**: 150 coins (50 rounds)
- **Basic Special Ammo**: 100-200 coins (30-40 rounds)
- **Mid-Tier Special Ammo**: 300-500 coins (30-40 rounds)
- **Elite Special Ammo**: 800-1500 coins (30-40 rounds)

### 3.3 Ammo Packs
- Small Pack: 50 rounds (standard), 30 rounds (special)
- Medium Pack: 100 rounds (standard), 60 rounds (special)
- Large Pack: 200 rounds (standard), 100 rounds (special)

## 4. Inventory Integration

### 4.1 Ammo Storage
- Track ammo quantity per type in inventory
- Display ammo in inventory grid with quantity badges
- Show equipped ammo in equipped items section

### 4.2 Ammo Selection
- Add "Ammo" slot to equipped items (next to Weapon, Armor, Powerup)
- Allow equipping ammo from inventory
- Store equipped ammo in `inventory.equipped.ammo`

### 4.3 Ammo Consumption
- Consume 1 ammo per bullet fired
- When ammo runs out, switch to "Unlimited Basic Rounds" (default, no bonus)
- Display ammo count in HUD (e.g., "Ammo: 127/∞")
- Show warning when ammo < 20

## 5. Bullet System Modifications

### 5.1 Bullet Class Extensions
```javascript
class Bullet {
  constructor() {
    this.reset();
    this.ammoType = null; // Reference to equipped ammo
    this.damage = 1; // Base damage + ammo bonus
    this.color = 'yellow'; // Default color
    this.trailColor = 'orange';
    this.pierceCount = 0; // How many zombies it can pierce
    this.piercedZombies = []; // Track pierced zombies
    this.explosiveRadius = 0; // AOE radius
    this.effectType = null; // Special effect type
    this.effectValue = 0; // Effect strength
  }
  
  init(x, y, angle, ammoType = null) {
    // ... existing init code ...
    if (ammoType) {
      this.ammoType = ammoType;
      this.damage = 1 + (ammoType.damageBonus || 0);
      this.color = ammoType.color || 'yellow';
      this.trailColor = ammoType.trailColor || 'orange';
      this.pierceCount = ammoType.effect?.type === 'piercing' ? ammoType.effect.value : 0;
      this.explosiveRadius = ammoType.effect?.type === 'explosive' ? ammoType.effect.value : 0;
      this.effectType = ammoType.effect?.type || null;
      this.effectValue = ammoType.effect?.value || 0;
    }
  }
  
  draw(ctx) {
    // Draw bullet with ammo color
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * (this.ammoType?.size || 1), 0, Math.PI * 2);
    ctx.fill();
    
    // Draw trail based on ammo type
    if (this.ammoType?.particleType) {
      this.drawAmmoTrail(ctx);
    }
  }
}
```

### 5.2 Collision System Updates
- Apply ammo damage bonus: `zombie.health -= bullet.damage`
- Handle piercing: Track pierced zombies, continue through if pierce count allows
- Handle explosive: Deal damage to all zombies in radius
- Apply status effects: Slow (ice), Burn (fire), Poison (poison), Chain (electric)

### 5.3 Particle Effects
- Create particle effects for each special ammo type:
  - Fire: Orange/red particles, smoke trail
  - Ice: Cyan particles, frost crystals
  - Electric: Yellow/white sparks, chain lightning effect
  - Poison: Green/purple clouds
  - Explosive: Orange explosion with shockwave
  - Armor-Piercing: Metallic sparks

## 6. HUD Integration

### 6.1 Ammo Display
- Add ammo counter to HUD:
  - Current ammo count
  - Ammo type icon/name
  - Warning indicator when low
  - "∞" symbol for unlimited (default) ammo

### 6.2 Visual Feedback
- Color-coded ammo indicator
- Flash effect when switching ammo types
- Low ammo warning (red/pulsing)

## 7. Compatibility System

### 7.1 Weapon-Ammo Compatibility
- Each weapon has `compatibleAmmo` array in shop-manager
- Each ammo has `compatibleWeapons` array
- Check compatibility before equipping
- Show compatibility warning if mismatch

### 7.2 Default Ammo
- All weapons can use "Unlimited Basic Rounds" (default, no bonus)
- Special ammo requires compatibility check

## 8. Implementation Steps

### Phase 1: Core Ammo System
1. Create ammo catalog in `shop-manager.js`
2. Add ammo items (20+ ammo types across tiers)
3. Extend `Bullet` class with ammo properties
4. Update `autoShoot()` to consume ammo
5. Add ammo to inventory system

### Phase 2: Shop & Inventory UI
6. Add "Ammunition" tab to shop
7. Create ammo rendering in shop grid
8. Add ammo slot to inventory equipped section
9. Update inventory grid to show ammo items
10. Add ammo hover previews with stats

### Phase 3: Combat Integration
11. Update `checkBulletCollisions()` for ammo damage
12. Implement piercing mechanic
13. Implement explosive AOE damage
14. Add status effects (slow, burn, poison)
15. Implement chain damage (electric)

### Phase 4: Visual Effects
16. Update bullet drawing with ammo colors
17. Create particle effects for each special ammo type
18. Add trail effects for special ammo
19. Update HUD with ammo counter
20. Add visual feedback for status effects on zombies

### Phase 5: Polish & Balance
21. Test all ammo types in-game
22. Balance prices and pack sizes
23. Fine-tune damage values and effects
24. Test compatibility system
25. Add audio effects (optional)

## 9. File Modifications Required

### New Files:
- `js/ammo-manager.js` - Manages ammo consumption and equipped ammo

### Modified Files:
- `js/shop-manager.js` - Add ammo catalog (20+ items)
- `js/inventory-manager.js` - Add ammo slot to equipped items
- `js/entities.js` - Extend Bullet class with ammo properties
- `js/game.js` - Update autoShoot() and handleBulletCollisions()
- `js/zombie-manager.js` - Update collision system for ammo effects
- `js/shop-ui.js` - Add ammo tab and rendering
- `index.html` - Add ammo slot to equipped items UI
- `css/game.css` - Style ammo UI elements and HUD
- `js/particle-manager.js` - Add particle effects for special ammo

## 10. Balancing Guidelines

### Damage Scaling:
- Basic ammo: +0 to +2 damage (early game)
- Enhanced ammo: +1 to +3 damage (mid game)
- Special ammo: +2 to +5 damage + effects (mid-late game)
- Elite special ammo: +3 to +6 damage + strong effects (late game)

### Cost vs. Benefit:
- Standard ammo: Cheap, reliable, no special effects
- Special ammo: 3-4x more expensive, but powerful effects
- Balance for 1000-wave progression (matches existing economy)

### Consumption Rate:
- Standard weapons: 1 ammo per shot
- Multishot weapons: 1 ammo per bullet (e.g., shotgun uses 5 ammo per shot)
- Balance pack sizes accordingly

## 11. Special Considerations

### Infinite Ammo Fallback:
- If no ammo equipped or runs out, use default "unlimited basic rounds"
- Default rounds: No damage bonus, yellow color, no effects
- Prevents game breaking if player runs out of ammo

### Ammo Switching:
- Allow switching ammo mid-game from inventory
- Apply new ammo type to next shot fired
- Visual feedback when ammo type changes

### Status Effect Stacking:
- Multiple effects can apply to same zombie
- Effects have separate timers
- Visual indicators show active effects

---

## Estimated Implementation Complexity:
- **Core System**: Medium
- **UI Integration**: Medium
- **Combat Integration**: Medium-High
- **Visual Effects**: High
- **Testing & Balance**: High

**Total Estimated Time**: 4-6 hours for full implementation

---

This plan provides a comprehensive roadmap for implementing the ammunition system. Should I proceed with implementation?
