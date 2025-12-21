// Inventory Manager - Handles player inventory and equipped items

class InventoryManager {
  constructor() {
    this.loadInventory();
  }

  // Load inventory from storage
  loadInventory() {
    const saved = localStorage.getItem('inventory');
    this.inventory = saved ? JSON.parse(saved) : {
      items: {},
      equipped: {
        weapon: null,
        armor: null,
        powerup: null,
        ammo: null
      }
    };
    // Ensure ammo slot exists for backwards compatibility
    if (!this.inventory.equipped.ammo) {
      this.inventory.equipped.ammo = null;
    }
  }

  // Save inventory to storage
  saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(this.inventory));
  }

  // Add item to inventory
  addItem(itemId, quantity = 1) {
    if (!this.inventory.items[itemId]) {
      this.inventory.items[itemId] = 0;
    }
    this.inventory.items[itemId] += quantity;
    this.saveInventory();
  }

  // Remove item from inventory
  removeItem(itemId, quantity = 1) {
    if (this.inventory.items[itemId]) {
      this.inventory.items[itemId] = Math.max(0, this.inventory.items[itemId] - quantity);
      if (this.inventory.items[itemId] === 0) {
        delete this.inventory.items[itemId];
      }
      this.saveInventory();
      return true;
    }
    return false;
  }

  // Get item quantity
  getItemQuantity(itemId) {
    return this.inventory.items[itemId] || 0;
  }

  // Check if player has item
  hasItem(itemId) {
    return this.inventory.items[itemId] > 0;
  }

  // Equip item
  equipItem(itemId, slot) {
    if (!this.hasItem(itemId)) return false;
    this.inventory.equipped[slot] = itemId;
    this.saveInventory();
    return true;
  }

  // Unequip item
  unequipItem(slot) {
    this.inventory.equipped[slot] = null;
    this.saveInventory();
  }

  // Get equipped item
  getEquipped(slot) {
    return this.inventory.equipped[slot];
  }

  // Get all inventory items
  getAllItems() {
    return this.inventory.items;
  }

  // Get equipped items
  getEquippedItems() {
    return this.inventory.equipped;
  }

  // Reset inventory (for testing)
  reset() {
    this.inventory = {
      items: {},
      equipped: {
        weapon: null,
        armor: null,
        powerup: null,
        ammo: null
      }
    };
    this.saveInventory();
  }
}
