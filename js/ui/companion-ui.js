// Companion UI Handler - Manage companion upgrades

function getCompanionManager() {
  if (typeof Game !== 'undefined' && Game && Game.companionManager) {
    return Game.companionManager;
  }
  // Create temporary companion manager for menu access
  if (!window.tempCompanionManager) {
    const tempCanvas = document.createElement('canvas');
    window.tempCompanionManager = new CompanionManager(tempCanvas);
  }
  return window.tempCompanionManager;
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

// Open companion upgrade menu
function openCompanion() {
  const overlay = document.getElementById('companionOverlay');
  overlay.classList.add('show');
  updateCompanionCoins();
  renderCompanionUpgrades();
}

// Close companion upgrade menu
function closeCompanion() {
  const overlay = document.getElementById('companionOverlay');
  overlay.classList.remove('show');
}

// Update coins display
function updateCompanionCoins() {
  const scoreManager = getScoreManager();
  if (scoreManager) {
    document.getElementById('companionCoins').textContent = scoreManager.currency;
  } else {
    const currency = parseInt(localStorage.getItem('currency')) || 0;
    document.getElementById('companionCoins').textContent = currency;
  }
}

// Render all companion upgrade cards
function renderCompanionUpgrades() {
  const container = document.getElementById('companionUpgrades');
  container.innerHTML = '';
  
  const companionManager = getCompanionManager();
  if (!companionManager) {
    container.innerHTML = '<p style="color: #fff; text-align: center; grid-column: 1 / -1;">Companion system error.</p>';
    return;
  }
  
  // Show all companion types for upgrading
  const allCompanionTypes = [
    { type: 'drone', name: 'Attack Drone', icon: '🤖', unlockWave: 10 },
    { type: 'robot', name: 'Combat Robot', icon: '🦾', unlockWave: 25 },
    { type: 'turret', name: 'Auto Turret', icon: '🔫', unlockWave: 50 },
    { type: 'medic', name: 'Medical Drone', icon: '💊', unlockWave: 75 },
    { type: 'tank', name: 'Tank Companion', icon: '🛡️', unlockWave: 100 },
  ];
  
  allCompanionTypes.forEach((companionInfo) => {
    const currentLevel = companionManager.getUpgradeLevel(companionInfo.type);
    const config = CONFIG.COMPANIONS[companionInfo.type.toUpperCase()];
    const baseCost = config.UPGRADE_COST || 500;
    const upgradeCost = Math.floor(baseCost * (1 + currentLevel * 0.5));
    
    const scoreManager = getScoreManager();
    const canAfford = scoreManager && scoreManager.currency >= upgradeCost;
    const isUnlocked = companionManager.isUnlocked(companionInfo.type);
    
    const card = document.createElement('div');
    card.className = 'c1-companion-card' + (isUnlocked ? '' : ' locked');
    card.innerHTML = `
      <div class="c1-companion-header">
        <div class="c1-companion-icon">${companionInfo.icon}</div>
        <div class="c1-companion-name">${companionInfo.name}</div>
        ${currentLevel > 0 ? `<div class="c1-companion-level">Level ${currentLevel + 1}</div>` : ''}
      </div>
      <div class="c1-companion-info">
        ${!isUnlocked ? `<div class="c1-unlock-text" style="color: rgba(255,255,255,0.6);">Unlocks at Wave ${companionInfo.unlockWave}</div>` : ''}
        ${currentLevel > 0 ? `<div class="c1-upgrade-text" style="color: #FFD700; margin-top: 4px;">Level ${currentLevel + 1}: Enhanced Stats</div>` : `<div class="c1-upgrade-text" style="color: rgba(255,255,255,0.5); margin-top: 4px;">Level 1: Base stats</div>`}
      </div>
      <div class="c1-companion-stats">
        <div class="c1-stat">Damage: ${config.DAMAGE || 'N/A'}</div>
        <div class="c1-stat">Health: ${config.HEALTH} HP</div>
        <div class="c1-stat">Fire Rate: ${config.FIRE_RATE || 'N/A'}ms</div>
        ${config.RANGE ? `<div class="c1-stat">Range: ${config.RANGE}px</div>` : ''}
        ${config.HEAL_RATE ? `<div class="c1-stat">Heal Rate: ${config.HEAL_RATE} HP/${config.HEAL_INTERVAL/1000}s</div>` : ''}
      </div>
      <div class="c1-companion-footer">
        <button class="c1-upgrade-btn" onclick="event.stopPropagation(); upgradeCompanionType('${companionInfo.type}')" ${!canAfford || !isUnlocked ? 'disabled' : ''}>
          ${!isUnlocked ? 'Locked' : `Upgrade (💰 ${upgradeCost})`}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Upgrade a companion type
function upgradeCompanionType(type) {
  const companionManager = getCompanionManager();
  const scoreManager = getScoreManager();
  
  if (!companionManager || !scoreManager) {
    alert('Companion system not available');
    return;
  }
  
  const result = companionManager.upgradeCompanionType(type);
  if (!result.success) {
    alert(result.message);
    return;
  }
  
  const cost = result.cost;
  
  if (scoreManager.currency < cost) {
    alert('Not enough coins!');
    return;
  }
  
  // Deduct currency
  scoreManager.addCurrency(-cost);
  
  // Upgrade the companion type
  const newLevel = companionManager.getUpgradeLevel(type) + 1;
  companionManager.setUpgradeLevel(type, newLevel);
  
  // Update UI
  updateCompanionCoins();
  renderCompanionUpgrades();
  
  // Sync with game if running
  if (typeof Game !== 'undefined' && Game && Game.scoreManager) {
    Game.scoreManager.currency = scoreManager.currency;
  }
  
  const typeNames = {
    'drone': 'Attack Drone',
    'robot': 'Combat Robot',
    'turret': 'Auto Turret',
    'medic': 'Medical Drone',
    'tank': 'Tank Companion',
  };
  const typeName = typeNames[type.toLowerCase()] || type;
  
  alert(`Upgraded ${typeName} to Level ${newLevel + 1}! All ${typeName}s will have enhanced stats.`);
}

