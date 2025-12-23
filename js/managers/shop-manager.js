// Shop Manager - Handles shop items and purchases
// Shop items data imported from separate file for better organization

class ShopManager {
  constructor(inventoryManager, scoreManager, achievementManager = null) {
    this.inventoryManager = inventoryManager;
    this.scoreManager = scoreManager;
    this.achievementManager = achievementManager;
    this.shopItems = this.initializeShopItems();
  }

  // Initialize shop items catalog
  // Items are defined in js/data/shop-items.js for easier maintenance
  initializeShopItems() {
    // In browser environment, shop items are loaded via script tag
    // In node environment (testing), they're loaded via require()
    if (typeof SHOP_ITEMS !== 'undefined') {
      return SHOP_ITEMS;
    } else if (typeof require !== 'undefined') {
      return require('./data/shop-items.js');
    } else {
      console.error('Shop items data not loaded!');
      return {};
    }
  }
  // Get all shop items
  getAllItems() {
    return this.shopItems;
  }

  // Get items by type
  getItemsByType(type) {
    return Object.values(this.shopItems).filter(item => item.type === type);
  }

  // Get shop item by ID
  getItem(itemId) {
    return this.shopItems[itemId];
  }

  // Check if player can afford item
  canAfford(itemId) {
    const item = this.shopItems[itemId];
    if (!item) return false;
    return this.scoreManager.currency >= item.price;
  }

  // Check if player meets rank requirement for item
  meetsRankRequirement(itemId) {
    const item = this.shopItems[itemId];
    if (!item || !item.rankRequirement) return true;

    const playerRank = this.scoreManager.getPersistentRank();
    const rankOrder = ['Soldier', 'Veteran', 'Elite', 'Legend'];
    const playerRankIndex = rankOrder.indexOf(playerRank);
    const requiredRankIndex = rankOrder.indexOf(item.rankRequirement);

    return playerRankIndex >= requiredRankIndex;
  }

  // Get rank requirement info for display
  getRankRequirementInfo(itemId) {
    const item = this.shopItems[itemId];
    if (!item || !item.rankRequirement) return null;

    const meets = this.meetsRankRequirement(itemId);
    return {
      required: item.rankRequirement,
      meets: meets,
      current: this.scoreManager.getPersistentRank()
    };
  }

  // Purchase item
  purchase(itemId) {
    const item = this.shopItems[itemId];
    if (!item) return { success: false, message: 'Item not found' };

    // Check rank requirement
    if (!this.meetsRankRequirement(itemId)) {
      return { success: false, message: `Requires ${item.rankRequirement} rank` };
    }

    if (!this.canAfford(itemId)) {
      return { success: false, message: 'Not enough coins' };
    }

    // Check if companion already owned (before deducting currency)
    if (item.type === 'companion' && this.inventoryManager.hasItem(itemId)) {
      return { success: false, message: 'Companion already owned!' };
    }

    // Check if upgrade has reached max stacks
    if (item.type === 'upgrade' && item.maxStacks) {
      const currentQuantity = this.inventoryManager.getItemQuantity(itemId);
      if (currentQuantity >= item.maxStacks) {
        return { success: false, message: `Max stacks reached (${item.maxStacks})` };
      }
    }

    // Deduct currency
    this.scoreManager.addCurrency(-item.price);

    // Track purchase for achievements
    if (this.achievementManager) {
      this.achievementManager.trackPurchase(item.price);
      if (item.type === 'companion') {
        this.achievementManager.trackCompanionUnlock();
      }
    }

    // Handle companion purchases - unlock and spawn immediately if game is running
    if (item.type === 'companion') {
      // Unlock the companion type
      if (typeof Game !== 'undefined' && Game && Game.companionManager) {
        Game.companionManager.unlock(item.companionType);
      }
      // Add to inventory
      this.inventoryManager.addItem(itemId, 1);
      // Spawn companion if game is running
      if (typeof Game !== 'undefined' && Game && Game.player && Game.companionManager) {
        Game.companionManager.spawn(item.companionType, Game.player.x, Game.player.y);
      }
      return { success: true, message: `Purchased and deployed ${item.name}!` };
    }

    // Add to inventory
    if (item.type === 'ammunition') {
      // Ammo: add packSize quantity
      const quantity = item.packSize || 50;
      this.inventoryManager.addItem(itemId, quantity);
    } else if (item.type === 'consumable' || item.type === 'upgrade' || item.type === 'fortress_consumable') {
      this.inventoryManager.addItem(itemId, 1);
    } else {
      this.inventoryManager.addItem(itemId, 1);
    }

    return { success: true, message: `Purchased ${item.name}!` };
  }

