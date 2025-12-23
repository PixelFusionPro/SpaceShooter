// Shop & Inventory UI Handler

let currentShopTab = 'weapon';
let currentInventoryTab = 'weapon';

// Initialize managers if game is not running (for menu access)
function getShopManager() {
  if (typeof Game !== 'undefined' && Game && Game.shopManager) {
    return Game.shopManager;
  }
  // Create temporary managers for menu access
  if (!window.tempInventoryManager) {
    window.tempInventoryManager = new InventoryManager();
  }
  if (!window.tempShopManager) {
    const scoreManager = {
      currency: parseInt(localStorage.getItem('currency')) || 0,
      addCurrency: function(amount) {
        this.currency += amount;
        localStorage.setItem('currency', this.currency);
      }
    };
    window.tempShopManager = new ShopManager(window.tempInventoryManager, scoreManager);
  }
  return window.tempShopManager;
}

function getInventoryManager() {
  if (typeof Game !== 'undefined' && Game && Game.inventoryManager) {
    return Game.inventoryManager;
  }
  if (!window.tempInventoryManager) {
    window.tempInventoryManager = new InventoryManager();
  }
  return window.tempInventoryManager;
}

// Shop Functions
function openShop() {
  const overlay = document.getElementById('shopOverlay');
  overlay.classList.add('show');
  updateShopCoins();
  switchShopTab('weapon');
}

function closeShop() {
  const overlay = document.getElementById('shopOverlay');
  overlay.classList.remove('show');
}

function updateShopCoins() {
  const shopManager = getShopManager();
  if (shopManager) {
    document.getElementById('shopCoins').textContent = shopManager.scoreManager.currency;
  } else {
    const currency = parseInt(localStorage.getItem('currency')) || 0;
    document.getElementById('shopCoins').textContent = currency;
  }
}

