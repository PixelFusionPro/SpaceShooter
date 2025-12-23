// Item Icon Generator - Creates unique SVG icons for all shop items

function getItemIcon(itemId, itemType, itemName) {
  // Generate unique SVG icon based on item ID and type
  const iconMap = {
    // Weapons
    'weapon_pistol': createWeaponIcon('pistol', '#C0C0C0'),
    'weapon_smg': createWeaponIcon('smg', '#808080'),
    'weapon_assault': createWeaponIcon('rifle', '#4A4A4A'),
    'weapon_fast': createWeaponIcon('blaster', '#FFD700'),
    'weapon_dual': createWeaponIcon('dual', '#FFA500'),
    'weapon_crossbow': createWeaponIcon('crossbow', '#8B4513'),
    'weapon_burst': createWeaponIcon('burst', '#4169E1'),
    'weapon_strong': createWeaponIcon('cannon', '#DC143C'),
    'weapon_shotgun': createWeaponIcon('shotgun', '#2F4F4F'),
    'weapon_multi': createWeaponIcon('multishot', '#9370DB'),
    'weapon_plasma': createWeaponIcon('plasma', '#00CED1'),
    'weapon_sniper': createWeaponIcon('sniper', '#228B22'),
    'weapon_laser': createWeaponIcon('laser', '#FF1493'),
    'weapon_tesla': createWeaponIcon('tesla', '#FFFF00'),
    'weapon_chain': createWeaponIcon('chaingun', '#FF4500'),
    'weapon_flame': createWeaponIcon('flame', '#FF0000'),
    'weapon_rocket': createWeaponIcon('rocket', '#8B0000'),
    'weapon_minigun': createWeaponIcon('minigun', '#000000'),
    'weapon_railgun': createWeaponIcon('railgun', '#00FFFF'),
    'weapon_quantum': createWeaponIcon('quantum', '#FF00FF'),
    
    // Armor
    'armor_leather': createArmorIcon('leather', '#8B4513'),
    'armor_kevlar': createArmorIcon('kevlar', '#708090'),
    'armor_light': createArmorIcon('light', '#D3D3D3'),
    'armor_tactical': createArmorIcon('tactical', '#2F4F4F'),
    'armor_mesh': createArmorIcon('mesh', '#4682B4'),
    'armor_stealth': createArmorIcon('stealth', '#191970'),
    'armor_combat': createArmorIcon('combat', '#556B2F'),
    'armor_plated': createArmorIcon('plated', '#696969'),
    'armor_ceramic': createArmorIcon('ceramic', '#F5F5DC'),
    'armor_heavy': createArmorIcon('heavy', '#36454F'),
    'armor_bio': createArmorIcon('bio', '#00FF00'),
    'armor_riot': createArmorIcon('riot', '#FFD700'),
    'armor_regen': createArmorIcon('regen', '#32CD32'),
    'armor_advanced': createArmorIcon('advanced', '#00CED1'),
    'armor_nano': createArmorIcon('nano', '#9370DB'),
    'armor_plasma': createArmorIcon('plasma', '#FF1493'),
    'armor_exo': createArmorIcon('exo', '#FF4500'),
    'armor_power': createArmorIcon('power', '#FFD700'),
    'armor_titan': createArmorIcon('titan', '#C0C0C0'),
    'armor_quantum': createArmorIcon('quantum', '#FF00FF'),
    
    // Consumables
    'powerup_heal_pack_small': createConsumableIcon('bandage', '#FF6B6B'),
    'powerup_heal_pack': createConsumableIcon('medkit', '#FF0000'),
    'powerup_heal_pack_large': createConsumableIcon('medkit-large', '#DC143C'),
    'powerup_heal_pack_full': createConsumableIcon('fullheal', '#00FF00'),
    'powerup_speed_boost': createConsumableIcon('speed', '#FFA500'),
    'powerup_fire_rate_boost': createConsumableIcon('rapid', '#FFFF00'),
    'powerup_damage_boost': createConsumableIcon('damage', '#FF4500'),
    'powerup_regen_boost': createConsumableIcon('regen', '#00FF00'),
    'powerup_armor_boost': createConsumableIcon('armor', '#4169E1'),
    'powerup_ammo_multishot': createConsumableIcon('multishot', '#9370DB'),
    'powerup_piercing': createConsumableIcon('pierce', '#C0C0C0'),
    'powerup_explosive': createConsumableIcon('explosive', '#FF0000'),
    'powerup_time_slow': createConsumableIcon('time', '#00CED1'),
    'powerup_chain_lightning': createConsumableIcon('lightning', '#FFFF00'),
    'powerup_score_boost': createConsumableIcon('score', '#FFD700'),
    'powerup_coin_boost': createConsumableIcon('coin', '#FFD700'),
    'powerup_crit_boost': createConsumableIcon('crit', '#FF1493'),
    'powerup_lifesteal': createConsumableIcon('lifesteal', '#DC143C'),
    'powerup_shield': createConsumableIcon('shield', '#00CED1'),
    'powerup_berserker': createConsumableIcon('berserker', '#FF0000'),
    
    // Upgrades
    'upgrade_max_health': createUpgradeIcon('health', '#FF0000'),
    'upgrade_fire_rate': createUpgradeIcon('firerate', '#FFA500'),
    'upgrade_speed': createUpgradeIcon('speed', '#00CED1'),
    'upgrade_damage': createUpgradeIcon('damage', '#FF4500'),
    'upgrade_max_health_plus': createUpgradeIcon('health-plus', '#DC143C'),
    'upgrade_fire_rate_plus': createUpgradeIcon('firerate-plus', '#FF8C00'),
    'upgrade_regen': createUpgradeIcon('regen', '#32CD32'),
    'upgrade_speed_plus': createUpgradeIcon('speed-plus', '#00BFFF'),
    'upgrade_coin_gain': createUpgradeIcon('coin', '#FFD700'),
    'upgrade_damage_plus': createUpgradeIcon('damage-plus', '#FF6347'),
    'upgrade_multishot': createUpgradeIcon('multishot', '#9370DB'),
    'upgrade_regen_plus': createUpgradeIcon('regen-plus', '#00FF00'),
    'upgrade_score_multiplier': createUpgradeIcon('score', '#FFD700'),
    'upgrade_crit_chance': createUpgradeIcon('crit', '#FF1493'),
    'upgrade_multishot_plus': createUpgradeIcon('multishot-plus', '#8A2BE2'),
    'upgrade_crit_damage': createUpgradeIcon('crit-damage', '#FF00FF'),
    'upgrade_coin_gain_plus': createUpgradeIcon('coin-plus', '#FFD700'),
    'upgrade_piercing': createUpgradeIcon('pierce', '#C0C0C0'),
    'upgrade_score_multiplier_plus': createUpgradeIcon('score-plus', '#FFD700'),
    'upgrade_armor_pierce': createUpgradeIcon('armor-pierce', '#2F4F4F'),
    'upgrade_lifesteal': createUpgradeIcon('lifesteal', '#DC143C'),
    'upgrade_lifesteal_plus': createUpgradeIcon('lifesteal-plus', '#8B0000'),
    
    // Ammunition - Standard
    'ammo_standard_basic': createAmmoIcon('standard', '#FFD700'),
    'ammo_standard_enhanced': createAmmoIcon('enhanced', '#FFEB3B'),
    'ammo_standard_advanced': createAmmoIcon('advanced', '#FFC107'),
    'ammo_shotgun_basic': createAmmoIcon('shotgun', '#8B4513'),
    'ammo_shotgun_enhanced': createAmmoIcon('shotgun-enh', '#A0522D'),
    'ammo_shotgun_advanced': createAmmoIcon('shotgun-adv', '#654321'),
    'ammo_sniper_basic': createAmmoIcon('sniper', '#C0C0C0'),
    'ammo_sniper_enhanced': createAmmoIcon('sniper-enh', '#E0E0E0'),
    'ammo_sniper_advanced': createAmmoIcon('sniper-adv', '#F0F0F0'),
    'ammo_smg_basic': createAmmoIcon('smg', '#808080'),
    'ammo_smg_enhanced': createAmmoIcon('smg-enh', '#A0A0A0'),
    'ammo_smg_advanced': createAmmoIcon('smg-adv', '#C0C0C0'),
    
    // Ammunition - Special
    'ammo_explosive_t1': createAmmoIcon('explosive', '#FF4500'),
    'ammo_explosive_t2': createAmmoIcon('explosive-t2', '#FF3300'),
    'ammo_explosive_t3': createAmmoIcon('explosive-t3', '#FF0000'),
    'ammo_piercing_t1': createAmmoIcon('pierce', '#C0C0C0'),
    'ammo_piercing_t2': createAmmoIcon('pierce-t2', '#E0E0E0'),
    'ammo_piercing_t3': createAmmoIcon('pierce-t3', '#F0F0F0'),
    'ammo_ice_t1': createAmmoIcon('ice', '#87CEEB'),
    'ammo_ice_t2': createAmmoIcon('ice-t2', '#00CED1'),
    'ammo_ice_t3': createAmmoIcon('ice-t3', '#00BFFF'),
    'ammo_fire_t1': createAmmoIcon('fire', '#FF4500'),
    'ammo_fire_t2': createAmmoIcon('fire-t2', '#FF3300'),
    'ammo_fire_t3': createAmmoIcon('fire-t3', '#FF0000'),
    'ammo_electric_t1': createAmmoIcon('electric', '#FFFF00'),
    'ammo_electric_t2': createAmmoIcon('electric-t2', '#FFEB3B'),
    'ammo_electric_t3': createAmmoIcon('electric-t3', '#FFC107'),
    'ammo_poison_t1': createAmmoIcon('poison', '#9ACD32'),
    'ammo_poison_t2': createAmmoIcon('poison-t2', '#7CFC00'),
    'ammo_poison_t3': createAmmoIcon('poison-t3', '#00FF00'),
    'ammo_armor_piercing_t1': createAmmoIcon('armor-pierce', '#2F2F2F'),
    'ammo_armor_piercing_t2': createAmmoIcon('armor-pierce-t2', '#1F1F1F'),
    'ammo_armor_piercing_t3': createAmmoIcon('armor-pierce-t3', '#0F0F0F'),
    'ammo_hollow_point_t1': createAmmoIcon('hollow', '#000000'),
    'ammo_hollow_point_t2': createAmmoIcon('hollow-t2', '#1A1A1A'),
    'ammo_hollow_point_t3': createAmmoIcon('hollow-t3', '#000000'),
    
    // Fortress Structures
    'fortress_fence': createFortressIcon('fence', '#8B4513'),
    'fortress_barricade': createFortressIcon('barricade', '#D2691E'),
    'fortress_gate': createFortressIcon('gate', '#555555'),
    'fortress_wall': createFortressIcon('wall', '#808080'),
    'fortress_tower': createFortressIcon('tower', '#696969'),
    
    // Companions
    'companion_drone': createCompanionIcon('drone', '#00d4ff'),
    'companion_robot': createCompanionIcon('robot', '#ff6b35'),
    'companion_turret': createCompanionIcon('turret', '#4a4a4a'),
    'companion_medic': createCompanionIcon('medic', '#00ff88'),
    'companion_tank': createCompanionIcon('tank', '#8b4513'),
  };
  
  // Return icon if found, otherwise create generic icon
  if (iconMap[itemId]) {
    return iconMap[itemId];
  }
  
  // Fallback: create generic icon based on type
  return createGenericIcon(itemType, itemName);
}

