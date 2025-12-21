// Fortress UI Handler - Manage fortress structures and upgrades

function getFortressManager() {
  if (typeof Game !== 'undefined' && Game && Game.fortressManager) {
    return Game.fortressManager;
  }
  // Create temporary fortress manager for menu access
  if (!window.tempFortressManager) {
    // Create a minimal canvas for the temporary manager
    const tempCanvas = document.createElement('canvas');
    window.tempFortressManager = new FortressManager(tempCanvas);
    // Don't create structures, just manage upgrade levels
  }
  return window.tempFortressManager;
}

function getScoreManager() {
  if (typeof Game !== 'undefined' && Game && Game.scoreManager) {
    return Game.scoreManager;
  }
  // Create temporary score manager for menu access
  if (!window.tempScoreManager) {
    window.tempScoreManager = {
      currency: parseInt(localStorage.getItem('currency')) || 0,
      addCurrency: function(amount) {
        this.currency += amount;
        localStorage.setItem('currency', this.currency);
      }
    };
  }
  return window.tempScoreManager;
}

// Open fortress menu
function openFortress() {
  const overlay = document.getElementById('fortressOverlay');
  overlay.classList.add('show');
  updateFortressCoins();
  renderFortressStructures();
}

// Close fortress menu
function closeFortress() {
  const overlay = document.getElementById('fortressOverlay');
  overlay.classList.remove('show');
}

// Update coins display
function updateFortressCoins() {
  const scoreManager = getScoreManager();
  if (scoreManager) {
    document.getElementById('fortressCoins').textContent = scoreManager.currency;
  } else {
    const currency = parseInt(localStorage.getItem('currency')) || 0;
    document.getElementById('fortressCoins').textContent = currency;
  }
}