function switchShopTab(type) {
  currentShopTab = type;
  const tabs = document.querySelectorAll('.s1-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  
  const typeMap = {
    'weapon': 0,
    'armor': 1,
    'consumable': 2,
    'upgrade': 3,
    'ammunition': 4
  };
  tabs[typeMap[type]].classList.add('active');
  
  renderShopItems(type);
}

function renderShopItems(type) {
  const container = document.getElementById('shopItems');
  container.innerHTML = '';
  
  const shopManager = getShopManager();
  if (!shopManager) {
    container.innerHTML = '<p style="color: #fff; text-align: center; grid-column: 1 / -1;">Shop not initialized</p>';
    return;
  }
  
  const items = shopManager.getItemsByType(type);
  
  if (items.length === 0) {
    container.innerHTML = '<p style="color: rgba(255,255,255,0.7); text-align: center; grid-column: 1 / -1;">No items in this category</p>';
    return;
  }
  
  items.forEach(item => {
    const canAfford = shopManager.canAfford(item.id);
    const card = document.createElement('div');
    card.className = 's1-item-card' + (canAfford ? ' affordable' : ' unaffordable');
    
    // Build visible stats for the card
    let visibleStats = '';
    const stats = [];
    
    if (item.statBoost) {
      if (item.statBoost.damage) stats.push({ label: 'DMG', value: `+${item.statBoost.damage}` });
      if (item.statBoost.fireRate) stats.push({ label: 'Fire Rate', value: `+${(item.statBoost.fireRate * 100).toFixed(0)}%` });
      if (item.statBoost.maxHealth) stats.push({ label: 'HP', value: `+${item.statBoost.maxHealth}` });
      if (item.statBoost.regenRate) stats.push({ label: 'Regen', value: `+${item.statBoost.regenRate.toFixed(1)}` });
      if (item.statBoost.multishot) stats.push({ label: 'Multishot', value: `+${item.statBoost.multishot}` });
    }
    
    if (item.effect) {
      if (item.effect.heal) stats.push({ label: 'Heal', value: `+${item.effect.heal}` });
      if (item.effect.damage) stats.push({ label: 'DMG', value: `+${item.effect.damage}` });
    }
    
    if (item.type === 'ammunition' && item.damageBonus) {
      stats.push({ label: 'DMG Bonus', value: `+${item.damageBonus}` });
    }
    
    if (stats.length > 0) {
      visibleStats = '<div class="s1-item-stats">' + 
        stats.slice(0, 3).map(s => `<div class="s1-item-stat"><span class="s1-item-stat-label">${s.label}:</span><span class="s1-item-stat-value">${s.value}</span></div>`).join('') + 
        '</div>';
    }
    
    // Build stats text for preview
    let statsHTML = '';
    if (item.statBoost) {
      const stats = [];
      if (item.statBoost.fireRate !== undefined) {
        const rateChange = item.statBoost.fireRate > 0 ? '+' : '';
        const ratePercent = ((item.statBoost.fireRate - 1) * 100).toFixed(0);
        stats.push(`Fire Rate: ${rateChange}${ratePercent}%`);
      }
      if (item.statBoost.damage) stats.push(`Damage: +${item.statBoost.damage}`);
      if (item.statBoost.maxHealth) stats.push(`Max Health: +${item.statBoost.maxHealth}`);
      if (item.statBoost.regenRate !== undefined) {
        const regenChange = item.statBoost.regenRate > 1 ? '+' : '';
        const regenPercent = ((item.statBoost.regenRate - 1) * 100).toFixed(0);
        stats.push(`Regen Rate: ${regenChange}${regenPercent}%`);
      }
      if (item.statBoost.multishot) stats.push(`Multishot: +${item.statBoost.multishot}`);
      if (item.statBoost.speed !== undefined) {
        const speedChange = item.statBoost.speed > 1 ? '+' : '';
        const speedPercent = ((item.statBoost.speed - 1) * 100).toFixed(0);
        stats.push(`Speed: ${speedChange}${speedPercent}%`);
      }
      if (item.statBoost.coinMultiplier !== undefined && item.statBoost.coinMultiplier !== 1) {
        const coinChange = item.statBoost.coinMultiplier > 1 ? '+' : '';
        const coinPercent = ((item.statBoost.coinMultiplier - 1) * 100).toFixed(0);
        stats.push(`Coin Multiplier: ${coinChange}${coinPercent}%`);
      }
      if (item.statBoost.scoreMultiplier !== undefined && item.statBoost.scoreMultiplier !== 1) {
        const scoreChange = item.statBoost.scoreMultiplier > 1 ? '+' : '';
        const scorePercent = ((item.statBoost.scoreMultiplier - 1) * 100).toFixed(0);
        stats.push(`Score Multiplier: ${scoreChange}${scorePercent}%`);
      }
      if (item.statBoost.critChance) stats.push(`Crit Chance: +${(item.statBoost.critChance * 100).toFixed(0)}%`);
      if (item.statBoost.critMultiplier !== undefined && item.statBoost.critMultiplier !== 1) {
        const critMultPercent = ((item.statBoost.critMultiplier - 1) * 100).toFixed(0);
        stats.push(`Crit Multiplier: +${critMultPercent}%`);
      }
      if (item.statBoost.piercing) stats.push(`Piercing: +${item.statBoost.piercing}`);
      if (item.statBoost.armorPen) stats.push(`Armor Pen: +${(item.statBoost.armorPen * 100).toFixed(0)}%`);
      if (item.statBoost.lifesteal) stats.push(`Lifesteal: +${(item.statBoost.lifesteal * 100).toFixed(0)}%`);
      if (stats.length > 0) {
        statsHTML = '<div class="s1-preview-stats">' + stats.map(s => `<div>${s}</div>`).join('') + '</div>';
      }
    }
    
    // Build effect text for preview
    let effectHTML = '';
    const effects = [];
    
    if (item.effect) {
      if (item.effect.heal) effects.push(`Heal: +${item.effect.heal}`);
      if (item.effect.damage) effects.push(`Damage: +${item.effect.damage}`);
    }
    
    // Ammo-specific effects
    if (item.type === 'ammunition') {
      if (item.damageBonus !== undefined && item.damageBonus !== null) {
        effects.push(`Damage Bonus: +${item.damageBonus}`);
      }
      if (item.effect && item.effect.type) {
        if (item.effect.type === 'piercing') {
          effects.push(`Pierces: ${item.effect.value} enemies`);
        } else if (item.effect.type === 'explosive') {
          effects.push(`AOE Radius: ${item.effect.value}px`);
        } else if (item.effect.type === 'ice') {
          effects.push(`Slow: ${(item.effect.value * 100).toFixed(0)}% for ${item.effect.duration/1000}s`);
        } else if (item.effect.type === 'fire') {
          effects.push(`Burn: ${item.effect.value} damage over ${item.effect.duration/1000}s`);
        } else if (item.effect.type === 'electric') {
          effects.push(`Chains: ${item.effect.value} nearby enemies`);
        } else if (item.effect.type === 'poison') {
          effects.push(`Poison: ${item.effect.value} damage over ${item.effect.duration/1000}s`);
        } else if (item.effect.type === 'armor_piercing') {
          effects.push(`Ignores: ${(item.effect.value * 100).toFixed(0)}% armor`);
        } else if (item.effect.type === 'critical') {
          effects.push(`Crit: ${(item.effect.value * 100).toFixed(0)}% chance`);
        }
      }
    }
    
    if (effects.length > 0) {
      effectHTML = '<div class="s1-preview-stats">' + effects.map(e => `<div>${e}</div>`).join('') + '</div>';
    }
    
    // Show compatible weapons for ammo
    let compatibilityHTML = '';
    if (item.type === 'ammunition' && item.compatibleWeapons && item.compatibleWeapons.length > 0) {
      const compatibleWeaponNames = item.compatibleWeapons.map(model => {
        // Capitalize first letter and replace underscores
        return model.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }).join(', ');
      compatibilityHTML = `<div class="s1-preview-compatibility"><strong>Compatible:</strong> ${compatibleWeaponNames}</div>`;
    }
    
    // Tier text
    const tierText = item.tier ? `Tier ${item.tier}` : '';
    
    // Price display with pack size for ammo
    let priceDisplay = `💰 ${item.price}`;
    if (item.type === 'ammunition' && item.packSize) {
      priceDisplay += ` (${item.packSize} rounds)`;
    }
    
    // Get unique SVG icon
    const svgIcon = typeof getItemIcon !== 'undefined' 
      ? getItemIcon(item.id, item.type, item.name)
      : item.icon;
    
    // Create item label for better identification
    const itemLabel = `<div class="s1-item-label">${item.name}</div>`;
    
    card.innerHTML = `
      <div class="s1-item-header">
        <div class="s1-item-icon">${svgIcon}</div>
        ${itemLabel}
        ${visibleStats}
      </div>
      <div class="s1-item-price">💰 ${item.price}</div>
      <div class="s1-item-footer">
        <button class="s1-item-buy" onclick="event.stopPropagation(); buyItem('${item.id}')" ${!canAfford ? 'disabled' : ''}>
          ${canAfford ? 'Buy' : '$$$'}
        </button>
      </div>
      <div class="s1-item-preview">
        <div class="s1-preview-header">
          <div class="s1-preview-icon">${svgIcon}</div>
          <div class="s1-preview-name">${item.name}</div>
        </div>
        <div class="s1-preview-description">${item.description}</div>
        <div class="s1-preview-price">${priceDisplay}</div>
        ${statsHTML}
        ${effectHTML}
        ${compatibilityHTML}
        ${tierText ? `<div class="s1-preview-tier">${tierText}</div>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

function buyItem(itemId) {
  const shopManager = getShopManager();
  if (!shopManager) return;
  
  const result = shopManager.purchase(itemId);
  
  if (result.success) {
    updateShopCoins();
    renderShopItems(currentShopTab);
    updateMenuCoins();
    // Update game currency if game is running
    if (typeof Game !== 'undefined' && Game && Game.scoreManager) {
      Game.scoreManager.currency = shopManager.scoreManager.currency;
    }
  } else {
    alert(result.message);
  }
}

// Inventory Functions
function openInventory() {
  const overlay = document.getElementById('inventoryOverlay');
  overlay.classList.add('show');
  updateEquippedItems();
  switchInventoryTab('weapon');
}

function closeInventory() {
  const overlay = document.getElementById('inventoryOverlay');
  overlay.classList.remove('show');
}

function updateEquippedItems() {
  const inventoryManager = getInventoryManager();
  const shopManager = getShopManager();
  if (!inventoryManager || !shopManager) return;
  
  const equipped = inventoryManager.getEquippedItems();
  
  // Update equipped weapon
  const weaponEl = document.getElementById('equippedWeapon');
  if (equipped.weapon && shopManager) {
    const item = shopManager.getItem(equipped.weapon);
    weaponEl.innerHTML = item ? `${item.icon}<br><small>${item.name}</small>` : '-';
  } else {
    weaponEl.textContent = '-';
  }
  
  // Update equipped armor
  const armorEl = document.getElementById('equippedArmor');
  if (equipped.armor && shopManager) {
    const item = shopManager.getItem(equipped.armor);
    armorEl.innerHTML = item ? `${item.icon}<br><small>${item.name}</small>` : '-';
  } else {
    armorEl.textContent = '-';
  }
  
  // Update equipped ammo
  const ammoEl = document.getElementById('equippedAmmo');
  if (equipped.ammo && shopManager) {
    const item = shopManager.getItem(equipped.ammo);
    const quantity = inventoryManager.getItemQuantity(equipped.ammo);
    ammoEl.innerHTML = item ? `${item.icon}<br><small>${item.name}</small><br><small>(${quantity})</small>` : '-';
  } else {
    ammoEl.textContent = '-';
  }
  
  // Update equipped powerup
  const powerupEl = document.getElementById('equippedPowerup');
  if (equipped.powerup && shopManager) {
    const item = shopManager.getItem(equipped.powerup);
    powerupEl.innerHTML = item ? `${item.icon}<br><small>${item.name}</small>` : '-';
  } else {
    powerupEl.textContent = '-';
  }
}

function switchInventoryTab(type) {
  currentInventoryTab = type;
  const tabs = document.querySelectorAll('.i1-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  
  const typeMap = {
    'weapon': 0,
    'armor': 1,
    'consumable': 2,
    'upgrade': 3,
    'ammunition': 4
  };
  tabs[typeMap[type]].classList.add('active');
  
  renderInventoryItems(type);
}

function renderInventoryItems(type) {
  const container = document.getElementById('inventoryItems');
  container.innerHTML = '';
  
  const inventoryManager = getInventoryManager();
  const shopManager = getShopManager();
  if (!inventoryManager || !shopManager) {
    container.innerHTML = '<p style="color: #fff; text-align: center;">Inventory not initialized</p>';
    return;
  }
  
  const allItems = inventoryManager.getAllItems();
  
  // Filter items by type
  const filteredItems = Object.keys(allItems).filter(itemId => {
    const item = shopManager ? shopManager.getItem(itemId) : null;
    return item && item.type === type && allItems[itemId] > 0;
  });
  
  if (filteredItems.length === 0) {
    container.innerHTML = '<p style="color: rgba(255,255,255,0.7); text-align: center; grid-column: 1 / -1;">No items in this category</p>';
    return;
  }
  
  filteredItems.forEach(itemId => {
    const item = shopManager.getItem(itemId);
    if (!item) return;
    
    const quantity = allItems[itemId];
    const equipped = inventoryManager.getEquippedItems();
    const isEquipped = (type === 'weapon' && equipped.weapon === itemId) ||
                       (type === 'armor' && equipped.armor === itemId) ||
                       (type === 'ammunition' && equipped.ammo === itemId) ||
                       (type === 'powerup' && equipped.powerup === itemId);
    
    const card = document.createElement('div');
    card.className = 'i1-item-card' + (isEquipped ? ' equipped' : '');
    
    // Build stats text for preview
    let statsHTML = '';
    if (item.statBoost) {
      const stats = [];
      if (item.statBoost.fireRate) stats.push(`Fire Rate: ${item.statBoost.fireRate > 0 ? '+' : ''}${(item.statBoost.fireRate * 100).toFixed(0)}%`);
      if (item.statBoost.damage) stats.push(`Damage: ${item.statBoost.damage > 0 ? '+' : ''}${item.statBoost.damage}`);
      if (item.statBoost.maxHealth) stats.push(`Max Health: +${item.statBoost.maxHealth}`);
      if (item.statBoost.regenRate) stats.push(`Regen Rate: +${item.statBoost.regenRate.toFixed(2)}`);
      if (item.statBoost.multishot) stats.push(`Multishot: +${item.statBoost.multishot}`);
      if (stats.length > 0) {
        statsHTML = '<div class="i1-preview-stats">' + stats.map(s => `<div>${s}</div>`).join('') + '</div>';
      }
    }
    
    // Build effect text for preview
    let effectHTML = '';
    const effects = [];
    
    if (item.effect) {
      if (item.effect.heal) effects.push(`Heal: +${item.effect.heal}`);
      if (item.effect.damage) effects.push(`Damage: +${item.effect.damage}`);
    }
    
    // Ammo-specific effects (always show damageBonus for ammo)
    if (item.type === 'ammunition') {
      if (item.damageBonus !== undefined && item.damageBonus !== null) {
        effects.push(`Damage Bonus: +${item.damageBonus}`);
      }
      if (item.effect && item.effect.type) {
        if (item.effect.type === 'piercing') {
          effects.push(`Pierces: ${item.effect.value} enemies`);
        } else if (item.effect.type === 'explosive') {
          effects.push(`AOE Radius: ${item.effect.value}px`);
        } else if (item.effect.type === 'ice') {
          effects.push(`Slow: ${(item.effect.value * 100).toFixed(0)}% for ${item.effect.duration/1000}s`);
        } else if (item.effect.type === 'fire') {
          effects.push(`Burn: ${item.effect.value} damage over ${item.effect.duration/1000}s`);
        } else if (item.effect.type === 'electric') {
          effects.push(`Chains: ${item.effect.value} nearby enemies`);
        } else if (item.effect.type === 'poison') {
          effects.push(`Poison: ${item.effect.value} damage over ${item.effect.duration/1000}s`);
        } else if (item.effect.type === 'armor_piercing') {
          effects.push(`Ignores: ${(item.effect.value * 100).toFixed(0)}% armor`);
        } else if (item.effect.type === 'critical') {
          effects.push(`Crit: ${(item.effect.value * 100).toFixed(0)}% chance`);
        }
      }
    }
    
    if (effects.length > 0) {
      effectHTML = '<div class="i1-preview-stats">' + effects.map(e => `<div>${e}</div>`).join('') + '</div>';
    }
    
    // Show compatible weapons for ammo
    let compatibilityHTML = '';
    if (item.type === 'ammunition' && item.compatibleWeapons) {
      compatibilityHTML = '<div class="i1-preview-stats"><div><strong>Compatible Weapons:</strong></div><div>' + item.compatibleWeapons.join(', ') + '</div></div>';
    }
    
    // Tier text
    const tierText = item.tier ? `Tier ${item.tier}` : '';
    
    let actionButtons = '';
    if (type === 'weapon' || type === 'armor') {
      actionButtons = `
        <div class="i1-item-footer">
          <button class="i1-item-equip" onclick="equipItem('${itemId}', '${type === 'weapon' ? 'weapon' : 'armor'}')">
            ${isEquipped ? 'ON' : 'EQ'}
          </button>
        </div>
      `;
    } else if (type === 'ammunition') {
      actionButtons = `
        <div class="i1-item-footer">
          <button class="i1-item-equip" onclick="equipItem('${itemId}', 'ammo')">
            ${isEquipped ? 'ON' : 'EQ'}
          </button>
        </div>
      `;
    } else if (type === 'consumable') {
      actionButtons = `
        <div class="i1-item-footer">
          <button class="i1-item-use" onclick="useItem('${itemId}')">Use</button>
        </div>
      `;
    }
    
    // Get unique SVG icon
    const svgIcon = typeof getItemIcon !== 'undefined' 
      ? getItemIcon(itemId, item.type, item.name)
      : item.icon;
    
    // Create item label for better identification
    const itemLabel = `<div class="i1-item-label">${item.name}</div>`;
    
    card.innerHTML = `
      <div class="i1-item-header">
        <div class="i1-item-icon">${svgIcon}</div>
        ${itemLabel}
      </div>
      <div class="i1-item-quantity">${quantity > 1 ? quantity : ''}</div>
      ${actionButtons}
      <div class="i1-item-preview">
        <div class="i1-preview-header">
          <div class="i1-preview-icon">${svgIcon}</div>
          <div class="i1-preview-name">${item.name}</div>
        </div>
        <div class="i1-preview-description">${item.description}</div>
        ${statsHTML}
        ${effectHTML}
        ${compatibilityHTML}
        ${tierText ? `<div class="i1-preview-tier">${tierText}</div>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

function equipItem(itemId, slot) {
  const inventoryManager = getInventoryManager();
  if (!inventoryManager) return;
  
  const success = inventoryManager.equipItem(itemId, slot);
  if (success) {
    updateEquippedItems();
    renderInventoryItems(currentInventoryTab);
    // Sync with game if running
    if (typeof Game !== 'undefined' && Game && Game.inventoryManager) {
      Game.inventoryManager.equipItem(itemId, slot);
    }
  }
}

function useItem(itemId) {
  const shopManager = getShopManager();
  const inventoryManager = getInventoryManager();
  if (!shopManager || !inventoryManager) return;
  
  // Only works in-game, but we can still remove from inventory
  if (typeof Game !== 'undefined' && Game && Game.player) {
    const result = shopManager.useConsumable(itemId, Game.player);
    if (result.success) {
      renderInventoryItems(currentInventoryTab);
      updateEquippedItems();
    } else {
      alert(result.message);
    }
  } else {
    alert('Can only use consumables during gameplay');
  }
}

function updateMenuCoins() {
  const currency = typeof Game !== 'undefined' && Game && Game.scoreManager 
    ? Game.scoreManager.currency 
    : (parseInt(localStorage.getItem('currency')) || 0);
  document.getElementById('menuCoins').textContent = currency;
}

// Update menu coins on page load
document.addEventListener('DOMContentLoaded', () => {
  updateMenuCoins();
});