function createWeaponIcon(weaponType, color) {
  const svg = {
    pistol: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="4" width="8" height="12" rx="2" fill="${color}"/>
      <rect x="14" y="8" width="4" height="4" rx="1" fill="${color}"/>
      <circle cx="10" cy="10" r="1.5" fill="#000"/>
    </svg>`,
    smg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="12" height="8" rx="1" fill="${color}"/>
      <rect x="16" y="8" width="3" height="4" rx="0.5" fill="${color}"/>
      <rect x="7" y="8" width="8" height="1" fill="#000"/>
    </svg>`,
    rifle: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="14" height="6" rx="1" fill="${color}"/>
      <rect x="16" y="7" width="4" height="4" rx="0.5" fill="${color}"/>
      <line x1="6" y1="8" x2="14" y2="8" stroke="#000" stroke-width="0.5"/>
    </svg>`,
    blaster: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="7" width="10" height="6" rx="1" fill="${color}"/>
      <circle cx="11" cy="10" r="2" fill="#FFD700"/>
      <polygon points="16,8 20,10 16,12" fill="${color}"/>
    </svg>`,
    dual: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="6" height="8" rx="1" fill="${color}"/>
      <rect x="14" y="6" width="6" height="8" rx="1" fill="${color}"/>
      <circle cx="7" cy="10" r="1" fill="#000"/>
      <circle cx="17" cy="10" r="1" fill="#000"/>
    </svg>`,
    crossbow: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12 L20 12 M8 8 L8 16 M16 8 L16 16" stroke="${color}" stroke-width="2" fill="none"/>
      <path d="M6 10 L10 10 M14 10 L18 10" stroke="${color}" stroke-width="1.5"/>
    </svg>`,
    burst: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="7" width="12" height="6" rx="1" fill="${color}"/>
      <rect x="15" y="8" width="4" height="4" rx="0.5" fill="${color}"/>
      <circle cx="8" cy="10" r="0.8" fill="#000"/>
      <circle cx="11" cy="10" r="0.8" fill="#000"/>
      <circle cx="14" cy="10" r="0.8" fill="#000"/>
    </svg>`,
    cannon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="8" width="16" height="8" rx="2" fill="${color}"/>
      <circle cx="11" cy="12" r="3" fill="#000"/>
      <rect x="17" y="10" width="5" height="4" rx="1" fill="${color}"/>
    </svg>`,
    shotgun: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="14" height="8" rx="1.5" fill="${color}"/>
      <rect x="16" y="8" width="4" height="4" rx="0.5" fill="${color}"/>
      <line x1="6" y1="9" x2="14" y2="9" stroke="#000" stroke-width="1"/>
      <line x1="6" y1="11" x2="14" y2="11" stroke="#000" stroke-width="1"/>
    </svg>`,
    multishot: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="7" width="10" height="6" rx="1" fill="${color}"/>
      <polygon points="16,8 20,7 20,13 16,12" fill="${color}"/>
      <circle cx="9" cy="10" r="0.8" fill="#000"/>
      <circle cx="11" cy="10" r="0.8" fill="#000"/>
      <circle cx="13" cy="10" r="0.8" fill="#000"/>
    </svg>`,
    plasma: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="7" width="10" height="6" rx="1" fill="${color}"/>
      <circle cx="11" cy="10" r="2" fill="#00FFFF" opacity="0.8"/>
      <polygon points="16,8 20,10 16,12" fill="${color}"/>
    </svg>`,
    sniper: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="8" width="16" height="4" rx="0.5" fill="${color}"/>
      <rect x="17" y="9" width="5" height="2" rx="0.5" fill="${color}"/>
      <circle cx="6" cy="10" r="1" fill="#000"/>
      <circle cx="11" cy="10" r="0.5" fill="#FFD700"/>
    </svg>`,
    laser: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="10" height="4" rx="0.5" fill="${color}"/>
      <line x1="16" y1="10" x2="22" y2="10" stroke="${color}" stroke-width="2"/>
      <circle cx="11" cy="10" r="1" fill="#FF1493"/>
    </svg>`,
    tesla: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="7" width="10" height="6" rx="1" fill="${color}"/>
      <path d="M11 6 L11 14 M8 9 L14 9 M8 11 L14 11" stroke="#FFFF00" stroke-width="1.5"/>
    </svg>`,
    chaingun: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="14" height="8" rx="1" fill="${color}"/>
      <circle cx="11" cy="10" r="3" fill="#000"/>
      <rect x="16" y="8" width="4" height="4" rx="0.5" fill="${color}"/>
    </svg>`,
    flame: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="10" height="4" rx="1" fill="${color}"/>
      <path d="M16 8 Q18 6 20 8 Q18 10 16 12" fill="#FF0000" opacity="0.8"/>
    </svg>`,
    rocket: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 10 L18 10 L16 8 L18 6 L16 8 L16 12 L18 14 L16 12 L18 10" fill="${color}"/>
      <polygon points="18,8 22,10 18,12" fill="#FF0000"/>
    </svg>`,
    minigun: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="7" width="16" height="6" rx="1" fill="${color}"/>
      <circle cx="11" cy="10" r="2.5" fill="#000"/>
      <rect x="17" y="8" width="5" height="4" rx="0.5" fill="${color}"/>
    </svg>`,
    railgun: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="14" height="4" rx="0.5" fill="${color}"/>
      <rect x="16" y="9" width="6" height="2" rx="0.5" fill="${color}"/>
      <line x1="6" y1="10" x2="14" y2="10" stroke="#00FFFF" stroke-width="1"/>
    </svg>`,
    quantum: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="7" width="10" height="6" rx="1" fill="${color}"/>
      <circle cx="11" cy="10" r="2" fill="#FF00FF" opacity="0.8"/>
      <circle cx="11" cy="10" r="1" fill="#FFFFFF"/>
    </svg>`,
  };
  
  return svg[weaponType] || createGenericIcon('weapon', weaponType);
}