  // Use fortress repair kit
  useFortressRepairKit(itemId) {
    const item = this.shopItems[itemId];
    if (!item || item.type !== 'fortress_consumable') {
      return { success: false, message: 'Not a fortress consumable' };
    }

    // Check if player has the item
    const quantity = this.inventoryManager.getItemQuantity(itemId);
    if (quantity <= 0) {
      return { success: false, message: `You don't have any ${item.name}` };
    }

    // Apply repair to fortress if game is running
    if (typeof Game !== 'undefined' && Game && Game.fortressManager) {
      Game.fortressManager.repairAll(item.repairAmount);

      // Track repair for achievements
      if (Game.achievementManager) {
        // Count number of structures repaired
        const structuresRepaired = Game.fortressManager.structures.filter(s => s.health < s.maxHealth).length;
        for (let i = 0; i < structuresRepaired; i++) {
          Game.achievementManager.trackStructureRepair();
        }
      }
    }

    // Remove item from inventory
    this.inventoryManager.removeItem(itemId, 1);

    return { success: true, message: `Used ${item.name}! Structures repaired.` };
  }

  // Use consumable item
  useConsumable(itemId, player) {
    const item = this.shopItems[itemId];
    if (!item || item.type !== 'consumable') {
      return { success: false, message: 'Not a consumable item' };
    }

    if (!this.inventoryManager.hasItem(itemId)) {
      return { success: false, message: 'Item not in inventory' };
    }

    // Initialize active effects array if not exists
    if (!this.activeEffects) {
      this.activeEffects = [];
    }

    const effect = item.effect;
    const now = Date.now();

    // Apply instant effects
    if (effect.heal) {
      const maxHealth = CONFIG.PLAYER.MAX_HEALTH + this.getEquippedStatBoosts().maxHealth;
      player.health = Math.min(maxHealth, player.health + effect.heal);
    }

    // Apply temporary effects with duration
    if (effect.duration && effect.duration > 0) {
      const tempEffect = {
        id: itemId,
        name: item.name,
        expiresAt: now + effect.duration,
        stats: {}
      };

      // Map effect properties to stat boosts
      if (effect.speed) tempEffect.stats.speed = effect.speed;
      if (effect.fireRate) tempEffect.stats.fireRate = effect.fireRate;
      if (effect.damage) tempEffect.stats.damage = effect.damage;
      if (effect.regenRate) tempEffect.stats.regenRate = effect.regenRate;
      if (effect.maxHealth) tempEffect.stats.maxHealth = effect.maxHealth;
      if (effect.multishot) tempEffect.stats.multishot = effect.multishot;
      if (effect.piercing) tempEffect.stats.piercing = effect.piercing;
      if (effect.explosive) tempEffect.stats.explosive = effect.explosive;
      if (effect.scoreMultiplier) tempEffect.stats.scoreMultiplier = effect.scoreMultiplier;
      if (effect.coinMultiplier) tempEffect.stats.coinMultiplier = effect.coinMultiplier;
      if (effect.critChance) tempEffect.stats.critChance = effect.critChance;
      if (effect.critMultiplier) tempEffect.stats.critMultiplier = effect.critMultiplier;
      if (effect.lifesteal) tempEffect.stats.lifesteal = effect.lifesteal;
      if (effect.shield) tempEffect.stats.shield = true;

      // Add to active effects
      this.activeEffects.push(tempEffect);
    }

    // Remove from inventory
    this.inventoryManager.removeItem(itemId, 1);

    return { success: true, message: `Used ${item.name}!` };
  }

  // Get active temporary effects
  getActiveEffects() {
    if (!this.activeEffects) {
      this.activeEffects = [];
    }

    // Remove expired effects
    const now = Date.now();
    this.activeEffects = this.activeEffects.filter(effect => effect.expiresAt > now);

    return this.activeEffects;
  }

