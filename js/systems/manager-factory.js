// Manager Factory Utility
// Eliminates duplicate manager getter code across UI files
// Single source of truth for accessing managers (from Game or temporary instances)

/**
 * Universal manager getter utility
 * Checks if a manager exists in the running game instance, otherwise creates a temporary one
 *
 * @param {string} managerName - Name of the manager property on Game object (e.g., 'fortressManager')
 * @param {function} createTemporary - Function that creates a temporary manager instance
 * @returns {object} The manager instance (from Game or temporary)
 */
function getManager(managerName, createTemporary) {
  // Check if game is running and has the manager
  if (typeof Game !== 'undefined' && Game && Game[managerName]) {
    return Game[managerName];
  }

  // Create temporary manager if needed
  const tempKey = `temp_${managerName}`;
  if (!window[tempKey]) {
    window[tempKey] = createTemporary();
  }

  return window[tempKey];
}

/**
 * Get FortressManager instance (from game or temporary)
 * @returns {FortressManager} Fortress manager instance
 */
function getFortressManager() {
  return getManager('fortressManager', () => {
    const tempCanvas = document.createElement('canvas');
    return new FortressManager(tempCanvas);
  });
}

/**
 * Get CompanionManager instance (from game or temporary)
 * @returns {CompanionManager} Companion manager instance
 */
function getCompanionManager() {
  return getManager('companionManager', () => {
    const tempCanvas = document.createElement('canvas');
    const tempBulletPool = { get: () => null, release: () => {} }; // Mock pool
    return new CompanionManager(tempCanvas, tempBulletPool);
  });
}

/**
 * Get ScoreManager instance (from game or temporary)
 * @returns {ScoreManager} Score manager instance
 */
function getScoreManager() {
  return getManager('scoreManager', () => {
    return new ScoreManager();
  });
}

/**
 * Get ShopManager instance (from game or temporary)
 * @returns {ShopManager} Shop manager instance
 */
function getShopManager() {
  return getManager('shopManager', () => {
    return new ShopManager();
  });
}

/**
 * Get InventoryManager instance (from game or temporary)
 * @returns {InventoryManager} Inventory manager instance
 */
function getInventoryManager() {
  return getManager('inventoryManager', () => {
    return new InventoryManager();
  });
}

/**
 * Get any manager by name with custom creator
 * Useful for adding new managers without updating this file
 *
 * @param {string} name - Manager name (e.g., 'achievementManager')
 * @param {function} creator - Function to create temporary instance
 * @returns {object} Manager instance
 */
function getCustomManager(name, creator) {
  return getManager(name, creator);
}

/**
 * Check if game is currently running
 * @returns {boolean} True if game instance exists and is active
 */
function isGameRunning() {
  return typeof Game !== 'undefined' && Game !== null;
}

/**
 * Clear all temporary managers
 * Useful for cleanup or forcing fresh instances
 */
function clearTemporaryManagers() {
  const tempKeys = Object.keys(window).filter(key => key.startsWith('temp_'));
  tempKeys.forEach(key => {
    delete window[key];
  });
}