function createArmorIcon(armorType, color) {
  const baseSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4 L8 6 L8 10 L12 12 L16 10 L16 6 Z" fill="${color}" stroke="#000" stroke-width="0.5"/>
    <rect x="10" y="12" width="4" height="8" rx="1" fill="${color}" stroke="#000" stroke-width="0.5"/>
    <rect x="9" y="16" width="6" height="2" rx="0.5" fill="${color}"/>
  </svg>`;
  
  return baseSvg;
}

function createConsumableIcon(consumableType, color) {
  const svg = {
    bandage: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="10" width="8" height="4" rx="1" fill="${color}"/>
      <line x1="10" y1="12" x2="14" y2="12" stroke="#FFF" stroke-width="1"/>
      <line x1="12" y1="10" x2="12" y2="14" stroke="#FFF" stroke-width="1"/>
    </svg>`,
    medkit: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="12" height="8" rx="1" fill="${color}" stroke="#FFF" stroke-width="1"/>
      <line x1="8" y1="12" x2="16" y2="12" stroke="#FFF" stroke-width="1.5"/>
      <line x1="12" y1="10" x2="12" y2="14" stroke="#FFF" stroke-width="1.5"/>
    </svg>`,
    'medkit-large': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="7" width="14" height="10" rx="1.5" fill="${color}" stroke="#FFF" stroke-width="1.5"/>
      <line x1="7" y1="12" x2="17" y2="12" stroke="#FFF" stroke-width="2"/>
      <line x1="12" y1="9" x2="12" y2="15" stroke="#FFF" stroke-width="2"/>
    </svg>`,
    fullheal: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="${color}" stroke="#FFF" stroke-width="1.5"/>
      <line x1="9" y1="12" x2="15" y2="12" stroke="#FFF" stroke-width="2"/>
      <line x1="12" y1="9" x2="12" y2="15" stroke="#FFF" stroke-width="2"/>
    </svg>`,
    speed: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,4 18,12 12,20 6,12" fill="${color}"/>
      <polygon points="12,8 15,12 12,16 9,12" fill="#FFF" opacity="0.8"/>
    </svg>`,
    rapid: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="6" fill="${color}"/>
      <circle cx="12" cy="12" r="3" fill="#FFF"/>
      <path d="M12 6 L12 12 L18 12" stroke="#FFF" stroke-width="1.5" fill="none"/>
    </svg>`,
    damage: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,4 16,10 12,16 8,10" fill="${color}"/>
      <line x1="12" y1="6" x2="12" y2="14" stroke="#FFF" stroke-width="1.5"/>
    </svg>`,
    regen: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4 Q8 8 8 12 Q8 16 12 20 Q16 16 16 12 Q16 8 12 4" fill="${color}"/>
      <circle cx="12" cy="12" r="2" fill="#FFF"/>
    </svg>`,
    armor: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4 L8 6 L8 10 L12 12 L16 10 L16 6 Z" fill="${color}"/>
      <rect x="10" y="12" width="4" height="6" rx="0.5" fill="${color}"/>
    </svg>`,
    multishot: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="6" fill="${color}"/>
      <circle cx="9" cy="9" r="1.5" fill="#FFF"/>
      <circle cx="12" cy="12" r="1.5" fill="#FFF"/>
      <circle cx="15" cy="9" r="1.5" fill="#FFF"/>
    </svg>`,
    pierce: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="6" y1="12" x2="18" y2="12" stroke="${color}" stroke-width="3"/>
      <circle cx="8" cy="12" r="2" fill="${color}"/>
      <circle cx="16" cy="12" r="2" fill="${color}"/>
    </svg>`,
    explosive: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="6" fill="${color}"/>
      <path d="M9 9 L15 15 M15 9 L9 15" stroke="#FFF" stroke-width="1.5"/>
    </svg>`,
    time: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="${color}" stroke="#FFF" stroke-width="1"/>
      <line x1="12" y1="12" x2="12" y2="6" stroke="#FFF" stroke-width="2"/>
      <line x1="12" y1="12" x2="16" y2="12" stroke="#FFF" stroke-width="1.5"/>
    </svg>`,
    lightning: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4 L8 14 L12 14 L10 20 L18 10 L14 10 L16 4 Z" fill="${color}"/>
    </svg>`,
    score: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,2 15,9 22,10 17,15 18,22 12,18 6,22 7,15 2,10 9,9" fill="${color}"/>
    </svg>`,
    coin: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="${color}" stroke="#FFD700" stroke-width="1"/>
      <text x="12" y="16" text-anchor="middle" fill="#000" font-size="10" font-weight="bold">$</text>
    </svg>`,
    crit: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,4 16,10 12,16 8,10" fill="${color}"/>
      <text x="12" y="14" text-anchor="middle" fill="#FFF" font-size="8" font-weight="bold">!</text>
    </svg>`,
    lifesteal: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4 Q8 8 8 12 Q8 16 12 20 Q16 16 16 12 Q16 8 12 4" fill="${color}"/>
      <circle cx="12" cy="12" r="3" fill="#FFF" opacity="0.8"/>
    </svg>`,
    shield: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2 L4 6 L4 12 Q4 18 12 22 Q20 18 20 12 L20 6 Z" fill="${color}" stroke="#FFF" stroke-width="1"/>
    </svg>`,
    berserker: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="${color}"/>
      <path d="M8 10 Q10 8 12 10 Q14 8 16 10 Q14 14 12 16 Q10 14 8 10" fill="#000"/>
    </svg>`,
  };
  
  return svg[consumableType] || createGenericIcon('consumable', consumableType);
}

function createUpgradeIcon(upgradeType, color) {
  const baseSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="12,2 15,9 22,10 17,15 18,22 12,18 6,22 7,15 2,10 9,9" fill="${color}" stroke="#FFD700" stroke-width="0.5"/>
    <text x="12" y="16" text-anchor="middle" fill="#FFF" font-size="8" font-weight="bold">+</text>
  </svg>`;
  
  return baseSvg;
}