// Render all fortress structures
function renderFortressStructures() {
  const container = document.getElementById('fortressStructures');
  container.innerHTML = '';
  
  const fortressManager = getFortressManager();
  if (!fortressManager) {
    container.innerHTML = '<p style="color: #fff; text-align: center; grid-column: 1 / -1;">Fortress system error.</p>';
    return;
  }
  
  const structures = fortressManager.structures || [];
  
  // Show all structure types for upgrading, even if not built yet
  const allStructureTypes = [
    { type: 'fence', name: 'Wooden Fence', icon: '🪵', unlockWave: 5 },
    { type: 'barricade', name: 'Barricade', icon: '🪨', unlockWave: 15 },
    { type: 'gate', name: 'Gate', icon: '🚪', unlockWave: 30 },
    { type: 'wall', name: 'Stone Wall', icon: '🧱', unlockWave: 50 },
    { type: 'tower', name: 'Guard Tower', icon: '🗼', unlockWave: 75 },
  ];
  
  if (structures.length === 0) {
    // Render upgrade cards for all structure types
    allStructureTypes.forEach((structInfo) => {
      const currentLevel = fortressManager.getUpgradeLevel(structInfo.type);
      const config = CONFIG.FORTRESS[structInfo.type.toUpperCase()];
      const baseCost = config.UPGRADE_COST || 100;
      const upgradeCost = Math.floor(baseCost * (1 + currentLevel * 0.5));
      
      const scoreManager = getScoreManager();
      const canAfford = scoreManager && scoreManager.currency >= upgradeCost;
      
      const card = document.createElement('div');
      card.className = 'f1-structure-card';
      card.innerHTML = `
        <div class="f1-structure-header">
          <div class="f1-structure-icon">${structInfo.icon}</div>
          <div class="f1-structure-name">${structInfo.name}</div>
          ${currentLevel > 0 ? `<div class="f1-structure-level">Level ${currentLevel + 1}</div>` : ''}
        </div>
        <div class="f1-structure-health">
          <div class="f1-health-text" style="color: rgba(255,255,255,0.6);">Permanent Upgrade</div>
          ${currentLevel > 0 ? `<div class="f1-health-text" style="color: #FFD700; margin-top: 4px;">Level ${currentLevel + 1}: +${currentLevel * (config.UPGRADE_HEALTH_BONUS || 50)} HP</div>` : `<div class="f1-health-text" style="color: rgba(255,255,255,0.5); margin-top: 4px;">Level 1: Base stats</div>`}
          ${structInfo.type === 'tower' && currentLevel > 0 ? `<div class="f1-health-text" style="color: #FFD700; margin-top: 4px;">Damage: +${(currentLevel * (config.UPGRADE_DAMAGE_BONUS || 0.5)).toFixed(1)} dmg</div>` : ''}
        </div>
        <div class="f1-structure-stats">
          <div class="f1-stat">Base Health: ${config.HEALTH} HP</div>
          <div class="f1-stat">Damage Resistance: ${(config.DAMAGE_RESISTANCE * 100).toFixed(0)}%</div>
          <div class="f1-stat">Slow Effect: ${(config.SLOW_EFFECT * 100).toFixed(0)}%</div>
          ${structInfo.type === 'tower' ? `<div class="f1-stat">Base Damage: ${config.DAMAGE || 1.0} dmg</div>` : ''}
          ${structInfo.type === 'tower' ? `<div class="f1-stat">Range: ${config.RANGE || 200} px</div>` : ''}
          ${structInfo.type === 'tower' && currentLevel > 0 ? `<div class="f1-stat" style="color: #FFD700;">Current Damage: ${((config.DAMAGE || 1.0) + (currentLevel * (config.UPGRADE_DAMAGE_BONUS || 0.5))).toFixed(1)} dmg</div>` : ''}
        </div>
        <div class="f1-structure-footer">
          <button class="f1-upgrade-btn" onclick="event.stopPropagation(); upgradeStructureType('${structInfo.type}')" ${!canAfford ? 'disabled' : ''}>
            Upgrade (💰 ${upgradeCost})
          </button>
        </div>
      `;
      container.appendChild(card);
    });
    return;
  }
  
  structures.forEach((structure, index) => {
    const healthPercent = structure.getHealthPercent();
    const isActive = structure.active;
    const card = document.createElement('div');
    card.className = 'f1-structure-card' + (isActive ? ' active' : ' destroyed');
    
    // Get structure type icon
    const typeIcons = {
      'fence': '🪵',
      'wall': '🧱',
      'barricade': '🪨',
      'tower': '🗼',
      'gate': '🚪',
    };
    const icon = typeIcons[structure.type] || '🏰';
    
    // Get structure type name
    const typeNames = {
      'fence': 'Wooden Fence',
      'wall': 'Stone Wall',
      'barricade': 'Barricade',
      'tower': 'Guard Tower',
      'gate': 'Gate',
    };
    const typeName = typeNames[structure.type] || structure.type;
    
    // Calculate upgrade cost based on saved upgrade level (not just structure's current level)
    const fortressManager = getFortressManager();
    const savedLevel = fortressManager ? fortressManager.getUpgradeLevel(structure.type) : structure.upgradeLevel;
    const baseCost = structure.upgradeCost || 100;
    const upgradeCost = Math.floor(baseCost * (1 + savedLevel * 0.5));
    
    const scoreManager = getScoreManager();
    const canAfford = scoreManager && scoreManager.currency >= upgradeCost;
    
    card.innerHTML = `
      <div class="f1-structure-header">
        <div class="f1-structure-icon">${icon}</div>
        <div class="f1-structure-name">${typeName}</div>
        ${structure.upgradeLevel > 0 ? `<div class="f1-structure-level">Level ${structure.upgradeLevel + 1}</div>` : ''}
      </div>
      <div class="f1-structure-health">
        <div class="f1-health-bar">
          <div class="f1-health-fill" style="width: ${healthPercent * 100}%"></div>
        </div>
        <div class="f1-health-text">${Math.ceil(structure.health)} / ${Math.ceil(structure.maxHealth)} HP</div>
        ${!isActive ? '<div class="f1-status-destroyed">Destroyed</div>' : ''}
      </div>
      <div class="f1-structure-stats">
        <div class="f1-stat">Damage Resistance: ${(structure.damageResistance * 100).toFixed(0)}%</div>
        <div class="f1-stat">Slow Effect: ${(structure.slowEffect * 100).toFixed(0)}%</div>
        <div class="f1-stat">Blockage: ${structure.blockage.toFixed(1)}</div>
        ${structure.type === 'tower' ? `<div class="f1-stat" style="color: #FFD700;">Damage: ${structure.damage ? structure.damage.toFixed(1) : '1.0'} dmg</div>` : ''}
        ${structure.type === 'tower' ? `<div class="f1-stat">Range: ${structure.range || 200} px</div>` : ''}
      </div>
      <div class="f1-structure-footer">
        <button class="f1-upgrade-btn" onclick="event.stopPropagation(); upgradeStructure(${index})" ${!canAfford ? 'disabled' : ''}>
          Upgrade (💰 ${upgradeCost})
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Upgrade a structure by index (when structures exist)
function upgradeStructure(index) {
  const fortressManager = getFortressManager();
  const scoreManager = getScoreManager();
  
  if (!fortressManager || !scoreManager) {
    alert('Fortress system not available');
    return;
  }
  
  const result = fortressManager.upgradeStructure(index);
  if (!result.success) {
    alert(result.message);
    return;
  }
  
  const structure = result.structure;
  const cost = result.cost;
  const type = result.type;
  
  if (scoreManager.currency < cost) {
    alert('Not enough coins!');
    return;
  }
  
  // Deduct currency
  scoreManager.addCurrency(-cost);
  
  // Upgrade the structure type (affects all structures of this type, including future ones)
  const newLevel = fortressManager.getUpgradeLevel(type) + 1;
  fortressManager.setUpgradeLevel(type, newLevel);
  
  // Update UI
  updateFortressCoins();
  renderFortressStructures();
  
  // Sync with game if running
  if (typeof Game !== 'undefined' && Game && Game.scoreManager) {
    Game.scoreManager.currency = scoreManager.currency;
  }
  
  const typeNames = {
    'fence': 'Wooden Fence',
    'wall': 'Stone Wall',
    'barricade': 'Barricade',
    'tower': 'Guard Tower',
    'gate': 'Gate',
  };
  const typeName = typeNames[type.toLowerCase()] || type;
  
  alert(`Upgraded ${typeName} to Level ${newLevel + 1}! All ${typeName}s will have increased durability.`);
}

// Upgrade a structure type directly (works even when no structures exist)
function upgradeStructureType(type) {
  const fortressManager = getFortressManager();
  const scoreManager = getScoreManager();
  
  if (!fortressManager || !scoreManager) {
    alert('Fortress system not available');
    return;
  }
  
  const result = fortressManager.upgradeStructureType(type);
  if (!result.success) {
    alert(result.message);
    return;
  }
  
  const cost = result.cost;
  const currentLevel = result.currentLevel;
  
  if (scoreManager.currency < cost) {
    alert('Not enough coins!');
    return;
  }
  
  // Deduct currency
  scoreManager.addCurrency(-cost);
  
  // Upgrade the structure type
  const newLevel = currentLevel + 1;
  fortressManager.setUpgradeLevel(type, newLevel);
  
  // Update UI
  updateFortressCoins();
  renderFortressStructures();
  
  // Sync with game if running
  if (typeof Game !== 'undefined' && Game && Game.scoreManager) {
    Game.scoreManager.currency = scoreManager.currency;
  }
  
  const typeNames = {
    'fence': 'Wooden Fence',
    'wall': 'Stone Wall',
    'barricade': 'Barricade',
    'tower': 'Guard Tower',
    'gate': 'Gate',
  };
  const typeName = typeNames[type.toLowerCase()] || type;
  const config = CONFIG.FORTRESS[type.toUpperCase()];
  const healthBonus = config.UPGRADE_HEALTH_BONUS || 50;
  
  alert(`Upgraded ${typeName} to Level ${newLevel + 1}! All ${typeName}s will have +${healthBonus} HP when built.`);
}

// Update menu coins
function updateMenuCoinsFromFortress() {
  const currency = typeof Game !== 'undefined' && Game && Game.scoreManager 
    ? Game.scoreManager.currency 
    : (parseInt(localStorage.getItem('currency')) || 0);
  const menuCoins = document.getElementById('menuCoins');
  if (menuCoins) {
    menuCoins.textContent = currency;
  }
}