  // Get stat boosts from equipped items and upgrades
  getEquippedStatBoosts() {
    const equipped = this.inventoryManager.getEquippedItems();
    const allItems = this.inventoryManager.getAllItems();
    const boosts = {
      fireRate: 1,
      damage: 0,
      maxHealth: 0,
      regenRate: 1,
      multishot: 0,
      speed: 1,
      coinMultiplier: 1,
      scoreMultiplier: 1,
      critChance: 0,
      critMultiplier: 1,
      piercing: 0,
      armorPen: 0,
      lifesteal: 0
    };

    // Check equipped weapon
    if (equipped.weapon) {
      const weapon = this.shopItems[equipped.weapon];
      if (weapon && weapon.statBoost) {
        if (weapon.statBoost.fireRate) boosts.fireRate *= weapon.statBoost.fireRate;
        if (weapon.statBoost.damage) boosts.damage += weapon.statBoost.damage;
        if (weapon.statBoost.multishot) boosts.multishot = weapon.statBoost.multishot;
      }
    }

    // Check equipped armor
    if (equipped.armor) {
      const armor = this.shopItems[equipped.armor];
      if (armor && armor.statBoost) {
        if (armor.statBoost.maxHealth) boosts.maxHealth += armor.statBoost.maxHealth;
        if (armor.statBoost.regenRate) boosts.regenRate *= armor.statBoost.regenRate;
      }
    }

    // Apply all stackable upgrades (based on quantity owned)
    Object.keys(allItems).forEach(itemId => {
      const item = this.shopItems[itemId];
      if (item && item.type === 'upgrade' && item.stackable && item.statBoost) {
        const quantity = allItems[itemId];
        if (quantity > 0) {
          // Apply stat boost for each stack
          for (let i = 0; i < quantity; i++) {
            if (item.statBoost.fireRate) boosts.fireRate *= item.statBoost.fireRate;
            if (item.statBoost.damage !== undefined) boosts.damage += item.statBoost.damage;
            if (item.statBoost.maxHealth) boosts.maxHealth += item.statBoost.maxHealth;
            if (item.statBoost.regenRate) boosts.regenRate *= item.statBoost.regenRate;
            if (item.statBoost.multishot) boosts.multishot += item.statBoost.multishot;
            if (item.statBoost.speed) boosts.speed *= item.statBoost.speed;
            if (item.statBoost.coinMultiplier) boosts.coinMultiplier *= item.statBoost.coinMultiplier;
            if (item.statBoost.scoreMultiplier) boosts.scoreMultiplier *= item.statBoost.scoreMultiplier;
            if (item.statBoost.critChance) boosts.critChance += item.statBoost.critChance;
            if (item.statBoost.critMultiplier) boosts.critMultiplier += item.statBoost.critMultiplier;
            if (item.statBoost.piercing) boosts.piercing += item.statBoost.piercing;
            if (item.statBoost.armorPen) boosts.armorPen += item.statBoost.armorPen;
            if (item.statBoost.lifesteal) boosts.lifesteal += item.statBoost.lifesteal;
          }
        }
      }
    });

    // Apply active temporary effects from consumables
    const activeEffects = this.getActiveEffects();
    activeEffects.forEach(effect => {
      if (effect.stats.speed) boosts.speed *= effect.stats.speed;
      if (effect.stats.fireRate) boosts.fireRate *= effect.stats.fireRate;
      if (effect.stats.damage) boosts.damage += effect.stats.damage;
      if (effect.stats.regenRate) boosts.regenRate *= effect.stats.regenRate;
      if (effect.stats.maxHealth) boosts.maxHealth += effect.stats.maxHealth;
      if (effect.stats.multishot) boosts.multishot += effect.stats.multishot;
      if (effect.stats.piercing) boosts.piercing += effect.stats.piercing;
      if (effect.stats.scoreMultiplier) boosts.scoreMultiplier *= effect.stats.scoreMultiplier;
      if (effect.stats.coinMultiplier) boosts.coinMultiplier *= effect.stats.coinMultiplier;
      if (effect.stats.critChance) boosts.critChance += effect.stats.critChance;
      if (effect.stats.critMultiplier) boosts.critMultiplier += effect.stats.critMultiplier;
      if (effect.stats.lifesteal) boosts.lifesteal += effect.stats.lifesteal;
      if (effect.stats.shield) boosts.shield = true;
    });

    // Apply permanent boosts from unlocked achievements
    if (this.achievementManager) {
      const achievementBoosts = this.achievementManager.getAchievementStatBoosts();
      if (achievementBoosts.damage) boosts.damage += achievementBoosts.damage;
      if (achievementBoosts.maxHealth) boosts.maxHealth += achievementBoosts.maxHealth;
      if (achievementBoosts.regenRate) boosts.regenRate += achievementBoosts.regenRate;
      if (achievementBoosts.fireRate) boosts.fireRate -= achievementBoosts.fireRate; // Negative because fireRate is a cooldown
      if (achievementBoosts.critChance) boosts.critChance += achievementBoosts.critChance;
      if (achievementBoosts.critMultiplier) boosts.critMultiplier += achievementBoosts.critMultiplier;
      if (achievementBoosts.scoreMultiplier) boosts.scoreMultiplier *= (1 + achievementBoosts.scoreMultiplier);
      if (achievementBoosts.coinMultiplier) boosts.coinMultiplier *= (1 + achievementBoosts.coinMultiplier);
    }

    return boosts;
  }
}