function createAmmoIcon(ammoType, color) {
  const baseSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="6" fill="${color}" stroke="#000" stroke-width="1"/>
    <circle cx="12" cy="12" r="2" fill="#000"/>
  </svg>`;
  
  return baseSvg;
}

function createFortressIcon(fortressType, color) {
  const svg = {
    fence: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="2" height="8" fill="${color}"/>
      <rect x="10" y="8" width="2" height="8" fill="${color}"/>
      <rect x="16" y="8" width="2" height="8" fill="${color}"/>
      <line x1="4" y1="10" x2="18" y2="10" stroke="${color}" stroke-width="1.5"/>
      <line x1="4" y1="14" x2="18" y2="14" stroke="${color}" stroke-width="1.5"/>
    </svg>`,
    barricade: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="12" height="8" rx="1" fill="${color}" stroke="#000" stroke-width="1"/>
      <line x1="8" y1="10" x2="16" y2="10" stroke="#000" stroke-width="1"/>
      <line x1="8" y1="14" x2="16" y2="14" stroke="#000" stroke-width="1"/>
    </svg>`,
    gate: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="6" width="8" height="12" rx="1" fill="${color}" stroke="#000" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="1.5" fill="#000"/>
    </svg>`,
    wall: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="16" height="8" fill="${color}" stroke="#000" stroke-width="1"/>
      <line x1="8" y1="8" x2="8" y2="16" stroke="#000" stroke-width="0.5"/>
      <line x1="16" y1="8" x2="16" y2="16" stroke="#000" stroke-width="0.5"/>
    </svg>`,
    tower: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="10" width="8" height="10" fill="${color}" stroke="#000" stroke-width="1"/>
      <polygon points="12,4 16,10 8,10" fill="${color}" stroke="#000" stroke-width="1"/>
      <rect x="11" y="12" width="2" height="2" fill="#000"/>
    </svg>`,
  };
  
  return svg[fortressType] || createGenericIcon('fortress', fortressType);
}

function createCompanionIcon(companionType, color) {
  const svg = {
    drone: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,6 16,12 12,18 8,12" fill="${color}"/>
      <circle cx="12" cy="12" r="2" fill="#FFF"/>
    </svg>`,
    robot: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="6" width="8" height="10" rx="1" fill="${color}"/>
      <circle cx="12" cy="10" r="1.5" fill="#FF0000"/>
      <rect x="9" y="14" width="2" height="4" fill="${color}"/>
      <rect x="13" y="14" width="2" height="4" fill="${color}"/>
    </svg>`,
    turret: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="14" width="8" height="4" rx="1" fill="${color}"/>
      <circle cx="12" cy="12" r="4" fill="${color}"/>
      <rect x="12" y="8" width="6" height="2" rx="0.5" fill="${color}"/>
    </svg>`,
    medic: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="6" fill="${color}"/>
      <line x1="12" y1="8" x2="12" y2="16" stroke="#FFF" stroke-width="2"/>
      <line x1="8" y1="12" x2="16" y2="12" stroke="#FFF" stroke-width="2"/>
    </svg>`,
    tank: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="12" height="8" rx="1" fill="${color}"/>
      <rect x="8" y="8" width="8" height="2" fill="${color}"/>
      <circle cx="9" cy="16" r="1.5" fill="#000"/>
      <circle cx="15" cy="16" r="1.5" fill="#000"/>
    </svg>`,
  };
  
  return svg[companionType] || createGenericIcon('companion', companionType);
}

function createGenericIcon(type, name) {
  const colors = {
    weapon: '#C0C0C0',
    armor: '#4169E1',
    consumable: '#FF6B6B',
    upgrade: '#FFD700',
    ammunition: '#FFA500',
    fortress: '#8B4513',
    companion: '#00d4ff',
  };
  
  const color = colors[type] || '#808080';
  
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="12" height="12" rx="2" fill="${color}"/>
    <text x="12" y="16" text-anchor="middle" fill="#FFF" font-size="8">?</text>
  </svg>`;
}


